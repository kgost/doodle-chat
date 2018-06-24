import { Component, OnInit, Input } from '@angular/core';

import { FriendService } from '../friend.service';
import { Friendship } from '../friendship.model';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-friend-item',
  templateUrl: './friend-item.component.html',
  styleUrls: ['./friend-item.component.css']
})
export class FriendItemComponent implements OnInit {
  @Input() friendship: Friendship;

  constructor(
    private authService: AuthService,
    private friendService: FriendService
  ) { }

  ngOnInit() {
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

  onAccept() {
    this.friendService.updateFriendship( this.friendship._id, this.friendship );
  }

  onRemove() {
    this.friendService.removeFriendship( this.friendship._id );
  }

  onSelectFriendship() {
    if ( !this.isPending() && !this.isRequest() ) {
      this.friendService.loadMessages( this.friendship._id );
    }
  }
}
