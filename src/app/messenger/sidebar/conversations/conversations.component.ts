import { Component, OnInit } from '@angular/core';

import { ConversationService } from './conversation.service';
import { SocketIoService } from '../../../shared/socket-io.service';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.css']
})
export class ConversationsComponent implements OnInit {

  constructor(
    private conversationService: ConversationService,
    private socketIoService: SocketIoService
  ) { }

  ngOnInit() {
    this.conversationService.loadConversations();
    this.socketIoService.conversationChange
      .subscribe( () => {
        this.conversationService.loadConversations();
      } );
  }

}
