<template>
  <div>
    <h1 v-if="friendship">{{ friendName }}</h1>

    <div v-for="message of messages" :key="message.id" class="message-list">
      <div>
        <span v-html="emojifyMessage( decode( decrypt( message.message ) ) )" class="message"></span>
        <span>{{ message.author.username }}</span>
        <button v-on:click="onEdit( message )" v-if="isOwner( message.userId )">Edit</button>
        <button v-on:click="onDelete( message.id )" v-if="isOwner( message.userId )">Delete</button>
      </div>

      <div>
        <EditReaction :messageId="message.id" :accessKey="accessKey"></EditReaction>
        <img v-for="( reaction, i ) of message.reactions" :key="i" :src="emojify( decrypt( reaction.emoji ) )" :alt="decrypt( reaction.emoji )" :title="getUsername( reaction.userId )" class="emoji">
      </div>
    </div>

    <TypingNames :names="typingNames"></TypingNames>

    <EditMessage v-if="friendship" v-model="activeMessage" :accessKey="accessKey" :name="name"></EditMessage>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import twemoji from 'twemoji';

import store from '@/store.ts';
import router from '@/router.ts';

import EditMessage from '@/components/EditMessage.vue';
import EditReaction from '@/components/EditReaction.vue';
import TypingNames from '@/components/TypingNames.vue';

@Component({
  components: {
    EditMessage,
    EditReaction,
    TypingNames,
  },
})
export default class Friendship extends Vue {
  private activeMessage = {
    id: 0,
    message: '',
  };

  get friendName() {
    if ( this.friendship.userOneId === store.state.user.id ) {
      return this.friendship.userTwo.username;
    } else {
      return this.friendship.userOne.username;
    }
  }

  get messages() {
    return Object.values( store.state.messages ).sort( ( a: any, b: any ) => {
      if ( a.createdAt > b.createdAt ) {
        return 1;
      } else if ( b.createdAt > a.createdAt ) {
        return -1;
      }

      return 0;
    } );
  }

  get friendship() {
    if ( store.state.privateKey ) {
      return store.state.friendships[+this.$route.params.id];
    }
  }

  get accessKey() {
    if ( this.friendship ) {
      const privateKey = store.getters.privateKey;

      if ( this.friendship.userOneId === store.state.user.id ) {
        return privateKey.decrypt( this.friendship.userOneAccessKey );
      }

      return privateKey.decrypt( this.friendship.userTwoAccessKey );
    }

    return '';
  }

  get typingNames() {
    return Object.keys( store.state.typingNames ).filter( ( name ) => {
      return name !== this.name;
    } );
  }

  get name() {
    return store.state.user.username;
  }

  private decrypt( message: string ) {
    return store.getters.getDecryptedMessage({ message, key: this.accessKey });
  }

  private isOwner( id: number ) {
    return store.state.user.id === id;
  }

  private onEdit( message: any ) {
    this.activeMessage.id = message.id;
    this.activeMessage.message = this.decode( this.decrypt( message.message ) );
  }

  private onDelete( messageId: number ) {
    store.dispatch( 'removeFriendshipMessage', { id: +this.$route.params.id, messageId } );
  }

  private emojify( emoji: string ) {
    return `https://twemoji.maxcdn.com/2/72x72/${ twemoji.convert.toCodePoint( decodeURIComponent( emoji ) ) }.png`;
  }

  private emojifyMessage( message: string ) {
    return twemoji.parse( message );
  }

  private decode( message: string ) {
    return decodeURIComponent( escape( message ) );
  }

  private getUsername( id: number ) {
    if ( this.friendship.userOneId === id ) {
      return this.friendship.userOne.username;
    } else {
      return this.friendship.userTwo.username;
    }
  }

  private mounted() {
    store.commit( 'clearMessages' );
    store.dispatch( 'getFriendship', +router.currentRoute.params.id )
      .then( () => {
        store.dispatch( 'joinFriendship', +router.currentRoute.params.id );
        store.dispatch( 'getFriendshipMessages', { id: +router.currentRoute.params.id, offset: 0 } );
      } );
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.emoji {
  width: 32px;
}
</style>
