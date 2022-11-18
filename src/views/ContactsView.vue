<script setup lang="ts">
import { ref, computed } from "vue";

import { useDataStore } from "@/stores/data";

const dataStore = useDataStore();

const newContact = ref("");
const addingNewContact = ref(false);
function addNewContact() {
  console.log("adding contact: ", newContact.value);
  if (!newContact.value) {
    return;
  }
  addingNewContact.value = true;
  dataStore.addContact(newContact.value).then(() => {
    newContact.value = "";
    addingNewContact.value = false;
  });
}
function acceptContact(id: string) {
  console.log("accept contact: ", id);
  dataStore.acceptContact(id);
}

const selectedContact = ref(undefined as undefined | any);
function selectContact(contact: any) {
  selectedContact.value = contact;
}
</script>

<template>
  <div v-if="!selectedContact">
    <div class="blog">
      <div class="blog_post" data-type="title">
        Contacts
        <input type="text" v-model="newContact" />
        <button @click="addNewContact" class="button" data-size="small">
          +
        </button>
      </div>

      <div
        v-for="c in dataStore.contacts"
        :key="c.id"
        class="blog_post"
        @click="selectContact(c)"
      >
        {{ c.user_id }}
      </div>
    </div>

    <!-- Contact Requests -->
    <div class="blog" v-if="dataStore.contactRequests.length">
      <div class="blog_post" data-type="title">Contact Requests</div>

      <div v-for="c in dataStore.contactRequests" :key="c.id" class="blog_post">
        {{ c.id }}
        <button @click="acceptContact(c.id)" class="button" data-size="small">
          accept
        </button>
      </div>
    </div>
  </div>

  <div v-else>
    <div class="blog_header">
      {{ selectedContact.user_id }}
      <button
        @click="selectedContact = undefined"
        class="button"
        data-size="small"
      >
        back
      </button>
    </div>

    <div class="blog">
      <div class="blog_post" data-type="title">Public Blogs</div>
      <div
        v-for="b in dataStore.userData[selectedContact.user_id]['public_blogs']"
        :key="b.id"
        class="blog_post"
      >
        {{ b.name }}
        <button
          v-if="dataStore.subscriptionsMap[b.id]"
          class="button"
          data-size="small"
        >
          Remove
        </button>
        <button
          v-else
          @click="dataStore.subscribe(selectedContact.user_id, b.id)"
          class="button"
          data-size="small"
        >
          Add
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
