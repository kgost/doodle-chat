<template>
  <div>
    <form v-on:submit.prevent="onSubmit">
      <div class="input-group">
        <h3>Name</h3>
        <input type="text" v-model="conversation.name" placeholder="username">
      </div>
      <div class="participants">
        <h3>Participants</h3>
        <button :disabled="!valid" class="new">new</button>
        <div class="participant" v-for="( participant, i ) of participants">
          <div class="input-group">
            <h4>Username</h4>
            <input type="text" v-on:change="getUserId( i )" placeholder="username">
          </div>
          <div class="input-group">
            <h4>Nickname</h4>
            <input type="text" v-model="participant.nickname" placeholder="nickname">
          </div>
        </div>
      </div>
      <button :disabled="!valid" type="submit">Submit</button>
    </form>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import store from '@/store.ts';
import router from '@/router.ts';

@Component({

  methods: {
    getUserId( index: number ) {
    },

    onSubmit() {
      console.log( this.$data.valid );
      if ( this.$data.valid ) {
        let p;

        if ( this.$route.name === 'edit-conversation' && this.$data.isOwner ) {
          p = store.dispatch( 'updateConversation', {
            conversation: this.$data.conversation,
            participants: this.$data.participants } );
        } else if ( this.$route.name === 'edit-conversation' && !this.$data.isOwner ) {
          p = store.dispatch( 'changeConversation', this.$data.participants );
        } else {
          p = store.dispatch( 'createConversation', {
            conversation: this.$data.conversation,
            participants: this.$data.participants } );
        }

        p.then( () => {
          router.push({ path: '/' });
        } );
      }
    },
  },
})
export default class SignIn extends Vue {
  conversation = {
    name: '',
    userId: 0,
  }

  participants = [
    {
      userId: store.state.user.id,
      nickname: '',
      accessKey: generate,
    },
    {
      userId: 0,
      nickname: '',
      accessKey: '',
    },
  ]

  get valid(): boolean {
    if ( !this.conversation.name || !this.conversation.userId ) {
      return false;
    }

    for ( const participant of this.participants ) {
      if ( !participant.userId || !participant.accessKey ) {
        return false;
      }
    }

    return true;
  }

  get isOwner(): boolean {
    return store.state.user.id === this.conversation.userId;
  }

  getUserId( index: number ) {
    store.dispatch( 'usernameTaken', this.participants[index].username )
      .then( ( user ) => {
        if ( user ) {
          this.participants[index].userId = user.id;
          this.participants[index].publicKey = user.publicKey;
        }
      } );
  }
}
</script>
<style lang="scss">
.participants {
  position: relative;

  .participant {

    .input-group {
      display: inline-block;
    }
  }

  .new {
    position: absolute;
    top: 0;
    right: 0;
  }
}
</style>
