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
        <img v-if="message.isImage" :src="message.message.substr( 4 )">
        <video controls v-else-if="message.isVideo" :src="message.message.substr( 4 )"></video>
        <div v-else v-html="emojifyMessage( message.message )" class="message"></div>
      </div>

      <div>
        <img v-for="( reaction, i ) of message.reactions" :key="i" :src="emojify( decrypt( reaction.emoji ) )" :alt="decrypt( reaction.emoji )" :title="getUsername( reaction.userId )" class="emoji">
      </div>

      <div class="actions" v-if="message.id === openReaction || message.id === activeActions">
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
    EditReaction
  },
})
export default class MessageList extends Vue {
  @Prop( Boolean ) private lastMessage: boolean = false;
  @Prop( String ) private accessKey: string = '';
  @Prop( Object ) private activeMessage!: { id: number, message: string };
  @Prop( Number ) private oldScrollHeight: number = 0;
  @Prop( Object ) private usernameMap;

  private stopActions = false;

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
    Vue.set( this, 'stopActions', true );

    window.setTimeout( () => {
      Vue.set( this, 'stopActions', false );
    }, 10 );

    Vue.set( this, 'activeActionsId', id );
  }

  set openReaction( id: number ) {
    Vue.set( this, 'openReactionId', id );
  }

  get activeActions() {
    return this.activeActionsId;
  }

  get openReaction() {
    return this.openReactionId;
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
      action = 'getConversationMessages'
    } else {
      action = 'getFriendshipMessages'
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

  private onEdit( message: any ) {
    if ( !this.stopActions ) {
      if ( message.id === this.activeActions ) {
        this.$emit( 'active-message', { id: message.id, message: message.message } );
      }
    }
  }

  private onDelete( messageId: number ) {
    if ( !this.stopActions ) {
      if ( messageId === this.activeActions ) {
        this.$emit( 'delete', messageId );
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.message-list {
  height: calc( 100% - 51px );;
  overflow: auto;

  .message-wrapper {
    position: relative;

    &:hover, &.hover {
      background-color: #d8d8d8;
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
        font-size: 18px;

        .glyphicon {
          padding: 4px;
        }
      }
    }
  }
}

.emoji {
  height: 32px;
}
</style>
