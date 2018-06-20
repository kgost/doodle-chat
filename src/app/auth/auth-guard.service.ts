import { Injectable } from '@angular/core';
import { CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard {

  constructor(private authService: AuthService,
              private router: Router) { }

  canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): boolean {
    const isSignedIn = this.authService.isSignedin();
    if ( isSignedIn ) {
      return true;
    }
    this.router.navigate( ['/'] );
    return false;
  }
}
