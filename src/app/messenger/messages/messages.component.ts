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

  constructor(
    private socketIoService: SocketIoService,
    private messageService: MessageService,
    private conversationService: ConversationService,
    private friendService: FriendService
  ) { }

  ngOnInit() {
    this.socketIoService.messagesChange
      .subscribe(
        () => {
          if ( this.messageService.privateMode ) {
            this.friendService.loadMessages( this.friendService.getCurrentFriendship()._id, true );
          } else {
            this.conversationService.loadMessages( this.conversationService.getCurrentConversation()._id, true );
          }
        }
      );
  }

}
