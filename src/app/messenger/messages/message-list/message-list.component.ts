import { Component, OnInit, OnDestroy, AfterViewChecked, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Message } from '../message.model';
import { Conversation } from '../../sidebar/conversations/conversation.model';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css'],
})
export class MessageListComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('list') list: ElementRef;
  subscriptions: Subscription[] = [];
  title: string;
  messages: Message[];
  initial = true;
  loading = true;
  loaded = 0;
  paginate = false;
  edit = false;

  constructor(
    private messageService: MessageService,
  ) { }

  ngOnInit() {
    this.messages = this.messageService.getMessages();
    this.title = this.messageService.getTitle();
    this.subscriptions.push( this.messageService.changeEmitter
      .subscribe( () => {
        const messages = this.messageService.getMessages();


        if ( this.messages.length > 0 && messages.length > 0 &&  messages[0]._id !== this.messages[0]._id ) {
          this.paginate = true;
        } else {
          this.paginate = false;
        }

        if ( this.messages.length === messages.length ) {
          this.edit = true;
        } else {
          this.edit = false;
        }

        if ( this.initial || this.paginate ) {
          this.loaded -= messages.length - this.messages.length;
        }

        this.messages = messages;
        this.title = this.messageService.getTitle();

        this.loading = false;
      } ) );

    this.subscriptions.push( this.messageService.loadEmitter
      .subscribe(
        () => {
          if ( this.initial || this.paginate ) {
            this.loaded++;
          } else if ( !this.paginate && !this.edit ) {
            this.messageService.containerEmitter.emit();
          }
        }
      ) );

    this.subscriptions.push( this.messageService.reloadEmitter
      .subscribe(
        () => {
          this.initial = true;
          this.loaded = 0 - this.messages.length;
        }
      ) );

    this.subscriptions.push( this.messageService.loadingSubject
      .subscribe(
        ( loading ) => {
          this.loading = loading;
        }
      ) );

    if ( this.messageService.rootRoute ) {
      this.loading = false;
    }
  }

  ngAfterViewChecked() {
    if ( this.loaded === 0 && this.initial ) {
      this.initial = false;
      this.messageService.containerEmitter.emit();
    }

    if ( this.loaded === 0 && this.paginate ) {
      this.paginate = false;
      this.messageService.paginateEmitter.emit();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach( ( sub ) => {
      sub.unsubscribe();
    } );
  }
}
