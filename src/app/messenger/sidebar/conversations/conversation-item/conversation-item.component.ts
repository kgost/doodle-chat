import { Component, OnInit, Input } from '@angular/core';

import { ConversationService } from '../conversation.service';
import { Conversation } from '../conversation.model';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-conversation-item',
  templateUrl: './conversation-item.component.html',
  styleUrls: ['./conversation-item.component.css']
})
export class ConversationItemComponent implements OnInit {
  @Input() conversation: Conversation;

  constructor(
    private authService: AuthService,
    private conversationService: ConversationService,
  ) { }

  ngOnInit() {
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  onEdit() {
    this.conversationService.editChange.next( this.conversation );
  }

  onSelectConversation() {
    this.conversationService.loadMessages( this.conversation._id );
  }
}
