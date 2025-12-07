<script setup>

import {onMounted} from "vue";
import api from "@/api/index.js";
import { reactive} from "vue";


const stompClient = ref(null)

onMounted(async () => {
  const response = await api.get("/api/members/list");
  console.log(response.data);
  state.members = response.data;

  if(stompClient.value && stompClient.value.connected) {
    return
  }
  const SockJS = new SockJS('/ws-stomp')
});

const state = reactive({
  members: []
});


</script>

<template>
  {{state.members}}
</template>
