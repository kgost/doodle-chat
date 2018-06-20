import { Injectable, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';

import { Message } from './message.model';
import { Conversation } from '../sidebar/conversations/conversation.model';
import { SidebarService } from '../sidebar/sidebar.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private currentConversation: Conversation;
  messages: Message[] = [];
  changeEmitter = new EventEmitter<void>();

  constructor(
    sidebarService: SidebarService
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
    this.messages.push( message );
    this.changeEmitter.emit();
  }

  updateMessage( id: string, message: Message ) {
    this.messages[this.getMessageIndex( id )] = message;
    this.changeEmitter.emit();
  }

  removeMessage( id: string ) {
    this.messages.splice( this.getMessageIndex( id ), 1 );
    this.changeEmitter.emit();
  }

  private getMessageIndex( id: string ) {
    for ( let i = 0; i < this.messages.length; i++ ) {
      if ( this.messages[i]._id === id ) {
        return i;
      }
    }
  }
}
