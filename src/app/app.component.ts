import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth/auth.service';
import { SidebarService } from './messenger/sidebar/sidebar.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService,
    private router: Router,
  ) {}

  ngOnInit() {
    navigator.serviceWorker.addEventListener( 'message', ( event ) => {
      if ( event.data.type !== 'PUSH' ) {
        this.sidebarService.initialLoad = true;
        this.router.navigate(['/messenger']);
        this.router.navigate([event.data]);
      }
    } );
  }
}
