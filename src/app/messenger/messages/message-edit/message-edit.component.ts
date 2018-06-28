import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Buffer } from 'buffer';
import * as CryptoJS from 'crypto-js';
import * as sanitizer from 'sanitizer';

import { Media } from '../media/media.model';
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
  key = '';
  subscription: Subscription;

  constructor(
    private messageService: MessageService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.subscription = this.messageService.editChange
      .subscribe(
        ( message: Message ) => {
          this.messageEdit.setValue({
            'text': this.decrypt( message.text )
          });
          this.editMode = true;
          this.editId = message._id;
        }
      );
  }

  onSubmit() {
    if ( this.messageEdit.valid ) {
      let message;
      if ( this.messageService.privateMode ) {
        message = new Message(
          this.authService.getCurrentUser()._id,
          this.encrypt( sanitizer.sanitize( this.messageEdit.value.text ) ),
          undefined,
          this.messageService.getCurrentFriendship()._id,
        );
      } else {
        message = new Message(
          this.authService.getCurrentUser()._id,
          this.encrypt( sanitizer.sanitize( this.messageEdit.value.text ) ),
          this.messageService.getCurrentConversation()._id,
        );
      }

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

  onMediaUpload( event ) {
    const file = event.srcElement.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const message = new Message(
        this.authService.getCurrentUser()._id,
        '', '', '',
        new Media( file.type, new Buffer( reader.result ) ) );
      this.messageService.addMessage( message );
    };

    reader.readAsArrayBuffer( file );
  }

  encrypt( text: string ) {
    return CryptoJS.AES.encrypt( text, this.key ).toString();
  }

  decrypt( text: string ) {
    const bytes = CryptoJS.AES.decrypt( text, this.key );
    return bytes.toString( CryptoJS.enc.Utf8 );
  }

  onDecrypt() {
    this.messageService.setKey( this.key );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
