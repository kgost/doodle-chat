<template>
  <div>
    <div class="container">
      <h1>{{ showSignIn ? 'Sign In' : 'Sign Up' }}</h1>

      <small v-show="showSignIn">Not a user? <router-link to="/signup">Sign Up</router-link></small>

      <small v-show="!showSignIn">Have an account? <router-link to="/signin">Sign In</router-link></small>

      <form v-on:submit.prevent="onSubmit">
        <div class="input-group">
          <h3>Username</h3>
          <input type="text" v-model="username" placeholder="username">
        </div>
        <div class="input-group">
          <h3>Password</h3>
          <input type="password" v-model="password" placeholder="password">
        </div>
        <button :disabled="!valid" type="submit">{{ showSignIn ? 'Sign In' : 'Sign Up' }}</button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import store from '@/store.ts';
import router from '@/router.ts';

@Component({
  computed: {
  },

  methods: {
  },
})
export default class SignIn extends Vue {
  private username = '';
  private password = '';

  get showSignIn() {
    if ( this.$route.name === 'signin' ) {
      return true;
    }
  }

  get valid() {
    return this.username !== '' && this.password.length >= 10;
  }

  private onSubmit() {
    if ( this.username !== '' && this.password.length >= 10 ) {
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
      } );
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  margin: 0 30px;

  h1 {
    margin-bottom: 0;
  }

  small {
    a {
      color: #0000EE;
    }
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
    padding: 5px;
    margin-top: 5px;
    background-color: #54abba;
    color: white;
  }
}
</style>
