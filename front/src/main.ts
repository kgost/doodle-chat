import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

import sanitizeHTML from 'sanitize-html';

Vue.config.productionTip = false;
Vue.prototype.$sanitize = sanitizeHTML;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
