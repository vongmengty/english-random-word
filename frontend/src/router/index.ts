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
    { path: "/:pathMatch(.*)*", redirect: "/" }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});
