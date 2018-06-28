import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AlertService } from '../alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  message: string;
  danger = false;
  warning = false;
  success = false;

  constructor(
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.subscriptions.push( this.alertService.alertSubject
      .subscribe(
        ( data: { message: string, mode: string } ) => {
          this.message = data.message;
          this.danger = data.mode === 'danger';
          this.warning = data.mode === 'warning';
          this.success = data.mode === 'success';
        }
      ) );
  }

  onClose() {
    delete this.message;
  }

  ngOnDestroy() {
    this.subscriptions.forEach( ( sub ) => {
      sub.unsubscribe();
    } );
  }
}
