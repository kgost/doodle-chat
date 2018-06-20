import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

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
    private router: Router
  ) { }

  ngOnInit() {
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  onEdit() {
    this.router.navigate( ['/messenger/conversations', this.conversation._id, 'edit'] );
  }

  onSelectConversation() {
    this.conversationService.loadMessages( this.conversation._id );
  }
}
