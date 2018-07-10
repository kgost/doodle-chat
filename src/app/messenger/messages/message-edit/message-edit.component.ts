import { Component, OnInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Buffer } from 'buffer';

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
  @ViewChild('textarea') textarea: ElementRef;
  subscriptions: Subscription[] = [];
  editMode = false;
  editId: string;
  emojis = ['🤔', '😂', '😍', '😤', '😢', '🇮🇱'];

  constructor(
    private messageService: MessageService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.subscriptions.push( this.messageService.editChange
      .subscribe(
        ( message: Message ) => {
          this.messageEdit.setValue({
            'text': decodeURIComponent(escape(this.authService.decryptAes( message.text, this.messageService.getKey() )))
          });
          this.editMode = true;
          this.editId = message._id;
          this.textarea.nativeElement.focus();
        }
      ) );
    this.subscriptions.push( this.messageService.removeEmitter
      .subscribe(
        ( id: string ) => {
          if ( this.editMode && this.editId === id ) {
            this.onCancel();
          }
        }
      ) );
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

  onCancel( event = null ) {
    console.log( event );
    if ( event ) {
      event.preventDefault();
    }

    this.editMode = false;
    delete this.editId;
    this.messageEdit.reset();

    if ( !event ) {
      this.textarea.nativeElement.focus();
    }
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

  onSelectEmoji( index: number ) {
    let text = this.messageEdit.value.text ? this.messageEdit.value.text : '';
    let endIndex;
    if (typeof this.textarea.nativeElement.selectionStart !== 'undefined' &&
      typeof this.textarea.nativeElement.selectionEnd !== 'undefined') {
      endIndex = this.textarea.nativeElement.selectionEnd;
      text = text.slice(0, this.textarea.nativeElement.selectionStart) + this.emojis[index] + text.slice(endIndex);
      this.messageEdit.setValue({ 'text': text });
      this.textarea.nativeElement.focus();
      this.textarea.nativeElement.selectionStart = this.textarea.nativeElement.selectionEnd = endIndex + this.emojis[index].length;
    } else {
      text = text + this.emojis[index];
      this.messageEdit.setValue({ 'text': text });
      this.textarea.nativeElement.focus();
    }
  }

  onTextKey( event ) {
    if ( event.keyCode === 13 && !event.shiftKey ) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach( ( sub ) => {
      sub.unsubscribe();
    } );
  }
}
