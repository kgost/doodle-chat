import { Component, OnInit, OnDestroy, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { Friendship } from '../friendship.model';

import { SidebarService } from '../../sidebar.service';
import { FriendService } from '../friend.service';
import { MessageService } from '../../../messages/message.service';
import { ConversationService } from '../../conversations/conversation.service';
import { AuthService } from '../../../../auth/auth.service';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-friend-item',
  templateUrl: './friend-item.component.html',
  styleUrls: ['./friend-item.component.css']
})
export class FriendItemComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('container') container: ElementRef;
  @Input() friendship: Friendship;
  subscriptions: Subscription[] = [];
  notification = false;
  active = false;

  constructor(
    private authService: AuthService,
    private friendService: FriendService,
    private conversationService: ConversationService,
    private messageService: MessageService,
    private sidebarService: SidebarService,
    private notificationService: NotificationService,
    private router: Router,
  ) { }

  ngOnInit() {
    if ( this.friendship.forceSelect || this.sidebarService.activeFriendshipId === this.friendship._id ) {
      this.active = true;
    }

    this.reInit();

    this.subscriptions.push( this.friendService.changeEmitter
      .subscribe(
        () => this.reInit()
      ) );

    this.subscriptions.push( this.sidebarService.deactivate
      .subscribe(
        () => {
          this.active = false;
        }
      ) );

    this.subscriptions.push( this.notificationService.hiddenEmitter
      .subscribe(
        () => {
          if ( this.friendship.forceSelect ) {
            this.onSelectFriendship( true );
          }

          this.reInit();
        }
      ) );
  }

  getFriendName() {
    for ( let i = 0; i < this.friendship.users.length; i++ ) {
      if ( this.friendship.users[i].id._id !== this.authService.getCurrentUser()._id ) {
        return this.friendship.users[i].id.username;
      }
    }
  }

  isRequest() {
    for ( let i = 0; i < this.friendship.users.length; i++ ) {
      if ( this.friendship.users[i].id._id === this.authService.getCurrentUser()._id && !this.friendship.users[i].accepted ) {
        return true;
      }
    }

    return false;
  }

  isPending() {
    for ( let i = 0; i < this.friendship.users.length; i++ ) {
      if ( this.friendship.users[i].id._id !== this.authService.getCurrentUser()._id && !this.friendship.users[i].accepted ) {
        return true;
      }
    }

    return false;
  }

  onAccept( e ) {
    e.stopPropagation();
    this.friendService.updateFriendship( this.friendship._id, this.friendship );
  }

  onRemove( e ) {
    e.stopPropagation();
    this.friendService.removeFriendship( this.friendship._id );
  }

  onSelectFriendship( force = false ) {
    if ( !this.isPending() && !this.isRequest() ) {
      if ( this.notification ) {
        this.friendService.removeNotification( this.friendship._id );
        this.notification = false;
      }

      this.conversationService.reset();
      this.messageService.reset( true );
      this.sidebarService.activeFriendshipId = this.friendship._id;
      delete this.sidebarService.activeConversationId;

      this.sidebarService.deactivate.emit();
      this.active = true;

      if ( !force ) {
        this.router.navigate( ['/messenger/friends', this.friendship._id] );
      } else {
        this.friendService.loadMessages( this.friendship._id );
        this.friendService.stopForce( this.friendship._id );
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach( ( sub ) => {
      sub.unsubscribe();
    } );
  }

  ngAfterViewInit() {
    if ( this.friendship.forceSelect ) {
      this.onSelectFriendship( true );
    }

    if ( this.active ) {
      this.sidebarService.scrollSubject
        .next( { height: this.container.nativeElement.offsetTop + this.container.nativeElement.offsetHeight, conversations: false } );
    }
  }

  private reInit() {
    if ( this.friendService.checkNotification( this.friendship._id ) &&
      ( !this.friendService.getCurrentFriendship() ||
        this.friendService.getCurrentFriendship()._id !== this.friendship._id ||
        this.notificationService.getBrowserHidden() ) ) {
      this.notification = true;

      if ( !this.active || this.notificationService.getBrowserHidden() ) {
        this.friendService.notifySound();
      }
    } else if ( this.friendService.checkNotification( this.friendship._id ) &&
      this.friendService.getCurrentFriendship() &&
      this.friendService.getCurrentFriendship()._id === this.friendship._id ) {
      this.notification = false;
      this.friendService.removeNotification( this.friendship._id );
    }
  }
}
