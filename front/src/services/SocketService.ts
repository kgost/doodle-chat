import io from 'socket.io-client';

export default class ConversationService {
  public socket: any;

  constructor() {
    if ( location.hostname === 'staging.jackthelast.com' ) {
      this.socket = io( `${ location.protocol }//staging-api.jackthelast.com` );
    } else {
      this.socket = io( `${ location.protocol }//${ location.hostname }:8080` );
    }
  }

  public signIn( id: number ) {
    this.socket.emit( 'signin', id );
  }

  public signOut( id: number ) {
    this.socket.emit( 'signout', id );
  }

  public listenConversation( id: number ) {
    this.socket.emit( 'listen-conversation', id );
  }

  public listenFriendship( id: number ) {
    this.socket.emit( 'listen-friendship', id );
  }

  public unListenConversation( id: number ) {
    this.socket.emit( 'unlisten-conversation', id );
  }

  public unListenFriendship( id: number ) {
    this.socket.emit( 'unlisten-friendship', id );
  }

  public joinConversation( id: number ) {
    this.socket.emit( 'join-conversation', id );
  }

  public joinFriendship( id: number ) {
    this.socket.emit( 'join-friendship', id );
  }

  public leaveConversation( id: number ) {
    this.socket.emit( 'leave-conversation', id );
  }

  public leaveFriendship( id: number ) {
    this.socket.emit( 'leave-friendship', id );
  }

  public newConversationMessage( id: number, messageId: number ) {
    this.socket.emit( 'new-conversation-message', { id, messageId } );
  }

  public changeConversationMessage( id: number, messageId: number ) {
    this.socket.emit( 'change-conversation-message', { id, messageId } );
  }

  public newFriendshipMessage( id: number, messageId: number ) {
    this.socket.emit( 'new-friendship-message', { id, messageId } );
  }

  public changeFriendshipMessage( id: number, messageId: number ) {
    this.socket.emit( 'change-friendship-message', { id, messageId } );
  }

  public updateConversation( id: number ) {
    this.socket.emit( 'update-conversation', id );
  }

  public updateFriendship( id: number ) {
    this.socket.emit( 'update-friendship', id );
  }

  public addConversation( userId: number ) {
    this.socket.emit( 'add-conversation', userId );
  }

  public addFriendship( userId: number ) {
    this.socket.emit( 'add-friendship', userId );
  }

  public conversationTyping( id: number, username: string ) {
    this.socket.emit( 'conversation-typing', { id, username } );
  }

  public friendshipTyping( id: number, username: string ) {
    this.socket.emit( 'friendship-typing', { id, username } );
  }
}
