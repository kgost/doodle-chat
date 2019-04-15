import Vue from 'vue';
import Router from 'vue-router';

import Home from './views/Home.vue';

import SignIn from './views/SignIn.vue';

import Messenger from './views/Messenger.vue';

import EditConversation from './views/EditConversation.vue';

// import Settings from './views/Settings.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'messenger',
      component: Messenger,
    },
    // Conversations
    {
      path: '/conversations/:id/new',
      name: 'new-conversation',
      component: EditConversation,
    },
    {
      path: '/conversations/:id',
      name: 'conversation',
      component: Messenger,
    },
    {
      path: '/conversations/:id/edit',
      name: 'edit-conversation',
      component: EditConversation,
    },
    {
      path: '/freindships/:id',
      name: 'friendship',
      component: Messenger,
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
  ],
});
