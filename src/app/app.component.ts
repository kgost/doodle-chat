import { Component, OnInit } from '@angular/core';

import { SocketIoService } from './shared/socket-io.service';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  constructor(
  ) {}

  ngOnInit() {
  }
}
