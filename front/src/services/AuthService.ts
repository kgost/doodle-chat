import Api from './Api';

import * as forge from 'node-forge';

export default class AuthService {
  public keyGen() {
    return forge.pki.rsa.generateKeyPair( { bits: 2048 } );
  }

  public generateConversationAccessKeys( participants: Array<{ userId: number, publicKey: string }>, decryptedKey: string = '' ) {
    const accessKeys = {};

    if ( decryptedKey === '' ) {
      decryptedKey = this.getRandomAesKey();
    }

    for ( const participant of participants ) {
      const publicKey = this.getPublicKeyFromString( participant.publicKey );
      accessKeys[participant.userId] = publicKey.encrypt( decryptedKey );
    }

    return accessKeys;
  }

  public generateFriendshipAccessKeys( userOneId: number, userOnePublicKey: string, userTwoId: number, userTwoPublicKey: string ) {
    const accessKeys = {};

    const decryptedKey = this.getRandomAesKey();

    accessKeys[userOneId] = this.getPublicKeyFromString( userOnePublicKey ).encrypt( decryptedKey );
    accessKeys[userTwoId] = this.getPublicKeyFromString( userTwoPublicKey ).encrypt( decryptedKey );

    return accessKeys;
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

  public getRandomAesKey() {
    return forge.random.getBytesSync( 16 ).toString();
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

  public getPrivateKeyFromString( privateKeyString: string ) {
    return forge.pki.privateKeyFromAsn1( forge.asn1.fromDer( privateKeyString ) );
  }

  public getPublicKeyFromString( publicKeyString: string ) {
    return forge.pki.publicKeyFromAsn1( forge.asn1.fromDer( publicKeyString ) );
  }
}
