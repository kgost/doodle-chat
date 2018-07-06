import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { ConversationService } from './conversation.service';
import { SocketIoService } from '../../../shared/socket-io.service';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.css']
})
export class ConversationsComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];

  constructor(
    private conversationService: ConversationService,
    private socketIoService: SocketIoService
  ) { }

  ngOnInit() {
    this.conversationService.loadConversations();
    this.subscriptions.push( this.socketIoService.conversationChange
      .subscribe( () => {
        this.conversationService.loadConversations();
      } ) );
    this.subscriptions.push( this.socketIoService.reconnectEmitter
      .subscribe( () => {
        this.conversationService.loadConversations( true );
      } ) );
  }

  ngOnDestroy() {
    this.conversationService.reset();

    this.subscriptions.forEach( ( sub ) => {
      sub.unsubscribe();
    } );
  }
}
