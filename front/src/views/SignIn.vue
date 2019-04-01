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
  data() {
    return {
      username: '',
      password: '',
    };
  },

  components: {
  },

  computed: {
    showSignIn() {
      if ( this.$route.name === 'signin' ) {
        return true;
      }
    },

    valid() {
      return this.$data.username !== '' && this.$data.password.length >= 10;
    },
  },

  methods: {
    onSubmit() {
      if ( this.$data.username !== '' && this.$data.password.length >= 10 ) {
        let p;
        if ( this.$route.name === 'signin' ) {
          p = store.dispatch( 'signIn', { username: this.$data.username, password: this.$data.password } );
        } else {
          p = store.dispatch( 'signUp', { username: this.$data.username, password: this.$data.password } );
        }

        p.then( () => {
          router.push({ path: '/messenger' });
        } );
      }
    },
  },
})
export default class SignIn extends Vue {}
</script>
