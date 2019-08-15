<template>
  <div v-if="friendship" class="container">
    <h1>{{ friendName }}</h1>

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

    <EditMessage v-if="friendship" v-model="activeMessage" :accessKey="accessKey" :name="name"></EditMessage>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';

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
export default class Friendship extends Vue {
  private activeMessage = {
    id: 0,
    message: '',
  };

  private lastMessage = false;

  private oldScrollHeight = 0;

  @Watch( 'friendName' )
  private onConversationNameChange( current ) {
    if ( current ) {
      store.commit( 'setName', this.friendName );
    }
  }

  get friendName() {
    if ( this.friendship ) {
      if ( this.friendship.userOneId === store.state.user.id ) {
        return this.friendship.userTwo.username;
      } else {
        return this.friendship.userOne.username;
      }
    }
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

  get usernameMap() {
    if ( !this.friendship ) {
      return {};
    }

    return {
      [this.friendship.userOneId]: this.friendship.userOne.username,
      [this.friendship.userTwoId]: this.friendship.userTwo.username,
    };
  }

  private decrypt( message: string ) {
    return store.getters.getDecryptedMessage({ message, key: this.accessKey });
  }

  private onEdit( message: any ) {
      this.activeMessage.id = message.id;
      this.activeMessage.message = message.message;
  }

  private onDelete( messageId: number ) {
    store.dispatch( 'removeFriendshipMessage', { id: +this.$route.params.id, messageId } );

    if ( messageId === this.activeMessage.id ) {
      Vue.set( this.activeMessage, 'id', 0 );
      Vue.set( this.activeMessage, 'message', '' );
    }
  }

 private mounted() {
    Vue.set( this, 'lastMessage', false );
    Vue.set( this, 'oldScrollHeight', 0 );
    store.commit( 'clearMessages' );

    if ( this.friendName ) {
      store.commit( 'setName', this.friendName );
    }

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
.container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  h1 {
    margin: 10px;
  }
}

@media only screen and (max-width: 600px) {
  h1 {
    display: none;
  }
}
</style>
