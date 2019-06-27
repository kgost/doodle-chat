<template>
  <div>
    <form v-on:submit.prevent="onSubmit">
      <div class="input-group">
        <h3>User Name</h3>
        <input type="text" v-model="username" placeholder="username">
      </div>

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

  get valid(): boolean {
    if ( !this.friendship.userOneId || !this.friendship.userTwoId ) {
      return false;
    }

    return true;
  }

  @Watch( 'username' )
  private onUsernameChange( value: string ) {
    store.dispatch( 'usernameTaken', this.username )
      .then( ( res ) => {
        if ( res.data ) {
          this.friendship.userTwo.publicKey = res.data.publicKey;
          this.friendship.userTwoId = res.data.id;
        }
      } );
  }

  private onSubmit() {
    if ( this.valid ) {
      store.dispatch( 'createFriendship', this.friendship )
        .then( () => {
          router.push({ path: '/' });
        } );
    }
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
