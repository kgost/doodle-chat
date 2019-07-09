<template>
  <div>
    <img v-show="!showReactions" v-on:click="toggleShow" src="/img/emojis/1f914.png" alt="🤔" class="emoji">
    <img v-show="showReactions" v-on:click="onSubmit( emoji )" v-for="( emoji, i ) of emojis" :key="i" :src="emojify( emoji )" :alt="emoji" class="emoji">
    <button v-show="showReactions" v-on:click="toggleShow">Close</button>
  </div>
</template>

<script lang="ts">
import { Component, Model, Prop, Vue } from 'vue-property-decorator';
import twemoji from 'twemoji';

import store from '@/store.ts';
import router from '@/router.ts';

@Component({
})
export default class EditReaction extends Vue {
  @Prop( String ) private readonly accessKey!: string;
  @Prop( Number ) private readonly messageId!: string;

  private emojis = ['🤔', '😂', '😍', '😤', '😢', '👍', '🏊🏿‍♂️', '🔫'];
  private showReactions = false;

  private toggleShow() {
    this.showReactions = !this.showReactions;
  }

  private emojify( emoji: string ) {
    return `/img/emojis/${ twemoji.convert.toCodePoint( emoji ) }.png`;
  }

  private encrypt( emoji: string ) {
    return store.getters.getEncryptedMessage({ message: encodeURIComponent( emoji ), key: this.accessKey });
  }

  private onSubmit( emoji: string ) {
    let p;

    const payload = { emoji: this.encrypt( emoji ) };

    if ( router.currentRoute.name === 'conversation' ) {
      p = store.dispatch( 'createConversationReaction', { id: +this.$route.params.id, messageId: this.messageId, reaction: payload } );
    } else {
      p = store.dispatch( 'createFriendshipReaction', { id: +this.$route.params.id, messageId: this.messageId, reaction: payload } );
    }

    p.then( () => {
      this.toggleShow();
    } );
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.emoji {
  height: 32px;
}
</style>
