import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Message } from '../message.model';
import { MessageService } from '../message.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-message-edit',
  templateUrl: './message-edit.component.html',
  styleUrls: ['./message-edit.component.css']
})
export class MessageEditComponent implements OnInit, OnDestroy {
  @ViewChild('f') messageEdit: NgForm;
  editMode = false;
  editId: string;
  subscription: Subscription;

  constructor(
    private messageService: MessageService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.subscription = this.messageService.editChange
      .subscribe(
        ( message: Message ) => {
          this.messageEdit.setValue({ 'text': message.text });
          this.editMode = true;
          this.editId = message._id;
        }
      );
  }

  onSubmit() {
    if ( this.messageEdit.valid ) {
      const message = new Message(
        this.authService.getCurrentUser()._id,
        this.messageService.getCurrentConversation()._id,
        this.messageEdit.value.text
      );

      if ( this.editMode ) {
        message._id = this.editId;
        this.messageService.updateMessage( message._id, message );
      } else {
        this.messageService.addMessage( message );
      }

      this.onCancel();
    }
  }

  onCancel() {
    this.editMode = false;
    delete this.editId;
    this.messageEdit.reset();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
