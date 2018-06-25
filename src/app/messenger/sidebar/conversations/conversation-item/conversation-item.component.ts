import { Component, OnInit, Input } from '@angular/core';

import { SidebarService } from '../../sidebar.service';
import { ConversationService } from '../conversation.service';
import { Conversation } from '../conversation.model';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-conversation-item',
  templateUrl: './conversation-item.component.html',
  styleUrls: ['./conversation-item.component.css']
})
export class ConversationItemComponent implements OnInit {
  @Input() conversation: Conversation;
  notification = false;
  active = false;

  constructor(
    private authService: AuthService,
    private conversationService: ConversationService,
    private sidebarService: SidebarService,
  ) { }

  ngOnInit() {
    this.conversationService.changeEmitter
      .subscribe(
        () => {
          if ( this.conversationService.checkNotification( this.conversation._id ) &&
            ( !this.conversationService.getCurrentConversation() ||
              this.conversationService.getCurrentConversation()._id !== this.conversation._id ) ) {
            this.notification = true;
          } else if ( this.conversationService.checkNotification( this.conversation._id ) &&
            this.conversationService.getCurrentConversation() &&
            this.conversationService.getCurrentConversation()._id === this.conversation._id ) {
            this.conversationService.removeNotification( this.conversation._id );
          }
        }
      );
    this.sidebarService.deactivate
      .subscribe(
        () => {
          this.active = false;
        }
      );
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
  }
}
