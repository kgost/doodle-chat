import { Component, OnInit, Input } from '@angular/core';

import { Message } from '../message.model';
import { MessageService } from '../message.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-message-item',
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.css']
})
export class MessageItemComponent implements OnInit {
  @Input()message: Message;
  owner = false;

  constructor(
    private messageService: MessageService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.owner = this.authService.getCurrentUser()._id === this.message.user;
  }

  onEdit() {
    this.messageService.editChange.next( this.message );
  }

  onDelete() {
    this.messageService.removeMessage( this.message._id );
  }
}
