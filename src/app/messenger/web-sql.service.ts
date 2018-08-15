import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebSqlService {
  private db: any;
  loaded = false;

  constructor() { }

  init() {
    if ( !this.loaded ) {
      this.db = ( window as any ).openDatabase( 'lalilulelo', '1.0', 'Database For Managing Encrypted Client Side Data', 30 * 1024 * 1024 );
      this.loaded = true;
    }

    this.db.transaction( ( tx ) => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS medias (messageId, media, expiration)');
    } );
  }

  getMedia( messageId: string ) {
    return new Promise<any>( ( resolve, reject ) => {
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
    this.db.transaction( ( tx ) => {
      tx.executeSql(`INSERT INTO medias VALUES('${ messageId }','${ media }',${ expiration })`, [], ( newTx ) => {
      }, ( newTx, err ) => {
        console.log( err );
      } );
    } );
  }

  removeMedia( messageId: string ) {
    this.db.transaction( ( tx ) => {
      tx.executeSql(`DELETE FROM medias WHERE messageId="${ messageId }"`);
    } );
  }

  getExpirations() {
    return new Promise<any>( ( resolve, reject ) => {
      this.db.transaction( ( tx ) => {
        tx.executeSql( 'SELECT medias.messageId, medias.expiration FROM medias', [], ( newTx, results ) => {
          return resolve( results.rows );
        }, () => {
          return resolve( [] );
        } );
      } );
    } );
  }

private ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

private str2ab(str) {
  const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  const bufView = new Uint16Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

private  mysql_real_escape_string (str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
        }
    });
}
}
