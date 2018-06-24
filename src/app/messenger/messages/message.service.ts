import { Injectable, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Message } from './message.model';
import { Conversation } from '../sidebar/conversations/conversation.model';
import { Friendship } from '../sidebar/friends/friendship.model';
import { AuthService } from '../../auth/auth.service';
import { SocketIoService } from '../../shared/socket-io.service';
import { SidebarService } from '../sidebar/sidebar.service';

@Injectable()
export class MessageService {
  private currentConversation: Conversation;
  private currentFriendship: Friendship;
  private currentFriendName: string;
  messages: Message[] = [];
  changeEmitter = new EventEmitter<void>();
  editChange = new Subject<Message>();
  privateMode = false;

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService,
    private socketIoService: SocketIoService
  ) { }

  getTitle() {
    if ( this.privateMode ) {
      return this.currentFriendName;
    }

    if ( this.currentConversation ) {
      return this.currentConversation.name;
    }
  }

  getMessages() {
    return this.messages.slice();
  }

  loadMessages( conversation: Conversation, messages: Message[] ) {
    this.currentConversation = conversation;
    delete this.currentFriendship;
    delete this.currentFriendName;
    this.messages = messages;
    this.privateMode = false;
    this.changeEmitter.emit();
  }

  loadPrivateMessages( friendship: Friendship, messages: Message[] ) {
    for ( let i = 0; i < friendship.users.length; i++ ) {
      if ( friendship.users[i].id._id !== this.authService.getCurrentUser()._id ) {
        this.currentFriendName = friendship.users[i].id.username;
      }
    }
    this.currentFriendship = friendship;
    delete this.currentConversation;
    this.messages = messages;
    this.privateMode = true;
    this.changeEmitter.emit();
  }

  addMessage( message: Message ) {
    if ( !this.privateMode ) {
      this.sidebarService.createMessage( this.currentConversation._id, message )
        .subscribe(
          ( newMessage: Message ) => {
            this.socketIoService.newMessage( this.currentConversation._id );
          }
        );
    } else {
      this.sidebarService.createPrivateMessage( this.currentFriendship._id, message )
        .subscribe(
          ( newMessage: Message ) => {
            this.socketIoService.newPrivateMessage( this.currentFriendship._id );
          }
        );
    }
  }

  updateMessage( id: string, message: Message ) {
    this.sidebarService.updateMessage( id, message )
      .subscribe(
        ( data: any ) => {
          if ( this.privateMode ) {
            this.socketIoService.newPrivateMessage( this.currentFriendship._id );
          } else {
            this.socketIoService.newMessage( this.currentConversation._id );
          }
        }
      );
  }

  removeMessage( id: string ) {
    this.sidebarService.removeMessage( id )
      .subscribe(
        ( data: any ) => {
          if ( this.privateMode ) {
            this.socketIoService.newPrivateMessage( this.currentFriendship._id );
          } else {
            this.socketIoService.newMessage( this.currentConversation._id );
          }
        }
      );
  }

  getCurrentConversation() {
    return this.currentConversation;
  }

  getCurrentFriendship() {
    return this.currentFriendship;
  }

  reset() {
    this.messages = [];
    delete this.currentFriendship;
    delete this.currentFriendName;
    delete this.currentConversation;
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
