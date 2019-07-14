<template>
  <div class="container">
    <div class="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/signin">Sign In</router-link> |
      <router-link to="/signup">Sign Up</router-link> |
      <router-link to="/settings">Settings</router-link>
    </div>

    <div v-show="!showSideBar" class="mobile-header">
      <div v-on:click="showSideBar = !showSideBar" class="hamberger">
        <div class="line"></div>
        <div class="line"></div>
        <div class="line"></div>
      </div>

      <h1>{{ name }}</h1>
    </div>

    <SideBar v-model="showSideBar"></SideBar>

    <router-view/>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from 'vue-property-decorator';

import store from '@/store.ts';
import router from '@/router.ts';

import SideBar from '@/components/SideBar.vue';

@Component({
  components: {
    SideBar,
  },
})
export default class App extends Vue {
  private showSideBar = false;

  @Watch( '$route' )
  onRouteChange() {
    Vue.set( this, 'showSideBar', false );
  }

  get name() {
    return store.state.name;
  }

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

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;

  .mobile-header {
    display: none;
  }

  .main {
    overflow: hidden;
  }
}

@media only screen and (max-width: 600px) {
  .container {
    .nav {
      display: none;
    }

    .mobile-header {
      position: relative;
      display: block !important;

      .hamberger {
        position: absolute;
        top: 0;
        left: 0;

        .line {
          margin-bottom: 3px;
          width: 20px;
          height: 5px;
          background-color: #000000;
        }
      }

      h1 {
        text-align: center;
      }
    }
  }
}
</style>

<style lang="scss">
body {
  margin: 0;
  padding: 0;

}
</style>
