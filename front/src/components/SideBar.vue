<template>
  <div class="sidebar" :class="{ open: open }">
    <div class="mobile-header">
      <h2>
        Saoirse

        <router-link to="/settings" class="settings"><span class="glyphicon glyphicon-cog"></span></router-link>
        <span v-on:click="onSignOut" class="sign-out glyphicon glyphicon-log-out"></span>
      </h2>

      <span v-on:click="onClose" class="glyphicon glyphicon-remove close"></span>
    </div>

    <div class="container">
      <div class="wrapper">
        <h3>Conversations</h3>
        <router-link to="/conversations/new"  class="new"><span class="glyphicon glyphicon-plus"></span></router-link>
        <ul>
          <li v-for="( conversation, i ) of conversations" :key="i">
            <router-link v-on:click.native="onClose" :to="`/conversations/${ conversation.id }`">{{ conversation.name }} <span v-show="conversation.notifications.length" class="notifications">{{ conversation.notifications.length ? conversation.notifications.length : '' }}</span></router-link>
            <router-link :to="`/conversations/${ conversation.id }/edit`"><span class="glyphicon glyphicon-edit"></span></router-link>
            <span v-if="isOwner( conversation.userId )" v-on:click="onDeleteConversation( conversation.id )" class="glyphicon glyphicon-trash"></span>
          </li>
        </ul>
      </div>

      <div class="wrapper">
        <h3>Friends</h3>
        <router-link to="/friendships/new"  class="new"><span class="glyphicon glyphicon-plus"></span></router-link>
        <ul>
          <li v-for="( friendship, i ) of friendships" :key="i">
            <router-link v-on:click.native="onClose" :to="`/friendships/${ friendship.id }`">{{ getFriendName( friendship ) }} <span v-show="friendship.notifications.length" class="notifications">{{ friendship.notifications.length ? friendship.notifications.length : '' }}</span></router-link>
            <button v-if="showAccept( friendship )" v-on:click="onAccept( friendship )">Accept</button>
            <span v-if="!showAccept( friendship ) && showPending( friendship )">Pending</span>
            <span v-on:click="onDeleteFriendship( friendship.id )" class="glyphicon glyphicon-trash"></span>
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

  private onSignOut() {
    store.dispatch( 'signOut' );
    this.onClose();
    router.push({ path: '/signin' });
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
  border-right: 1px solid black;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 3;
  width: 300px;
  background-color: #FFFFFF;

  .mobile-header {
    padding-left: 10px;
    display: none;
  }

  .container {
    padding-left: 10px;
    overflow: auto;

    .wrapper {
      position: relative;

      .new {
        position: absolute;
        top: 0;
        right: 0;
      }

      ul {
        padding: 0;
        list-style: none;
        font-size: 18px;

        li {
          .router-link-exact-active {
            color: #2b9ce3;
          }

          .glyphicon {
            margin-left: 5px;
            font-size: 20px;
          }

          .notifications {
            background-color: red;
            border-radius: 5px;
            padding: 4px 4px 0;
            color: white;
            font-size: 17px;
            font-weight: bolder;
          }
        }
      }
    }
  }
}


@media only screen and (max-width: 600px) {
  .sidebar {
    width: 100%;
    left: -100%;
    border: none;

    &.open {
      left: 0;
    }

    .mobile-header {
      display: block;

      .settings, .sign-out {
        display: inline-block;
        margin-left: 10px;
        font-size: 0.83em;
      }

      .close {
        position: absolute;
        top: 0;
        right: 0;
        font-size: 25px;
      }
    }
  }
}
</style>
