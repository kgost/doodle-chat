import Vue from 'vue';
import Vuex from 'vuex';

import AuthService from '@/services/AuthService';

Vue.use(Vuex);

const authService = new AuthService();

export default new Vuex.Store({
  state: {
    token: '',
    publicKey: {},
    privateKey: {},
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
      localStorage.setItem( 'token' , token );
    },

    clearToken( state, token ) {
      Vue.delete( state, 'token' );
      localStorage.removeItem( 'token' );
    },

    setUser( state, user ) {
      Vue.set( state, 'user', user );
    },

    clearUser( state, user ) {
      Vue.delete( state, 'user' );
      localStorage.removeItem( 'user' );
    },

    setKeys( state, keyPair ) {
      Vue.set( this, 'publicKey', keyPair.publicKey );
      Vue.set( this, 'privateKey', keyPair.privateKey );
    },

    clearKeys( state, keyPair ) {
      Vue.delete( this, 'publicKey' );
      Vue.delete( this, 'privateKey' );
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
            const keypair = {
              publicKey: authService.getPublicKeyFromString( res.data.publicKey ),
              privateKey: authService.getPrivateKeyFromString(
                authService.decryptAes( res.data.encPrivateKey, authService.getAesKeyFromString( body.password ) ),
              ),
            };

            commit( 'setToken', res.data.token );
            commit( 'setUser', res.data.user );
            commit( 'setKeys', keypair );

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
            const encPrivateKey = authService.encryptAes(
              authService.privateKeyToString( keyPair.privateKey ),
              authService.getAesKeyFromString( password ),
            );

            authService.signup({
              username,
              password,
              publicKey: authService.publicKeyToString( keyPair.publicKey ),
              encPrivateKey,
            }).then( ( res: any ) => {
                commit( 'setToken', res.data.token );
                commit( 'setUser', res.data.user );
                commit( 'setKeys', keyPair );

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
