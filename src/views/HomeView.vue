<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";

import { ref, computed } from "vue";

import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const loaded = computed(() => authStore.loaded);

// Tabs
let current_tab = ref("wall");
</script>

<template>
  <main>
    <div class="content">
      <div class="tabs">
        <RouterLink
          :to="{ name: 'contacts' }"
          class="tab"
          :class="{ current_tab: current_tab == 'contacts' }"
          @click="current_tab = 'contacts'"
        >
          Contacts
        </RouterLink>
        <RouterLink
          :to="{ name: 'wall' }"
          class="tab"
          :class="{ current_tab: current_tab == 'wall' }"
          @click="current_tab = 'wall'"
        >
          Wall
        </RouterLink>
        <RouterLink
          :to="{ name: 'my_blogs' }"
          class="tab"
          :class="{ current_tab: current_tab == 'my_blogs' }"
          @click="current_tab = 'my_blogs'"
        >
          My Blogs
        </RouterLink>
        <RouterLink
          :to="{ name: 'messages' }"
          class="tab"
          :class="{ current_tab: current_tab == 'messages' }"
          @click="current_tab = 'messages'"
        >
          Messages
        </RouterLink>
      </div>

      <div v-if="!loaded">Loading...</div>
      <RouterView v-else />
    </div>
  </main>
</template>

<style scoped lang="scss">
.content {
  max-width: min(800px, 90vw);
  margin: auto;
}

.tabs {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.tab {
  padding-inline: 1rem;
  padding-block: 0.7rem;
  border-color: burlywood;
  border-width: 3px;
  border-style: solid;
  border-radius: 5px;
  color: hsl(34, 57%, 20%); // burlywood but 50% darker;
  text-decoration: none;

  &:hover {
    background-color: hsl(34, 57%, 90%); // burlywood but 20% lighter
  }
}

.current_tab {
  background-color: burlywood;

  &:hover {
    background-color: burlywood;
  }
}
</style>
