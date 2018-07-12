import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { SocketIoService } from '../../../shared/socket-io.service';
import { AuthService } from '../../../auth/auth.service';
import { TypingService } from '../typing.service';

@Component({
  selector: 'app-typing',
  templateUrl: './typing.component.html',
  styleUrls: ['./typing.component.css']
})
export class TypingComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  usernames = {};
  usernamesArray = [];

  constructor(
    private socketIoService: SocketIoService,
    private authService: AuthService,
    private typingService: TypingService,
  ) { }

  ngOnInit() {
    this.subscriptions.push( this.socketIoService.userTyping
      .subscribe(
        ( username: string ) => {
          if ( username !== this.authService.getCurrentUser().username ) {
            if ( this.usernames[username] ) {
              clearTimeout( this.usernames[username] );
            }

            this.usernames[username] = setTimeout( () => {
              delete this.usernames[username];
              this.usernamesArray = Object.keys( this.usernames );
            }, 2500 );
            this.usernamesArray = Object.keys( this.usernames );
          }
        }
      ) );
    this.subscriptions.push( this.typingService.stopTyping
      .subscribe(
        ( username: string ) => {
          if ( this.usernames[username] ) {
            clearTimeout( this.usernames[username] );
            delete this.usernames[username];
            this.usernamesArray = Object.keys( this.usernames );
          }
        }
      ) );
  }

  ngOnDestroy() {
    this.subscriptions.forEach( ( sub ) => {
      sub.unsubscribe();
    } );
  }
}
