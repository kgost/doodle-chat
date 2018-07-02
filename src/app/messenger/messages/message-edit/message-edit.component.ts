import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Buffer } from 'buffer';
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
  subscription: Subscription;
  showEmojis = false;
  emojis = ['🤔', '😂', '😍', '😤', '🇮🇱'];

  constructor(
    private messageService: MessageService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.subscription = this.messageService.editChange
      .subscribe(
        ( message: Message ) => {
          this.messageEdit.setValue({
            'text': decodeURIComponent(escape(this.authService.decryptAes( message.text, this.messageService.getKey() )))
          });
          this.editMode = true;
          this.editId = message._id;
        }
      );
  }

  onSubmit() {
    if ( this.messageEdit.valid ) {
      let message;
      const encodeing = unescape( encodeURIComponent( this.messageEdit.value.text ) );
      if ( this.messageService.privateMode ) {
        message = new Message(
          this.authService.getCurrentUser()._id,
          this.authService.encryptAes( encodeing, this.messageService.getKey() ),
          undefined,
          this.messageService.getCurrentFriendship()._id,
        );
      } else {
        message = new Message(
          this.authService.getCurrentUser()._id,
          this.authService.encryptAes( encodeing, this.messageService.getKey() ),
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

  onShowEmojis() {
    this.showEmojis = true;
  }

  onSelectEmoji( index: number ) {
    const text = this.messageEdit.value.text ? this.messageEdit.value.text : '';
    this.messageEdit.setValue({ 'text': text + this.emojis[index] });
    this.showEmojis = false;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
