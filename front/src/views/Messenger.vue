<template>
  <div>
    <div class="flex-container">
      <SideBar></SideBar>
      <Conversation v-if="showConversation"></Conversation>

      <Friendship v-if="showFriendship"></Friendship>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import store from '@/store.ts';
import router from '@/router.ts';

import SocketService from '@/services/SocketService';

const socketService = new SocketService();

import SideBar from '@/components/SideBar.vue';
import Conversation from '@/components/Conversation.vue';
import Friendship from '@/components/Friendship.vue';

@Component({
  components: {
    SideBar,
    Conversation,
    Friendship,
  },
  beforeRouteLeave( to, from, next ) {
    store.commit( 'clearMessages' );

    if ( to.name !== 'conversation' && to.name !== 'friendship' ) {
      if ( from.name === 'conversation' ) {
        socketService.leaveConversation( store.state.conversationId );
      } else if ( from.name === 'friendship' ) {
        socketService.leaveFriendship( store.state.friendshipId );
      }

      store.commit( 'leaveRooms' );
    }

    next();
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
