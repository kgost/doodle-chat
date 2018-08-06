import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Conversation } from './sidebar/conversations/conversation.model';
import { Friendship } from './sidebar/friends/friendship.model';
import { SidebarService } from './sidebar/sidebar.service';
import { ConversationService } from './sidebar/conversations/conversation.service';
import { FriendService } from './sidebar/friends/friend.service';
import { MessageService } from './messages/message.service';
import { AuthService } from '../auth/auth.service';
import { AlertService } from '../alert.service';
import { SocketIoService } from '../shared/socket-io.service';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  conversation: Conversation;
  friendship: Friendship;
  reactions: { text: string, username: string }[];
  showMessages = false;

  constructor(
    private sidebarService: SidebarService,
    private conversationService: ConversationService,
    private messageService: MessageService,
    private friendService: FriendService,
    private authService: AuthService,
    private alertService: AlertService,
    private socketIoService: SocketIoService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
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
          } else if ( this.router.url.indexOf( 'friends' ) !== -1 ) {
            if ( this.sidebarService.initialLoad ) {
              this.friendService.forceSelect( params['id'] );
            } else {
              this.friendService.loadMessages( params['id'] );
            }

            this.showMessages = true;
          } else {
            delete this.sidebarService.activeConversationId;
            delete this.sidebarService.activeFriendshipId;
            this.showMessages = false;
          }

          this.sidebarService.initialLoad = false;
        }
      ) );

    this.subscriptions.push( this.conversationService.editChange
      .subscribe(
        ( conversation: Conversation ) => {
          this.conversation = conversation;
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

    navigator.serviceWorker.addEventListener( 'message', ( event ) => {
      if ( !event.data.PUSH ) {
        this.sidebarService.initialLoad = true;
        this.router.navigate([event.data]);
      }
    } );
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
