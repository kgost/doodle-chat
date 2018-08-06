import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  showNav = false;

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  isSignedin() {
    return this.authService.isSignedin();
  }

  onSignout() {
    this.authService.signout();
    this.showNav = false;
  }

  toggleNav() {
    this.showNav = !this.showNav;
  }

  onNavigate() {
    this.showNav = false;
  }
}
