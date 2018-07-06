import { Injectable, EventEmitter } from '@angular/core';

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

  constructor(
    private socketIoService: SocketIoService,
    private sidebarService: SidebarService,
    private favicons: Favicons,
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
}
