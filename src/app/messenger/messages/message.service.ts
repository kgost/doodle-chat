import { Injectable, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Message } from './message.model';
import { Conversation } from '../sidebar/conversations/conversation.model';
import { Friendship } from '../sidebar/friends/friendship.model';
import { User } from '../../auth/user.model';
import { AuthService } from '../../auth/auth.service';
import { SocketIoService } from '../../shared/socket-io.service';
import { SidebarService } from '../sidebar/sidebar.service';
import { TypingService } from './typing.service';

@Injectable()
export class MessageService {
  private currentConversation: Conversation;
  private currentFriendship: Friendship;
  private currentFriendName: string;
  messages: Message[] = [];
  changeEmitter = new EventEmitter<void>();
  containerEmitter = new EventEmitter<void>();
  paginateEmitter = new EventEmitter<void>();
  loadEmitter = new EventEmitter<void>();
  reloadEmitter = new EventEmitter<void>();
  keyEmitter = new EventEmitter<void>();
  removeEmitter = new EventEmitter<string>();
  editChange = new Subject<Message>();
  showReactions = new Subject<{ text: string, username: string }[]>();
  privateMode = false;
  key = '';
  loadMore = false;

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService,
    private socketIoService: SocketIoService,
    private typingService: TypingService,
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

  loadPreviousMessages() {
    if ( this.loadMore ) {
      if ( this.privateMode && this.currentFriendship ) {
        this.sidebarService.getPreviousPrivateMessages( this.currentFriendship._id, this.messages[0]._id )
          .subscribe(
            ( messages: Message[] ) => {
              if ( messages.length < 20 ) {
                this.loadMore = false;
              }
              this.messages = messages.concat( this.messages );
              this.changeEmitter.emit();
            }
          );
      } else if ( this.currentConversation ) {
        this.sidebarService.getPreviousMessages( this.currentConversation._id, this.messages[0]._id )
          .subscribe(
            ( messages: Message[] ) => {
              if ( messages.length < 20 ) {
                this.loadMore = false;
              }
              this.messages = messages.concat( this.messages );
              this.changeEmitter.emit();
            }
          );
      }
    }
  }

  loadMessages( conversation: Conversation, messages: Message[] ) {
    this.key = this.authService.decryptAccessKey( this.getConversationAccessKey( conversation, this.authService.getCurrentUser()._id ) );
    this.currentConversation = conversation;
    delete this.currentFriendship;
    delete this.currentFriendName;
    this.messages = messages;
    this.privateMode = false;

    if ( messages.length === 20 ) {
      this.loadMore = true;
    }

    this.reloadEmitter.emit();
    this.changeEmitter.emit();
  }

  loadPrivateMessages( friendship: Friendship, messages: Message[] ) {
    for ( let i = 0; i < friendship.users.length; i++ ) {
      if ( friendship.users[i].id._id !== this.authService.getCurrentUser()._id ) {
        this.currentFriendName = friendship.users[i].id.username;
      }
    }
    this.key = this.authService.decryptAccessKey( this.getFriendshipAccessKey( friendship, this.authService.getCurrentUser()._id ) );
    this.currentFriendship = friendship;
    delete this.currentConversation;
    this.messages = messages;
    this.privateMode = true;

    if ( messages.length === 20 ) {
      this.loadMore = true;
    }

    this.reloadEmitter.emit();
    this.changeEmitter.emit();
  }

  loadMessage( message: Message ) {
    this.messages.push( message );
    this.typingService.stopTyping.emit( message.username );
    this.changeEmitter.emit();
  }

  changeMessage( id: string, message: Message ) {
    if ( message ) {
      this.messages[this.getMessageIndex( id )] = message;
      this.typingService.stopTyping.emit( message.username );
    } else {
      this.messages.splice( this.getMessageIndex( id ), 1 );
    }
    this.changeEmitter.emit();
  }

  addMessage( message: Message ) {
    if ( !this.privateMode ) {
      this.sidebarService.createMessage( this.currentConversation._id, message )
        .subscribe(
          ( newMessage: Message ) => {
            this.socketIoService.newMessage( this.currentConversation._id, newMessage._id );
          }
        );
    } else {
      this.sidebarService.createPrivateMessage( this.currentFriendship._id, message )
        .subscribe(
          ( newMessage: Message ) => {
            this.socketIoService.newPrivateMessage( this.currentFriendship._id, newMessage._id );
          }
        );
    }
  }

  addReaction( id: string, emoji: string ) {
    if ( !this.privateMode ) {
      this.sidebarService.postReaction( id, this.currentConversation._id, emoji )
        .subscribe(
          ( newMessage: Message ) => {
            this.socketIoService.changeMessage( this.currentConversation._id, newMessage._id );
          }
        );
    } else {
      this.sidebarService.postPrivateReaction( id, this.currentFriendship._id, emoji )
        .subscribe(
          ( newMessage: Message ) => {
            this.socketIoService.changePrivateMessage( this.currentFriendship._id, newMessage._id );
          }
        );
    }
  }

  updateMessage( id: string, message: Message ) {
    this.sidebarService.updateMessage( id, message )
      .subscribe(
        ( data: any ) => {
          if ( this.privateMode ) {
            this.socketIoService.changePrivateMessage( this.currentFriendship._id, id );
          } else {
            this.socketIoService.changeMessage( this.currentConversation._id, id );
          }
        }
      );
  }

  removeMessage( id: string ) {
    this.removeEmitter.emit( id );
    this.sidebarService.removeMessage( id )
      .subscribe(
        ( data: any ) => {
          if ( this.privateMode ) {
            this.socketIoService.changePrivateMessage( this.currentFriendship._id, id );
          } else {
            this.socketIoService.changeMessage( this.currentConversation._id, id );
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

  getKey() {
    return this.key;
  }

  setKey( key: string ) {
    this.key = key;
    this.keyEmitter.emit();
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

  private getConversationAccessKey( conversation: Conversation, userId: string ) {
    for ( let i = 0; i < conversation.participants.length; i++ ) {
      if ( conversation.participants[i].id._id === userId ) {
        return conversation.participants[i].accessKey;
      }
    }
  }

  private getFriendshipAccessKey( friendship: Friendship, userId: string ) {
    for ( let i = 0; i < friendship.users.length; i++ ) {
      if ( friendship.users[i].id._id === userId ) {
        return friendship.users[i].accessKey;
      }
    }
  }
}
