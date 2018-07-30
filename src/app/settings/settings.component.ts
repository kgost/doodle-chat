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
