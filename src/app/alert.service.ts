import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  alertSubject = new Subject<{ message: string, mode: string }>();

  constructor(
  ) { }

  handleError( error ) {
    console.log( error );
    switch ( error.status ) {
      case 400:
      case 403:
      case 404:
      case 500:
        this.alertSubject.next({ message: error.json().userMessage, mode: 'warning' });
        break;
      case 401:
        this.alertSubject.next({ message: error.json().userMessage, mode: 'danger' });
        break;
    }
  }
}
