<template>
  <div>
    <form v-on:submit.prevent="onSubmit" class="edit-form">
      <div class="input-group">
        <h3>Name</h3>
        <input class="name" v-if="isOwner" type="text" v-model="conversation.name" placeholder="username">
        <h4 v-if="!isOwner">{{ conversation.name }}</h4>
      </div>

      <div class="participants">
        <h3>Participants</h3>

        <button v-on:click.prevent="onAddParticipant" :disabled="!valid" class="new">Add Participant</button>

        <div class="participant" v-for="( participant, i ) of participants" :key="i">
          <div class="input-group">
            <h4>Username <span v-on:click="onRemoveParticipant( i )" class="glyphicon glyphicon-remove"></span></h4>

            <input v-if="isOwner" type="text" v-model="participant.username" placeholder="username">
            <span v-if="!isOwner">{{ participant.username }}</span>
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
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';

import store from '@/store.ts';
import router from '@/router.ts';

@Component({
  beforeRouteUpdate( to, from, next ) {
    const vm: any = this;
    vm.onLoad( to );
    next();
  }
})
export default class EditConversation extends Vue {
  private conversation = {
    name: '',
    userId: 0,
  };

  private participants = [
    {
      userId: store.state.user.id,
      nickname: '',
      username: store.state.user.username,
      publicKey: store.state.publicKey,
    },
    {
      userId: 0,
      nickname: '',
      username: '',
      publicKey: '',
    },
  ];

  @Watch( 'participants', { deep: true } )
  private onParticipantChange( newParticipants ) {
    for ( const index in newParticipants ) {
      this.getUserId( +index );
    }
  }

  get valid(): boolean {
    if ( !this.conversation.name || !this.conversation.userId ) {
      return false;
    }

    for ( const participant of this.participants ) {
      if ( !participant.userId ) {
        return false;
      }
    }

    return true;
  }

  get isOwner(): boolean {
    return store.state.user.id === this.conversation.userId;
  }

  private getUserId( index: number ) {
    store.dispatch( 'usernameTaken', this.participants[index].username )
      .then( ( res ) => {
        if ( res.data ) {
          this.participants[index].userId = res.data.id;
          this.participants[index].publicKey = res.data.publicKey;
        }
      } );
  }

  private onAddParticipant() {
    this.participants.push({
      userId: 0,
      nickname: '',
      username: '',
      publicKey: '',
    });
  }

  private onRemoveParticipant( index: number ) {
    this.participants.splice( index );
  }

  private onSubmit() {
    if ( this.valid ) {
      let p;

      if ( router.currentRoute.name === 'edit-conversation' && this.isOwner ) {
        p = store.dispatch( 'updateConversation', {
          conversation: this.conversation,
          participants: this.participants } );
      } else if ( router.currentRoute.name === 'edit-conversation' && !this.isOwner ) {
        p = store.dispatch( 'changeConversation', {
          conversation: this.conversation,
          participants: this.participants } );
      } else {
        p = store.dispatch( 'createConversation', {
          conversation: this.conversation,
          participants: this.participants } );
      }

      p.then( ( conv: any ) => {
        router.push({ path: `/conversations/${ conv.id }` });
      } );
    }
  }

  private onLoad( route ) {
    if ( route.name === 'edit-conversation' ) {
      store.dispatch( 'getConversation', route.params.id )
        .then( ( conversation ) => {
          Vue.set( this, 'conversation', conversation );
          Vue.set( this, 'participants', conversation.participants );
        } );
    } else {
      Vue.set( this.conversation, 'userId', store.state.user.id );
    }
  }

  private mounted() {
    this.onLoad( router.currentRoute );
  }
}
</script>
<style lang="scss">
.edit-form {
  margin: 0 10px;

  .name {
    width: calc( 50% - 10px );
    border: 1px solid gray;
    border-radius: 8px;
    font-size: 16px;
    padding: 6px 0 6px 6px;
  }

  button {
    float: right;
    padding: 8px;
    margin-top: 5px;
    background-color: #54abba;
    color: white;

    &:disabled {
      opacity: 0.7;
    }

    &.new {
      position: absolute;
      top: 0;
      right: 0;
    }
  }

  .participants {
    position: relative;

    .participant {

      .input-group {
        display: inline-block;
        width: calc( 50% );

        input {
          width: calc( 100% - 10px );
          border: 1px solid gray;
          border-radius: 8px;
          font-size: 16px;
          padding: 6px 0 6px 6px;
        }
      }
    }
  }
}
</style>
