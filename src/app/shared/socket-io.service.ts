import { Injectable, EventEmitter } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { User } from '../auth/user.model';
import { Conversation } from '../messenger/sidebar/conversations/conversation.model';

@Injectable()
export class SocketIoService {
  joinedConversation: string;
  conversationChange = new EventEmitter<void>();
  conversationLeave = new EventEmitter<void>();
  messagesChange = new EventEmitter<void>();

  constructor( private socket: Socket ) {
    this.socket.on( 'refresh-conversations', ( data: any ) => {
      this.conversationChange.emit();
    } );

    this.socket.on( 'refresh-messages', () => {
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

  unListenConversation( conversationId: string ) {
    this.socket.emit( 'unlisten-conversation', conversationId );
  }

  addConversation( userId: string ) {
    this.socket.emit( 'add-conversation', userId );
  }

  updateConversation( conversationId: string ) {
    this.socket.emit( 'update-conversation', conversationId );
  }

  joinConversation( conversationId: string ) {
    this.joinedConversation = conversationId;
    this.socket.emit( 'join-conversation', conversationId );
  }

  leaveConversation( conversationId: string ) {
    this.socket.emit( 'leave-conversation', conversationId );
    this.conversationLeave.emit();
  }

  newMessage( conversationId: string ) {
    this.socket.emit( 'new-message', conversationId );
  }
}
