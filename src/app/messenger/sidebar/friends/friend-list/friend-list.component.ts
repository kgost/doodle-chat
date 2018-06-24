import { Component, OnInit } from '@angular/core';

import { Friendship } from '../friendship.model';
import { FriendService } from '../friend.service';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.css']
})
export class FriendListComponent implements OnInit {
  friendships: Friendship[];

  constructor(
    private friendService: FriendService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.friendships = this.friendService.getFriendships();
    this.friendService.changeEmitter
      .subscribe(
        () => this.friendships = this.friendService.getFriendships()
      );
  }

  onNew() {
    this.friendService.editChange.next( new Friendship( [] ) );
  }
}
