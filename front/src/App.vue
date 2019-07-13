<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/signin">Sign In</router-link> |
      <router-link to="/signup">Sign Up</router-link> |
      <router-link to="/settings">Settings</router-link>
    </div>
    <router-view/>
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
export default class App extends Vue {
  private created() {
    store.dispatch( 'consumeNonce' );
    store.dispatch( 'getPushSub' );
    store.commit( 'setUser', store.state.user );

    navigator.serviceWorker.addEventListener( 'message', ( event ) => {
      if ( event.data.type == 'PUSH' ) {
        router.push({ path: event.data.url });
      }
    } );
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
