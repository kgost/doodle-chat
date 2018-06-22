import { Component, OnInit } from '@angular/core';

import { SocketIoService } from '../../shared/socket-io.service';
import { MessageService } from './message.service';
import { ConversationService } from '../sidebar/conversations/conversation.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  constructor(
    private socketIoService: SocketIoService,
    private messageService: MessageService,
    private conversationService: ConversationService
  ) { }

  ngOnInit() {
    this.socketIoService.messagesChange
      .subscribe(
        () => {
          this.conversationService.loadMessages( this.messageService.getCurrentConversation()._id, true );
        }
      );
  }

}
