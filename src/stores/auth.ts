import { ref, computed } from "vue";
import type { Ref } from "vue";
import { defineStore } from "pinia";

import { rid } from "@/rethinkid";
import { useDataStore } from "./data";

export const useAuthStore = defineStore("auth", () => {
  const loaded = ref(false);
  const authenticated = ref(false);
  const user = ref({
    id: "",
    email: "",
    name: "",
  }) as Ref<null | { id: string; email: string; name: string }>;

  async function autoSignIn() {
    if (rid.isLoggedIn()) {
      try {
        user.value = rid.userInfo();
        console.log("user", user);
        authenticated.value = true;

        const dataStore = useDataStore();
        await dataStore.fetchAll();
      } catch (e: any) {
        console.error("auto sign in error:", e);
        return;
      }
    }
    loaded.value = true;
  }

  return { user, loaded, authenticated, autoSignIn };
});
