<template>
  <div class="container">
    <h1 v-if="friendship">{{ friendName }}</h1>

    <div ref="messageList" v-on:scroll="onScroll" class="message-list">
      <div v-on:mouseover="activeActions = message.id" v-on:mouseleave="activeActions = 0" v-for="( message, i ) of messages" :key="message.id" class="message-wrapper">
        <div class="message-container">
          <div v-if="!i || message.userId !== messages[i - 1].userId"><strong class="author">{{ message.author.username }}</strong>:</div>
          <img v-if="message.isImage" :src="message.message.substr( 4 )">
          <video controls v-else-if="message.isVideo" :src="message.message.substr( 4 )"></video>
          <div v-else v-html="emojifyMessage( message.message )" class="message"></div>
        </div>

        <div>
          <img v-for="( reaction, i ) of message.reactions" :key="i" :src="emojify( decrypt( reaction.emoji ) )" :alt="decrypt( reaction.emoji )" :title="getUsername( reaction.userId )" class="emoji">
        </div>

        <div class="actions" v-if="message.id === openReaction || message.id === activeActions">
          <button v-on:click="onEdit( message )" v-if="isOwner( message.userId ) && !message.isMedia">Edit</button>
          <button v-on:click="onDelete( message.id )" v-if="isOwner( message.userId )">Delete</button>
          <EditReaction v-on:toggle="openReaction = $event ? message.id : 0" :messageId="message.id" :accessKey="accessKey"></EditReaction>
        </div>
      </div>
    </div>

    <TypingNames :names="typingNames"></TypingNames>

    <EditMessage v-if="friendship" v-model="activeMessage" :accessKey="accessKey" :name="name"></EditMessage>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import twemoji from 'twemoji';

import store from '@/store.ts';
import router from '@/router.ts';

import EditMessage from '@/components/EditMessage.vue';
import EditReaction from '@/components/EditReaction.vue';
import TypingNames from '@/components/TypingNames.vue';

@Component({
  beforeRouteUpdate( to, from, next ) {
    Vue.set( this, 'lastMessage', false );
    Vue.set( this, 'oldScrollHeight', 0 );
    store.commit( 'clearMessages' );
    store.dispatch( 'getFriendship', +to.params.id )
      .then( () => {
        store.dispatch( 'joinFriendship', +to.params.id );
        store.dispatch( 'getFriendshipMessages', { id: +to.params.id, offset: 0 } )
          .finally( () => {
            next();
          } );
      } );
  },

  beforeRouteLeave( to, from, next ) {
    store.commit( 'clearMessages' );
    next();
  },

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

  private lastMessage = false;

  private oldScrollHeight = 0;

  private activeActionsId = 0;

  private openReactionId = 0;

  $refs!: {
    messageList: HTMLElement,
  };

  @Watch( 'messages.length' )
  private onMessageLengthChange( current, old ) {
    if ( current !== undefined ) {
      if ( this.$refs.messageList.scrollHeight - ( this.$refs.messageList.scrollTop + this.$refs.messageList.offsetHeight ) < 10 && ( current === old + 1 || !old ) ) {
        window.setTimeout( () => {
          Vue.set( this.$refs.messageList, 'scrollTop', this.$refs.messageList.scrollHeight );
          Vue.set( this, 'oldScrollHeight', this.$refs.messageList.scrollHeight );
        }, 10 );
      } else if ( this.$refs.messageList.scrollTop === 0 && current > old ) {
        window.setTimeout( () => {
          Vue.set( this.$refs.messageList, 'scrollTop', this.$refs.messageList.scrollHeight - this.oldScrollHeight );
        }, 10 );
      }
    }
  }

  set activeActions( id: number ) {
    window.setTimeout( () => {
      Vue.set( this, 'activeActionsId', id );
    }, 10 );
  }

  set openReaction( id: number ) {
    window.setTimeout( () => {
      Vue.set( this, 'openReactionId', id );
    }, 10 );
  }

  get activeActions() {
    return this.activeActionsId;
  }

  get openReaction() {
    return this.openReactionId;
  }

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
    } ).map( ( message: any ) => {
      const result: any = JSON.parse( JSON.stringify( message ) );

      result.message = this.decrypt( result.message );

      return result
    } ).filter( ( message: any ) => {
      if ( !message.message ) {
        return false;
      }

      try {
        this.decode( message.message );
        return true;
      } catch ( err ) {
        return false;
      }
    } ).map( ( message: any ) =>{
      console.log( message.message );
      message.message = this.decode( message.message );

      if ( message.message.indexOf( '!img' ) === 0 ) {
        message.isMedia = true;
        message.isImage = true;
      } else if ( message.message.indexOf( '!vid' ) === 0 ) {
        message.isMedia = true;
        message.isVideo = true;
      }

      return message;
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
    if ( message.id === this.activeActions ) {
      this.activeMessage.id = message.id;
      this.activeMessage.message = message.message;
    }
  }

  private onDelete( messageId: number ) {
    if ( messageId === this.activeActions ) {
      store.dispatch( 'removeFriendshipMessage', { id: +this.$route.params.id, messageId } )
        .finally ( () => {
          Vue.set( this, 'oldScrollHeight', this.$refs.messageList.scrollHeight );
        } );
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
    if ( this.friendship.userOneId === id ) {
      return this.friendship.userOne.username;
    } else {
      return this.friendship.userTwo.username;
    }
  }

  private onScroll() {
    if ( !this.lastMessage && this.$refs.messageList.scrollTop === 0 ) {
      Vue.set( this, 'oldScrollHeight', this.$refs.messageList.scrollHeight );
      store.dispatch( 'getFriendshipMessages', { id: +router.currentRoute.params.id, offset: this.messages.length / 20 } )
        .catch( ( err ) => {
          if ( err.response.status === 404 ) {
            Vue.set( this, 'lastMessage', true );
          }
        } );
    }
  }

  private mounted() {
    Vue.set( this, 'lastMessage', false );
    Vue.set( this, 'oldScrollHeight', 0 );
    store.commit( 'clearMessages' );
    store.dispatch( 'getFriendship', +router.currentRoute.params.id )
      .then( () => {
        store.commit( 'setName', this.friendName );
        store.dispatch( 'joinFriendship', +router.currentRoute.params.id );
        store.dispatch( 'getFriendshipMessages', { id: +router.currentRoute.params.id, offset: 0 } );
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
  overflow: hidden;

  .message-list {
    min-height: calc( 100% - 51px );;
    overflow: auto;

    .message-wrapper {
      position: relative;

      &:hover {
        background: #d8d8d8;
      }

      .author {
        font-size: 1.15em;
      }

      .message-container {
        margin: 5px 10px;

        .message {
          padding: 5px 0;
        }
      }

      .actions {
        position: absolute;
        z-index: 1;
        top: 0;
        right: 0;
        text-align: right;

        &.open {
          display: initial;
        }

        button {
          vertical-align: top;
        }
      }
    }
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
