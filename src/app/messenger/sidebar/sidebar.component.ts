import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { SidebarService } from './sidebar.service';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @ViewChild('container') container: ElementRef;
  @ViewChild('conversations') conversations: ElementRef;
  @ViewChild('friends') friends: ElementRef;
  subscriptions: Subscription[] = [];

  constructor(
    private sidebarService: SidebarService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.subscriptions.push( this.sidebarService.scrollSubject
      .subscribe(
        ( obj: { height: number, conversations: boolean } ) => {
          const parentOffset = ( obj.conversations ) ?
            this.conversations.nativeElement.offsetTop :
            this.friends.nativeElement.offsetTop;

          if ( obj.height + parentOffset > this.container.nativeElement.scrollTop + this.container.nativeElement.offsetHeight ) {
            this.scrollBottom( obj.height + parentOffset  );
          }
        }
      ) );

    this.notificationService.loadNotifications();
  }

  ngOnDestroy() {
    this.subscriptions.forEach( ( sub ) => {
      sub.unsubscribe();
    } );
  }

  private scrollBottom( height: number = this.container.nativeElement.scrollHeight ) {
    try {
      this.container.nativeElement.scrollTop = height;
    } catch (err) { }
  }
}
