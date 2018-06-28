import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  alertSubject = new Subject<{ message: string, mode: string }>();

  constructor() { }
}
