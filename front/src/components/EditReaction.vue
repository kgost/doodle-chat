<template>
  <div class="reaction-container">
    <button v-show="!showReactions" v-on:click.stop="toggleShow" class="open">
      <img src="/img/emojis/1f914.png" alt="🤔" class="emoji">
    </button>

    <div v-show="showReactions">
      <img v-show="showReactions" v-on:click.stop="onSubmit( emoji )" v-for="( emoji, i ) of emojis" :key="i" :src="emojify( emoji )" :alt="emoji" class="emoji">
      <button v-show="showReactions" v-on:click.stop="toggleShow" class="close">✗</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import twemoji from 'twemoji';

import store from '@/store.ts';
import router from '@/router.ts';

@Component({
})
export default class EditReaction extends Vue {
  @Prop( String ) private readonly accessKey!: string;
  @Prop( Number ) private readonly messageId!: string;
  @Prop( Number ) private readonly activeId!: number;

  private emojis = ['🤔', '😂', '😍', '😤', '😢', '👍', /*'🏊🏿‍♂️',*/ '🔫'];
  private showReactions = false;

  @Watch( 'activeId' )
  private onActiveIdChange( current ) {
    if ( current !== this.messageId ) {
      this.close();
    }
  }

  private toggleShow() {
    Vue.set( this, 'showReactions', !this.showReactions );
    this.$emit( 'toggle', this.showReactions );
  }

  private close() {
    Vue.set( this, 'showReactions', false );
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
  background-color: #d8d8d8;

  button {
    font-size: 18px;

    &.open {
      padding: 1px 3px;

      img {
        font-size: 30px;
        height: 30px;
      }
    }

    &.close {
      vertical-align: top;
      font-size: 28px;
      padding: 0 10px;
    }
  }
}

img.emoji {
  height: 32px;
  font-size: 32px;
}
</style>
