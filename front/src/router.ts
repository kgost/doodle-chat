import Vue from 'vue';
import Router from 'vue-router';

import store from './store';

import About from './views/About.vue';

import SignIn from './views/SignIn.vue';

import Messenger from './views/Messenger.vue';
import Conversation from './views/Conversation.vue';
import Friendship from './views/Friendship.vue';

import EditConversation from './views/EditConversation.vue';
import EditFriendship from './views/EditFriendship.vue';

import Settings from './views/Settings.vue';

Vue.use(Router);

const signinGuard = ( to, from, next ) => {
  if ( !store.getters.signedIn ) {
    next( '/signup' );
    return false;
  }

  return true;
};

const newUserGuard = ( to, from, next ) => {
  if ( store.getters.signedIn ) {
    next( '/' );
    return false;
  }

  return true;
};

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'messenger',
      component: Messenger,
      beforeEnter: ( to, from, next ) => {
        if ( !store.getters.signedIn ) {
          next( '/about' );
        } else {
          next();
        }
      },
    },
    {
      path: '/about',
      name: 'about',
      component: About,
    },
    // Conversations
    {
      path: '/conversations/new',
      name: 'new-conversation',
      component: EditConversation,
      beforeEnter: ( to, from, next ) => {
        if ( signinGuard( to, from, next ) ) {
          next();
        }
      },
    },
    {
      path: '/conversations/:id',
      name: 'conversation',
      component: Conversation,
      beforeEnter: ( to, from, next ) => {
        if ( signinGuard( to, from, next ) ) {
          next();
        }
      },
    },
    {
      path: '/conversations/:id/edit',
      name: 'edit-conversation',
      component: EditConversation,
      beforeEnter: ( to, from, next ) => {
        if ( signinGuard( to, from, next ) ) {
          next();
        }
      },
    },
    {
      path: '/friendships/new',
      name: 'new-friendship',
      component: EditFriendship,
      beforeEnter: ( to, from, next ) => {
        if ( signinGuard( to, from, next ) ) {
          next();
        }
      },
    },
    {
      path: '/friendships/:id',
      name: 'friendship',
      component: Friendship,
      beforeEnter: ( to, from, next ) => {
        if ( signinGuard( to, from, next ) ) {
          next();
        }
      },
    },
    {
      path: '/signin',
      name: 'signin',
      component: SignIn,
      beforeEnter: ( to, from, next ) => {
        if ( newUserGuard( to, from, next ) ) {
          next();
        }
      },
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignIn,
      beforeEnter: ( to, from, next ) => {
        if ( newUserGuard( to, from, next ) ) {
          next();
        }
      },
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      beforeEnter: ( to, from, next ) => {
        if ( signinGuard( to, from, next ) ) {
          next();
        }
      },
    },
  ],
});
