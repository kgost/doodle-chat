import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Conversation } from './sidebar/conversations/conversation.model';
import { ConversationService } from './sidebar/conversations/conversation.service';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  conversation: Conversation;

  constructor(
    private conversationService: ConversationService
  ) { }

  ngOnInit() {
    this.subscription = this.conversationService.editChange
      .subscribe(
        ( conversation: Conversation ) => {
          this.conversation = conversation;
        }
      );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
