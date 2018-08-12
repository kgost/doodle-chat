import { Injectable } from '@angular/core';
import { CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AuthService } from './auth.service';
import { AlertService } from '../alert.service';

@Injectable()
export class AuthGuard {

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) { }

  canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Observable<boolean>|boolean {
    if ( this.authService.isSignedin() && this.authService.keysSet() ) {
      return true;
    } else if ( this.authService.isSignedin() ) {
      return Observable.create( ( observer ) => {
        this.authService.storePrivateKey()
          .then( ( result ) => {
            if ( !result ) {
              this.authService.signout( true );
            }

            observer.next( result );
            observer.complete();
          } )
          .catch( ( err ) => {
            console.log( err );
            this.router.navigate( ['/signin'] );
          } );
      } );
    }
    this.alertService.alertSubject.next({ message: 'You Must Sign Back In.', mode: 'warning' });
    this.router.navigate( ['/signin'] );
    return false;
  }
}
