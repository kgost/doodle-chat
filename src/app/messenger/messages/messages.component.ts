import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { SocketIoService } from '../../shared/socket-io.service';
import { MessageService } from './message.service';
import { ConversationService } from '../sidebar/conversations/conversation.service';
import { FriendService } from '../sidebar/friends/friend.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, OnDestroy {
  @ViewChild('container') private container: ElementRef;
  subscriptions: Subscription[] = [];
  active = false;

  constructor(
    private socketIoService: SocketIoService,
    private messageService: MessageService,
    private conversationService: ConversationService,
    private friendService: FriendService
  ) { }

  ngOnInit() {
    this.subscriptions.push( this.messageService.containerEmitter
      .subscribe(
        () => this.scrollBottom()
      ) );

    this.subscriptions.push( this.messageService.changeEmitter
      .subscribe(
        () => {
          if ( this.messageService.getTitle() ) {
            this.active = true;
          } else {
            this.active = false;
          }
        }
      ) );
    this.subscriptions.push( this.socketIoService.messagesAdd
      .subscribe(
        ( messageId: string ) => {
          if ( this.messageService.privateMode ) {
            this.friendService.loadMessage( messageId );
          } else {
            this.conversationService.loadMessage( messageId );
          }
        }
      ) );
    this.subscriptions.push( this.socketIoService.messagesChange
      .subscribe(
        ( messageId: string ) => {
          if ( this.messageService.privateMode ) {
            this.friendService.changeMessage( messageId );
          } else {
            this.conversationService.changeMessage( messageId );
          }
        }
      ) );
  }

  ngOnDestroy() {
    this.subscriptions.forEach( ( sub ) => {
      sub.unsubscribe();
    } );

    this.messageService.reset();
  }

  private scrollBottom() {
    try {
      this.container.nativeElement.scrollTop = this.container.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
