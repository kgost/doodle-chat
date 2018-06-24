import { Component, OnInit } from '@angular/core';

import { FriendService } from './friend.service';
import { SocketIoService } from '../../../shared/socket-io.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {

  constructor(
    private friendService: FriendService,
    private socketIoService: SocketIoService
  ) { }

  ngOnInit() {
    this.friendService.loadFriendships();
    this.socketIoService.friendshipChange
      .subscribe( () => {
        this.friendService.loadFriendships();
      } );
  }

}
