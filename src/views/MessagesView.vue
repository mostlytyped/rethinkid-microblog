<script setup lang="ts">
import { ref, computed } from "vue";

import { useDataStore } from "@/stores/data";

const dataStore = useDataStore();

const individualChats = computed(() =>
  dataStore.contacts.filter((c: any) => {
    return !!c.last_message;
  })
);
const chatlessUsers = computed(() =>
  dataStore.contacts.filter((c: any) => {
    return !c.last_message;
  })
);
// dataStore.contacts that have last_message
// dataStore.postMessage to post new message
// dataStore.individualChat(user_id) to get thread for user

const addingIndividualChat = ref(false);
const message = ref("");
const chatUser = ref("");
function cancelAddingIndChat() {
  addingIndividualChat.value = false;
  message.value = "";
  chatUser.value = "";
}
function addIndividualChat() {
  if (chatUser.value == "") {
    console.log("needs user");
    // TODO better signal
    return;
  }
  if (message.value == "") {
    console.log("needs message");
    // TODO better signal
    return;
  }
  dataStore.postMessage({ user_id: chatUser.value, text: message.value });
  cancelAddingIndChat();
}
const currentIndividualChat = ref(undefined as undefined | any);
function sendIndividualMessage() {
  if (!currentIndividualChat.value) {
    console.log("needs user");
    // TODO better signal
    return;
  }
  if (message.value == "") {
    console.log("needs message");
    // TODO better signal
    return;
  }
  dataStore.postMessage({
    user_id: currentIndividualChat.value.user_id,
    text: message.value,
  });
  message.value = "";
}
</script>

<template>
  <div class="blog">
    <div class="blog_post" data-type="title">
      Group chats <button class="button" data-size="small">+</button>
    </div>
    <div v-for="b in dataStore.groupChats" :key="b.id" class="blog_post">
      {{ b.name }}
    </div>
  </div>

  <!-- all individual chats -->
  <div v-if="!currentIndividualChat" class="blog">
    <!-- header -->
    <div class="blog_post" data-type="title">
      Individual chats
      <button
        v-show="!addingIndividualChat"
        @click="addingIndividualChat = true"
        class="button"
        data-size="small"
      >
        +
      </button>
      <button
        v-show="addingIndividualChat"
        @click="cancelAddingIndChat"
        class="button"
        data-size="small"
      >
        x
      </button>
      <div v-show="addingIndividualChat">
        <label for="users">User:</label>
        <select
          id="users"
          name="users"
          v-model="chatUser"
          class="button"
          data-size="small"
        >
          <option v-for="u in chatlessUsers" :key="u.id" :value="u.user_id">
            {{ u.user_id }}
          </option>
        </select>
        <input type="text" v-model="message" />
        <button @click="addIndividualChat" class="button" data-size="small">
          +
        </button>
      </div>
    </div>

    <!-- chats -->
    <div
      v-for="c in individualChats"
      :key="c.id"
      class="blog_post"
      @click="currentIndividualChat = c"
    >
      {{ c.user_id }}
    </div>
  </div>
  <!-- selected chat -->
  <div v-else class="blog">
    <!-- header -->
    <div class="blog_post" data-type="title">
      {{ currentIndividualChat.user_id }}
      <button
        @click="currentIndividualChat = undefined"
        class="button"
        data-size="small"
      >
        back
      </button>
      <div>
        <input type="text" v-model="message" />
        <button @click="sendIndividualMessage" class="button" data-size="small">
          send
        </button>
      </div>
    </div>

    <!-- messages -->
    <div
      v-for="p in dataStore.individualChat(currentIndividualChat.user_id)"
      :key="p.id"
      class="message"
      :data-type="p.user_id == currentIndividualChat.user_id ? 'mine' : 'other'"
    >
      <div class="message_ts">{{ p.ts }}</div>
      <div class="message_text">
        {{ p.text }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
