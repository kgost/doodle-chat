import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Conversation } from './sidebar/conversations/conversation.model';
import { Friendship } from './sidebar/friends/friendship.model';
import { SidebarService } from './sidebar/sidebar.service';
import { ConversationService } from './sidebar/conversations/conversation.service';
import { FriendService } from './sidebar/friends/friend.service';
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
  showMessages = false;

  constructor(
    private sidebarService: SidebarService,
    private conversationService: ConversationService,
    private friendService: FriendService,
    private authService: AuthService,
    private alertService: AlertService,
    private socketIoService: SocketIoService
  ) { }

  ngOnInit() {
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
