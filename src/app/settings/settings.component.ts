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
  VAPID_PUBLIC_KEY = 'BIvF-GchsDONxK_P9zHU23Iv7uT8Ng3Lz62zfpOkvf8leyqjHItqp7hDQXV3i6Dh-7PaznxNg-dxFOz7gg3GmaQ';
  toggle = false;

  constructor(
    private swPush: SwPush,
    private sidebarService: SidebarService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    if ( this.authService.getCurrentUser().pushSub ) {
      this.toggle = true;
    }
    console.log( this.toggle );
  }

  onNotificationToggle() {
    if ( this.authService.getCurrentUser().pushSub ) {
      this.disableNotifications();
      this.authService.removePushSub();
      this.toggle = false;
    } else {
      this.enableNotifications();
      this.authService.addPushSub();
      this.toggle = true;
    }
  }

  enableNotifications() {
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then( sub => this.sidebarService.addPushSubscriber( sub ) )
    .catch( err => console.error( 'could not subscribe' ) );
  }

  disableNotifications() {
    this.sidebarService.removePushSubscriber();
  }
}
