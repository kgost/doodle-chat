import { Component, OnInit } from '@angular/core';

import { SocketIoService } from '../../shared/socket-io.service';
import { MessageService } from './message.service';
import { ConversationService } from '../sidebar/conversations/conversation.service';
import { FriendService } from '../sidebar/friends/friend.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  active = false;

  constructor(
    private socketIoService: SocketIoService,
    private messageService: MessageService,
    private conversationService: ConversationService,
    private friendService: FriendService
  ) { }

  ngOnInit() {
    this.messageService.changeEmitter
      .subscribe(
        () => {
          if ( this.messageService.getTitle() ) {
            this.active = true;
          } else {
            this.active = false;
          }
        }
      );
    this.socketIoService.messagesAdd
      .subscribe(
        ( messageId: string ) => {
          if ( this.messageService.privateMode ) {
            this.friendService.loadMessage( messageId );
          } else {
            this.conversationService.loadMessage( messageId );
          }
        }
      );
    this.socketIoService.messagesChange
      .subscribe(
        ( messageId: string ) => {
          if ( this.messageService.privateMode ) {
            this.friendService.changeMessage( messageId );
          } else {
            this.conversationService.changeMessage( messageId );
          }
        }
      );
  }

}
