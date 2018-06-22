import { Injectable, EventEmitter } from '@angular/core';
import { Socket } from 'ngx-socket-io';

import { User } from '../auth/user.model';
import { Conversation } from '../messenger/sidebar/conversations/conversation.model';

@Injectable()
export class SocketIoService {
  conversationChange = new EventEmitter<void>();
  messagesChange = new EventEmitter<void>();

  constructor( private socket: Socket ) {
    this.socket.on( 'refresh-conversations', ( data: any ) => {
      this.conversationChange.emit();
    } );

    this.socket.on( 'refresh-messages', () => {
      this.messagesChange.emit();
    } );
  }

  signin( user: User ) {
    this.socket.emit( 'signin', user._id );
  }

  signout( user: User ) {
    this.socket.emit( 'signout', user._id );
  }

  listenConversation( conversation: Conversation ) {
    this.socket.emit( 'listen-conversation', conversation._id );
  }

  unListenConversation( conversation: Conversation ) {
    this.socket.emit( 'unlisten-conversation', conversation._id );
  }

  addConversation( user: User ) {
    this.socket.emit( 'add-conversation', user._id );
  }

  updateConversation( conversation: Conversation ) {
    this.socket.emit( 'update-conversation', conversation._id );
  }

  joinConversation( conversationId: string ) {
    this.socket.emit( 'join-conversation', conversationId );
  }

  newMessage( conversationId: string ) {
    this.socket.emit( 'new-message', conversationId );
  }
}
