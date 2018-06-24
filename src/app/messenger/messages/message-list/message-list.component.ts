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
  title: string;
  messages: Message[];

  constructor(
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.messages = this.messageService.getMessages();
    this.title = this.messageService.getTitle();
    this.messageService.changeEmitter
      .subscribe( () => {
        this.messages = this.messageService.getMessages();
        this.title = this.messageService.getTitle();
      } );
  }
}
