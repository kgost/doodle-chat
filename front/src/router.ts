import Vue from 'vue';
import Router from 'vue-router';

import Home from './views/Home.vue';

import SignIn from './views/SignIn.vue';

import MessageList from './views/MessageList.vue';

// import Settings from './views/Settings.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/signin',
      name: 'signin',
      component: SignIn,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignIn,
    },
    {
      path: '/conversation/:id',
      name: 'conversation',
      component: MessageList,
    },
    {
      path: '/friendship/:id',
      name: 'friendship',
      component: MessageList,
    },
  ],
});
