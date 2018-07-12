import { Component, OnInit, OnDestroy, Input } from '@angular/core';
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
export class ConversationItemComponent implements OnInit, OnDestroy {
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
  ) { }

  ngOnInit() {
    this.reInit();

    this.subscriptions.push( this.conversationService.changeEmitter
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
        () => this.reInit()
      ) );
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  onEdit() {
    this.conversationService.editChange.next( this.conversation );
  }

  onLeave() {
    this.conversationService.leaveConversation( this.conversation._id );
  }

  onSelectConversation() {
    if ( this.notification ) {
      this.conversationService.removeNotification( this.conversation._id );
      this.notification = false;
    }
    this.conversationService.loadMessages( this.conversation._id );
    this.sidebarService.deactivate.emit();
    this.active = true;
    this.friendService.reset();
  }

  ngOnDestroy() {
    this.subscriptions.forEach( ( sub ) => {
      sub.unsubscribe();
    } );
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
      this.conversationService.removeNotification( this.conversation._id );
    }
  }
}
