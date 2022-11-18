<script setup lang="ts">
import { ref, computed } from "vue";

import { useDataStore } from "@/stores/data";

const dataStore = useDataStore();
</script>

<template>
  <div class="blog">
    <div class="blog_post" data-type="title">Wall</div>
    <div v-for="p in dataStore.wall" :key="p.id" class="blog_post">
      <div class="post_ts">{{ p.ts }}</div>
      <div class="post_text">
        {{ p.text }}
      </div>
      <div class="post_author">{{ p.user }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
