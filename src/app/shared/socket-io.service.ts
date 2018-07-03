import { Injectable, EventEmitter } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { User } from '../auth/user.model';
import { Conversation } from '../messenger/sidebar/conversations/conversation.model';
import { AlertService } from '../alert.service';

@Injectable()
export class SocketIoService {
  joinedConversation: string;
  joinedFriendship: string;
  conversationChange = new EventEmitter<void>();
  friendshipChange = new EventEmitter<void>();
  conversationLeave = new EventEmitter<void>();
  friendshipLeave = new EventEmitter<void>();
  messagesChange = new EventEmitter<string>();
  messagesAdd = new EventEmitter<string>();
  notifyConversation = new EventEmitter<string>();
  notifyFriendship = new EventEmitter<string>();
  reconnectEmitter = new EventEmitter<void>();
  reconnect = false;

  constructor( private socket: Socket, private alertService: AlertService ) {
    this.socket.on( 'connect', ( data: any ) => {
      if ( this.reconnect ) {
        this.alertService.alertSubject.next(
          { message: 'You Have Reconnected To The Server!', mode: 'success' } );
      }
      this.reconnect = false;
      this.reconnectEmitter.emit();
    } );

    this.socket.on( 'disconnect', ( data: any ) => {
      this.alertService.alertSubject.next(
        { message: 'You Have Disconnected From The Server, Attempting To Reconnect...', mode: 'danger' } );
      this.reconnect = true;
    } );

    this.socket.on( 'refresh-conversations', ( data: any ) => {
      this.conversationChange.emit();
    } );

    this.socket.on( 'add-message', ( messageId ) => {
      this.messagesAdd.emit( messageId );
    } );

    this.socket.on( 'update-message', ( messageId: string ) => {
      this.messagesChange.emit( messageId );
    } );

    this.socket.on( 'refresh-friendships', ( data: any ) => {
      this.friendshipChange.emit();
    } );

    this.socket.on( 'add-private-message', ( messageId ) => {
      this.messagesAdd.emit( messageId );
    } );

    this.socket.on( 'update-private-message', ( messageId: string ) => {
      this.messagesChange.emit( messageId );
    } );

    this.socket.on( 'notify-conversation', ( conversationId ) => {
      this.notifyConversation.emit( conversationId );
    } );

    this.socket.on( 'notify-friendship', ( friendshipId ) => {
      this.notifyFriendship.emit( friendshipId );
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

  newMessage( conversationId: string, messageId: string ) {
    this.socket.emit( 'new-message', { messageId: messageId, conversationId: conversationId } );
  }

  changeMessage( conversationId: string, messageId: string ) {
    this.socket.emit( 'change-message', { messageId: messageId, conversationId: conversationId } );
  }

  newPrivateMessage( friendshipId: string, messageId: string ) {
    this.socket.emit( 'new-private-message', { messageId: messageId, friendshipId: friendshipId } );
  }

  changePrivateMessage( friendshipId: string, messageId: string ) {
    this.socket.emit( 'change-private-message', { messageId: messageId, friendshipId: friendshipId } );
  }
}
