<script setup lang="ts">
import { ref, computed } from "vue";

import { useDataStore } from "@/stores/data";

const dataStore = useDataStore();

//
// Public blog
//
const addingPubBlog = ref(false);
const pubBlogName = ref("");
function cancelAddingPubBlog() {
  addingPubBlog.value = false;
  pubBlogName.value = "";
}
function addPubBlog() {
  if (pubBlogName.value == "") {
    console.log("needs name");
    // TODO better signal
    return;
  }
  dataStore.addPublicBlog(pubBlogName.value);
  cancelAddingPubBlog();
}
const currentPublicBlog = ref(undefined as undefined | any);
const loadingPublicBlog = ref(true);
function setCurrentPublicBlog(blog: any) {
  loadingPublicBlog.value = true;
  currentPublicBlog.value = blog;
  dataStore
    .loadPublicBlog(blog.id)
    .then(() => (loadingPublicBlog.value = false));
}

const pubBlogPost = ref("");
const postingPublicBlog = ref(false);
function postToPubBlog() {
  console.log("posting: ", pubBlogPost.value);
  if (!pubBlogPost.value) {
    return;
  }
  postingPublicBlog.value = true;
  dataStore
    .postPublicBlog(currentPublicBlog.value.id, { text: pubBlogPost.value })
    .then(() => {
      pubBlogPost.value = "";
      postingPublicBlog.value = false;
    });
}

//
//
//
</script>

<template>
  <div>
    <!-- all blogs -->
    <div v-if="!currentPublicBlog" class="blog">
      <!-- header -->
      <div class="blog_post" data-type="title">
        Public blogs
        <button
          v-show="!addingPubBlog"
          @click="addingPubBlog = true"
          class="button"
          data-size="small"
        >
          +
        </button>
        <button
          v-show="addingPubBlog"
          @click="cancelAddingPubBlog"
          class="button"
          data-size="small"
        >
          x
        </button>
        <div v-show="addingPubBlog">
          <input type="text" v-model="pubBlogName" />
          <button @click="addPubBlog" class="button" data-size="small">
            +
          </button>
        </div>
      </div>

      <!-- blogs -->
      <div
        v-for="b in dataStore.publicBlogs"
        :key="b.id"
        class="blog_post"
        @click="setCurrentPublicBlog(b)"
      >
        {{ b.name }}
      </div>
    </div>

    <!-- selected blog -->
    <div v-else class="blog">
      <!-- header -->
      <div class="blog_post" data-type="title">
        {{ currentPublicBlog.name }}
        <button
          @click="currentPublicBlog = undefined"
          class="button"
          data-size="small"
        >
          back
        </button>
        <div>
          <input type="text" v-model="pubBlogPost" />
          <button @click="postToPubBlog" class="button" data-size="small">
            post
          </button>
        </div>
      </div>

      <!-- posts -->
      <div
        v-for="p in dataStore.publicBlog(currentPublicBlog.id)"
        :key="p.id"
        class="blog_post"
      >
        <div class="post_ts">{{ p.ts }}</div>
        <div class="post_text">
          {{ p.text }}
        </div>
      </div>
    </div>
  </div>

  <div class="blog">
    <div class="blog_post" data-type="title">
      Private blogs <button class="button" data-size="small">+</button>
    </div>
    <div v-for="b in dataStore.privateBlogs" :key="b.id" class="blog_post">
      {{ b.name }}
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
