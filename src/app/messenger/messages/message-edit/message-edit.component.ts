import { Component, OnInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Buffer } from 'buffer';

import { Media } from '../media/media.model';
import { Message } from '../message.model';

import { MessageService } from '../message.service';
import { AuthService } from '../../../auth/auth.service';
import { SocketIoService } from '../../../shared/socket-io.service';
import { AlertService } from '../../../alert.service';
import { WebSqlService } from '../../web-sql.service';

import { CommandsPipe } from '../commands.pipe';

@Component({
  selector: 'app-message-edit',
  templateUrl: './message-edit.component.html',
  styleUrls: ['./message-edit.component.css'],
  providers: [CommandsPipe]
})
export class MessageEditComponent implements OnInit, OnDestroy {
  @ViewChild('f') messageEdit: NgForm;
  @ViewChild('textarea') textarea: ElementRef;
  @ViewChild('emojiPicker') emojiPicker: any;
  subscriptions: Subscription[] = [];
  editMode = false;
  editId: string;
  sendTyping = true;
  media = false;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private socketIoService: SocketIoService,
    private alertService: AlertService,
    private commandPipe: CommandsPipe,
    private webSqlService: WebSqlService,
  ) { }

  ngOnInit() {
    this.media = this.webSqlService.supported;

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

    this.subscriptions.push( this.messageService.reloadEmitter
      .subscribe(
        () => {
          this.onCancel();
        }
      ) );
  }

  onFocus() {
    this.messageService.allowScrollBottom = true;
    this.messageService.containerEmitter.emit();
    setTimeout( () => {
      this.messageService.allowScrollBottom = true;
      this.messageService.containerEmitter.emit();
    }, 500 );
  }

  onSubmit() {
    if ( this.messageEdit.valid ) {
      let message = new Message(
        this.authService.getCurrentUser()._id,
        this.messageEdit.value.text,
      );

      if ( this.messageService.privateMode ) {
        message.friendshipId = this.messageService.getCurrentFriendship()._id;
      } else {
        message.conversationId = this.messageService.getCurrentConversation()._id;
      }

      message = this.commandPipe.transform( message );
      const encodeing = unescape( encodeURIComponent( message.text ) );
      message.text = this.authService.encryptAes(
        encodeing,
        this.messageService.getKey()
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

  onCancel( event = null ) {
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
    const file = event.srcElement ? event.srcElement.files[0] : event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      if ( file.type.indexOf( 'image' ) !== -1 ) {
        const image = new Image();

        image.onload = () => {
          const message = new Message(
            this.authService.getCurrentUser()._id,
            '', '', '',
            new Media( file.type, reader.result,
            null, { width: image.width, height: image.height } ) );
          this.messageService.addMessage( message );
        };

        image.src = window.URL.createObjectURL( file );
      } else {
        const message = new Message(
          this.authService.getCurrentUser()._id,
          '', '', '',
          new Media( file.type, reader.result ) );
        this.messageService.addMessage( message );
      }
    };

    reader.readAsDataURL( file );
  }

  onSelectEmoji( emoji ) {
    let text = this.messageEdit.value.text ? this.messageEdit.value.text : '';
    let endIndex;

    if (typeof this.textarea.nativeElement.selectionStart !== 'undefined' &&
      typeof this.textarea.nativeElement.selectionEnd !== 'undefined') {
      endIndex = this.textarea.nativeElement.selectionEnd;
      text = text.slice(0, this.textarea.nativeElement.selectionStart) + emoji + text.slice(endIndex);
      this.messageEdit.setValue({ 'text': text });
      this.textarea.nativeElement.focus();
      this.textarea.nativeElement.selectionStart = this.textarea.nativeElement.selectionEnd = endIndex + emoji.length;
    } else {
      text = text + emoji;
      this.messageEdit.setValue({ 'text': text });
      this.textarea.nativeElement.focus();
    }

    this.typing();
  }

  onTextKey( event ) {
    if ( event.keyCode === 13 && !event.shiftKey ) {
      event.preventDefault();
      this.onSubmit();
    } else if ( [13, 16, 17, 18, 19, 20, 27, 35, 36, 37, 38, 39, 40, 91, 93, 224].indexOf( event.keyCode ) === -1 ) {
      this.typing();
    }
  }

  onOpenEmoji() {
    this.emojiPicker.toggle();
  }

  ngOnDestroy() {
    this.subscriptions.forEach( ( sub ) => {
      sub.unsubscribe();
    } );
  }

  private typing() {
    if ( this.sendTyping ) {
      if ( this.messageService.privateMode ) {
        this.socketIoService.showTypingFriendship(
          this.authService.getCurrentUser().username, this.messageService.getCurrentFriendship()._id );
      } else {
        this.socketIoService.showTypingConversation(
          this.authService.getCurrentUser().username, this.messageService.getCurrentConversation()._id );
      }

      this.sendTyping = false;

      setTimeout( () => {
        this.sendTyping = true;
      }, 3500 );
    }
  }
}
