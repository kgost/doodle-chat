import { Injectable, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';

import { AuthService } from '../../../auth/auth.service';
import { SidebarService } from '../sidebar.service';
import { MessageService } from '../../messages/message.service';
import { User } from '../../../auth/user.model';
import { Conversation } from './conversation.model';
import { Message } from '../../messages/message.model';

@Injectable()
export class ConversationService {
  private currentConversation: Conversation;
  changeEmitter = new EventEmitter<void>();
  editChange = new Subject<Conversation>();
  user = this.authService.getCurrentUser();
  conversations: Conversation[] = [
    new Conversation( 'feff', this.user,
      [this.authService.getCurrentUser(), new User( 'jeff', 'asdf' )], 'asdf' ),
    new Conversation( 'feff', new User( 'jeff', 'asdf' ),
      [this.authService.getCurrentUser(), new User( 'jeff', 'asdf' )], 'fdsa' ),
  ];

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService,
    private messageService: MessageService,
  ) { }

  loadConversations() {
    this.sidebarService.getConversations()
      .subscribe(
        ( conversations: Conversation[] ) => {
          this.conversations = conversations;
          this.changeEmitter.emit();
        }
      );
  }

  loadMessages( id: string ) {
    this.sidebarService.getMessages( id )
      .subscribe(
        ( messages: Message[] ) => {
          this.currentConversation = this.getConversation( id );
          this.messageService.loadMessages( this.getConversation( id ), messages );
        }
      );
  }

  getCurrentConversation() {
    return this.currentConversation;
  }

  getConversation( id: string ) {
    return this.conversations[this.getConversationIndex( id )];
  }

  getConversations() {
    return this.conversations.slice();
  }

  addConversation( conversation: Conversation ) {
    this.sidebarService.createConversation( conversation )
      .subscribe(
        ( newConversation: Conversation ) => {
          this.conversations.push( newConversation );
          this.changeEmitter.emit();
        }
      );
  }

  addConversations( conversations: Conversation[] ) {
    this.conversations.concat( conversations );
    this.changeEmitter.emit();
  }

  updateConversation( id: string, conversation: Conversation ) {
    this.sidebarService.updateConversation( id, conversation )
      .subscribe(
        ( newConversation: Conversation ) => {
          this.conversations[this.getConversationIndex( id )] = newConversation;
          this.changeEmitter.emit();
        }
      );
  }

  removeConversation( id: string ) {
    this.sidebarService.removeConversation( id )
      .subscribe(
        ( data: any ) => {
          this.conversations.splice( this.getConversationIndex( id ), 1 );
          this.changeEmitter.emit();
        }
      );
  }

  private getConversationIndex( id: string ) {
    for ( let i = 0; i < this.conversations.length; i++ ) {
      if ( this.conversations[i]._id === id ) {
        return i;
      }
    }
  }
}
