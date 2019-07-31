<template>
  <div>
    <form class="edit-form" v-on:submit.prevent="onSubmit">
      <div class="input-group">
        <h3>User Name</h3>
        <input type="text" v-model="username" placeholder="Username">
      </div>

      <small class="error">{{ errorMessage }}</small>

      <button :disabled="!valid" type="submit">Submit</button>
    </form>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Prop, Vue } from 'vue-property-decorator';

import store from '@/store.ts';
import router from '@/router.ts';

@Component({
})
export default class SignIn extends Vue {
  private username = '';

  private friendship = {
    userOneId: store.state.user.id,
    userTwoId: 0,
    userOneAccepted: true,
    userTwoAccepted: false,
    userOne: {
      publicKey: store.state.publicKey,
    },
    userTwo: {
      publicKey: '',
    },
  };

  private errorMessage = '';

  get valid(): boolean {
    if ( !this.friendship.userOneId || !this.friendship.userTwoId ) {
      Vue.set( this, 'errorMessage', 'Invalid Username' );
      return false;
    }

    Vue.set( this, 'errorMessage', '' );
    return true;
  }

  @Watch( 'username' )
  private onUsernameChange( value: string ) {
    store.dispatch( 'usernameTaken', this.username )
      .then( ( res ) => {
        if ( res.data ) {
          Vue.set( this.friendship.userTwo, 'publicKey', res.data.publicKey );
          Vue.set( this.friendship, 'userTwoId', res.data.id );
        } else {
          Vue.set( this.friendship.userTwo, 'publicKey', '' );
          Vue.set( this.friendship, 'userTwoId', 0 );
        }
      } );
  }

  private onSubmit() {
    if ( this.valid ) {
      store.dispatch( 'createFriendship', this.friendship )
        .then( () => {
          router.push({ path: '/' });
        } )
        .catch( ( err ) => {
          Vue.set( this, 'errorMessage', err.response.data.message );
        } );
    }
  }
}
</script>
<style lang="scss">
.edit-form {
  width: 60%;
  margin: auto;

  .input-group {
    input {
      width: calc( 100% - 10px );
      border: 1px solid gray;
      border-radius: 8px;
      font-size: 16px;
      padding: 6px 0 6px 6px;
    }
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
  }

  .error {
    color: red;
  }
}
</style>
