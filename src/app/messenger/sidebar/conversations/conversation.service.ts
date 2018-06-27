import { Injectable, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';

import { AuthService } from '../../../auth/auth.service';
import { SocketIoService } from '../../../shared/socket-io.service';
import { SidebarService } from '../sidebar.service';
import { NotificationService } from '../notification.service';
import { MessageService } from '../../messages/message.service';
import { User } from '../../../auth/user.model';
import { Conversation } from './conversation.model';
import { Message } from '../../messages/message.model';

@Injectable()
export class ConversationService {
  private currentConversation: Conversation;
  changeEmitter = new EventEmitter<void>();
  editChange = new Subject<Conversation>();
  conversations: Conversation[] = [];

  constructor(
    private sidebarService: SidebarService,
    private messageService: MessageService,
    private socketIoService: SocketIoService,
    private notificationService: NotificationService
  ) {
    this.notificationService.conversationEmitter
      .subscribe(
        (  ) => {
          this.changeEmitter.emit();
        }
      );
  }

  loadConversations() {
    this.sidebarService.getConversations()
      .subscribe(
        ( conversations: Conversation[] ) => {
          this.updateSocket( conversations.slice() );
          this.conversations = conversations;
          this.changeEmitter.emit();
        }
      );
  }

  loadMessages( id: string ) {
    this.sidebarService.getMessages( id )
      .subscribe(
        ( messages: Message[] ) => {
          this.socketIoService.joinConversation( id );
          this.currentConversation = this.getConversation( id );
          this.messageService.loadMessages( this.getConversation( id ), messages );
        }
      );
  }

  loadMessage( id: string ) {
    this.sidebarService.getMessage( this.currentConversation._id, id )
      .subscribe(
        ( message: Message ) => {
          this.messageService.loadMessage( message );
        }
      );
  }

  changeMessage( id: string ) {
    this.sidebarService.getMessage( this.currentConversation._id, id )
      .subscribe(
        ( message: Message ) => {
          this.messageService.changeMessage( id, message );
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
          for ( let i = 0; i < newConversation.participants.length; i++ ) {
            this.socketIoService.addConversation( newConversation.participants[i]._id );
          }
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
          this.socketIoService.updateConversation( newConversation._id );

          for ( let i = 0; i < newConversation.participants.length; i++ ) {
            this.socketIoService.addConversation( newConversation.participants[i]._id );
          }
        }
      );
  }

  removeConversation( id: string ) {
    this.sidebarService.removeConversation( id )
      .subscribe(
        ( data: any ) => {
          this.socketIoService.updateConversation( id );
        }
      );
  }

  leaveConversation( id: string ) {
    this.sidebarService.leaveConversation( id )
      .subscribe(
        ( data: any ) => {
          this.socketIoService.updateConversation( id );
        }
      );
  }

  checkNotification( id: string ) {
    return this.notificationService.getConversationStatus( id );
  }

  removeNotification( id: string ) {
    this.notificationService.removeConversation( id );
  }

  reset() {
    delete this.currentConversation;
  }

  private getConversationIndex( id: string ) {
    for ( let i = 0; i < this.conversations.length; i++ ) {
      if ( this.conversations[i]._id === id ) {
        return i;
      }
    }
  }

  private updateSocket( conversations: Conversation[] ) {
    for ( let i = 0; i < this.conversations.length; i++ ) {
      let match = false;

      for ( let j = 0; j < conversations.length; j++ ) {
        if ( this.conversations[i]._id === conversations[j]._id ) {
          match = true;
          conversations.splice( j, 1 );
          break;
        }
      }

      if ( !match ) {
        if ( this.socketIoService.joinedConversation === this.conversations[i]._id ) {
          this.socketIoService.leaveConversation( this.conversations[i]._id );
          this.messageService.reset();
        }
        this.socketIoService.unListenConversation( this.conversations[i]._id );
      }
    }

    for ( let i = 0; i < conversations.length; i++ ) {
      this.socketIoService.listenConversation( conversations[i]._id );
    }
  }
}
