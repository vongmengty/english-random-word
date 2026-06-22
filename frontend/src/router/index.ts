import { createRouter, createWebHistory } from "vue-router";
import PracticeView from "../views/PracticeView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "practice", component: PracticeView },
    {
      path: "/study",
      name: "study",
      // Lazy-loaded: the study page and its charts aren't needed on first paint.
      component: () => import("../views/StudyView.vue")
    },
    {
      path: "/match",
      name: "match",
      // Lazy-loaded: the match game is a side feature, not on the critical path.
      component: () => import("../views/WordMatchView.vue")
    },
    { path: "/:pathMatch(.*)*", redirect: "/" }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});
