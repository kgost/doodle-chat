<template>
  <div>
    <h1 v-if="conversation">{{ conversation.name }}</h1>

    <div v-for="message of messages" :key="message.id">
      <span>{{ decrypt( message.message ) }}</span>
      <span>{{ message.author.username }}</span>
      <button v-on:click="onEdit( message )" v-if="isOwner( message.userId )">Edit</button>
      <button v-on:click="onDelete( message.id )" v-if="isOwner( message.userId )">Delete</button>
    </div>

    <EditMessage v-if="conversation" v-model="activeMessage" :accessKey="accessKey"></EditMessage>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import store from '@/store.ts';
import router from '@/router.ts';

import EditMessage from '@/components/EditMessage.vue';

@Component({
  components: {
    EditMessage,
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

  private decrypt( message: string ) {
    return store.getters.getDecryptedMessage({ message, key: this.accessKey });
  }

  private isOwner( id: number ) {
    return store.state.user.id === id;
  }

  private onEdit( message: any ) {
    this.activeMessage.id = message.id;
    this.activeMessage.message = this.decrypt( message.message );
  }

  private onDelete( messageId: number ) {
    store.dispatch( 'removeConversationMessage', { id: +this.$route.params.id, messageId } );
  }

  private mounted() {
    store.commit( 'clearMessages' );
    store.dispatch( 'getConversation', +router.currentRoute.params.id )
      .then( () => {
        store.dispatch( 'getConversationMessages', { id: +router.currentRoute.params.id, offset: 0 } );
      } );
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
</style>
