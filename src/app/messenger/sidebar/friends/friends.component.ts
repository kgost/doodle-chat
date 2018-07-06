import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { FriendService } from './friend.service';
import { SocketIoService } from '../../../shared/socket-io.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];

  constructor(
    private friendService: FriendService,
    private socketIoService: SocketIoService
  ) { }

  ngOnInit() {
    this.friendService.loadFriendships();
    this.subscriptions.push( this.socketIoService.friendshipChange
      .subscribe( () => {
        this.friendService.loadFriendships();
      } ) );
    this.subscriptions.push( this.socketIoService.reconnectEmitter
      .subscribe( () => {
        this.friendService.loadFriendships( true );
      } ) );
  }

  ngOnDestroy() {
    this.subscriptions.forEach( ( sub ) => {
      sub.unsubscribe();
    } );

    this.friendService.reset();
  }
}
