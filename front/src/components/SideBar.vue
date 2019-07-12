<template>
  <div>
    <div class="wrapper">
      <h3>Conversations</h3>
      <router-link to="/conversations/new"  class="new">new</router-link>
      <ul>
        <li v-for="( conversation, i ) of conversations" :key="i">
          <router-link :to="`/conversations/${ conversation.id }`">{{ conversation.name }} {{ conversation.notifications.length ? conversation.notifications.length : '' }}</router-link>
          <router-link :to="`/conversations/${ conversation.id }/edit`">Edit</router-link>
          <button v-if="isOwner( conversation.userId )" v-on:click="onDeleteConversation( conversation.id )">Delete</button>
        </li>
      </ul>
    </div>

    <div class="wrapper">
      <h3>Friends</h3>
      <router-link to="/friendships/new"  class="new">new</router-link>
      <ul>
        <li v-for="( friendship, i ) of friendships" :key="i">
          <router-link :to="`/friendships/${ friendship.id }`">{{ getFriendName( friendship ) }} {{ friendship.notifications.length ? friendship.notifications.length : '' }}</router-link>
          <button v-if="showAccept( friendship )" v-on:click="onAccept( friendship )">Accept</button>
          <span v-if="!showAccept( friendship ) && showPending( friendship )">Pending</span>
          <button v-on:click="onDeleteFriendship( friendship.id )">Delete</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import store from '@/store.ts';
import router from '@/router.ts';

@Component({
})
export default class SideBar extends Vue {
  get friendships() {
    return Object.values( store.state.friendships );
  }

  get conversations() {
    return Object.values( store.state.conversations );
  }

  private isOwner( userId ) {
    return store.state.user.id === userId;
  }

  private onDeleteConversation( id: number ) {
    store.dispatch( 'removeConversation', id );
  }

  private getFriendName( friendship: any ) {
    if ( friendship.userOneId === store.state.user.id ) {
      return friendship.userTwo.username;
    } else {
      return friendship.userOne.username;
    }
  }

  private showAccept( friendship: any ) {
    if ( friendship.userTwoId === store.state.user.id && !friendship.userTwoAccepted ) {
      return true;
    } else {
      return false;
    }
  }

  private showPending( friendship: any ) {
    return !friendship.userTwoAccepted;
  }

  private onAccept( friendship: any ) {
    friendship.userTwoAccepted = true;

    store.dispatch( 'updateFriendship', friendship );
  }

  private onDeleteFriendship( id: number ) {
    store.dispatch( 'removeFriendship', id );
  }

  private mounted() {
    store.dispatch( 'getConversations' );
    store.dispatch( 'getFriendships' );
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.wrapper {
  position: relative;

  .new {
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
