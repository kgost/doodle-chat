import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth/auth.service';
import { SidebarService } from './messenger/sidebar/sidebar.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('container') container: ElementRef;
  @ViewChild('header') header: ElementRef;
  @ViewChild('body') body: ElementRef;
  bodyHeight: number;
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

    window.addEventListener( 'resize', () => {
      this.container.nativeElement.style.height = '100%';
      this.bodyHeight = this.container.nativeElement.offsetHeight - this.header.nativeElement.offsetHeight;
      this.body.nativeElement.style.height = this.bodyHeight;
    } );
  }

  ngAfterViewInit() {
    this.container.nativeElement.style.height = '100%';
    this.bodyHeight = this.container.nativeElement.offsetHeight - this.header.nativeElement.offsetHeight;
    this.body.nativeElement.style.height = this.bodyHeight;
  }
}
