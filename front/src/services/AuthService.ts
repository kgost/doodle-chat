import Api from './Api';

import * as forge from 'node-forge';

export default class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'api/auth';
  }

  public signin( body: any ) {
    return new Promise( ( resolve, reject ) => {
      Api().post( `${ this.baseUrl }/signin`, body )
        .then( ( res ) => {
          resolve( res );
        } )
        .catch( ( err ) => {
          reject( err );
        } );
    } );
  }

  public signup( body: any ) {
    return new Promise( ( resolve, reject ) => {
      Api().post( `${ this.baseUrl }/signup`, body )
        .then( ( res ) => {
          resolve( res );
        } )
        .catch( ( err ) => {
          reject( err );
        } );
    } );
  }

  public usernameTaken( username: any ) {
    return new Promise( ( resolve, reject ) => {
      Api().get( `${ this.baseUrl }/usernameTaken/${ encodeURIComponent( username ) }` )
        .then( ( res ) => {
          resolve( res );
        } )
        .catch( ( err ) => {
          reject( err );
        } );
    } );
  }

  public keyGen() {
    return new Promise( ( resolve, reject ) => {
      const keyPair = forge.pki.rsa.generateKeyPair( { bits: 2048 } );
      resolve({ publicKey: keyPair.publicKey, privateKey: keyPair.privateKey });
    } );
  }
}
