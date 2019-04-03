import Vue from 'vue';
import Vuex from 'vuex';

import Crudify from '@/services/Crudify';
import AuthService from '@/services/AuthService';
import ConversationService from '@/services/ConversationService';

Vue.use(Vuex);

const authService = new AuthService();
const conversationService = new ConversationService();

export default new Vuex.Store({
  state: {
    // AUTH
    token: '',
    publicKey: {},
    privateKey: {},
    user: {
      id: localStorage.getItem( 'user:id' ) ? localStorage.getItem( 'user:id' ) : undefined,
      username: localStorage.getItem( 'user:username' ) ? localStorage.getItem( 'user:username' ) : undefined,
    },

    // Conversations
    conversationId: 0,
    conversations: {},

    // Friendships
    friendshipId: 0,
    friendships: {},

    // Messages
    messages: {},
  },

  mutations: {
    // AUTH
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
      localStorage.setItem( 'user:id', user.id );
      localStorage.setItem( 'user:username', user.username );
    },

    clearUser( state, user ) {
      Vue.delete( state, 'user' );
      localStorage.removeItem( 'user:id' );
      localStorage.removeItem( 'user:username' );
    },

    setKeys( state, keyPair ) {
      Vue.set( this, 'publicKey', keyPair.publicKey );
      Vue.set( this, 'privateKey', keyPair.privateKey );
    },

    clearKeys( state, keyPair ) {
      Vue.delete( this, 'publicKey' );
      Vue.delete( this, 'privateKey' );
    },

    // Conversations
    setConversation( state, conversation ) {
      Vue.set( state.conversations, conversation._id, conversation );
    },

    // Friendships
    setFriendship( state, friendship ) {
      Vue.set( state.friendships, friendship._id, friendship );
    },
  },

  actions: {
    // AUTH
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

    // Conversations
    createConversation: Crudify( conversationService.create, [['setConversation']] ),

    getConversations: Crudify( conversationService.index, [['setConversations']] ),

    getConversation: Crudify( conversationService.show ),

    updateConversation: Crudify( conversationService.update, [['setConversation']] ),

    removeConversation: Crudify( conversationService.destroy, [['clearConversation']] ),
  },
});
