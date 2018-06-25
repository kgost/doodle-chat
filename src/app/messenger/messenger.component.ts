import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Conversation } from './sidebar/conversations/conversation.model';
import { Friendship } from './sidebar/friends/friendship.model';
import { SidebarService } from './sidebar/sidebar.service';
import { ConversationService } from './sidebar/conversations/conversation.service';
import { FriendService } from './sidebar/friends/friend.service';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit, OnDestroy {
  subscriptionConversation: Subscription;
  subscriptionFriendship: Subscription;
  conversation: Conversation;
  friendship: Friendship;
  showMessages = false;

  constructor(
    private sidebarService: SidebarService,
    private conversationService: ConversationService,
    private friendService: FriendService,
  ) { }

  ngOnInit() {
    this.subscriptionConversation = this.conversationService.editChange
      .subscribe(
        ( conversation: Conversation ) => {
          this.conversation = conversation;
        }
      );
    this.subscriptionFriendship = this.friendService.editChange
      .subscribe(
        ( friendship: Friendship ) => {
          this.friendship = friendship;
        }
      );
    this.sidebarService.deactivate
      .subscribe(
        () => {
          this.showMessages = true;
        }
      );
  }

  ngOnDestroy() {
    this.subscriptionConversation.unsubscribe();
    this.subscriptionFriendship.unsubscribe();
  }

  toggleMessages() {
    this.showMessages = !this.showMessages;
  }
}
