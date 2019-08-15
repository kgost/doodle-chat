<template>
  <div class="typing-names">
    <span v-for="( name, i ) of names" :key="i">
      {{ name }}<span v-show="showComma( i )">,</span>
      <span v-show="showAnd( i )"> and</span>
    </span>
    <span v-show="names.length > 1"> are typing...</span>
    <span v-show="names.length == 1"> is typing...</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import store from '@/store.ts';
import router from '@/router.ts';

@Component({
  components: {
  },
})
export default class TypingNames extends Vue {
  @Prop( Array ) private names!: string[];

  private showComma( index: number ) {
    return this.names.length > 2 && index < this.names.length - 2;
  }

  private showAnd( index: number ) {
    return this.names.length > 1 && index === this.names.length - 2;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.emoji {
  width: 32px;
}

.typing-names {
  position: absolute;
  left: 0;
  bottom: 56px;
  opacity: 0.5;
  background-color: white;
}
</style>
