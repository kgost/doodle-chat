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
    publicKey: '',
    privateKey: '',
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
    getPublicKeyFromString: ( state ) => ( key: string ) => {
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

    setPublicKey( state, publicKey: string ) {
      localStorage.setItem( 'publicKey', publicKey );
      Vue.set( state, 'publicKey', publicKey );
    },

    setPrivateKey( state, privateKey: string ) {
      Vue.set( state, 'privateKey', privateKey );
    },

    setEncPrivateKey( state, encPrivateKey: string ) {
      localStorage.setItem( 'encPrivateKey', encPrivateKey );
    },

    clearKeys( state, keyPair ) {
      Vue.delete( state, 'publicKey' );
      Vue.delete( state, 'privateKey' );
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
    signIn( { commit, state, dispatch }, { username, password } ) {
      return Api().post( '/auth/signin', { username, password } )
        .then( ( res ) => {
          const keyPair = {
            publicKey: authService.getPublicKeyFromString( res.data.publicKey ),
            privateKey: authService.getPrivateKeyFromString(
              authService.decryptAes( res.data.encPrivateKey, authService.getAesKeyFromString( password ) ),
            ),
          };

          commit( 'setToken', res.data.token );
          commit( 'setUser', res.data.user );

          commit( 'setPublicKey', authService.publicKeyToString( keyPair.publicKey ) );
          commit( 'setPrivateKey', authService.privateKeyToString( keyPair.privateKey ) );

          return dispatch( 'consumeNonce' );
        } );
    },

    signUp( { commit, state, dispatch }, { username, password } ) {
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

        commit( 'setPublicKey', authService.publicKeyToString( keyPair.publicKey ) );
        commit( 'setPrivateKey', authService.privateKeyToString( keyPair.privateKey ) );

        return dispatch( 'consumeNonce' );
      } );
    },

    usernameTaken( { commit, state }, username ) {
      return Api().get( `/auth/username-taken/${ encodeURIComponent( username ) }` );
    },

    consumeNonce( { commit, state } ) {
      const nonce = authService.getRandomAesKey();

      return Api().post( '/auth/consume-nonce', { nonce } )
        .then( ( res ) => {
          if ( localStorage.getItem( 'encPrivateKey' ) ) {
            const encPrivateKey = localStorage.getItem( 'encPrivateKey' ) + '';
            const privateKey = authService.decryptAes( encPrivateKey, res.data );

            if ( privateKey.length ) {
              commit( 'setPrivateKey', privateKey );
            }
          }

          commit( 'setEncPrivateKey', authService.encryptAes( state.privateKey, nonce ) );
        } );
    },

    // Conversations
    createConversation( { commit, state, getters }, { conversation, participants } ) {
      const accessKeys = authService.generateAccessKeys( participants );

      for ( const participant of participants ) {
        participant.accessKey = accessKeys[participant.userId];
      }

      return Api().post( '/conversations', { conversation, participants } )
        .then( ( res ) => {
          commit( 'setConversation', res.data );
        } );
    },

    getConversation( { commit, state, getters }, conversationId: number ) {
      if ( state.conversations[conversationId] ) {
        return new Promise( ( resolve, reject) => {
          resolve( state.conversations[conversationId] );
        } );
      }

      return Api().get( `/conversations/${ conversationId }` )
        .then( ( res ) => {
          commit( 'setConversation', res.data );

          return res.data;
        } );
    },

    getConversations: Crudify( conversationService, 'index', [['setConversations']] ),

    updateConversation( { commit, state, getters }, { conversation, participants } ) {
      const accessKey = authService.getPrivateKeyFromString( state.privateKey ).decrypt( participants[0].accessKey );
      const accessKeys = authService.generateAccessKeys( participants, accessKey );

      for ( const participant of participants ) {
        participant.accessKey = accessKeys[participant.userId];
      }

      return Api().put( `/conversations/${ conversation.id }`, { conversation, participants } )
        .then( ( res ) => {
          commit( 'setConversation', res.data );

          return res.data;
        } );
    },

    changeConversation( { commit, state, getters }, { conversation, participants } ) {
      return Api().put( `/conversations/${ conversation.id }/change-cosmetic`, { participants } )
        .then( ( res ) => {
          commit( 'setConversation', res.data );

          return res.data;
        } );
    },

    removeConversation( { commit, state, getters }, conversationId ) {
      return Api().delete( `/conversations/${ conversationId }` )
        .then( () => {
          commit( 'clearConversation', conversationId );
        } );
    },
  },
});
