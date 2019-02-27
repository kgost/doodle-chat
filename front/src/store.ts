import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    conversationId: '',
    friendshipId: '',
    conversations: {},
    friendships: {},
    messages: {},
  },

  mutations: {
    setConversation( state, conversation ) {
      Vue.set( state.conversations, conversation._id, conversation );
    },

    setFriendship( state, friendship ) {
      Vue.set( state.friendships, friendship._id, friendship );
    },
  },

  actions: {

  },
});
