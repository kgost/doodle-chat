<template>
  <div class="sidebar" :class="{ open: open }">
    <div class="mobile-header">
      <h3>Saoirse</h3>

      <router-link to="/settings">Settings</router-link>

      <button v-on:click="onClose" class="close">Close</button>
    </div>

    <div class="container">
      <div class="wrapper">
        <h3>Conversations</h3>
        <router-link to="/conversations/new"  class="new">new</router-link>
        <ul>
          <li v-for="( conversation, i ) of conversations" :key="i">
            <router-link v-on:click="onMessageNavigate" :to="`/conversations/${ conversation.id }`">{{ conversation.name }} {{ conversation.notifications.length ? conversation.notifications.length : '' }}</router-link>
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
  </div>
</template>

<script lang="ts">
import { Component, Model, Vue } from 'vue-property-decorator';

import store from '@/store.ts';
import router from '@/router.ts';

@Component({
})
export default class SideBar extends Vue {
  @Model( 'open', { type: Boolean } ) private open!: boolean;

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

  private onClose() {
    this.$emit( 'open', false );
  }

  private onMessageNavigate() {
    store.commit( 'clearMessages' );
  }

  private mounted() {
    store.dispatch( 'getConversations' );
    store.dispatch( 'getFriendships' );
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1;
  background-color: #FFFFFF;

  .mobile-header {
    display: none;
  }

  .container {
    overflow: auto;

    .wrapper {
      position: relative;

      .new {
        position: absolute;
        top: 0;
        right: 0;
      }
    }
  }
}


@media only screen and (max-width: 600px) {
  .sidebar {
    width: 100%;
    left: -100%;

    &.open {
      left: 0;
    }

    .mobile-header {
      display: block;

      .close {
        position: absolute;
        top: 0;
        right: 0;
      }
    }
  }
}
</style>
