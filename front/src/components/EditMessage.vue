<template>
  <div>
    <textarea ref="textarea" cols="30" rows="10" v-model="message.message"></textarea>
    <EmojiPicker v-on:pick-emoji="onPickEmoji( $event )"></EmojiPicker>

    <button v-if="message.id" v-on:click="onCancel">Cancel</button>
    <button v-on:click="onSubmit">Submit</button>
    <button v-on:click="$refs.mediaUpload.click()">
      Media
      <input type="file" ref="mediaUpload" v-on:change="onMediaUpload" class="media-upload">
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Model, Prop, Watch, Vue } from 'vue-property-decorator';

import store from '@/store.ts';
import router from '@/router.ts';

import EmojiPicker from '@/components/EmojiPicker.vue';

@Component({
  components: {
    EmojiPicker,
  }
})
export default class EditMessage extends Vue {
  @Model( 'on-submit', { type: Object } ) private message!: { id: number, message: string };
  @Prop( String ) private readonly accessKey!: string;
  @Prop( String ) private readonly name!: string;

  $refs!: {
    textarea: HTMLFormElement
  };

  get encryptedMessage() {
    return store.getters.getEncryptedMessage({ message: this.encoding, key: this.accessKey });
  }

  get encoding() {
    return unescape( encodeURIComponent( this.message.message ) );
  }

  @Watch( 'message.message' )
  private onMessageChange() {
    if ( router.currentRoute.name === 'conversation' ) {
      store.dispatch( 'conversationTyping', { id: +this.$route.params.id, name: this.name } );
    } else {
      store.dispatch( 'friendshipTyping', { id: +this.$route.params.id, name: this.name } );
    }
  }

  private onPickEmoji( emoji ) {
    let text = this.message.message;

    if ( typeof this.$refs.textarea.selectionStart !== 'undefined' && typeof this.$refs.textarea.selectionEnd !== 'undefined' ) {
      const endIndex = this.$refs.textarea.selectionEnd;
      text = text.slice( 0, this.$refs.textarea.selectionStart ) + emoji + text.slice( endIndex );
      Vue.set( this.message, 'message', text );
      this.$refs.textarea.focus();

      window.setTimeout( () => {
        this.$refs.textarea.selectionEnd = this.$refs.textarea.selectionStart = endIndex + emoji.length;
      }, 10 );
    } else {
      text = text + emoji;
      Vue.set( this.message, 'message', text );
      this.$refs.textarea.focus();
    }
  }

  private onMediaUpload( event ) {
    let p;
    const file = event.srcElement ? event.srcElement.files[0] : event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const payload = { message: reader.result }

      if ( file.type.indexOf( 'image' ) !== -1 ) {
        payload.message = '!img ' + payload.message;
      } else if ( file.type.indexOf( 'video' ) !== 1 ) {
        payload.message = '!vid ' + payload.message;
      }

      payload.message = store.getters.getEncryptedMessage({ message: unescape( encodeURIComponent( payload.message + '' ) ), key: this.accessKey });

      if ( router.currentRoute.name === 'conversation' ) {
        p = store.dispatch( 'createConversationMessage', { id: +this.$route.params.id, message: payload } );
      } else {
        p = store.dispatch( 'createFriendshipMessage', { id: +this.$route.params.id, message: payload } );
      }
    }

    reader.readAsDataURL( file );
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

  private onCancel() {
    Vue.set( this.message, 'id', 0 );
    Vue.set( this.message, 'message', '' );

    this.$emit( 'on-submit', this.message );
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.media-upload {
  display: none;
}
</style>
