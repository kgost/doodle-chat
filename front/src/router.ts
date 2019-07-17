import Vue from 'vue';
import Router from 'vue-router';

import Home from './views/Home.vue';

import SignIn from './views/SignIn.vue';

import Messenger from './views/Messenger.vue';
import Conversation from './views/Conversation.vue';
import Friendship from './views/Friendship.vue';

import EditConversation from './views/EditConversation.vue';
import EditFriendship from './views/EditFriendship.vue';

import Settings from './views/Settings.vue';

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
      path: '/conversations/new',
      name: 'new-conversation',
      component: EditConversation,
    },
    {
      path: '/conversations/:id',
      name: 'conversation',
      component: Conversation,
    },
    {
      path: '/conversations/:id/edit',
      name: 'edit-conversation',
      component: EditConversation,
    },
    {
      path: '/friendships/new',
      name: 'new-friendship',
      component: EditFriendship,
    },
    {
      path: '/friendships/:id',
      name: 'friendship',
      component: Friendship,
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
      path: '/settings',
      name: 'settings',
      component: Settings,
    },
  ],
});
