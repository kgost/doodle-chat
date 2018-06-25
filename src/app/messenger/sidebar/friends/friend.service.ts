import { Injectable, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';

import { AuthService } from '../../../auth/auth.service';
import { SocketIoService } from '../../../shared/socket-io.service';
import { SidebarService } from '../sidebar.service';
import { NotificationService } from '../notification.service';
import { MessageService } from '../../messages/message.service';
import { User } from '../../../auth/user.model';
import { Friendship } from './friendship.model';
import { Message } from '../../messages/message.model';

@Injectable()
export class FriendService {
  private currentFriendship: Friendship;
  changeEmitter = new EventEmitter<void>();
  editChange = new Subject<Friendship>();
  friendships: Friendship[] = [];

  constructor(
    private sidebarService: SidebarService,
    private messageService: MessageService,
    private socketIoService: SocketIoService,
    private notificationService: NotificationService,
  ) {
    this.notificationService.friendshipEmitter
      .subscribe(
        () => {
          this.changeEmitter.emit();
        }
      );
  }

  loadFriendships() {
    this.sidebarService.getFriendships()
      .subscribe(
        ( friendships: Friendship[] ) => {
          this.updateSocket( friendships.slice() );
          this.friendships = friendships;
          this.changeEmitter.emit();
        }
      );
  }

  loadMessages( id: string ) {
    this.sidebarService.getPrivateMessages( id )
      .subscribe(
        ( messages: Message[] ) => {
          this.socketIoService.joinFriendship( id );
          this.currentFriendship = this.getFriendship( id );
          this.messageService.loadPrivateMessages( this.getFriendship( id ), messages );
        }
      );
  }

  loadMessage( id: string ) {
    this.sidebarService.getPrivateMessage( this.currentFriendship._id, id )
      .subscribe(
        ( message: Message ) => {
          this.messageService.loadMessage( message );
        }
      );
  }

  changeMessage( id: string ) {
    this.sidebarService.getPrivateMessage( this.currentFriendship._id, id )
      .subscribe(
        ( message: Message ) => {
          this.messageService.changeMessage( id, message );
        }
      );
  }

  getCurrentFriendship() {
    return this.currentFriendship;
  }

  getFriendship( id: string ) {
    return this.friendships[this.getFriendshipIndex( id )];
  }

  getFriendships() {
    return this.friendships.slice();
  }

  addFriendship( friendship: Friendship ) {
    this.sidebarService.createFriendship( friendship )
      .subscribe(
        ( newFriendship: Friendship ) => {
          for ( let i = 0; i < newFriendship.users.length; i++ ) {
            this.socketIoService.addFriendship( newFriendship.users[i].id._id );
          }
        }
      );
  }

  updateFriendship( id: string, friendship: Friendship ) {
    this.sidebarService.updateFriendship( id, friendship )
      .subscribe(
        ( newFriendship: Friendship ) => {
          this.socketIoService.updateFriendship( newFriendship._id );
        }
      );
  }

  removeFriendship( id: string ) {
    this.sidebarService.removeFriendship( id )
      .subscribe(
        ( data: any ) => {
          this.socketIoService.updateFriendship( id );
        }
      );
  }

  checkNotification( id: string ) {
    return this.notificationService.getFriendshipStatus( id );
  }

  removeNotification( id: string ) {
    return this.notificationService.removeFriendship( id );
  }

  private getFriendshipIndex( id: string ) {
    for ( let i = 0; i < this.friendships.length; i++ ) {
      if ( this.friendships[i]._id === id ) {
        return i;
      }
    }
  }

  private updateSocket( friendships: Friendship[] ) {
    for ( let i = 0; i < this.friendships.length; i++ ) {
      let match = false;

      for ( let j = 0; j < friendships.length; j++ ) {
        if ( this.friendships[i]._id === friendships[j]._id ) {
          match = true;
          friendships.splice( j, 1 );
          break;
        }
      }

      if ( !match ) {
        if ( this.socketIoService.joinedFriendship === this.friendships[i]._id ) {
          this.socketIoService.leaveFriendship( this.friendships[i]._id );
          this.messageService.reset();
        }
        this.socketIoService.unListenFriendship( this.friendships[i]._id );
      }
    }

    for ( let i = 0; i < friendships.length; i++ ) {
      this.socketIoService.listenFriendship( friendships[i]._id );
    }
  }
}