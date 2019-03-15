import Vue from 'vue';
import Vuex from 'vuex';

import AuthService from '@/services/AuthService';

Vue.use(Vuex);

const authService = new AuthService();

export default new Vuex.Store({
  state: {
    token: '',
    user: {},
    conversationId: '',
    friendshipId: '',
    conversations: {},
    friendships: {},
    messages: {},
  },

  mutations: {
    setToken( state, token ) {
      Vue.set( state, 'token', token );
    },

    clearToken( state, token ) {
      Vue.delete( state, 'token' );
    },

    setUser( state, user ) {
      Vue.set( state, 'user', user );
    },

    clearUser( state, user ) {
      Vue.delete( state, 'user' );
    },

    setConversation( state, conversation ) {
      Vue.set( state.conversations, conversation._id, conversation );
    },

    setFriendship( state, friendship ) {
      Vue.set( state.friendships, friendship._id, friendship );
    },
  },

  actions: {
    signIn( { commit, state }, body ) {
      return new Promise( ( resolve, reject ) => {
        authService.signin( body )
          .then( ( res: any ) => {
            commit( 'setToken', res.token );
            commit( 'setUser', res.user );
            resolve( res );
          } )
          .catch( ( err ) => {
            reject( err );
          } );
      } );
    },

    signUp( { commit, state }, { username, password } ) {
      return new Promise( ( resolve, reject ) => {
        authService.keyGen()
          .then( ( keyPair: any ) => {
            authService.signup({
              username: username,
              password: password,
              publicKey: keyPair.publicKey,
              encPrivateKey: authService.encryptAes( authService.privateKeyToString( keyPair.privateKey ), password )
            }).then( ( res: any ) => {
                commit( 'setToken', res.token );
                commit( 'setUser', res.user );
                resolve( res );
              } )
              .catch( ( err ) => {
                reject( err );
              } );
          } )
          .catch( ( err ) => {
            reject( err );
          } );
      } );
    },
  },
});
