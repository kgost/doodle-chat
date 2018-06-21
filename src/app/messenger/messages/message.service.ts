import { Injectable, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';

import { Message } from './message.model';
import { Conversation } from '../sidebar/conversations/conversation.model';
import { SidebarService } from '../sidebar/sidebar.service';

@Injectable()
export class MessageService {
  private currentConversation: Conversation;
  messages: Message[] = [];
  changeEmitter = new EventEmitter<void>();
  editChange = new Subject<Message>();

  constructor(
    private sidebarService: SidebarService
  ) { }

  getCurrentConversation() {
    return this.currentConversation;
  }

  getMessages() {
    return this.messages.slice();
  }

  loadMessages( conversation: Conversation, messages: Message[] ) {
    this.currentConversation = conversation;
    this.messages = messages;
    this.changeEmitter.emit();
  }

  addMessage( message: Message ) {
    this.sidebarService.createMessage( this.currentConversation._id, message )
      .subscribe(
        ( newMessage: Message ) => {
          this.messages.push( newMessage );
          this.changeEmitter.emit();
        }
      );
  }

  updateMessage( id: string, message: Message ) {
    this.sidebarService.updateMessage( id, message )
      .subscribe(
        ( data: any ) => {
          this.messages[this.getMessageIndex( id )] = message;
          this.changeEmitter.emit();
        }
      );
  }

  removeMessage( id: string ) {
    this.sidebarService.removeMessage( id )
      .subscribe(
        ( data: any ) => {
          this.messages.splice( this.getMessageIndex( id ), 1 );
          this.changeEmitter.emit();
        }
      );
  }

  private getMessageIndex( id: string ) {
    for ( let i = 0; i < this.messages.length; i++ ) {
      if ( this.messages[i]._id === id ) {
        return i;
      }
    }
  }
}
