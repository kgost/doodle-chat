<template>
  <div ref="messageList" v-on:scroll="onScroll" class="message-list">
    <div
      v-on:touchstart.stop="activeActions = message.id"
      v-on:mouseover.stop="activeActions = message.id"
      v-on:mouseleave.stop="activeActions = 0"
      v-for="( message, i ) of messages"
      :key="message.id"
      :class="{ hover: activeActions === message.id }"
      class="message-wrapper">

      <div class="message-container">
        <div v-if="!i || message.userId !== messages[i - 1].userId"><strong class="author">{{ getUsername( message.userId ) }}</strong>:</div>
        <img v-if="message.isImage" :src="message.message.substr( 4 )" v-on:load="onMediaLoad" class="media">
        <video controls v-else-if="message.isVideo" :src="message.message.substr( 4 )" v-on:load="onMediaLoad" class="media"></video>
        <div v-else v-html="emojifyMessage( $sanitize( message.message ) )" class="message"></div>
      </div>

      <div class="reactions-container">
        <span class="reaction-wrapper" v-for="( reaction, i ) of message.reactions" :key="i">
          <img v-on:click="showUsername = reaction.id" :src="emojify( decrypt( reaction.emoji ) )" :alt="decrypt( reaction.emoji )" :title="getUsername( reaction.userId )" class="emoji">
          <span v-show="showUsername === reaction.id" class="popover">{{ getUsername( reaction.userId ) }}</span>
        </span>
      </div>

      <div class="actions" v-show="message.id === openReaction || message.id === activeActions">
        <button v-on:click="onEdit( message )" v-if="isOwner( message.userId ) && !message.isMedia"><span class="glyphicon glyphicon-edit"></span></button>
        <button v-on:click="onDelete( message.id )" v-if="isOwner( message.userId )"><span class="glyphicon glyphicon-trash"></span></button>
        <EditReaction v-on:toggle="openReaction = $event ? message.id : 0" :activeId="openReaction" :messageId="message.id" :accessKey="accessKey"></EditReaction>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Model, Prop, Watch, Vue } from 'vue-property-decorator';
import EditReaction from '@/components/EditReaction.vue';

import twemoji from 'twemoji';

import store from '@/store.ts';
import router from '@/router.ts';

@Component({
  components: {
    EditReaction,
  },
})
export default class MessageList extends Vue {
  public $refs!: {
    messageList: HTMLElement,
  };

  @Prop( Boolean ) private lastMessage: boolean = false;
  @Prop( String ) private accessKey;
  @Prop( Object ) private activeMessage!: { id: number, message: string };
  @Prop( Number ) private oldScrollHeight: number = 0;
  @Prop( Object ) private usernameMap;

  private stopActions = false;

  private activeActionsId = 0;

  private openReactionId = 0;

  private showUsernameId = 0;

  private showUsernameTimeout = 0;

  private freshLoad = false;

  @Watch( 'messages.length' )
  private onMessageLengthChange( current, old ) {
    if ( current !== undefined ) {
      if ( this.$refs.messageList.scrollHeight - ( this.$refs.messageList.scrollTop + this.$refs.messageList.offsetHeight ) < 10 && ( current === old + 1 || !old ) ) {
        if ( !old ) {
          Vue.set( this, 'freshLoad', true );
        } else {
          Vue.set( this, 'freshLoad', false );
        }

        window.setTimeout( () => {
          Vue.set( this.$refs.messageList, 'scrollTop', this.$refs.messageList.scrollHeight );
          this.$emit( 'old-scroll-height', this.$refs.messageList.scrollHeight );
        }, 10 );
      } else if ( this.$refs.messageList.scrollTop === 0 && current > old ) {
        window.setTimeout( () => {
          Vue.set( this.$refs.messageList, 'scrollTop', this.$refs.messageList.scrollHeight - this.oldScrollHeight );
          this.$emit( 'old-scroll-height', this.$refs.messageList.scrollHeight );
        }, 10 );
      }

      window.setTimeout( () => {
        if ( this.$refs.messageList.offsetHeight === this.$refs.messageList.scrollHeight ) {
          this.getMessages();
        }
      }, 10 );
    }
  }

  set activeActions( id: number ) {
    if ( id !== this.activeActionsId ) {
      Vue.set( this, 'stopActions', true );

      window.setTimeout( () => {
        Vue.set( this, 'stopActions', false );
        console.log( this.stopActions );
      }, 1000 );

      Vue.set( this, 'activeActionsId', id );
    }
  }

  get activeActions() {
    return this.activeActionsId;
  }

  set openReaction( id: number ) {
    Vue.set( this, 'openReactionId', id );
  }

  get openReaction() {
    return this.openReactionId;
  }

  set showUsername( id: number ) {
    Vue.set( this, 'showUsernameId', id );
    window.clearTimeout( this.showUsernameTimeout );

    this.showUsernameTimeout = window.setTimeout( () => {
      Vue.set( this, 'showUsernameId', 0 );
    }, 2000 );
  }

  get showUsername() {
    return this.showUsernameId;
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

      return result;
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
    } ).map( ( message: any ) => {
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

  private decrypt( message: string ) {
    return store.getters.getDecryptedMessage({ message, key: this.accessKey });
  }

  private decode( message: string ) {
    return decodeURIComponent( escape( message ) );
  }

  private emojify( emoji: string ) {
    return `/img/emojis/${ twemoji.convert.toCodePoint( decodeURIComponent( emoji ) ) }.png`;
  }

  private emojifyMessage( message: string ) {
    return twemoji.parse( message, ( icon, options, variant ) => {
      return `/img/emojis/${ icon }.png`;
    } );
  }

  private getUsername( id: number ) {
    return this.usernameMap[id] ? this.usernameMap[id] : '';
  }

  private onScroll() {
    if ( !this.lastMessage && this.$refs.messageList.scrollTop === 0 ) {
      this.$emit( 'old-scroll-height', this.$refs.messageList.scrollHeight );

      this.getMessages();
    }
  }

  private getMessages() {
    let action;

    if ( router.currentRoute.name === 'conversation' ) {
      action = 'getConversationMessages';
    } else {
      action = 'getFriendshipMessages';
    }

    return store.dispatch( action, { id: +router.currentRoute.params.id, offset: this.messages.length / 20 } )
      .catch( ( err ) => {
        if ( err.response.status === 404 ) {
          this.$emit( 'last-message', true );
        }
      } );
  }

  private isOwner( id: number ) {
    return store.state.user.id === id;
  }

  private onMediaLoad() {
    if ( this.$refs.messageList.scrollTop === 0 || this.freshLoad ) {
      Vue.set( this, 'freshLoad', false );
      window.setTimeout( () => {
        Vue.set( this.$refs.messageList, 'scrollTop', this.$refs.messageList.scrollHeight );
        this.$emit( 'old-scroll-height', this.$refs.messageList.scrollHeight );
      }, 50 );
    }
  }

  private onEdit( message: any ) {
    console.log( this.stopActions );
    if ( !this.stopActions ) {
      if ( message.id === this.activeActions ) {
        this.$emit( 'active-message', { id: message.id, message: message.message } );
      }
    } else {
      Vue.set( this, 'stopActions', false );
    }
  }

  private onDelete( messageId: number ) {
    if ( !this.stopActions ) {
      if ( messageId === this.activeActions ) {
        this.$emit( 'delete', messageId );
      }
    } else {
      Vue.set( this, 'stopActions', false );
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.message-list {
  height: calc( 100% - 51px );;
  border-top: 1px solid #dfdfdf;
  overflow: auto;

  .message-wrapper {
    position: relative;

    &:hover, &.hover {
      margin-top: -1px;
      border-top: 1px solid black;
    }

    .reactions-container {
      margin-left: 35px;

      .reaction-wrapper {
        position: relative;

        .popover {
          position: absolute;
          top: -45px;
          left: 0px;
          padding: 5px;
          border: 1px solid gray;
          background-color: white;
        }
      }
    }

    .author {
      font-size: 1.15em;
    }

    .message-container {
      padding: 5px 10px;

      .media {
        max-width: 100%;
      }

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
        font-size: 26px;

        .glyphicon {
          padding: 4px;
        }
      }
    }
  }
}

.emoji {
  height: 24px;
}
</style>
