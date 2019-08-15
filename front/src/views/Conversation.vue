<template>
  <div class="container">
    <h1 v-if="conversation">{{ conversation.name }}</h1>

    <MessageList
      :lastMessage="lastMessage"
      v-on:last-message="lastMessage = $event"

      :accessKey="accessKey"

      :activeMessage="activeMessage"
      v-on:active-message="activeMessage = $event"

      :oldScrollHeight="oldScrollHeight"
      v-on:old-scroll-height="oldScrollHeight = $event"

      :usernameMap="usernameMap"

      v-on:delete="onDelete( $event )"
    ></MessageList>

    <TypingNames :names="typingNames"></TypingNames>

    <EditMessage v-if="conversation" v-model="activeMessage" :accessKey="accessKey" :name="name"></EditMessage>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import twemoji from 'twemoji';

import store from '@/store.ts';
import router from '@/router.ts';

import MessageList from '@/components/MessageList.vue';
import EditMessage from '@/components/EditMessage.vue';
import EditReaction from '@/components/EditReaction.vue';
import TypingNames from '@/components/TypingNames.vue';

@Component({
  beforeRouteUpdate( to, from, next ) {
    Vue.set( this, 'lastMessage', false );
    Vue.set( this, 'oldScrollHeight', 0 );
    store.commit( 'clearMessages' );
    store.dispatch( 'getConversation', +to.params.id )
      .then( () => {
        store.dispatch( 'joinConversation', +to.params.id );
        store.dispatch( 'getConversationMessages', { id: +to.params.id, offset: 0 } )
          .finally( () => {
            next();
          } );
      } );
  },

  beforeRouteLeave( to, from, next ) {
    store.commit( 'clearMessages' );
    store.commit( 'setName', '' );
    next();
  },

  components: {
    MessageList,
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

  private lastMessage = false;

  private oldScrollHeight = 0;

  @Watch( 'conversation.name' )
  private onConversationNameChange( current ) {
    if ( current ) {
      store.commit( 'setName', this.conversation.name );
    }
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

  get usernameMap() {
    if ( !this.conversation ) {
      return {};
    }

    const result = {};

    for ( const participant of this.conversation.participants ) {
      result[participant.userId] = participant.nickname || participant.user.username;
    }

    return result;
  }

  private decrypt( message: string ) {
    return store.getters.getDecryptedMessage({ message, key: this.accessKey });
  }

  private onEdit( message: any ) {
    this.activeMessage.id = message.id;
    this.activeMessage.message = message.message;
  }

  private onDelete( messageId: number ) {
    store.dispatch( 'removeConversationMessage', { id: +this.$route.params.id, messageId } );

    if ( messageId === this.activeMessage.id ) {
      Vue.set( this.activeMessage, 'id', 0 );
      Vue.set( this.activeMessage, 'message', '' );
    }
  }

  private mounted() {
    Vue.set( this, 'lastMessage', false );
    Vue.set( this, 'oldScrollHeight', 0 );
    store.commit( 'clearMessages' );

    if ( this.conversation ) {
      store.commit( 'setName', this.conversation.name );
    }

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
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-left: auto;
  position: relative;
  overflow: hidden;

  h1 {
    margin: 10px;
  }
}

.emoji {
  height: 32px;
}

@media only screen and (max-width: 600px) {
  h1 {
    display: none;
  }
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
