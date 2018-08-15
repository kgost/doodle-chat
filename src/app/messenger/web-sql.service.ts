import { Injectable } from '@angular/core';

import { AlertService } from '../alert.service';

@Injectable({
  providedIn: 'root'
})
export class WebSqlService {
  private db: any;
  loaded = false;
  supported = false;

  constructor(
    private alertService: AlertService
  ) { }

  init() {
    if ( !this.loaded ) {
      this.db = ( window as any ).openDatabase( 'lalilulelo', '1.0', 'Database For Managing Encrypted Client Side Data', 30 * 1024 * 1024 );
      this.loaded = true;
    }

    if ( !this.db ) {
      console.log( 'feff' );
      this.browserAlert();
      return;
    } else {
      this.supported = true;
    }

    this.db.transaction( ( tx ) => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS medias (messageId, media, expiration)');
    } );
  }

  getMedia( messageId: string ) {
    return new Promise<any>( ( resolve, reject ) => {
      if ( !this.db ) {
        return resolve( null );
      }

      this.db.transaction( ( tx ) => {
        tx.executeSql( `SELECT medias.media FROM medias WHERE messageId="${ messageId }" LIMIT 1`, [], ( newTx, results ) => {
          if ( !results.rows.length ) {
            return resolve( null );
          }

          return resolve( results.rows.item(0).media );
        }, (  ) => {
          return resolve( null );
        } );
      } );
    } );
  }

  addMedia( messageId: string, media: string, expiration: number ) {
    if ( !this.db ) {
      return;
    }

    this.db.transaction( ( tx ) => {
      tx.executeSql(`INSERT INTO medias VALUES('${ messageId }','${ media }',${ expiration })`, [], ( newTx ) => {
      }, ( newTx, err ) => {
        console.log( err );
      } );
    } );
  }

  removeMedia( messageId: string ) {
    if ( !this.db ) {
      this.browserAlert();
      return;
    }

    this.db.transaction( ( tx ) => {
      tx.executeSql(`DELETE FROM medias WHERE messageId="${ messageId }"`);
    } );
  }

  getExpirations() {
    return new Promise<any>( ( resolve, reject ) => {
      if ( !this.db ) {
        return resolve( null );
      }

      this.db.transaction( ( tx ) => {
        tx.executeSql( 'SELECT medias.messageId, medias.expiration FROM medias', [], ( newTx, results ) => {
          return resolve( results.rows );
        }, () => {
          return resolve( [] );
        } );
      } );
    } );
  }

  private browserAlert() {
    this.alertService.alertSubject.next({ mode: 'danger', message: 'Your Browser Does Not Support WebSQL, Media Will Not Work.' });
  }
}
