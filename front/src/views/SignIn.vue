<template>
  <div>
    <div class="container">
      <h1>{{ showSignIn ? 'Sign In' : 'Sign Up' }}</h1>

      <small v-show="showSignIn">Not a user? <router-link to="/signup">Sign Up</router-link></small>

      <small v-show="!showSignIn">Have an account? <router-link to="/signin">Sign In</router-link></small>

      <p v-show="error" class="error">{{ error }}</p>

      <form v-on:submit.prevent="onSubmit">
        <div class="input-group">
          <h3>Username</h3>

          <small v-show="username === ''" class="error">Must Enter A Username</small>
          <small v-show="usernameTaken" class="error">Username Taken</small>

          <input type="text" v-model="username" placeholder="username">
        </div>
        <div class="input-group">
          <h3>Password</h3>

          <small v-show="password.length < 10" class="error">Password Must be at Least 10 Characters</small>

          <input type="password" v-model="password" placeholder="password">
        </div>

        <button :disabled="!valid" type="submit">{{ showSignIn ? 'Sign In' : 'Sign Up' }}</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from 'vue-property-decorator';

import store from '@/store.ts';
import router from '@/router.ts';

@Component({
})
export default class SignIn extends Vue {
  private username = '';

  private password = '';

  private error = '';

  private usernameTaken = false;

  private usernameChecked = false;

  @Watch( 'username' )
  private onUsernameChange() {
    if ( !this.username.length ) {
      return false;
    }

    if ( router.currentRoute.name === 'signup' ) {
      Vue.set( this, 'usernameChecked', false );

      store.dispatch( 'usernameTaken', this.username )
        .then( ( res: any ) => {
          Vue.set( this, 'usernameChecked', true );
          Vue.set( this, 'usernameTaken', !!res.data );
        } );
    }
  }

  get showSignIn() {
    if ( this.$route.name === 'signin' ) {
      return true;
    }
  }

  get valid() {
    if ( router.currentRoute.name === 'signin' ) {
      return this.username !== '' && this.password.length >= 10;
    } else {
      return this.username !== '' && this.password.length >= 10 && !this.usernameTaken && this.usernameChecked;
    }
  }

  private onSubmit() {
    if ( this.username !== '' && this.password.length >= 10 ) {
      Vue.set( this, 'error', '' );

      let p;

      if ( router.currentRoute.name === 'signin' ) {
        p = store.dispatch( 'signIn', { username: this.username, password: this.password } );
      } else {
        p = store.dispatch( 'signUp', { username: this.username, password: this.password } );
      }

      p.then( () => {
        router.push({ path: '/' });
        store.dispatch( 'consumeNonce' );
        store.dispatch( 'getPushSub' );
        store.dispatch( 'getConversations' );
        store.dispatch( 'getFriendships' );
      } ).catch( ( err ) => {
        console.log( err.message );
        if ( err.response.status ) {
          Vue.set( this, 'error', 'Invalid Login Credentials' );
        }
      } );
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  width: 60%;
  margin: auto;

  h1 {
    margin-bottom: 0;
  }

  small {
    a {
      color: #0000EE;
    }
  }

  .error {
    color: red;
  }

  input {
    width: 100%;
    border: 1px solid gray;
    border-radius: 8px;
    font-size: 16px;
    padding: 6px 0;
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
}

@media only screen and (max-width: 600px) {
  .container {
    width: auto;
    margin: 0 10px;
  }
}
</style>
