import { Injectable, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { User } from './user.model';
import { SocketIoService } from '../shared/socket-io.service';

@Injectable()
export class AuthService implements OnInit {
  baseUrl = '/auth/';
  currentUser = new User(
    localStorage.getItem( 'username' ),
    localStorage.getItem( 'userId' ),
  );

  constructor(
    private http: Http,
    private router: Router,
    private socketIoService: SocketIoService
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
          this.currentUser = new User(
            localStorage.getItem( 'username' ),
            localStorage.getItem( 'userId' ),
          );
          this.socketIoService.signin( this.currentUser._id );
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
          this.currentUser = new User(
            localStorage.getItem( 'username' ),
            localStorage.getItem( 'userId' ),
          );
          this.socketIoService.signin( this.currentUser._id );
          this.router.navigate(['/messenger']);
        },
        ( response: Response ) => {
          const error = response.json();
          console.log( error );
        }
      );
  }

  usernameTaken( username: string ) {
    return this.http.get( this.baseUrl + 'usernameTaken/' + username )
      .pipe( map( ( response: Response )  => {
        return response.json().obj;
      } ) );
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
    this.socketIoService.signout( this.currentUser._id );
    delete this.currentUser;
    localStorage.removeItem( 'token' );
    this.router.navigate( ['/'] );
  }
}
