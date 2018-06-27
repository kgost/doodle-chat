import { Component, OnInit, OnDestroy, AfterViewChecked, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Message } from '../message.model';
import { Conversation } from '../../sidebar/conversations/conversation.model';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('list') list: ElementRef;
  subscriptions: Subscription[] = [];
  title: string;
  messages: Message[];
  oldLength: number;
  initial = true;
  loaded = 0;
  loadGoal = 0;

  constructor(
    private messageService: MessageService,
  ) { }

  ngOnInit() {
    this.messages = this.messageService.getMessages();
    this.title = this.messageService.getTitle();
    this.subscriptions.push( this.messageService.changeEmitter
      .subscribe( () => {
        this.messages = this.messageService.getMessages();

        if ( this.initial ) {
          this.loaded -= this.messages.length;
          this.messages.forEach( ( message ) => {
            if ( message.media ) {
              this.loaded--;
            }
          } );
        }

        this.title = this.messageService.getTitle();
      } ) );

    this.subscriptions.push( this.messageService.loadEmitter
      .subscribe(
        () => {
          if ( this.initial ) {
            this.loaded++;
          } else {
            this.messageService.containerEmitter.emit();
          }
        }
      ) );

    this.subscriptions.push( this.messageService.reloadEmitter
      .subscribe(
        () => {
          this.initial = true;
        }
      ) );
  }

  ngAfterViewChecked() {
    if ( this.loaded === 0 && this.initial ) {
      this.initial = false;
      this.messageService.containerEmitter.emit();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach( ( sub ) => {
      sub.unsubscribe();
    } );
  }
}
