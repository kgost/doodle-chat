import Vue from 'vue';
import Vuex from 'vuex';

import SocketService from '@/services/SocketService';
import Api from '@/services/Api';
import Crudify from '@/services/Crudify';
import AuthService from '@/services/AuthService';
import ConversationService from '@/services/ConversationService';

Vue.use(Vuex);

const socketService = new SocketService();
const authService = new AuthService();
const conversationService = new ConversationService();

const vuex =  new Vuex.Store({
  state: {
    // AUTH
    token: localStorage.getItem( 'token' ),
    publicKey: localStorage.getItem( 'publicKey' ),
    privateKey: '',
    decryptedAccessKey: '',
    user: {
      id: localStorage.getItem( 'user:id' ) ? Number( localStorage.getItem( 'user:id' ) ) : undefined,
      username: localStorage.getItem( 'user:username' ) ? localStorage.getItem( 'user:username' ) : undefined,
    },

    typingNames: {},

    name: '',

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

    privateKey: ( state ) => {
      return authService.getPrivateKeyFromString( state.privateKey );
    },

    getDecryptedMessage: ( state ) => ({ message, key }) => {
      return authService.decryptAes( message, key );
    },

    getEncryptedMessage: ( state ) => ({ message, key }) => {
      return authService.encryptAes( message, key );
    },

    notifications: ( state ) => {
      for ( const conversation of Object.values( state.conversations ) ) {
        const c: any = conversation;

        if ( c.notifications.length ) {
          return true;
        }
      }

      for ( const friendship of Object.values( state.friendships ) ) {
        const f: any = friendship;

        if ( f.notifications.length ) {
          return true;
        }
      }

      return false;
    },

    signedIn: ( state ) => {
      return !!state.token;
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

      socketService.signIn( user.id );
    },

    clearUser( state ) {
      if ( state.user.id ) {
        socketService.signOut( state.user.id );
      }

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

    clearEncPrivateKey( state, encPrivateKey: string ) {
      localStorage.removeItem( 'encPrivateKey' );
    },

    clearKeys( state, keyPair ) {
      Vue.delete( state, 'publicKey' );
      Vue.delete( state, 'privateKey' );
    },

    // Conversations
    setConversation( state, conversation ) {
      Vue.set( state.conversations, conversation.id, conversation );

      if ( conversation.notifications.length ) {
        activeFavicon();
      }
    },

    clearConversation( state, id ) {
      Vue.delete( state.conversations, id );
    },

    setConversations( state, conversations ) {
      let foundNotifications = false;

      for ( const conversation of conversations ) {
        Vue.set( state.conversations, conversation.id, conversation );

        if ( conversation.notifications.length ) {
          foundNotifications = true;
        }
      }

      if ( foundNotifications ) {
        activeFavicon();
      }
    },

    clearConversations( state ) {
      Vue.set( state, 'conversations', {} );
    },

    setConversationId( state, id ) {
      Vue.set( state, 'conversationId', id );
      Vue.set( state, 'friendshipId', 0 );
    },

    // Friendships
    setFriendship( state, friendship ) {
      Vue.set( state.friendships, friendship.id, friendship );

      if ( friendship.notifications.length ) {
        activeFavicon();
      }
    },

    clearFriendship( state, id ) {
      Vue.delete( state.friendships, id );
    },

    setFriendships( state, friendships ) {
      let foundNotifications = false;

      for ( const friendship of friendships ) {
        Vue.set( state.friendships, friendship.id, friendship );

        if ( friendship.notifications.length ) {
          foundNotifications = true;
        }
      }

      if ( foundNotifications ) {
        activeFavicon();
      }
    },

    clearFriendships( state ) {
      Vue.set( state, 'friendships', {} );
    },

    setFriendshipId( state, id ) {
      Vue.set( state, 'friendshipId', id );
      Vue.set( state, 'conversationId', 0 );
    },

    // Messages
    setMessage( state, message ) {
      Vue.set( state.messages, message.id, message );
    },

    clearMessage( state, id ) {
      Vue.delete( state.messages, id );
    },

    setMessages( state, messages ) {
      for ( const message of messages ) {
        Vue.set( state.messages, message.id, message );
      }
    },

    clearMessages( state, id ) {
      Vue.set( state, 'messages', {} );
    },

    setName( state, name ) {
      Vue.set( state, 'name', name );
    },

    setTyping( state, name: string ) {
      if ( state.typingNames[name] ) {
        window.clearTimeout( vuex.state.typingNames[name] );
      }

      const timeout = window.setTimeout( () => {
        Vue.delete( state.typingNames, name );
      }, 4000 );

      Vue.set( state.typingNames, name, timeout );
    },

    setPushSub( state ) {
      Vue.set( state.user, 'pushSub', true );
    },

    clearPushSub( state ) {
      Vue.delete( state.user, 'pushSub' );
    },

    leaveRooms( state ) {
      Vue.set( state, 'conversationId', 0 );
      Vue.set( state, 'friendshipId', 0 );
    },
  },

  actions: {
    // AUTH
    signIn( { commit, state, dispatch, getters }, { username, password } ) {
      return Api().post( '/auth/signin-challenge', { username } ).then( ( res ) => {
        const privateKey = authService.getPrivateKeyFromString(
          authService.decryptAes(
            res.data.encPrivateKey, authService.getAesKeyFromString( password ),
          ),
        );

        const challengeAnswer = privateKey.decrypt( res.data.challenge );

        return Api().post( '/auth/signin', { username, challengeAnswer } );
      } ).then( ( res ) => {
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

        commit( 'clearEncPrivateKey' );

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

        commit( 'clearEncPrivateKey' );

        return dispatch( 'consumeNonce' );
      } );
    },

    signOut( { commit } ) {
      commit( 'clearToken' );
      commit( 'clearUser' );
      commit( 'clearEncPrivateKey' );
      commit( 'clearKeys' );
      commit( 'clearConversations' );
      commit( 'clearFriendships' );
      commit( 'clearFriendships' );
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
    joinConversation( { commit, state, dispatch }, id ) {
      socketService.leaveConversation( state.conversationId );
      socketService.leaveFriendship( state.friendshipId );
      socketService.joinConversation( id );

      if ( state.conversations[id] && state.conversations[id].notifications.length ) {
        dispatch( 'removeConversationNotifications', id );
      }

      commit( 'setConversationId', id );
    },

    createConversation( { commit, state, getters }, { conversation, participants } ) {
      const accessKeys = authService.generateConversationAccessKeys( participants );

      for ( const participant of participants ) {
        participant.accessKey = accessKeys[participant.userId];
      }

      return Api().post( '/conversations', { conversation, participants } )
        .then( ( res ) => {
          commit( 'setConversation', res.data );

          for ( const participant of res.data.participants ) {
            socketService.addConversation( participant.userId );
          }

          return res.data;
        } );
    },

    getConversations( { commit, state } ) {
      return Api().get( '/conversations' )
        .then( ( res ) => {
          const newConversations: number[] = [];
          const removedConversations: number[] = [];

          for ( const conversation of res.data ) {
            if ( !state.conversations[conversation.id] ) {
              newConversations.push( conversation.id );
            }
          }

          for ( const id of Object.keys( state.conversations ) ) {
            const oldConversation: any = state.conversations[id];
            let match = false;

            for ( const conversation of res.data ) {
              if ( conversation.id === +id ) {
                match = true;
                break;
              }
            }

            if ( !match ) {
              removedConversations.push( +id );
            }
          }

          for ( const id of newConversations ) {
            socketService.listenConversation( id );
          }

          for ( const id of removedConversations ) {
            socketService.unListenConversation( id );
            commit( 'clearConversation', id );
          }

          commit( 'setConversations', res.data );
        } )
        .catch( ( err ) => {
          if ( err.response.status === 404 ) {
            commit( 'clearConversations' );
          }
        } );
    },

    getConversation( { commit, state, getters }, id: number ) {
      return Api().get( `/conversations/${ id }` )
        .then( ( res ) => {
          commit( 'setConversation', res.data );

          return state.conversations[id];
        } );
    },

    updateConversation( { commit, state, getters }, { conversation, participants } ) {
      const accessKey = authService.getPrivateKeyFromString( state.privateKey ).decrypt( participants[0].accessKey );
      const accessKeys = authService.generateConversationAccessKeys( participants, accessKey );

      for ( const participant of participants ) {
        participant.accessKey = accessKeys[participant.userId];
      }

      return Api().put( `/conversations/${ conversation.id }`, { conversation, participants } )
        .then( ( res ) => {
          for ( const participant of res.data.participants ) {
            let match = false;

            for ( const oldParticipant of state.conversations[conversation.id].participants ) {
              if ( oldParticipant.userId === participant.userId ) {
                match = true;
                break;
              }
            }

            if ( !match ) {
              socketService.addConversation( participant.userId );
            }
          }

          socketService.updateConversation( conversation.id );

          commit( 'setConversation', res.data );

          return res.data;
        } );
    },

    changeConversation( { commit, state, getters }, { conversation, participants } ) {
      return Api().put( `/conversations/${ conversation.id }/change-cosmetic`, { participants } )
        .then( ( res ) => {
          socketService.updateConversation( conversation.id );

          commit( 'setConversation', res.data );

          return res.data;
        } );
    },

    removeConversation( { commit, state, getters }, conversationId ) {
      return Api().delete( `/conversations/${ conversationId }` )
        .then( () => {
          socketService.updateConversation( conversationId );

          commit( 'clearConversation', conversationId );
        } );
    },

    // Friendships
    joinFriendship( { commit, state, dispatch }, id ) {
      socketService.leaveConversation( state.conversationId );
      socketService.leaveFriendship( state.friendshipId );
      socketService.joinFriendship( id );

      if ( state.friendships[id] && state.friendships[id].notifications.length ) {
        dispatch( 'removeFriendshipNotifications', id );
      }

      commit( 'setFriendshipId', id );
    },

    createFriendship( { commit }, friendship ) {
      const accessKeys = authService.generateFriendshipAccessKeys(
        friendship.userOneId,
        friendship.userOne.publicKey,
        friendship.userTwoId,
        friendship.userTwo.publicKey );

      friendship.userOneAccessKey = accessKeys[friendship.userOneId];
      friendship.userTwoAccessKey = accessKeys[friendship.userTwoId];

      return Api().post( '/friendships', friendship )
        .then( ( res ) => {
          socketService.addFriendship( friendship.userTwoId );
          socketService.listenFriendship( res.data.id );

          commit( 'setFriendship', res.data );
        } );
    },

    getFriendship( { commit, state }, id: number ) {
      return Api().get( `/friendships/${ id }` )
        .then( ( res ) => {
          commit( 'setFriendship', res.data );

          return state.friendships[id];
        } );
    },

    getFriendships( { commit, state } ) {
      return Api().get( '/friendships' )
        .then( ( res ) => {
          const newFriendships: number[] = [];
          const removedFriendships: number[] = [];

          for ( const friendship of res.data ) {
            if ( !state.friendships[friendship.id] ) {
              newFriendships.push( friendship.id );
            }
          }

          for ( const id of Object.keys( state.friendships ) ) {
            const oldFriendship: any = state.friendships[id];
            let match = false;

            for ( const friendship of res.data ) {
              if ( friendship.id === +id ) {
                match = true;
                break;
              }
            }

            if ( !match ) {
              removedFriendships.push( +id );
            }
          }

          for ( const id of newFriendships ) {
            socketService.listenFriendship( id );
          }

          for ( const id of removedFriendships ) {
            socketService.unListenFriendship( id );
            commit( 'clearFriendship', id );
          }

          commit( 'setFriendships', res.data );
        } )
        .catch( ( err ) => {
          if ( err.response.status === 404 ) {
            commit( 'clearFriendships' );
          }
        } );
    },

    updateFriendship( { commit }, friendship ) {
      return Api().put( `/friendships/${ friendship.id }`, friendship )
        .then( ( res ) => {
          socketService.updateFriendship( friendship.id );

          commit( 'setFriendship', res.data );
        } );
    },

    removeFriendship( { commit }, id ) {
      return Api().delete( `/friendships/${ id }` )
        .then( () => {
          socketService.updateFriendship( id );

          commit( 'clearFriendship', id );
        } );
    },

    // Conversation Messages
    conversationTyping( { commit }, { id, name } ) {
      socketService.conversationTyping( id, name );
    },

    createConversationMessage( { commit }, { id, message } ) {
      return Api().post( `/conversations/${ id }/messages`, message )
        .then( ( res ) => {
          socketService.newConversationMessage( id, res.data.id );

          commit( 'setMessage', res.data );
        } );
    },

    getConversationMessages( { commit }, { id, offset } ) {
      return Api().get( `/conversations/${ id }/messages?offset=${ offset }` )
        .then( ( res ) => {
          commit( 'setMessages', res.data );
        } );
    },

    getConversationMessage( { commit }, { id, messageId } ) {
      return Api().get( `/conversations/${ id }/messages/${ messageId }` )
        .then( ( res ) => {
          commit( 'setMessage', res.data );
        } );
    },

    updateConversationMessage( { commit }, { id, messageId, message } ) {
      return Api().put( `/conversations/${ id }/messages/${ messageId }`, message )
        .then( ( res ) => {
          socketService.changeConversationMessage( id, messageId );

          commit( 'setMessage', res.data );
        } );
    },

    removeConversationMessage( { commit }, { id, messageId } ) {
      return Api().delete( `/conversations/${ id }/messages/${ messageId }` )
        .then( ( res ) => {
          socketService.changeConversationMessage( id, messageId );

          commit( 'clearMessage', messageId );
        } );
    },

    // Friendship Messages
    friendshipTyping( { commit }, { id, name } ) {
      socketService.friendshipTyping( id, name );
    },

    createFriendshipMessage( { commit }, { id, message } ) {
      return Api().post( `/friendships/${ id }/messages`, message )
        .then( ( res ) => {
          socketService.newFriendshipMessage( id, res.data.id );

          commit( 'setMessage', res.data );
        } );
    },

    getFriendshipMessages( { commit }, { id, offset } ) {
      return Api().get( `/friendships/${ id }/messages?offset=${ offset }` )
        .then( ( res ) => {
          commit( 'setMessages', res.data );
        } );
    },

    getFriendshipMessage( { commit }, { id, messageId } ) {
      return Api().get( `/friendships/${ id }/messages/${ messageId }` )
        .then( ( res ) => {
          commit( 'setMessage', res.data );
        } );
    },

    updateFriendshipMessage( { commit }, { id, messageId, message } ) {
      return Api().put( `/friendships/${ id }/messages/${ messageId }`, message )
        .then( ( res ) => {
          socketService.changeFriendshipMessage( id, messageId );

          commit( 'setMessage', res.data );
        } );
    },

    removeFriendshipMessage( { commit }, { id, messageId } ) {
      return Api().delete( `/friendships/${ id }/messages/${ messageId }` )
        .then( ( res ) => {
          socketService.changeFriendshipMessage( id, messageId );

          commit( 'clearMessage', messageId );
        } );
    },

    // Conversation Reactions
    createConversationReaction( { commit, dispatch }, { id, messageId, reaction } ) {
      return Api().post( `/conversations/${ id }/messages/${ messageId }/reactions`, reaction )
        .then( ( res ) => {
          socketService.changeConversationMessage( id, messageId );

          return dispatch( 'getConversationMessage', { id, messageId } );
        } );
    },

    // Friendship Reactions
    createFriendshipReaction( { commit, dispatch }, { id, messageId, reaction } ) {
      return Api().post( `/friendships/${ id }/messages/${ messageId }/reactions`, reaction )
        .then( ( res ) => {
          socketService.changeFriendshipMessage( id, messageId );

          return dispatch( 'getFriendshipMessage', { id, messageId } );
        } );
    },

    // Conversation Notifications
    removeConversationNotifications( { commit, dispatch }, id ) {
      return Api().delete( `/conversations/${ id }/notifications` )
        .then( () => {
          return dispatch( 'getConversation', id );
        } );
    },

    // Conversation Notifications
    removeFriendshipNotifications( { commit, dispatch }, id ) {
      return Api().delete( `/friendships/${ id }/notifications` )
        .then( () => {
          return dispatch( 'getFriendship', id );
        } );
    },

    // PushSub
    setPushSub( { commit }, pushSub: any ) {
      return Api().post( `/pushSub`, pushSub )
        .then( () => {
          commit( 'setPushSub' );
        } );
    },

    submitSubscription( { commit, dispatch } ) {
      const base64String = 'BN7O7tZnRi9-RktuYKO8-IO7LKW9ttqDwRlYOcBfFKBU48B_SRQXq956VGP6jYK6KF1ABY9OkTik30nEPbPc9Mk';

      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }

      const options = {
        userVisibleOnly: true,
        applicationServerKey: outputArray,
      };

      navigator.serviceWorker.ready.then( ( registration: ServiceWorkerRegistration | void ) => {
        if ( registration ) {
          new Promise( ( resolve, reject ) => {
            registration.pushManager.getSubscription().then( ( subscription ) => {
              if ( subscription ) {
                subscription.unsubscribe().finally( () => {
                  resolve();
                } );
              } else {
                resolve();
              }
            } ).catch( resolve );
          } ).then( () => {
            registration.pushManager.subscribe( options ).then( ( subscription: PushSubscription ) => {
              dispatch( 'setPushSub', subscription );
            } ).catch( ( err ) => {
              console.log( err.message )
              console.log( err );
            } );
          } );
        }
      } );
    },

    getPushSub( { commit, dispatch } ) {
      return Api().get( `/pushSub` )
        .then( ( res ) => {
          if ( res.data ) {
            if ( 'PushManager' in window ) {
              if ( Notification.permission === 'granted' ) {
                dispatch( 'submitSubscription' );
                commit( 'setPushSub' );
              } else {
                Notification.requestPermission().then( ( permission ) => {
                  if ( permission === 'granted' ) {
                    dispatch( 'submitSubscription' );
                    commit( 'setPushSub' );
                  }
                } );
              }
            }
          } else {
            commit( 'clearPushSub' );
          }
        } );
    },

    clearPushSub( { commit } ) {
      return Api().delete( `/pushSub` )
        .then( () => {
          commit( 'clearPushSub' );
        } );
    },
  },
});

// Conversations
socketService.socket.on( 'add-conversation-message', ( payload ) => {
  vuex.dispatch( 'getConversationMessage', payload );
} );

socketService.socket.on( 'update-conversation-message', ( payload ) => {
  vuex.dispatch( 'getConversationMessage', payload )
    .catch( ( err ) => {
      if ( err.response.status === 404 ) {
        vuex.commit( 'clearMessage', payload.messageId );
      }
    } );
} );

socketService.socket.on( 'notify-conversation', ( id ) => {
  if ( vuex.state.conversationId === id && document.hasFocus() ) {
    vuex.dispatch( 'removeConversationNotifications', id );
  } else {
    vuex.dispatch( 'getConversation', id );
  }
} );

socketService.socket.on( 'refresh-conversations', ( payload ) => {
  vuex.dispatch( 'getConversations' );
} );

// Friendships
socketService.socket.on( 'add-friendship-message', ( payload ) => {
  vuex.dispatch( 'getFriendshipMessage', payload );
} );

socketService.socket.on( 'update-friendship-message', ( payload ) => {
  vuex.dispatch( 'getFriendshipMessage', payload )
    .catch( ( err ) => {
      if ( err.response.status === 404 ) {
        vuex.commit( 'clearMessage', payload.messageId );
      }
    } );
} );

socketService.socket.on( 'notify-friendship', ( id ) => {
  if ( vuex.state.friendshipId === id && document.hasFocus() ) {
    vuex.dispatch( 'removeFriendshipNotifications', id );
  } else {
    vuex.dispatch( 'getFriendship', id );
  }
} );

socketService.socket.on( 'refresh-friendships', ( payload ) => {
  vuex.dispatch( 'getFriendships' );
} );

socketService.socket.on( 'user-typing', ( name ) => {
  vuex.commit( 'setTyping', name );
} );

window.addEventListener( 'focus', () => {
  inactiveFavicon();

  if ( vuex.state.friendshipId && vuex.state.friendships[vuex.state.friendshipId].notifications.length ) {
    vuex.dispatch( 'removeFriendshipNotifications', vuex.state.friendshipId );
  } else if ( vuex.state.conversationId && vuex.state.conversations[vuex.state.conversationId].notifications.length ) {
    vuex.dispatch( 'removeConversationNotifications', vuex.state.conversationId );
  }
}, false );

function activeFavicon() {
  const link = document.createElement( 'link' );
  const oldLink = document.getElementById( 'dynamic-favicon' );

  link.id = 'dynamic-favicon';
  link.rel = 'shortcut icon';
  link.href = '/favicon-active.ico';

  if ( document.head ) {
    if ( oldLink ) {
      document.head.removeChild( oldLink );
    }

    document.head.appendChild( link );
  }
}

function inactiveFavicon() {
  const link = document.createElement( 'link' );
  const oldLink = document.getElementById( 'dynamic-favicon' );

  link.id = 'dynamic-favicon';
  link.rel = 'shortcut icon';
  link.href = '/favicon.ico';

  if ( document.head ) {
    if ( oldLink ) {
      document.head.removeChild( oldLink );
    }

    document.head.appendChild( link );
  }
}

export default vuex;
