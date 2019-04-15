<template>
  <div>
    <div class="wrapper">
      <h3>Conversations</h3>
      <router-link to="conversations/new"  class="new">new</router-link>
      <ul>
        <li v-for="conversation of conversations">
          <router-link :to="`/conversations/${ conversation.id }`">{{ conversation.name }}</router-link>
          <router-link :to="`/conversations/${ conversation.id }/edit`">Edit</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import store from '@/store.ts';
import router from '@/router.ts';

@Component({
  data() {
    return {
    };
  },

  computed: {
    conversations() {
      return Object.values( store.state.conversations );
    },
  },

  methods: {
  },

  mounted() {
    store.dispatch( 'getConversations' );
  },
})
export default class SideBar extends Vue {
  // @Prop() private msg!: string;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.wrapper {
  position: relative;

  .new {
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
