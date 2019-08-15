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
        <div v-if="!i || message.userId !== messages[i - 1].userId || newMinute( i )"><strong class="author">{{ getUsername( message.userId ) }}</strong><em class="message-time">{{ formatDate( message.createdAt ) }}</em>:</div>
        <div v-if="message.isMedia" class="media">
          <img v-if="message.isImage" :src="message.message.substr( 4 )" :class="{ 'too-wide': tooWide( message.message ), 'too-tall': tooTall( message.message ) }">
          <video controls v-else-if="message.isVideo" :src="message.message.substr( 4 )" :class="{ 'too-wide': tooWide( message.message ), 'too-tall': tooTall( message.message ) }"></video>
        </div>
        <div v-else v-html="emojifyMessage( $sanitize( message.message ) )" class="message"></div><em v-if="message.createdAt !== message.updatedAt">(edited)</em>
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

    <div class="spacer"></div>
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
      if ( this.$refs.messageList.scrollHeight - ( this.$refs.messageList.scrollTop + this.$refs.messageList.offsetHeight ) < 50 && ( current === old + 1 || !old ) ) {
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

  @Watch( '$route.params.id' )
  private onFriendshipChange( current, old ) {
    Vue.set( this, 'freshLoad', true );

    window.setTimeout( () => {
      Vue.set( this.$refs.messageList, 'scrollTop', this.$refs.messageList.scrollHeight );
      this.$emit( 'old-scroll-height', this.$refs.messageList.scrollHeight );
      this.$refs.messageList.focus();
    }, 10 );
  }

  set activeActions( id: number ) {
    if ( id !== this.activeActionsId ) {
      Vue.set( this, 'stopActions', true );

      window.setTimeout( () => {
        Vue.set( this, 'stopActions', false );
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

  private formatDate( date: string ) {
    const d = new Date( date );
    let hour;
    let minute;
    let suffix

    hour = d.getHours() % 12 === 0 ? 12 : d.getHours() % 12;

    minute = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();

    suffix = d.getHours() >= 12 ? 'pm' : 'am';

    return `${ hour }:${ minute } ${ suffix }`;
  }

  private isOwner( id: number ) {
    return store.state.user.id === id;
  }

  private newMinute( index: number ) {
    if ( index === 0 ) {
      return false;
    }

    const currDate = new Date( this.messages[index].createdAt );
    const prevDate = new Date( this.messages[index - 1].createdAt );

    if ( currDate.getDate() === prevDate.getDate() && currDate.getHours() === prevDate.getHours() && currDate.getMinutes() === prevDate.getMinutes() ) {
      return false;
    } else {
      return true;
    }
  }

  private tooWide( message: string ) {
    if ( message.indexOf( '!img' ) === 0 ) {
      const img = new Image();
      img.src = message.substr( 4 );

      const factor = 225 / img.height;

      return img.width * factor > 400;
    } else if ( message.indexOf( '!vid' ) === 0 ) {
      const vid = document.createElement( 'video' );
      vid.src = message.substr( 4 );

      const factor = 225 / vid.videoHeight;

      return vid.videoWidth * factor > 400;
    }
  }

  private tooTall( message: string ) {
    if ( message.indexOf( '!img' ) === 0 ) {
      const img = new Image();
      img.src = message.substr( 4 );

      const factor = 400 / img.width;

      return img.height * factor > 225;
    } else if ( message.indexOf( '!vid' ) === 0 ) {
      const vid = document.createElement( 'video' );
      vid.src = message.substr( 4 );

      const factor = 400 / vid.videoWidth;

      return vid.videoHeight * factor > 225;
    }
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
.spacer {
  height: 30px;
}
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

    .message-time {
      margin-left: 10px;
    }

    .message-container {
      padding: 5px 10px;

      .media {
        max-width: 100%;
        width: 400px;
        height: 225px;
        line-height: 225px;
        max-width: 100%;
        border-radius: 5px;
        background-color: black;

        video, img {
          display: block;
          max-width: 400px;
          max-height: 225px;
          width: 100%;
          height: 225px;
          padding: 0;
          border-radius: 5px;
          margin: auto;
          margin-top: -3px;

          &.too-wide {
            display: initial;
            height: initial;
            width: 100%;
            border-radius: 0;
            vertical-align: middle;
          }

          &.too-tall {
            border-radius: 0;
          }
        }
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
