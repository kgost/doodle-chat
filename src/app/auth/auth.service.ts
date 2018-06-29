import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import * as forge from 'node-forge';

import { User } from './user.model';
import { SocketIoService } from '../shared/socket-io.service';
import { AlertService } from '../alert.service';

@Injectable()
export class AuthService {
  baseUrl = '/auth/';
  currentUser = new User(
    localStorage.getItem( 'username' ),
    localStorage.getItem( 'userId' ),
  );
  private privateKey: any;
  private publicKey: any;

  constructor(
    private http: Http,
    private router: Router,
    private socketIoService: SocketIoService,
    private alertService: AlertService,
  ) {
    forge.options.usePureJavaScript = true;
  }

  signup( username: string, password: string ) {
    this.keyGen( password ).then(
      () => {
        this.http.post( this.baseUrl + 'signup', { username: username, password: password, publicKey: this.getPublicKeyString() } )
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
              this.alertService.alertSubject.next( { message: 'Successfully Signed Up!', mode: 'success' } );
              this.router.navigate(['/messenger']);
            },
            ( response: Response ) => {
              const error = response.json();
              console.log( error );
            }
          );
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
          this.keyGen( password ).then(
            () => {
              this.router.navigate(['/messenger']);
            }
          );
        },
        ( response: Response ) => {
          const error = response.json();
          this.alertService.alertSubject.next( { message: error.userMessage, mode: 'danger' } );
        }
      );
  }

  usernameTaken( username: string ) {
    return this.http.get( this.baseUrl + 'usernameTaken/' + encodeURIComponent( username ) )
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

  signout( signin = false ) {
    this.socketIoService.signout( this.currentUser._id );
    delete this.currentUser;
    localStorage.removeItem( 'token' );
    if ( signin ) {
      this.router.navigate( ['/signin'] );
    } else {
      this.router.navigate( ['/'] );
    }
  }

  getPublicKeyString() {
    return forge.asn1.toDer( forge.pki.publicKeyToAsn1( this.publicKey ) ).data;
  }

  decryptAccessKey( key: string ) {
    return this.privateKey.decrypt( key );
  }

  generateAccessKeys( users: User[] ) {
    const accessKeys = {};
    const key = 'feff';
    console.log( key );

    for ( let i = 0; i < users.length; i++ ) {
      const publicKey = this.getPublicKeyFromString( users[i].publicKey );
      accessKeys[users[i].username] = publicKey.encrypt( key );
      if ( users[i].username === this.currentUser.username ) {
        console.log( this.privateKey.decrypt( this.publicKey.encrypt( key ) ) );
        console.log( this.publicKey.encrypt( key ) );
      }
    }

    return accessKeys;
  }

  keysSet() {
    return this.privateKey && this.publicKey;
  }

  private keyGen( password: string ): Promise<void> {
    const prng = {
      str: password,
      getBytesSync: ( length ) => {
        const b = forge.util.createBuffer();

        while ( b.length() < length ) {
          b.putBytes( prng.str );
        }

        const result = b.getBytes( length );
        return b.getBytes( length );
      }
    };
    return new Promise<void>( ( resolve, reject ) => {
      const keypair = forge.pki.rsa.generateKeyPair( { bits: 2048, prng: prng } );
      this.privateKey = keypair.privateKey;
      this.publicKey = keypair.publicKey;
      resolve();
    } );
  }

  private getPublicKeyFromString( publicString: string ) {
    return forge.pki.publicKeyFromAsn1( forge.asn1.fromDer( publicString ) );
  }
}
