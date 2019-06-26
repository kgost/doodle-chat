<template>
  <div>
    <div class="wrapper">
      <h3>Conversations</h3>
      <router-link to="conversations/new"  class="new">new</router-link>
      <ul>
        <li v-for="( conversation, i ) of conversations">
          <router-link :to="`/conversations/${ conversation.id }`">{{ conversation.name }}</router-link>
          <router-link :to="`/conversations/${ conversation.id }/edit`">Edit</router-link>
          <button v-if="isOwner( conversation.userId )" v-on:click="onDelete( conversation.id )">Delete</button>
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
  get conversations() {
    return Object.values( store.state.conversations );
  }

  private isOwner( userId ) {
    return store.state.user.id === userId;
  }

  private onDelete( id: number ) {
    store.dispatch( 'removeConversation', id );
  }

  private mounted() {
    store.dispatch( 'getConversations' );
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
