<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import HelloWorld from "./components/HelloWorld.vue";

import { computed } from "vue";

import { useAuthStore } from "@/stores/auth";
import { rid } from "@/rethinkid";

// import AppNav from "@/components/AppNav.vue";

const store = useAuthStore();
const authenticated = computed(() => store.authenticated);
store.autoSignIn();

rid.loginUri().then((uri) => {
  console.log(uri);
});

rid.onLogin = () => {
  console.log("onLogin is called");
  store.autoSignIn();
};

function login(): void {
  rid.login();
}
</script>

<template>
  <header>
    <div v-if="store.user != null" class="flex">
      <div class="info">ID: {{ store.user.id }}</div>
      <div class="info">Email: {{ store.user.email }}</div>
      <div class="info">Name: {{ store.user.name }}</div>
    </div>
    <div v-else>Please log in</div>
  </header>
  <RouterView v-if="authenticated" />
  <div v-else class="loading">
    <button @click="login" class="button">Log in</button>
  </div>
</template>

<style scoped lang="scss">
header {
  background-color: cornflowerblue;
  margin-bottom: 1rem;
  padding-inline: 1rem;
}
.flex {
  display: flex;
  gap: 1rem;
}
.info {
  padding-block: 1rem;
}
.loading {
  color: black;
  padding: 1em;
}
</style>
