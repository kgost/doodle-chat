import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-notification-sound',
  templateUrl: './notification-sound.component.html',
  styleUrls: ['./notification-sound.component.css']
})
export class NotificationSoundComponent implements OnInit, OnDestroy {
  @ViewChild('audio') audioRef: ElementRef;
  subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.subscriptions.push( this.notificationService.soundEmitter
      .subscribe(
        () => {
          //this.playAudio();
        }
      ) );
  }

  playAudio() {
    this.audioRef.nativeElement.play();
  }

  ngOnDestroy() {
    this.subscriptions.forEach( ( sub ) => {
      sub.unsubscribe();
    } );
  }
}
