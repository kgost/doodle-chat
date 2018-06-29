import { Injectable } from '@angular/core';
import { CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router } from '@angular/router';

import { AuthService } from './auth.service';
import { AlertService } from '../alert.service';

@Injectable()
export class AuthGuard {

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) { }

  canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): boolean {
    if ( this.authService.isSignedin() && this.authService.keysSet() ) {
      return true;
    } else if ( this.authService.isSignedin() ) {
      this.alertService.alertSubject.next( { message: 'For Security Reasons, You Must Sign Back In', mode: 'danger' }   );
      this.authService.signout( true );
      return false;
    }
    this.router.navigate( ['/'] );
    return false;
  }
}
