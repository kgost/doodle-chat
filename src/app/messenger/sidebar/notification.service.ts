import { Injectable, EventEmitter } from '@angular/core';

import { SocketIoService } from '../../shared/socket-io.service';
import { SidebarService } from './sidebar.service';

@Injectable()
export class NotificationService {
  conversationNotifications: string[] = [];
  friendshipNotifications: string[] = [];
  conversationEmitter = new EventEmitter<void>();
  friendshipEmitter = new EventEmitter<void>();

  constructor(
    private socketIoService: SocketIoService,
    private sidebarService: SidebarService,
  ) {
    this.socketIoService.notifyConversation
      .subscribe(
        ( conversationId: string ) => {
          this.conversationNotifications.push( conversationId );
          this.conversationEmitter.emit();
        }
      );
    this.socketIoService.notifyFriendship
      .subscribe(
        ( friendshipId: string ) => {
          this.friendshipNotifications.push( friendshipId );
          this.friendshipEmitter.emit();
        }
      );
  }

  loadNotifications() {
    this.sidebarService.getNotifications()
      .subscribe(
        ( notifications: any ) => {
          console.log( notifications );
          this.conversationNotifications = notifications.conversations;
          this.friendshipNotifications = notifications.friendships;
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
          this.conversationEmitter.emit();
        }
      );
  }

  removeFriendship( id: string ) {
    this.sidebarService.removeFriendshipNotification( id )
      .subscribe(
        () => {
          this.friendshipNotifications.splice( this.getFriendshipIndex( id ), 1 );
          this.friendshipEmitter.emit();
        }
      );
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
}
