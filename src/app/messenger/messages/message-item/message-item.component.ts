import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Message } from '../message.model';
import { MessageService } from '../message.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-message-item',
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.css']
})
export class MessageItemComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input()message: Message;
  @ViewChild('clearfix') clearfix: ElementRef;
  subscriptions: Subscription[] = [];
  owner = false;
  key = '';
  editReaction = false;

  constructor(
    private messageService: MessageService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.owner = this.authService.getCurrentUser()._id === this.message.user;
    this.key = this.messageService.getKey();
    this.subscriptions.push( this.messageService.keyEmitter
      .subscribe(
        () => this.key = this.messageService.getKey()
      ));
  }

  onEdit() {
    this.messageService.editChange.next( this.message );
  }

  onDelete() {
    this.messageService.removeMessage( this.message._id );
  }

  onCheckReactions() {
    this.messageService.showReactions.next( this.message.reactions );
  }

  toggleReaction() {
    this.editReaction = !this.editReaction;
  }

  onSelectEmoji( emoji: string ) {

    this.messageService.addReaction( this.message._id,
      this.authService.encryptAes( unescape( encodeURIComponent( emoji ) ), this.messageService.getKey() ) );
    this.toggleReaction();
  }

  ngAfterViewInit() {
    if ( !this.message.media ) {
      this.messageService.loadEmitter.emit();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach( ( sub ) => {
      sub.unsubscribe();
    } );
  }
}
