<template>
  <div>
    <textarea cols="30" rows="10" v-model="message.message"></textarea>

    <button v-on:click="onSubmit">Submit</button>
  </div>
</template>

<script lang="ts">
import { Component, Model, Prop, Watch, Vue } from 'vue-property-decorator';

import store from '@/store.ts';
import router from '@/router.ts';

@Component({
})
export default class EditMessage extends Vue {
  @Model( 'on-submit', { type: Object } ) private message!: { id: number, message: string };
  @Prop( String ) private readonly accessKey!: string;
  @Prop( String ) private readonly name!: string;

  get encryptedMessage() {
    return store.getters.getEncryptedMessage({ message: this.message.message, key: this.accessKey });
  }

  @Watch( 'message.message' )
  private onMessageChange() {
    if ( router.currentRoute.name === 'conversation' ) {
      store.dispatch( 'conversationTyping', { id: +this.$route.params.id, name: this.name } );
    } else {
      store.dispatch( 'friendshipTyping', { id: +this.$route.params.id, name: this.name } );
    }
  }

  private onSubmit() {
    let p;

    const payload = { id: this.message.id, message: this.encryptedMessage };

    if ( router.currentRoute.name === 'conversation' ) {
      if ( this.message.id ) {
        p = store.dispatch( 'updateConversationMessage', { id: +this.$route.params.id, messageId: this.message.id, message: payload } );
      } else {
        p = store.dispatch( 'createConversationMessage', { id: +this.$route.params.id, message: payload } );
      }
    } else {
      if ( this.message.id ) {
        p = store.dispatch( 'updateFriendshipMessage', { id: +this.$route.params.id, messageId: this.message.id, message: payload } );
      } else {
        p = store.dispatch( 'createFriendshipMessage', { id: +this.$route.params.id, message: payload } );
      }
    }

    p.then( () => {
      Vue.set( this.message, 'id', 0 );
      Vue.set( this.message, 'message', '' );

      this.$emit( 'on-submit', this.message );
    } );
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
</style>
