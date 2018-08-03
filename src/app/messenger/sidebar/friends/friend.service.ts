import { Injectable, EventEmitter } from '@angular/core';
import { Response } from '@angular/http';
import { Subject } from 'rxjs';

import { AuthService } from '../../../auth/auth.service';
import { AlertService } from '../../../alert.service';
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
  loadEmitter = new EventEmitter<void>();
  editChange = new Subject<Friendship>();
  friendships: Friendship[] = [];
  friendNames: string[];
  loaded = false;

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
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
    this.sidebarService.friendNamesSubject
      .subscribe(
        ( friendNames: string[] ) => {
          this.friendNames = friendNames;
        }
      );
  }

  loadFriendships( reload = false ) {
    this.sidebarService.getFriendships()
      .subscribe(
        ( friendships: Friendship[] ) => {
          if ( reload ) {
            this.reloadSocket( friendships.slice() );
          } else {
            this.updateSocket( friendships.slice() );
          }
          this.loaded = true;
          this.friendships = friendships;
          this.changeEmitter.emit();
          this.loadEmitter.emit();
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

  forceSelect( id: string ) {
    this.socketIoService.joinFriendship( id );
    this.currentFriendship = this.getFriendship( id );
    if ( this.loaded ) {
      this.friendships[this.getFriendshipIndex( id )].forceSelect = true;
      this.changeEmitter.emit();
    } else {
      const sub = this.loadEmitter.subscribe( () => {
        this.friendships[this.getFriendshipIndex( id )].forceSelect = true;
        this.changeEmitter.emit();
        sub.unsubscribe();
      } );
    }
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

  getFriendNames() {
    return this.friendNames.slice();
  }

  addFriendship( friendship: Friendship ) {
    this.sidebarService.getPublicKeys( friendship.users )
      .subscribe(
        ( users: User[] ) => {
          const accessKeys = this.authService.generateAccessKeys( users );
          friendship.users = friendship.users.map(
            ( user ) => {
              return { id: user.id, accessKey: accessKeys[user.id.username], accepted: user.accepted };
            }
          );
          this.sidebarService.createFriendship( friendship )
            .subscribe(
              ( newFriendship: Friendship ) => {
                for ( let i = 0; i < newFriendship.users.length; i++ ) {
                  this.socketIoService.addFriendship( newFriendship.users[i].id._id );
                }
              },
              ( response: Response ) => {
                const error = response.json();
                this.alertService.alertSubject.next( { message: error.userMessage, mode: 'danger' } );
              }
            );
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

  reset() {
    delete this.currentFriendship;
  }

  notifySound() {
    this.notificationService.notifySound();
  }

  stopForce( id: string ) {
    delete this.friendships[this.getFriendshipIndex( id )].forceSelect;
    this.changeEmitter.emit();
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

  private reloadSocket( friendships: Friendship[] ) {
    for ( let i = 0; i < this.friendships.length; i++ ) {
      this.socketIoService.unListenFriendship( this.friendships[i]._id );
    }

    for ( let i = 0; i < friendships.length; i++ ) {
      this.socketIoService.listenFriendship( friendships[i]._id );
    }
  }
}
