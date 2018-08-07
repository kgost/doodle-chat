import { Component, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';

import { AuthService } from '../auth/auth.service';
import { AlertService } from '../alert.service';

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
    private alertService: AlertService,
    private swPush: SwPush,
  ) { }

  ngOnInit() {
    this.swPush.subscription.subscribe( ( pushSub ) => {
      if ( pushSub ) {
        this.toggle = true;
      }
    } );
  }

  onToggle() {
    this.toggle = !this.toggle;

    if ( this.toggle ) {
      this.onSubscribe();
    } else {
      this.unSubscribe();
    }
  }

  isEnabled() {
    return this.swPush.isEnabled;
  }

  onSubscribe() {
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
      .then( sub => this.authService.addPushSubscriber( sub ) )
      .catch( err => {
        console.error( 'could not subscribe' );
        console.error( err );
        this.alertService.alertSubject.next( { message: err.toString(), mode: 'danger' } );
        this.toggle = false;
      } );
  }

  unSubscribe() {
    this.swPush.unsubscribe()
      .then( () => {
        this.authService.removePushSubscriber();
      } )
      .catch( err => {
        console.error( 'could not unsubscribe' );
        console.error( err );
        this.alertService.alertSubject.next( { message: err.toString(), mode: 'danger' } );
        this.toggle = true;
      } );
  }
}
