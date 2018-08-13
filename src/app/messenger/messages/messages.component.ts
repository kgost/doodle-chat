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
  scrollTop: number;

  constructor(
    private socketIoService: SocketIoService,
    private messageService: MessageService,
    private conversationService: ConversationService,
    private friendService: FriendService
  ) { }

  ngOnInit() {
    this.subscriptions.push( this.messageService.containerEmitter
      .subscribe(
        () => {
          this.scrollBottom();
          this.scrollTop = this.container.nativeElement.scrollHeight;
        }
      ) );

    this.subscriptions.push( this.messageService.paginateEmitter
      .subscribe(
        () => {
          if ( this.container.nativeElement.scrollHeight - this.scrollTop > 0 ) {
            this.scrollBottom( this.container.nativeElement.scrollHeight - this.scrollTop );
            this.scrollTop = this.container.nativeElement.scrollHeight;
          }
        }
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

    this.subscriptions.push( this.socketIoService.reconnectEmitter
      .subscribe(
        () => {
          if ( this.messageService.privateMode && this.messageService.getCurrentFriendship() ) {
            this.friendService.loadMessages( this.messageService.getCurrentFriendship()._id );
          } else if ( this.messageService.getCurrentConversation() ) {
            this.conversationService.loadMessages( this.messageService.getCurrentConversation()._id );
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

  onContainerScroll() {
    if ( this.container.nativeElement.scrollHeight - this.container.nativeElement.scrollTop <=
      this.container.nativeElement.offsetHeight + 80 ) {
      this.messageService.allowScrollBottom = true;
    } else {
      this.messageService.allowScrollBottom = false;
      console.log( 'feff' );
    }

    if ( this.container.nativeElement.scrollTop === 0 ) {
      this.messageService.loadPreviousMessages();
    }
  }

  private scrollBottom( height: number = this.container.nativeElement.scrollHeight ) {
    if ( this.messageService.allowScrollBottom || this.messageService.scrollPrevious ) {
      console.log( 'feff' );
      if ( this.messageService.scrollPrevious ) {
        this.messageService.scrollPrevious = false;
      }

      try {
        this.container.nativeElement.scrollTop = height;
      } catch (err) { }
    }
  }
}
