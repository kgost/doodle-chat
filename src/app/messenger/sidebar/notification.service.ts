import { Inject, Injectable, EventEmitter } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { SocketIoService } from '../../shared/socket-io.service';
import { SidebarService } from './sidebar.service';
import { Favicons } from '../../favicons';

@Injectable()
export class NotificationService {
  conversationNotifications: string[] = [];
  friendshipNotifications: string[] = [];
  conversationEmitter = new EventEmitter<void>();
  friendshipEmitter = new EventEmitter<void>();
  soundEmitter = new EventEmitter<void>();
  hiddenEmitter = new EventEmitter<void>();
  private hiddenType = '';
  private browserHidden = false;

  constructor(
    private socketIoService: SocketIoService,
    private sidebarService: SidebarService,
    private favicons: Favicons,
    @Inject(DOCUMENT) private document: any
  ) {
    this.socketIoService.notifyConversation
      .subscribe(
        ( conversationId: string ) => {
          this.conversationNotifications.push( conversationId );

          if ( !this.isEmpty() ) {
            this.favicons.activate( 'active' );
          }

          this.conversationEmitter.emit();
        }
      );
    this.socketIoService.notifyFriendship
      .subscribe(
        ( friendshipId: string ) => {
          this.friendshipNotifications.push( friendshipId );

          if ( !this.isEmpty() ) {
            this.favicons.activate( 'active' );
          }

          this.friendshipEmitter.emit();
        }
      );

    let visibilityChange;

    if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
      this.hiddenType = 'hidden';
      visibilityChange = 'visibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
      this.hiddenType = 'msHidden';
      visibilityChange = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
      this.hiddenType = 'webkitHidden';
      visibilityChange = 'webkitvisibilitychange';
    }

    if (typeof document.addEventListener === 'undefined' || this.hiddenType === undefined) {
      console.log('This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.');
    } else {
      // Handle page visibility change
      document.addEventListener(visibilityChange, () => {
        this.browserHidden = this.document[this.hiddenType];
        this.hiddenEmitter.emit();
      }, false);
    }

    window.addEventListener( 'blur', () => {
      this.browserHidden = true;
      this.hiddenEmitter.emit();
    } );

    window.addEventListener( 'focus', () => {
      this.browserHidden = false;
      this.hiddenEmitter.emit();
    } );
  }

  loadNotifications() {
    this.sidebarService.getNotifications()
      .subscribe(
        ( notifications: any ) => {
          this.conversationNotifications = notifications.conversations;
          this.friendshipNotifications = notifications.friendships;

          if ( !this.isEmpty() ) {
            this.favicons.activate( 'active' );
          }

          this.conversationEmitter.emit();
          this.friendshipEmitter.emit();
        }
      );
  }

  getConversationStatus( id: string ) {
    if ( this.conversationNotifications.indexOf( id ) !== -1 ) {
      return true;
    }

    return false;
  }

  getFriendshipStatus( id: string ) {
    if ( this.friendshipNotifications.indexOf( id ) !== -1 ) {
      return true;
    }

    return false;
  }

  removeConversation( id: string ) {
    this.sidebarService.removeConversationNotification( id )
      .subscribe(
        () => {
          this.conversationNotifications.splice( this.getConversationIndex( id ), 1 );

          if ( this.isEmpty() ) {
            this.favicons.activate( 'inactive' );
          }

          this.conversationEmitter.emit();
        }
      );
  }

  removeFriendship( id: string ) {
    this.sidebarService.removeFriendshipNotification( id )
      .subscribe(
        () => {
          this.friendshipNotifications.splice( this.getFriendshipIndex( id ), 1 );

          if ( this.isEmpty() ) {
            this.favicons.activate( 'inactive' );
          }

          this.friendshipEmitter.emit();
        }
      );
  }

  notifySound() {
    this.soundEmitter.emit();
  }

  getBrowserHidden() {
    return this.browserHidden;
  }

  private getConversationIndex( id: string ) {
    for ( let i = 0; i < this.conversationNotifications.length; i++ ) {
      if ( this.conversationNotifications[i] === id ) {
        return i;
      }
    }
  }

  private getFriendshipIndex( id: string ) {
    for ( let i = 0; i < this.friendshipNotifications.length; i++ ) {
      if ( this.friendshipNotifications[i] === id ) {
        return i;
      }
    }
  }

  private isEmpty() {
    return this.conversationNotifications.length === 0 && this.friendshipNotifications.length === 0;
  }

  private handleVisibilityChange() {
    this.browserHidden = this.document[this.hiddenType];
    this.hiddenEmitter.emit();
  }
}
