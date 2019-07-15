<template>
  <div class="container">
    <h1 v-if="friendship">{{ friendName }}</h1>

    <div ref="messageList" v-on:scroll="onScroll" class="message-list">
      <div v-for="message of messages" :key="message.id">
        <div>
          <img v-if="message.isImage" :src="message.message.substr( 4 )">
          <video controls v-else-if="message.isVideo" :src="message.message.substr( 4 )"></video>
          <span v-else v-html="emojifyMessage( message.message )" class="message"></span>
          <span>{{ message.author.username }}</span>
          <button v-on:click="onEdit( message )" v-if="isOwner( message.userId ) && !message.isMedia">Edit</button>
          <button v-on:click="onDelete( message.id )" v-if="isOwner( message.userId )">Delete</button>
        </div>

        <div>
          <img v-for="( reaction, i ) of message.reactions" :key="i" :src="emojify( decrypt( reaction.emoji ) )" :alt="decrypt( reaction.emoji )" :title="getUsername( reaction.userId )" class="emoji">
          <EditReaction :messageId="message.id" :accessKey="accessKey"></EditReaction>
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

  $refs!: {
    messageList: HTMLElement,
  };

  @Watch( 'messages.length' )
  private onMessageLengthChange( current, old ) {
    if ( this.$refs.messageList.scrollHeight - ( this.$refs.messageList.scrollTop + this.$refs.messageList.offsetHeight ) < 10 && ( current === old + 1 || !old ) ) {
      window.setTimeout( () => {
        Vue.set( this.$refs.messageList, 'scrollTop', this.$refs.messageList.scrollHeight );
      }, 10 );
    } else if ( this.$refs.messageList.scrollTop === 0 && current > old ) {
      window.setTimeout( () => {
        Vue.set( this.$refs.messageList, 'scrollTop', this.$refs.messageList.scrollHeight - this.oldScrollHeight );
      }, 10 );
    }
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

      result.message = this.decode( this.decrypt( result.message ) );

      if ( result.message.indexOf( '!img' ) === 0 ) {
        result.isMedia = true;
        result.isImage = true;
      } else if ( result.message.indexOf( '!vid' ) === 0 ) {
        result.isMedia = true;
        result.isVideo = true;
      }

      return result;
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
    this.activeMessage.message = message.message;
  }

  private onDelete( messageId: number ) {
    store.dispatch( 'removeFriendshipMessage', { id: +this.$route.params.id, messageId } );
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
    if ( !this.lastMessage && this.$refs.messageList.scrollTop === 0 && this.messages.length % 20 === 0 ) {
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

  .message-list {
    min-height: calc( 100% - 82px );;
    overflow: auto;
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
