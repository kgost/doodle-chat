import { Component, OnInit, OnDestroy, AfterViewInit, Input } from '@angular/core';
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
  subscriptions: Subscription[] = [];
  owner = false;
  key = '';

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

  ngAfterViewInit() {
    this.messageService.loadEmitter.emit();
  }

  ngOnDestroy() {
    this.subscriptions.forEach( ( sub ) => {
      sub.unsubscribe();
    } );
  }
}
