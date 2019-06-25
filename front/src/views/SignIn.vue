<template>
  <div>
    <h1>{{ showSignIn ? 'Sign In' : 'Sign Up' }}</h1>
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
    if ( router.currentRoute.name === 'signin' ) {
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
        router.push({ path: '/messenger' });
      } );
    }
  }
}
</script>
