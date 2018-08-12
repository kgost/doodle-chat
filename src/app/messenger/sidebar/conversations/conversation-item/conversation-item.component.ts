import { Component, OnInit, OnDestroy, Input, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { SidebarService } from '../../sidebar.service';
import { ConversationService } from '../conversation.service';
import { FriendService } from '../../friends/friend.service';
import { Conversation } from '../conversation.model';
import { AuthService } from '../../../../auth/auth.service';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-conversation-item',
  templateUrl: './conversation-item.component.html',
  styleUrls: ['./conversation-item.component.css']
})
export class ConversationItemComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('container') container: ElementRef;
  @Input() conversation: Conversation;
  subscriptions: Subscription[] = [];
  notification = false;
  active = false;

  constructor(
    private authService: AuthService,
    private conversationService: ConversationService,
    private friendService: FriendService,
    private sidebarService: SidebarService,
    private notificationService: NotificationService,
    private router: Router,
  ) { }

  ngOnInit() {
    if ( this.conversation.forceSelect || this.sidebarService.activeConversationId === this.conversation._id ) {
      this.active = true;
    }

    this.reInit();

    this.subscriptions.push( this.conversationService.changeEmitter
      .subscribe(
        () => {
          if ( this.conversation.forceSelect ) {
            this.onSelectConversation( true );
          }

          this.reInit();
        }
      ) );

    this.subscriptions.push( this.sidebarService.deactivate
      .subscribe(
        () => {
          this.active = false;
        }
      ) );

    this.subscriptions.push( this.notificationService.hiddenEmitter
      .subscribe(
        () => this.reInit()
      ) );
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  onEdit( e ) {
    e.stopPropagation();
    this.conversationService.editChange.next( this.conversation );
  }

  onLeave( e ) {
    e.stopPropagation();
    this.conversationService.leaveConversation( this.conversation._id );
  }

  onSelectConversation( force = false ) {
    if ( this.notification ) {
      this.conversationService.removeNotification( this.conversation._id );
      this.notification = false;
    }

    this.friendService.reset();
    this.sidebarService.activeConversationId = this.conversation._id;
    delete this.sidebarService.activeFriendshipId;

    this.sidebarService.deactivate.emit();
    this.active = true;

    if ( !force ) {
      this.router.navigate( ['/messenger/conversations', this.conversation._id] );
    } else {
      this.conversationService.loadMessages( this.conversation._id );
      this.conversationService.stopForce( this.conversation._id );
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach( ( sub ) => {
      sub.unsubscribe();
    } );
  }

  ngAfterViewInit() {
    if ( this.conversation.forceSelect ) {
      this.onSelectConversation( true );
    }

    if ( this.active ) {
      this.sidebarService.scrollSubject
        .next( { height: this.container.nativeElement.offsetTop + this.container.nativeElement.offsetHeight, conversations: true } );
    }
  }

  private reInit() {
    if ( this.conversationService.checkNotification( this.conversation._id ) &&
      ( !this.conversationService.getCurrentConversation() ||
        this.conversationService.getCurrentConversation()._id !== this.conversation._id ||
        this.notificationService.getBrowserHidden() ) ) {
      this.notification = true;

      if ( !this.active || this.notificationService.getBrowserHidden() ) {
        this.friendService.notifySound();
      }
    } else if ( this.conversationService.checkNotification( this.conversation._id ) &&
      this.conversationService.getCurrentConversation() &&
      this.conversationService.getCurrentConversation()._id === this.conversation._id ) {
      this.notification = false;
      this.conversationService.removeNotification( this.conversation._id );
    }
  }
}
