import { ref, computed } from "vue";
import type { Ref } from "vue";
import { defineStore } from "pinia";

import { rid } from "@/rethinkid";
import { useAuthStore } from "./auth";
import type { Message } from "@mostlytyped/rethinkid-js-sdk/dist/types/types";
import type { Table } from "@mostlytyped/rethinkid-js-sdk/dist/types/table";

const CONTACT_REQUESTS_TABLE_NAME = "contact_requests";
const CONTACTS_TABLE_NAME = "contacts";
const SUBSCRIPTIONS_TABLE_NAME = "subscriptions";
const PUBLIC_BLOGS_TABLE_NAME = "public_blogs";
const PRIVATE_BLOGS_TABLE_NAME = "private_blogs";
const GROUP_CHATS_TABLE_NAME = "group_chats";
const INDIVIDUAL_CHATS_TABLE_NAME = "individual_chats";

export const useDataStore = defineStore("data", () => {
  // TODO add contact request table

  const data = ref({
    contact_requests: [] as any[],
    contacts: [] as any[],
    subscriptions: [] as any[],
    public_blogs: [] as any[],
    private_blogs: [] as any[],
    group_chats: [] as any[],
    individual_chats: [] as any[],
  } as { [key: string]: any });
  const contactRequests = computed(() => data.value.contact_requests);
  const contacts = computed(() => data.value.contacts);
  const subscriptions = computed(() => data.value.subscriptions);
  const publicBlogs = computed(() => data.value.public_blogs);
  const privateBlogs = computed(() => data.value.private_blogs);
  const groupChats = computed(() => data.value.group_chats);
  // const individualChats = computed(() => data.value.individual_chats);

  const subscriptionsMap = computed(() => {
    let map = {} as any;
    for (const sub of data.value.subscriptions) {
      map[sub.blog_id] = sub;
    }
    return map;
  });

  const contactsMap = computed(() => {
    let map = {} as any;
    for (const c of data.value.contacts) {
      map[c.user_id] = c;
    }
    return map;
  });

  const tables = {
    contact_requests: rid.table(CONTACT_REQUESTS_TABLE_NAME, async () => {
      await rid.permissionsSet([
        {
          tableName: CONTACT_REQUESTS_TABLE_NAME,
          userId: "*",
          type: "insert",
          condition: {
            matchUserId: "id",
          },
        },
      ]);
      return;
    }),
    contacts: rid.table(CONTACTS_TABLE_NAME, async () => {
      return;
    }),
    subscriptions: rid.table(SUBSCRIPTIONS_TABLE_NAME, async () => {
      return;
    }),
    public_blogs: rid.table(PUBLIC_BLOGS_TABLE_NAME, async () => {
      await rid.permissionsSet([
        {
          tableName: PUBLIC_BLOGS_TABLE_NAME,
          userId: "*",
          type: "read",
        },
      ]);
      return;
    }),
    private_blogs: rid.table(PRIVATE_BLOGS_TABLE_NAME, async () => {
      // await rid.permissionsSet([
      //   {
      //     tableName: PRIVATE_BLOGS_TABLE_NAME,
      //     userId: "*",
      //     type: "read",
      //     condition: {
      //       findUserIdIn: "users",
      //     },
      //   }
      // ]);
      return;
    }),
    group_chats: rid.table(GROUP_CHATS_TABLE_NAME, async () => {
      // await rid.permissionsSet([
      //   {
      //     tableName: GROUP_CHATS_TABLE_NAME,
      //     userId: "*",
      //     type: "read",
      //     condition: {
      //       findUserIdIn: "users",
      //     },
      //   }
      // ]);
      return;
    }),
    individual_chats: rid.table(INDIVIDUAL_CHATS_TABLE_NAME, async () => {
      await rid.permissionsSet([
        {
          tableName: INDIVIDUAL_CHATS_TABLE_NAME,
          userId: "*",
          type: "read",
          condition: {
            matchUserId: "user_id",
          },
        },
      ]);
      return;
    }),
  } as { [key: string]: any };

  let unsubscribe = {
    contact_requests: undefined as (() => Promise<Message>) | undefined,
    contacts: undefined as (() => Promise<Message>) | undefined,
    subscriptions: undefined as (() => Promise<Message>) | undefined,
    public_blogs: undefined as (() => Promise<Message>) | undefined,
    private_blogs: undefined as (() => Promise<Message>) | undefined,
    group_chats: undefined as (() => Promise<Message>) | undefined,
    individual_chats: undefined as (() => Promise<Message>) | undefined,
  } as { [key: string]: any };

  const userData = ref({} as { [key: string]: any });
  let userUnsubscribe = {} as { [key: string]: any };

  const blogData = ref({} as { [key: string]: any });
  let blogUnsubscribe = {} as { [key: string]: any };

  const wall = computed(() => {
    let wall = [];
    for (let u in blogData.value) {
      let posts = blogData.value[u].map((p: any) => {
        p.user = u;
        return p;
      });
      wall.push(...posts);
    }
    wall.sort((a, b) => {
      return new Date(b.ts).getTime() - new Date(a.ts).getTime();
    });
    return wall;
  });

  // async function sync(
  //   data: any[],
  //   table: Table
  // ): Promise<() => Promise<Message>> {
  //   // Get data
  //   const readResponse = await table.read();
  //   if (Array.isArray(readResponse.data)) {
  //     data = readResponse.data;
  //   }
  //   console.log("readResponse", readResponse);

  //   // Subscribe to changes
  //   return await table.subscribe(
  //     {},
  //     (changes: { old_val: any; new_val: any }) => {
  //       if (changes.old_val == null) {
  //         // Added value
  //         data.push(changes.new_val);
  //         return;
  //       }
  //       // Find the object
  //       const index = data.findIndex((el) => el.id == changes.old_val.id);
  //       if (changes.new_val == null) {
  //         // Deleted value
  //         data.splice(index, 1);
  //         return;
  //       }
  //       // Changed value
  //       data[index] = changes.new_val;
  //     }
  //   );
  // }

  async function fetchData(
    table:
      | "contact_requests"
      | "contacts"
      | "subscriptions"
      | "public_blogs"
      | "private_blogs"
      | "group_chats"
      | "individual_chats",
    onAdd?: (item: any) => Promise<void>,
    onDelete?: (item: any) => Promise<void>
  ): Promise<void> {
    if (unsubscribe[table]) {
      console.log("cannot fetch if subscribed");
      return;
    }
    console.log("fetch", table);
    try {
      // console.log("Before", table, ":", data.value[table]);
      // data.value[table] = [];
      // unsubscribe[table] = await sync(data.value[table], tables[table]);
      // console.log("After", table, ":", data.value[table]);

      // Get data
      const readResponse = await tables[table].read();
      if (Array.isArray(readResponse.data)) {
        data.value[table] = readResponse.data;
        if (onAdd) {
          for (const d of readResponse.data) {
            onAdd(d).catch((err) => console.log("failed onAdd:", err));
          }
        }
      }

      // Subscribe to changes
      unsubscribe[table] = await tables[table].subscribe(
        {},
        (changes: { old_val: any; new_val: any }) => {
          if (changes.old_val == null) {
            // Added value
            data.value[table].push(changes.new_val);
            if (onAdd) {
              onAdd(changes.new_val).catch((err) =>
                console.log("failed onAdd:", err)
              );
            }
            return;
          }
          // Find the object
          const index = data.value[table].findIndex(
            (el: any) => el.id == changes.old_val.id
          );
          if (changes.new_val == null) {
            // Deleted value
            data.value[table].splice(index, 1);
            if (onDelete) {
              onDelete(changes.new_val).catch((err) =>
                console.log("failed onDelete:", err)
              );
            }
            return;
          }
          // Changed value
          data.value[table][index] = changes.new_val;
        }
      );
      console.log("readResponse", readResponse);
    } catch (err) {
      console.log("Error reading table:", err);
    }
  }

  async function fetchUserData(user: any): Promise<void> {
    console.log("fetch user", user);
    const userId = user.user_id;
    console.log("fetch user data", userId);

    if (userUnsubscribe[userId]) {
      console.log("cannot fetch if subscribed");
      return;
    }

    userUnsubscribe[userId] = {};
    userData.value[userId] = {};
    // Fetch public blogs, TODO: private blogs and group chats later
    for (const table of [PUBLIC_BLOGS_TABLE_NAME]) {
      try {
        // Get data
        const readResponse = await rid.tableRead(table, {
          userId: userId,
        });
        if (Array.isArray(readResponse.data)) {
          userData.value[userId][table] = readResponse.data;
        }

        // Subscribe to changes
        userUnsubscribe[userId][table] = await rid.tableSubscribe(
          table,
          { userId: userId },
          (changes: { old_val: any; new_val: any }) => {
            if (changes.old_val == null) {
              // Added value
              userData.value[userId][table].push(changes.new_val);
              return;
            }
            // Find the object
            const index = userData.value[userId][table].findIndex(
              (el: any) => el.id == changes.old_val.id
            );
            if (changes.new_val == null) {
              // Deleted value
              userData.value[userId][table].splice(index, 1);
              return;
            }
            // Changed value
            userData.value[userId][table][index] = changes.new_val;
          }
        );
        console.log("readResponse", readResponse);
      } catch (err) {
        console.log("Error reading users table", table, ":", err);
      }
    }
    // Fetch messages
    const table = INDIVIDUAL_CHATS_TABLE_NAME;
    try {
      // Get data
      const readResponse = await rid.tableRead(table, {
        userId: userId,
      });
      if (Array.isArray(readResponse.data)) {
        userData.value[userId][table] = readResponse.data;

        const last = readResponse.data.at(-1);
        if (
          last &&
          contactsMap.value[userId] &&
          (!contactsMap.value[userId].last_message ||
            contactsMap.value[userId].last_message < last.ts)
        ) {
          tables.contacts.update({ id: user.id, last_message: last.ts });
        }
      }

      // Subscribe to changes
      userUnsubscribe[userId][table] = await rid.tableSubscribe(
        table,
        { userId: userId },
        (changes: { old_val: any; new_val: any }) => {
          if (changes.old_val == null) {
            // Added value
            userData.value[userId][table].push(changes.new_val);
            if (
              contactsMap.value[userId] &&
              (!contactsMap.value[userId].last_message ||
                contactsMap.value[userId].last_message < changes.new_val.ts)
            ) {
              tables.contacts.update({
                id: user.id,
                last_message: changes.new_val.ts,
              });
            }
            return;
          }
          // Find the object
          const index = userData.value[userId][table].findIndex(
            (el: any) => el.id == changes.old_val.id
          );
          if (changes.new_val == null) {
            // Deleted value
            userData.value[userId][table].splice(index, 1);
            return;
          }
          // Changed value
          userData.value[userId][table][index] = changes.new_val;
        }
      );
      console.log("readResponse", readResponse);
    } catch (err) {
      console.log("Error reading users table", table, ":", err);
    }
  }

  async function fetchBlogData(subscription: any): Promise<void> {
    console.log("fetch blog", subscription);
    const userId = subscription.user_id;
    const blogId = subscription.blog_id;
    console.log("fetch blog data", blogId, "from", userId);

    if (blogUnsubscribe[blogId]) {
      console.log("cannot fetch if subscribed");
      return;
    }

    blogData.value[blogId] = [];

    try {
      // Get data
      const readResponse = await rid.tableRead(blogId, {
        userId: userId,
      });
      if (Array.isArray(readResponse.data)) {
        blogData.value[blogId] = readResponse.data;
      }

      // Subscribe to changes
      blogUnsubscribe[blogId] = await rid.tableSubscribe(
        blogId,
        { userId: userId },
        (changes: { old_val: any; new_val: any }) => {
          if (changes.old_val == null) {
            // Added value
            blogData.value[blogId].push(changes.new_val);
            return;
          }
          // Find the object
          const index = blogData.value[blogId].findIndex(
            (el: any) => el.id == changes.old_val.id
          );
          if (changes.new_val == null) {
            // Deleted value
            blogData.value[blogId].splice(index, 1);
            return;
          }
          // Changed value
          blogData.value[blogId][index] = changes.new_val;
        }
      );
      console.log("readResponse", readResponse);
    } catch (err) {
      console.log("Error reading users table", blogId, ":", err);
    }
  }

  async function fetchAll(): Promise<void> {
    fetchData("contact_requests");
    fetchData("contacts", fetchUserData); // TODO add onDelete
    fetchData("subscriptions", fetchBlogData);
    fetchData("public_blogs");
    fetchData("private_blogs");
    fetchData("group_chats");
    fetchData("individual_chats"); // TODO: fetch messages
  }

  async function addContact(id: string) {
    console.log("Add contact", id);
    try {
      // Invite
      const authStore = useAuthStore();
      if (!authStore.user || !authStore.user.id) {
        console.log("Cannot invite, don't have own ID");
        return;
      }
      await rid.tableInsert(
        CONTACT_REQUESTS_TABLE_NAME,
        { id: authStore.user.id },
        { userId: id }
      );
    } catch (err) {
      console.log("Cannot invite contact, maybe does not exist:", err);
      return;
    }
    try {
      // Add contact
      await tables.contacts.insert({ user_id: id });
    } catch (err) {
      console.log("Cannot add contact:", err);
    }
  }

  async function acceptContact(id: string) {
    console.log("Accept contact", id);
    try {
      // Add contact
      await tables.contacts.insert({ user_id: id });
    } catch (err) {
      console.log("Cannot add contact:", err);
      return;
    }
    try {
      // Delete invite
      await tables.contact_requests.delete(id);
    } catch (err) {
      console.log("Cannot delete invite:", err);
      return;
    }
  }

  async function addPublicBlog(name: string) {
    console.log("Add public blog", name);
    try {
      await tables.public_blogs.insert({ name: name });
    } catch (err) {
      console.log("Cannot add public blog:", err);
    }
  }

  let publicBlogTables = {} as { [key: string]: Table };
  let publicBlogUnsubscribe = {} as { [key: string]: () => Promise<Message> };
  let publicBlogContent = ref({} as { [key: string]: any });
  const publicBlog = computed(() => {
    return (id: string) => {
      if (publicBlogContent.value[id]) {
        return publicBlogContent.value[id];
      }
      return [];
    };
  });

  async function loadPublicBlog(id: string) {
    // Add table
    if (!(id in publicBlogTables)) {
      publicBlogTables[id] = rid.table(id, async () => {
        await rid.permissionsSet([
          {
            tableName: id,
            userId: "*",
            type: "read",
          },
        ]);
        return;
      });
    }

    if (publicBlogUnsubscribe[id]) {
      console.log("Already subscribed to public blog", id);
      return;
    }

    try {
      // Get data
      const readResponse = await publicBlogTables[id].read();
      if (Array.isArray(readResponse.data)) {
        publicBlogContent.value[id] = readResponse.data;
      }

      // Subscribe to changes
      publicBlogUnsubscribe[id] = await publicBlogTables[id].subscribe(
        {},
        (changes: { old_val: any; new_val: any }) => {
          if (changes.old_val == null) {
            // Added value
            publicBlogContent.value[id].push(changes.new_val);
            return;
          }
          // Find the object
          const index = publicBlogContent.value[id].findIndex(
            (el: any) => el.id == changes.old_val.id
          );
          if (changes.new_val == null) {
            // Deleted value
            publicBlogContent.value[id].splice(index, 1);
            return;
          }
          // Changed value
          publicBlogContent.value[id][index] = changes.new_val;
        }
      );
      console.log("readResponse", readResponse);
    } catch (err) {
      console.log("Error loading public blog", id, ":", err);
    }
  }

  async function postPublicBlog(id: string, post: { text: string; ts?: Date }) {
    if (!(id in publicBlogTables)) {
      await loadPublicBlog(id);
    }

    try {
      if (!post.text) {
        return;
      }
      post.ts = new Date();
      console.log("got post", post);
      await publicBlogTables[id].insert(post);
    } catch (err) {
      console.log("Cannot post to public blog", id, ":", err);
    }
  }

  async function subscribe(userId: string, blogId: string) {
    console.log("Subscribe to", blogId, "by", userId);
    try {
      await tables.subscriptions.insert({ user_id: userId, blog_id: blogId });
    } catch (err) {
      console.log("Cannot subscribe:", err);
    }
  }

  async function postMessage(message: {
    user_id: string;
    text: string;
    ts?: Date;
  }) {
    console.log("post message for", message.user_id);
    try {
      if (!message.text) {
        return;
      }
      message.ts = new Date();
      await tables.individual_chats.insert(message);
      await tables.contacts.update({
        id: contactsMap.value[message.user_id].id,
        last_message: message.ts,
      });
    } catch (err) {
      console.log("Cannot post message:", err);
    }
  }

  const individualChat = computed(() => {
    return (user_id: string) => {
      let messages = data.value.individual_chats.filter(
        (c: any) => c.user_id == user_id
      );
      if (userData.value[user_id] && userData.value[user_id].individual_chats) {
        messages.push(...userData.value[user_id].individual_chats);
      }
      messages.sort((a: any, b: any) => {
        return new Date(b.ts).getTime() - new Date(a.ts).getTime();
      });
      console.log(messages);
      return messages;
    };
  });

  return {
    // state
    userData,
    blogData,

    // getters
    contactRequests,
    contacts,
    subscriptions,
    publicBlogs,
    privateBlogs,
    groupChats,
    // individualChats,
    subscriptionsMap,
    wall,

    // getters with parameter
    publicBlog,
    individualChat,

    // actions
    fetchAll,
    addContact,
    acceptContact,
    addPublicBlog,
    loadPublicBlog,
    postPublicBlog,
    subscribe,
    postMessage,
  };
});
