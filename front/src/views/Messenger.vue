<template>
  <div>
    <div class="flex-container">
      <SideBar></SideBar>
      <Conversation v-if="showConversation"></Conversation>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import store from '@/store.ts';
import router from '@/router.ts';

import SideBar from '@/components/SideBar.vue';
import Conversation from '@/components/Conversation.vue';

@Component({
  components: {
    SideBar,
    Conversation,
  },
})
export default class Messenger extends Vue {
  get showConversation() {
    return this.$route.name === 'conversation';
  }

  get showFriendship() {
    return this.$route.name === 'friendship';
  }
}
</script>
