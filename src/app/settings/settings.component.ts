import { Component, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';

import { SidebarService } from '../messenger/sidebar/sidebar.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  VAPID_PUBLIC_KEY = 'BGkgfZpOxJfbbAp-dZcNhJxB-oFE9Tz2fROAqXDs211GqWcomgzxPYgQMBSX3ZY5PYSxJcnSf2diyj-jad6TAm0';
  toggle = false;

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService,
    private swPush: SwPush,
  ) { }

  ngOnInit() {
    console.log( this.authService.getCurrentUser() );
    if ( this.authService.getCurrentUser().pushSub ) {
      this.toggle = true;
    }
  }

  onToggle() {
    this.toggle = !this.toggle;
    this.authService.setPushSub( this.toggle );

    if ( this.toggle ) {
      this.onSubscribe();
    } else {
      this.unSubscribe();
    }
  }

  onSubscribe() {
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then( sub => this.sidebarService.addPushSubscriber( sub ) )
    .catch( err => console.error( 'could not subscribe' ) );
  }

  unSubscribe() {
    this.sidebarService.removePushSubscriber();
  }

}
