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

  public encryptAes( input: string, key: string ) {
    const cipher = forge.cipher.createCipher( 'AES-ECB', key );
    cipher.start();
    cipher.update( forge.util.createBuffer( input ) );

    if ( cipher.finish() ) {
      return cipher.output.data;
    }

    return '';
  }

  public decryptAes( input: string, key: string ) {
    const decipher = forge.cipher.createDecipher( 'AES-ECB', key );
    decipher.start();
    decipher.update( forge.util.createBuffer( input ) );

    if ( decipher.finish() ) {
      return decipher.output.data;
    }

    return '';
  }

  public getAesKeyFromString( input: string ) {
    let key = '';

    while ( key.length < 16 ) {
      key += input;
    }

    return key.substr( 0, 16 );
  }

  public privateKeyToString( privateKey: any ) {
    return forge.asn1.toDer( forge.pki.privateKeyToAsn1( privateKey ) ).data;
  }

  public publicKeyToString( publicKey: any ) {
    return forge.asn1.toDer( forge.pki.publicKeyToAsn1( publicKey ) ).data;
  }

  public getPrivateKeyFromString( privateKeyString ) {
    return forge.pki.privateKeyFromAsn1( forge.asn1.fromDer( privateKeyString ) );
  }

  public getPublicKeyFromString( publicKeyString ) {
    return forge.pki.publicKeyFromAsn1( forge.asn1.fromDer( publicKeyString ) );
  }
}
