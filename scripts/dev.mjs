import { spawn } from "node:child_process";

const commands = [
  ["backend", "npm", ["run", "dev:backend"]],
  ["frontend", "npm", ["run", "dev:frontend"]]
];

const children = commands.map(([name, command, args]) => {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  child.on("exit", (code, signal) => {
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`);
      stopAll(code);
    }

    if (signal && signal !== "SIGINT" && signal !== "SIGTERM") {
      console.error(`${name} exited with signal ${signal}`);
      stopAll(1);
    }
  });

  return child;
});

function stopAll(exitCode = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  process.exit(exitCode);
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
