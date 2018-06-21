import { Component, OnInit } from '@angular/core';

import { Message } from '../message.model';
import { Conversation } from '../../sidebar/conversations/conversation.model';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent implements OnInit {
  conversation: Conversation;
  messages: Message[];

  constructor(
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.messages = this.messageService.getMessages();
    this.messageService.changeEmitter
      .subscribe( () => {
        this.messages = this.messageService.getMessages();
        this.conversation = this.messageService.getCurrentConversation();
      } );
  }

  getConversation() {
    return this.messageService.getCurrentConversation();
  }
}
