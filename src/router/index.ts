import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import WallView from "../views/WallView.vue";
import ContactsView from "../views/ContactsView.vue";
import MyBlogsView from "../views/MyBlogsView.vue";
import MessagesView from "../views/MessagesView.vue";

import { rid } from "@/rethinkid";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: {
        requiresAuth: false,
      },
      children: [
        {
          path: "contacts",
          name: "contacts",
          component: ContactsView,
        },
        {
          path: "",
          name: "wall",
          component: WallView,
        },
        {
          path: "my_blogs",
          name: "my_blogs",
          component: MyBlogsView,
        },
        {
          path: "messages",
          name: "messages",
          component: MessagesView,
        },
      ],
    },
  ],
});

router.beforeEach((to, from) => {
  document.title = (to.meta.title as string) || "Microblog";

  console.log("auth:", to.meta.requiresAuth !== false);
  // Check if route requires auth
  if (to.meta.requiresAuth !== false) {
    console.log("login:", !rid.isLoggedIn());
    if (!rid.isLoggedIn()) {
      return { name: "home", query: { redirect: to.name as string } };
    }
  }
});

export default router;
