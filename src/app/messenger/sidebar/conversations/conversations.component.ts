import { Component, OnInit } from '@angular/core';

import { ConversationService } from './conversation.service';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.css']
})
export class ConversationsComponent implements OnInit {

  constructor(
    private conversationService: ConversationService
  ) { }

  ngOnInit() {
    this.conversationService.loadConversations();
  }

}
