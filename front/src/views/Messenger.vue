<template>
  <div>
    <div class="flex-container">
      <SideBar></SideBar>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import store from '@/store.ts';
import router from '@/router.ts';

import SideBar from '@/components/SideBar.vue';

@Component({
  components: {
    SideBar,
  },
})
export default class Messenger extends Vue {
}
</script>
