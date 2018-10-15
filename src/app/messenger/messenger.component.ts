import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Media } from './messages/media/media.model';
import { Conversation } from './sidebar/conversations/conversation.model';
import { Friendship } from './sidebar/friends/friendship.model';

import { NotificationService } from './sidebar/notification.service';
import { SidebarService } from './sidebar/sidebar.service';
import { ConversationService } from './sidebar/conversations/conversation.service';
import { FriendService } from './sidebar/friends/friend.service';
import { MessageService } from './messages/message.service';
import { AuthService } from '../auth/auth.service';
import { AlertService } from '../alert.service';
import { SocketIoService } from '../shared/socket-io.service';
import { WebSqlService } from './web-sql.service';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  conversation: Conversation;
  conversationPart: Conversation;
  friendship: Friendship;
  previewMedia: Media;
  reactions: { text: string, username: string }[];
  showMessages = false;
  notification = false;

  constructor(
    private notificationService: NotificationService,
    private sidebarService: SidebarService,
    private conversationService: ConversationService,
    private messageService: MessageService,
    private friendService: FriendService,
    private authService: AuthService,
    private alertService: AlertService,
    private socketIoService: SocketIoService,
    private router: Router,
    private route: ActivatedRoute,
    private webSqlService: WebSqlService,
  ) { }

  ngOnInit() {
    this.socketIoService.leaveFriendship( this.socketIoService.joinedFriendship );
    this.socketIoService.leaveConversation( this.socketIoService.joinedConversation );

    this.subscriptions.push( this.route.params
      .subscribe(
        ( params ) => {
          if ( this.router.url.indexOf( 'conversations' ) !== -1 ) {
            if ( this.sidebarService.initialLoad ) {
              this.conversationService.forceSelect( params['id'] );
            } else {
              this.conversationService.loadMessages( params['id'] );
            }

            this.showMessages = true;
            this.authService.setPreviousRoute( '/messenger/conversations/' + params['id'] );
          } else if ( this.router.url.indexOf( 'friends' ) !== -1 ) {
            if ( this.sidebarService.initialLoad ) {
              this.friendService.forceSelect( params['id'] );
            } else {
              this.friendService.loadMessages( params['id'] );
            }

            this.showMessages = true;
            this.authService.setPreviousRoute( '/messenger/friends/' + params['id'] );
          } else {
            delete this.sidebarService.activeConversationId;
            delete this.sidebarService.activeFriendshipId;
            this.showMessages = false;
            this.messageService.rootRoute = true;
          }

          this.sidebarService.initialLoad = false;
        }
      ) );

    this.subscriptions.push( this.notificationService.conversationEmitter
      .subscribe(
        () => {
          if ( this.notificationService.conversationNotifications.length > 0 ) {
            this.notification = true;
          } else if ( !this.notificationService.friendshipNotifications.length ) {
            this.notification = false;
          }
        }
      ) );

    this.subscriptions.push( this.notificationService.friendshipEmitter
      .subscribe(
        () => {
          if ( this.notificationService.friendshipNotifications.length > 0 ) {
            this.notification = true;
          } else if ( !this.notificationService.conversationNotifications.length ) {
            this.notification = false;
          }
        }
      ) );

    this.subscriptions.push( this.messageService.previewSubject
      .subscribe(
        ( media: Media ) => {
          this.previewMedia = media;
        }
      ) );

    this.subscriptions.push( this.conversationService.editChange
      .subscribe(
        ( conversation: Conversation ) => {
          this.conversation = conversation;
        }
      ) );

    this.subscriptions.push( this.conversationService.settingsChange
      .subscribe(
        ( conversation: Conversation ) => {
          this.conversationPart = conversation;
        }
      ) );

    this.subscriptions.push( this.friendService.editChange
      .subscribe(
        ( friendship: Friendship ) => {
          this.friendship = friendship;
        }
      ) );
    this.subscriptions.push( this.messageService.showReactions
      .subscribe(
        ( reactions: { text: string, username: string }[] ) => {
          this.reactions = reactions;
        }
      ) );
    this.subscriptions.push( this.sidebarService.deactivate
      .subscribe(
        () => {
          this.showMessages = true;
        }
      ) );
    this.subscriptions.push( this.socketIoService.reconnectEmitter
      .subscribe(
        () => {
          this.socketIoService.signin( this.authService.getCurrentUser()._id );
        }
      ) );

    this.socketIoService.signin( this.authService.getCurrentUser()._id );

    if ( !this.webSqlService.loaded ) {
      this.webSqlService.init();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach( ( sub ) => {
      sub.unsubscribe();
    } );
  }

  toggleMessages() {
    this.showMessages = !this.showMessages;
  }
}
