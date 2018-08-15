import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Media } from './media.model';

import { MessageService } from '../message.service';
import { AuthService } from '../../../auth/auth.service';
import { SocketIoService } from '../../../shared/socket-io.service';
import { WebSqlService } from '../../web-sql.service';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.css']
})
export class MediaComponent implements OnInit, OnDestroy {
  @Input() media: Media;
  @Input() messageId: string;
  @ViewChild('video') video: ElementRef;
  subscriptions: Subscription[] = [];
  loaded = false;
  key: string;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private socketIoService: SocketIoService,
    private webSqlService: WebSqlService,
  ) { }

  ngOnInit() {
    this.key = this.messageService.getKey();

    if ( this.messageService.allowScrollBottom ) {
      this.messageService.mediaLock = true;
    }

    this.subscriptions.push( this.socketIoService.mediaSubject
      .subscribe(
        ( data: { messageId: string, mediaData: string } ) => {
          if ( this.messageId === data.messageId ) {
            this.media.data = data.mediaData, this.messageService.getKey();
          }
        }
      ) );

    this.getSocketMedia();
  }

  loadEmit() {
    this.loaded = true;

    if ( this.media ) {
      this.messageService.loadEmitter.emit();
    } else {
      this.messageService.loadEmitter.emit();
    }
  }

  getSocketMedia() {
    this.webSqlService.getMedia( this.messageId )
      .then( ( data ) => {
        if ( !data ) {
          const payload = { messageId: this.messageId, friendshipId: null, conversationId: null };

          if ( this.messageService.privateMode ) {
            payload.friendshipId = this.messageService.getCurrentFriendship()._id;
          } else {
            payload.conversationId = this.messageService.getCurrentConversation()._id;
          }

          this.socketIoService.getSocketMedia( payload );
        } else {
          this.media.data = data, this.messageService.getKey();
        }
      } );
  }

  ngOnDestroy() {
    this.subscriptions.forEach( ( sub ) => {
      sub.unsubscribe();
    } );
  }
}
