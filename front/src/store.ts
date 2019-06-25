import Vue from 'vue';
import Vuex from 'vuex';

import Api from '@/services/Api';
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
      id: localStorage.getItem( 'user:id' ) ? Number( localStorage.getItem( 'user:id' ) ) : undefined,
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
    encryptAccessKeys: ( state, participants: Array<{ userId: number, publicKey: string }> ) => {
      return authService.generateAccessKeys( participants, state.decryptedAccessKey );
    },

    getPublicKeyFromString( state, key: string ) {
      return authService.getPublicKeyFromString( key );
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
    signIn( { commit, state }, { username, password } ) {
      return Api().post( '/auth/signin', { username, password } )
        .then( ( res ) => {
          const keypair = {
            publicKey: authService.getPublicKeyFromString( res.data.publicKey ),
            privateKey: authService.getPrivateKeyFromString(
              authService.decryptAes( res.data.encPrivateKey, authService.getAesKeyFromString( password ) ),
            ),
          };

          commit( 'setToken', res.data.token );
          commit( 'setUser', res.data.user );
          commit( 'setKeys', keypair );
        } );
    },

    signUp( { commit, state }, { username, password } ) {
      const keyPair = authService.keyGen();

      const encPrivateKey = authService.encryptAes(
        authService.privateKeyToString( keyPair.privateKey ),
        authService.getAesKeyFromString( password ),
      );

      return Api().post( '/auth/signup', {
        username,
        password,
        publicKey: authService.publicKeyToString( keyPair.publicKey ),
        encPrivateKey,
      } ).then( ( res ) => {
        commit( 'setToken', res.data.token );
        commit( 'setUser', res.data.user );
        commit( 'setKeys', keyPair );
      } );
    },

    usernaemTaken( { commit, state }, username ) {
      return Api().get( `/auth/username-taken/${ encodeURIComponent( username ) }` );
    },

    // Conversations
    createConversation( { commit, state, getters }, { conversation, participants } ) {
      const accessKeys = getters.encryptAccessKeys( participants );

      for ( const participant of participants ) {
        participant.accessKey = accessKeys[participant.userId];
      }

      return Api().post( '/conversations', { conversation, participants } )
        .then( ( res ) => {
          commit( 'setConversation', res.data );
        } );
    },

    getConversations: Crudify( conversationService, 'index', [['setConversations']] ),

    updateConversation: Crudify( conversationService, 'update', [['setConversation']] ),

    removeConversation: Crudify( conversationService, 'destroy', [['clearConversation']] ),
  },
});
