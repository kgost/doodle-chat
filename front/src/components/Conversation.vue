<template>
  <div>
    <h1 v-if="conversation">{{ conversation.name }}</h1>

    <div v-for="message of messages" :key="message.id" class="message-list">
      <div>
        <span v-html="emojifyMessage( decode( decrypt( message.message ) ) )" class="message"></span>
        <span>{{ getUsername( message.userId ) }}</span>
        <button v-on:click="onEdit( message )" v-if="isOwner( message.userId )">Edit</button>
        <button v-on:click="onDelete( message.id )" v-if="isOwner( message.userId )">Delete</button>
      </div>

      <div>
        <EditReaction :messageId="message.id" :accessKey="accessKey"></EditReaction>
        <img v-for="( reaction, i ) of message.reactions" :key="i" :src="emojify( decrypt( reaction.emoji ) )" :alt="decrypt( reaction.emoji )" :title="getUsername( reaction.userId )" class="emoji">
      </div>
    </div>

    <TypingNames :names="typingNames"></TypingNames>

    <EditMessage v-if="conversation" v-model="activeMessage" :accessKey="accessKey" :name="name"></EditMessage>
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
export default class Conversation extends Vue {
  private activeMessage = {
    id: 0,
    message: '',
  };

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

  get conversation() {
    if ( store.state.privateKey ) {
      return store.state.conversations[+this.$route.params.id];
    }
  }

  get accessKey() {
    if ( this.conversation ) {
      const privateKey = store.getters.privateKey;

      for ( const participant of this.conversation.participants ) {
        if ( participant.userId === store.state.user.id ) {
          return privateKey.decrypt( participant.accessKey );
        }
      }
    }

    return '';
  }

  get typingNames() {
    return Object.keys( store.state.typingNames ).filter( ( name ) => {
      return name !== this.name;
    } );
  }

  get name() {
    for ( const participant of this.conversation.participants ) {
      if ( participant.userId === store.state.user.id ) {
        return participant.nickname || store.state.user.username;
      }
    }
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
    store.dispatch( 'removeConversationMessage', { id: +this.$route.params.id, messageId } );

    if ( messageId === this.activeMessage.id ) {
      Vue.set( this.activeMessage, 'id', 0 );
      Vue.set( this.activeMessage, 'message', '' );
    }
  }

  private emojify( emoji: string ) {
    return `/img/emojis/${ twemoji.convert.toCodePoint( decodeURIComponent( emoji ) ) }.png`;
  }

  private emojifyMessage( message: string ) {
    return twemoji.parse( message, ( icon, options, variant ) => {
      return `/img/emojis/${ icon }.png`;
    } );
  }

  private decode( message: string ) {
    return decodeURIComponent( escape( message ) );
  }

  private getUsername( id: number ) {
    for ( const participant of this.conversation.participants ) {
      if ( participant.userId === id ) {
        if ( participant.nickname ) {
          return participant.nickname;
        }

        return participant.user.username;
      }
    }
  }

  private mounted() {
    store.commit( 'clearMessages' );
    store.dispatch( 'getConversation', +router.currentRoute.params.id )
      .then( () => {
        store.dispatch( 'joinConversation', +router.currentRoute.params.id );
        store.dispatch( 'getConversationMessages', { id: +router.currentRoute.params.id, offset: 0 } );
      } );
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.emoji {
  height: 32px;
}
</style>

<style lang="scss">
.message-list {
  .message {
    .emoji {
      height: 1em;
      margin: 0 .05em 0 .1em;
      vertical-align: -0.1em;
    }
  }
}
</style>
