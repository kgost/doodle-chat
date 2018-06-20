import { Injectable, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';

import { User } from './user.model';

@Injectable()
export class AuthService implements OnInit {
  baseUrl = '/auth/';
  currentUser = new User(
    localStorage.getItem( 'username' ),
    localStorage.getItem( 'userId' ),
  );

  constructor(
    private http: Http,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUser = new User(
      localStorage.getItem( 'username' ),
      localStorage.getItem( 'userId' ),
    );
    console.log( this.currentUser );
  }

  signup( username: string, password: string ) {
    this.http.post( this.baseUrl + 'signup', { username: username, password: password } )
      .subscribe(
        ( response: Response ) => {
          const data = response.json();
          localStorage.setItem( 'token', data.token );
          localStorage.setItem( 'userId', data.userId );
          localStorage.setItem( 'username', username );
          this.router.navigate(['/messenger']);
        },
        ( response: Response ) => {
          const error = response.json();
          console.log( error );
        }
      );
  }

  signin( username: string, password: string ) {
    this.http.post( this.baseUrl + 'signin', { username: username, password: password } )
      .subscribe(
        ( response: Response ) => {
          const data = response.json();
          localStorage.setItem( 'token', data.token );
          localStorage.setItem( 'userId', data.userId );
          localStorage.setItem( 'username', username );
          this.router.navigate(['/messenger']);
        },
        ( response: Response ) => {
          const error = response.json();
          console.log( error );
        }
      );
  }

  getToken() {
    return localStorage.getItem( 'token' );
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isSignedin() {
    return localStorage.getItem( 'token' ) && localStorage.getItem( 'token' ).length > 0;
  }

  signout() {
    delete this.currentUser;
    localStorage.removeItem( 'token' );
    this.router.navigate( ['/'] );
  }
}
