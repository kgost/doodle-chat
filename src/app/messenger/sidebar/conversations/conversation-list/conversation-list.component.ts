import { Component, OnInit } from '@angular/core';

import { Conversation } from '../conversation.model';
import { ConversationService } from '../conversation.service';

@Component({
  selector: 'app-conversation-list',
  templateUrl: './conversation-list.component.html',
  styleUrls: ['./conversation-list.component.css']
})
export class ConversationListComponent implements OnInit {
  conversations: Conversation[];

  constructor(
    private conversationService: ConversationService,
  ) { }

  ngOnInit() {
    this.conversations = this.conversationService.getConversations();
    this.conversationService.changeEmitter
      .subscribe(
        () => this.conversations = this.conversationService.getConversations()
      );
  }
}
