<template>
  <div class="reaction-container" v-on-click-outside="close">
    <button v-show="!showReactions" v-on:click.stop="toggleShow">
      <img src="/img/emojis/1f914.png" alt="🤔" class="emoji">
    </button>

    <div :class="{ open: showReactions }">
      <img v-show="showReactions" v-on:click.stop="onSubmit( emoji )" v-for="( emoji, i ) of emojis" :key="i" :src="emojify( emoji )" :alt="emoji" class="emoji">
      <button v-show="showReactions" v-on:click.stop="toggleShow" class="close">✗</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Model, Prop, Mixins, Vue } from 'vue-property-decorator';
import { mixins } from 'vue-class-component'
import { mixin as onClickOutside } from 'vue-on-click-outside';
import twemoji from 'twemoji';

import store from '@/store.ts';
import router from '@/router.ts';

@Component({
})
export default class EditReaction extends mixins( onClickOutside ) {
  @Prop( String ) private readonly accessKey!: string;
  @Prop( Number ) private readonly messageId!: string;

  private emojis = ['🤔', '😂', '😍', '😤', '😢', '👍', /*'🏊🏿‍♂️',*/ '🔫'];
  private showReactions = false;

  private toggleShow() {
    Vue.set( this, 'showReactions', !this.showReactions );
    this.$emit( 'toggle', this.showReactions );
  }

  private close() {
    Vue.set( this, 'showReactions', false );
    this.$emit( 'toggle', false );
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
.reaction-container {
  display: inline-block;

  button {
    font-size: 18px;
    &.open {
      padding: 5px;
      background-color: #d8d8d8;
    }

    &.close {
      padding: 2px 10px;
    }
  }
}

img.emoji {
  height: 21px;
  font-size: 21px;
}
</style>
