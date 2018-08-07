import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { SwPush } from '@angular/service-worker';
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
  private previousRoute = localStorage.getItem( `${ this.currentUser._id }:previousRoute` );

  constructor(
    private http: Http,
    private router: Router,
    private socketIoService: SocketIoService,
    private alertService: AlertService,
    private swPush: SwPush,
  ) {
  }

  signup( username: string, password: string ) {
    this.keyGen().then(
      () => {
        this.http.post( this.baseUrl + 'signup',
          { username: username, password: password, publicKey: this.getPublicKeyString(),
            privateKey: this.encryptAes( this.getPrivateKeyString(), this.getKeyFromString( password ) ) } )
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

              this.storePrivateKey();
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
          this.publicKey = this.getPublicKeyFromString( data.publicKey );
          this.privateKey = this.getPrivateKeyFromString( this.decryptAes( data.privateKey, this.getKeyFromString( password ) ) );
          this.router.navigate([this.previousRoute || '/messenger']);

          this.storePrivateKey();

          if ( this.swPush.isEnabled ) {
            this.swPush.subscription.subscribe( ( sub ) => {
              this.addPushSubscriber( sub );
            } ) ;
          }
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
    localStorage.removeItem( 'userId' );
    localStorage.removeItem( 'username' );
    if ( signin ) {
      this.router.navigate( ['/signin'] );
    } else {
      this.router.navigate( ['/'] );
    }
  }

  getPublicKeyString() {
    return forge.asn1.toDer( forge.pki.publicKeyToAsn1( this.publicKey ) ).data;
  }

  private getPrivateKeyString() {
    return forge.asn1.toDer( forge.pki.privateKeyToAsn1( this.privateKey ) ).data;
  }

  decryptAccessKey( key: string ) {
    return this.privateKey.decrypt( key );
  }

  generateAccessKeys( users: User[], encryptedKey: string = '' ) {
    const accessKeys = {};
    let key = '';
    if ( encryptedKey === '' ) {
      key = forge.random.getBytesSync( 16 );
    } else {
      key = this.decryptAccessKey( encryptedKey );
    }

    for ( let i = 0; i < users.length; i++ ) {
      const publicKey = this.getPublicKeyFromString( users[i].publicKey );
      accessKeys[users[i].username] = publicKey.encrypt( key );
    }

    return accessKeys;
  }

  keysSet() {
    return this.privateKey && this.publicKey;
  }

  encryptAes( input: string, key: string ) {
    const cipher = forge.cipher.createCipher( 'AES-ECB', key );
    cipher.start();
    cipher.update( forge.util.createBuffer( input ) );

    if ( cipher.finish() ) {
      return cipher.output.data;
    }

    return '';
  }

  decryptAes( input: string, key: string ) {
    const decipher = forge.cipher.createDecipher( 'AES-ECB', key );
    decipher.start();
    decipher.update( forge.util.createBuffer( input ) );

    if ( decipher.finish() ) {
      return decipher.output.data;
    }

    return '';
  }

  storePrivateKey(): Promise<boolean> {
    return new Promise<boolean>( ( resolve, reject ) => {
      this.http.get( this.baseUrl + 'consumeNonce?token=' + this.getToken() )
        .subscribe(
          ( response: Response ) => {
            const data = response.json();
            let encryptedPrivateKey;
            let decryptedPrivateKey;
            if ( this.keysSet() ) {
              encryptedPrivateKey = this.encryptAes( this.getPrivateKeyString(), data.nonce );
              localStorage.setItem( 'privateKey', encryptedPrivateKey );
              return resolve( true );
            } else if ( localStorage.getItem( 'privateKey' ) ) {
              decryptedPrivateKey = this.decryptAes( localStorage.getItem( 'privateKey' ), data.oldNonce );
              encryptedPrivateKey = this.encryptAes( decryptedPrivateKey, data.nonce );
              localStorage.setItem( 'privateKey', encryptedPrivateKey );
              this.privateKey = this.getPrivateKeyFromString( decryptedPrivateKey );
              return resolve( true );
            }

            return resolve( false );
          }
        );
    } ) ;
  }

  addPushSubscriber( sub: any ) {
    this.http.post( this.baseUrl + 'addSubscriber?token=' + this.getToken(), sub )
      .subscribe(
        ( response: Response ) => {
          console.log( response.json() );
        },
        ( error: Response ) => {
          console.log( error.json() );
        }
      );
  }

  removePushSubscriber() {
    this.http.delete( this.baseUrl + 'removeSubscriber?token=' + this.getToken() )
      .subscribe(
        ( response: Response ) => {
          console.log( response.json() );
        },
        ( error: Response ) => {
          console.log( error.json() );
        }
      );
  }

  getPreviousRoute() {
    return this.previousRoute;
  }

  setPreviousRoute( route: string ) {
    this.previousRoute = route;
    localStorage.setItem( `${ this.currentUser._id }:previousRoute`, route );
  }

  private keyGen(): Promise<void> {
    return new Promise<void>( ( resolve, reject ) => {
      const keypair = forge.pki.rsa.generateKeyPair( { bits: 2048 } );
      this.privateKey = keypair.privateKey;
      this.publicKey = keypair.publicKey;
      resolve();
    } );
  }

  private getPublicKeyFromString( publicString: string ) {
    return forge.pki.publicKeyFromAsn1( forge.asn1.fromDer( publicString ) );
  }

  private getPrivateKeyFromString( privateString: string ) {
    return forge.pki.privateKeyFromAsn1( forge.asn1.fromDer( privateString ) );
  }

  private getKeyFromString( input: string ) {
    let key = '';

    while ( key.length < 16 ) {
      key += input;
    }

    return key.substr( 0, 16 );
  }

  private encryptRsa( input: string ) {
    return this.publicKey.encrypt( input );
  }

  private decryptRsa( input: string ) {
    return this.privateKey.decrypt( input );
  }
}
