import { Injectable, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Message } from './message.model';
import { Conversation } from '../sidebar/conversations/conversation.model';
import { Friendship } from '../sidebar/friends/friendship.model';
import { User } from '../../auth/user.model';
import { Poll } from './poll/poll.model';

import { AuthService } from '../../auth/auth.service';
import { SocketIoService } from '../../shared/socket-io.service';
import { SidebarService } from '../sidebar/sidebar.service';
import { TypingService } from './typing.service';
import { AlertService } from '../../alert.service';
import { WebSqlService } from '../web-sql.service';

@Injectable()
export class MessageService {
  private currentConversation: Conversation;
  private currentFriendship: Friendship;
  private currentFriendName: string;
  messages: Message[] = [];
  changeEmitter = new EventEmitter<void>();
  contextEmitter = new EventEmitter<void>();
  containerEmitter = new EventEmitter<void>();
  paginateEmitter = new EventEmitter<void>();
  loadEmitter = new EventEmitter<void>();
  reloadEmitter = new EventEmitter<void>();
  keyEmitter = new EventEmitter<void>();
  removeEmitter = new EventEmitter<string>();
  editChange = new Subject<Message>();
  showReactions = new Subject<{ text: string, username: string }[]>();
  loadingSubject = new Subject<boolean>();
  reactionSubject = new Subject<{ id: string, reactions: { username: string, text: string }[] }>();
  privateMode = false;
  key = '';
  loadMore = false;
  allowScrollBottom = true;
  mediaLock = false;
  scrollPrevious = false;
  rootRoute = false;

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService,
    private socketIoService: SocketIoService,
    private typingService: TypingService,
    private alertService: AlertService,
    private webSqlService: WebSqlService,
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
    if ( this.loadMore && this.messages[0] ) {
      if ( this.privateMode && this.currentFriendship ) {
        this.loadingSubject.next( true );
        this.sidebarService.getPreviousPrivateMessages( this.currentFriendship._id, this.messages[0]._id )
          .subscribe(
            ( messages: Message[] ) => {
              if ( messages.length < 20 ) {
                this.loadMore = false;
              }

              this.messages = messages.concat( this.messages );
              this.scrollPrevious = true;
              this.changeEmitter.emit();
              this.loadingSubject.next( false );
            },
            ( err: Response ) => {
              this.alertService.handleError( err );
            }
          );
      } else if ( this.currentConversation ) {
        this.loadingSubject.next( true );
        this.sidebarService.getPreviousMessages( this.currentConversation._id, this.messages[0]._id )
          .subscribe(
            ( messages: Message[] ) => {
              if ( messages.length < 20 ) {
                this.loadMore = false;
              }

              this.messages = messages.concat( this.messages );
              this.scrollPrevious = true;
              this.changeEmitter.emit();
              this.loadingSubject.next( false );
            },
            ( err: Response ) => {
              this.alertService.handleError( err );
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
    this.allowScrollBottom = true;

    if ( messages.length === 20 ) {
      this.loadMore = true;
    }

    this.reloadEmitter.emit();
    this.changeEmitter.emit();
    this.loadingSubject.next( false );
    this.clearMedia();
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
    this.loadingSubject.next( false );
    this.clearMedia();
  }

  loadMessage( message: Message ) {
    this.messages.push( message );

    if ( this.messages.length > 40 && this.allowScrollBottom ) {
      this.messages = this.messages.slice( this.messages.length - 40, this.messages.length );
      this.loadMore = true;
    }

    this.typingService.stopTyping.emit( message.username );
    this.changeEmitter.emit();
  }

  changeMessage( id: string, message: Message ) {
    if ( message ) {
      const lastText = this.messages[this.getMessageIndex( id )].text;
      this.messages[this.getMessageIndex( id )] = message;

      if ( message.text === lastText && !message.poll ) {
        this.reactionSubject.next( { id: id, reactions: message.reactions } );
      } else {
        this.changeEmitter.emit();
      }

      this.typingService.stopTyping.emit( message.username );
    } else {
      this.messages.splice( this.getMessageIndex( id ), 1 );
      this.changeEmitter.emit();

      this.webSqlService.removeMedia( id );
    }
  }

  addMessage( message: Message ) {
    if ( !this.privateMode ) {
      this.sidebarService.createMessage( this.currentConversation._id, message )
        .subscribe(
          ( newMessage: Message ) => {
            if ( message.media && message.media.data ) {
              this.webSqlService.addMedia( newMessage._id, message.media.data, new Date().setDate( new Date().getDate() + 3 ) );
              this.socketIoService.sendMedia(
                { messageId: newMessage._id, conversationId: this.currentConversation._id }, message.media.data );
            }

            this.socketIoService.newMessage( this.currentConversation._id, newMessage._id );
          },
          ( err: Response ) => {
            this.alertService.handleError( err );
          }
        );
    } else {
      this.sidebarService.createPrivateMessage( this.currentFriendship._id, message )
        .subscribe(
          ( newMessage: Message ) => {
            if ( message.media && message.media.data ) {
              this.webSqlService.addMedia( newMessage._id, message.media.data, new Date().setDate( new Date().getDate() + 3 ) );
              this.socketIoService.sendMedia( { messageId: newMessage._id, friendshipId: this.currentFriendship._id }, message.media.data );
            }

            this.socketIoService.newPrivateMessage( this.currentFriendship._id, newMessage._id );
          },
          ( err: Response ) => {
            this.alertService.handleError( err );
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
          },
          ( err: Response ) => {
            this.alertService.handleError( err );
          }
        );
    } else {
      this.sidebarService.postPrivateReaction( id, this.currentFriendship._id, emoji )
        .subscribe(
          ( newMessage: Message ) => {
            this.socketIoService.changePrivateMessage( this.currentFriendship._id, newMessage._id );
          },
          ( err: Response ) => {
            this.alertService.handleError( err );
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
        },
        ( err: Response ) => {
          this.alertService.handleError( err );
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
        },
        ( err: Response ) => {
          this.alertService.handleError( err );
        }
      );
  }

  pollVote( poll: Poll, index: number, messageId ) {
    this.sidebarService.pollVote( poll, index )
      .subscribe(
        ( data: any ) => {
          if ( this.privateMode ) {
            this.socketIoService.changePrivateMessage( this.currentFriendship._id, messageId );
          } else {
            this.socketIoService.changeMessage( this.currentConversation._id, messageId );
          }
        },
        ( err: Response ) => {
          this.alertService.handleError( err );
        }
      );
  }

  getCurrentConversation() {
    return this.currentConversation;
  }

  getNickname( id ) {
    if ( this.currentConversation ) {
      for ( const participant of this.currentConversation.participants ) {
        if ( participant.id._id === id ) {
          if ( !participant.nickname ) {
            return;
          }

          for ( const part of this.currentConversation.participants ) {
            if ( part.id._id !== id && ( part.id.username === participant.nickname || part.nickname === participant.nickname ) ) {
              return `${ participant.nickname } [${ participant.id.username }]`;
            }
          }

          return participant.nickname;
        }
      }
    }
  }

  refreshConversation( conversation: Conversation ) {
    this.currentConversation = conversation;
    this.changeEmitter.emit();
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

  reset( justMessages = false ) {
    if ( !justMessages ) {
      delete this.currentFriendship;
      delete this.currentFriendName;
      delete this.currentConversation;
    }

    this.messages = [];
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

  private clearMedia() {
    this.webSqlService.getExpirations()
      .then( ( rows ) => {
        for ( let i = 0; i < rows.length; i++ ) {
          if ( rows.item( i ).expiration <= new Date().getTime()  ) {
            this.webSqlService.removeMedia( rows.item( i ).messageId );
          }
        }
      } );
  }
}
