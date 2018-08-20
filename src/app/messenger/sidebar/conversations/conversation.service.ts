import { Injectable, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AuthService } from '../../../auth/auth.service';
import { SocketIoService } from '../../../shared/socket-io.service';
import { SidebarService } from '../sidebar.service';
import { NotificationService } from '../notification.service';
import { AlertService } from '../../../alert.service';
import { MessageService } from '../../messages/message.service';
import { User } from '../../../auth/user.model';
import { Conversation } from './conversation.model';
import { Message } from '../../messages/message.model';

@Injectable()
export class ConversationService {
  private currentConversation: Conversation;
  changeEmitter = new EventEmitter<void>();
  loadEmitter = new EventEmitter<void>();
  editChange = new Subject<Conversation>();
  conversations: Conversation[] = [];
  friendNames: string[] = [];
  loaded = false;

  constructor(
    private sidebarService: SidebarService,
    private messageService: MessageService,
    private authService: AuthService,
    private socketIoService: SocketIoService,
    private notificationService: NotificationService,
    private alertService: AlertService,
    private router: Router,
  ) {
    this.notificationService.conversationEmitter
      .subscribe(
        (  ) => {
          this.changeEmitter.emit();
        }
      );

    this.sidebarService.friendNamesSubject
      .subscribe(
        ( friendNames: string[] ) => {
          this.friendNames = friendNames;
        }
      );
  }

  loadConversations( reload = false ) {
    this.sidebarService.getConversations()
      .subscribe(
        ( conversations: Conversation[] ) => {
          if ( reload ) {
            this.reloadSocket( conversations );
          } else {
            this.updateSocket( conversations.slice() );
          }

          this.loaded = true;
          this.conversations = conversations;
          this.changeEmitter.emit();
          this.loadEmitter.emit();
        },
        ( err: Response ) => {
          this.alertService.handleError( err );
        }
      );
  }

  forceSelect( id: string ) {
    this.messageService.loadingSubject.next( true );
    this.socketIoService.joinConversation( id );
    this.currentConversation = this.getConversation( id );
    if ( this.loaded ) {
      if ( !this.exists( id ) ) {
        this.router.navigate(['/messenger']);
      } else {
        this.conversations[this.getConversationIndex( id )].forceSelect = true;
        this.changeEmitter.emit();
      }
    } else {
      const sub = this.loadEmitter.subscribe( () => {
        if ( !this.exists( id ) ) {
          this.router.navigate(['/messenger']);
        } else {
          this.conversations[this.getConversationIndex( id )].forceSelect = true;
          this.changeEmitter.emit();
        }

        sub.unsubscribe();
      } );
    }
  }

  loadMessages( id: string ) {
    this.messageService.loadingSubject.next( true );
    this.sidebarService.getMessages( id )
      .subscribe(
        ( messages: Message[] ) => {
          this.socketIoService.joinConversation( id );
          this.currentConversation = this.getConversation( id );
          this.messageService.loadMessages( this.getConversation( id ), messages );
        },
        ( err: Response ) => {
          this.alertService.handleError( err );
        }
      );
  }

  loadMessage( id: string ) {
    this.sidebarService.getMessage( this.currentConversation._id, id )
      .subscribe(
        ( message: Message ) => {
          this.messageService.loadMessage( message );
        },
        ( err: Response ) => {
          this.alertService.handleError( err );
        }
      );
  }

  changeMessage( id: string ) {
    this.sidebarService.getMessage( this.currentConversation._id, id )
      .subscribe(
        ( message: Message ) => {
          this.messageService.changeMessage( id, message );
        },
        ( err: Response ) => {
          this.alertService.handleError( err );
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

  getFriendNames() {
    return this.friendNames.slice();
  }

  addConversation( conversation: Conversation ) {
    this.sidebarService.getPublicKeys( conversation.participants )
      .subscribe(
        ( users: User[] ) => {
          const accessKeys = this.authService.generateAccessKeys( users );
          conversation.participants = conversation.participants.map(
            ( participant ) => {
              return { id: participant.id, nickname: participant.nickname, accessKey: accessKeys[participant.id.username] };
            }
          );
          this.sidebarService.createConversation( conversation )
            .subscribe(
              ( newConversation: Conversation ) => {
                for ( let i = 0; i < newConversation.participants.length; i++ ) {
                  this.socketIoService.addConversation( newConversation.participants[i].id._id );
                }
              },
              ( err: Response ) => {
                this.alertService.handleError( err );
              }
            );
        },
        ( err: Response ) => {
          this.alertService.handleError( err );
        }
      );
  }

  addConversations( conversations: Conversation[] ) {
    this.conversations.concat( conversations );
    this.changeEmitter.emit();
  }

  updateConversation( id: string, key: string, conversation: Conversation ) {
    this.sidebarService.getPublicKeys( conversation.participants )
      .subscribe(
        ( users: User[] ) => {
          const accessKeys = this.authService.generateAccessKeys( users, key );
          conversation.participants = conversation.participants.map(
            ( participant ) => {
              return { id: participant.id, nickname: participant.nickname, accessKey: accessKeys[participant.id.username] };
            }
          );
          this.sidebarService.updateConversation( id, conversation )
            .subscribe(
              ( newConversation: Conversation ) => {
                this.socketIoService.updateConversation( newConversation._id );

                for ( let i = 0; i < newConversation.participants.length; i++ ) {
                  this.socketIoService.addConversation( newConversation.participants[i].id._id );
                }
              },
              ( err: Response ) => {
                this.alertService.handleError( err );
              }
            );
        },
        ( err: Response ) => {
          this.alertService.handleError( err );
        }
      );
  }

  removeConversation( id: string ) {
    this.sidebarService.removeConversation( id )
      .subscribe(
        ( data: any ) => {
          this.socketIoService.updateConversation( id );
        },
        ( err: Response ) => {
          this.alertService.handleError( err );
        }
      );
  }

  leaveConversation( id: string ) {
    this.sidebarService.leaveConversation( id )
      .subscribe(
        ( data: any ) => {
          if ( this.currentConversation && this.currentConversation._id === id ) {
            delete this.currentConversation;
          }
          this.socketIoService.updateConversation( id );
        },
        ( err: Response ) => {
          this.alertService.handleError( err );
        }
      );
  }

  exists( id: string ) {
    return this.getConversationIndex( id ) !== -1;
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

  notifySound() {
    this.notificationService.notifySound();
  }

  stopForce( id: string ) {
    delete this.conversations[this.getConversationIndex( id )].forceSelect;
    this.changeEmitter.emit();
  }

  private getConversationIndex( id: string ) {
    for ( let i = 0; i < this.conversations.length; i++ ) {
      if ( this.conversations[i]._id === id ) {
        return i;
      }
    }

    return -1;
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

  private reloadSocket( conversations: Conversation[] ) {
    for ( let i = 0; i < this.conversations.length; i++ ) {
      this.socketIoService.unListenConversation( this.conversations[i]._id );
    }

    for ( let i = 0; i < conversations.length; i++ ) {
      this.socketIoService.listenConversation( conversations[i]._id );
    }
  }
}
