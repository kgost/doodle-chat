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
    token: localStorage.getItem( 'token' ),
    publicKey: {},
    privateKey: {},
    decryptedAccessKey: '',
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

  getters: {
    encryptAccessKeys: ( state ) => ( users: [{ id: number, publicKey: string }] ) => {
      return authService.generateAccessKeys( users, state.decryptedAccessKey );
    },
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
      Vue.set( state.conversations, conversation.id, conversation );
    },

    clearConversation( state, id ) {
      Vue.delete( state.conversations, id );
    },

    setConversations( state, conversations ) {
      for ( const conversation of conversations ) {
        Vue.set( state.conversations, conversation.id, conversation );
      }
    },

    // Friendships
    setFriendship( state, friendship ) {
      Vue.set( state.friendships, friendship.id, friendship );
    },
  },

  actions: {
    // AUTH
    signIn( { commit, state }, body ) {
      return new Promise( ( resolve, reject ) => {
        authService.signin( body )
          .then( ( data: any ) => {
            const keypair = {
              publicKey: authService.getPublicKeyFromString( data.publicKey ),
              privateKey: authService.getPrivateKeyFromString(
                authService.decryptAes( data.encPrivateKey, authService.getAesKeyFromString( body.password ) ),
              ),
            };

            commit( 'setToken', data.token );
            commit( 'setUser', data.user );
            commit( 'setKeys', keypair );

            resolve( data );
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
            }).then( ( data: any ) => {
                commit( 'setToken', data.token );
                commit( 'setUser', data.user );
                commit( 'setKeys', keyPair );

                resolve( data );
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

    usernaemTaken( { commit, state }, username ) {
      return authService.usernameTaken( username );
    },

    // Conversations
    createConversation: Crudify( conversationService, 'create', [['setConversation']] ),

    getConversations: Crudify( conversationService, 'index', [['setConversations']] ),

    updateConversation: Crudify( conversationService, 'update', [['setConversation']] ),

    removeConversation: Crudify( conversationService, 'destroy', [['clearConversation']] ),
  },
});
