import { Injectable, EventEmitter } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { User } from '../auth/user.model';
import { Conversation } from '../messenger/sidebar/conversations/conversation.model';

@Injectable()
export class SocketIoService {
  joinedConversation: string;
  joinedFriendship: string;
  conversationChange = new EventEmitter<void>();
  friendshipChange = new EventEmitter<void>();
  conversationLeave = new EventEmitter<void>();
  friendshipLeave = new EventEmitter<void>();
  messagesChange = new EventEmitter<void>();

  constructor( private socket: Socket ) {
    this.socket.on( 'refresh-conversations', ( data: any ) => {
      this.conversationChange.emit();
    } );

    this.socket.on( 'refresh-messages', () => {
      this.messagesChange.emit();
    } );

    this.socket.on( 'refresh-friendships', ( data: any ) => {
      this.friendshipChange.emit();
    } );

    this.socket.on( 'refresh-private-messages', () => {
      this.messagesChange.emit();
    } );
  }

  signin( userId: string ) {
    this.socket.emit( 'signin', userId );
  }

  signout( userId: string ) {
    this.socket.emit( 'signout', userId );
  }

  listenConversation( conversationId: string ) {
    this.socket.emit( 'listen-conversation', conversationId );
  }

  listenFriendship( friendshipId: string ) {
    this.socket.emit( 'listen-friendship', friendshipId );
  }

  unListenConversation( conversationId: string ) {
    this.socket.emit( 'unlisten-conversation', conversationId );
  }

  unListenFriendship( friendshipId: string ) {
    this.socket.emit( 'unlisten-friendship', friendshipId );
  }
  addConversation( userId: string ) {
    this.socket.emit( 'add-conversation', userId );
  }

  addFriendship( userId: string ) {
    this.socket.emit( 'add-friendship', userId );
  }

  updateConversation( conversationId: string ) {
    this.socket.emit( 'update-conversation', conversationId );
  }

  updateFriendship( friendshipId: string ) {
    this.socket.emit( 'update-friendship', friendshipId );
  }

  joinConversation( conversationId: string ) {
    this.joinedConversation = conversationId;
    this.socket.emit( 'join-conversation', conversationId );
    if ( this.joinedFriendship ) {
      this.leaveFriendship( this.joinedFriendship );
      delete this.joinedFriendship;
    }
  }

  joinFriendship( friendshipId: string ) {
    this.joinedFriendship = friendshipId;
    this.socket.emit( 'join-friendship', friendshipId );
    if ( this.joinedConversation ) {
      this.leaveConversation( this.joinedConversation );
      delete this.joinedConversation;
    }
  }

  leaveConversation( conversationId: string ) {
    this.socket.emit( 'leave-conversation', conversationId );
    this.conversationLeave.emit();
  }

  leaveFriendship( friendshipId: string ) {
    this.socket.emit( 'leave-friendship', friendshipId );
    this.friendshipLeave.emit();
  }

  newMessage( conversationId: string ) {
    this.socket.emit( 'new-message', conversationId );
  }

  newPrivateMessage( friendshipId: string ) {
    this.socket.emit( 'new-private-message', friendshipId );
  }
}
