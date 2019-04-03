import Api from './Api';

export class Rest {
  protected basePath: string;

  constructor( basePath: string ) {
    this.basePath = basePath;
  }

  public create( body: any ) {
    return new Promise( ( resolve, reject ) => {
      Api().post( this.basePath, body )
        .then( ( res ) => {
          resolve( res.data );
        } )
        .catch( ( err ) => {
          reject( err );
        } );
    } );
  }

  public index() {
    return new Promise( ( resolve, reject ) => {
      Api().get( this.basePath )
        .then( ( res ) => {
          resolve( res.data );
        } )
        .catch( ( err ) => {
          reject( err );
        } );
    } );
  }

  public show( id: number ) {
    return new Promise( ( resolve, reject ) => {
      Api().get( `${ this.basePath }/${ id }` )
        .then( ( res ) => {
          resolve( res.data );
        } )
        .catch( ( err ) => {
          reject( err );
        } );
    } );
  }

  public update( id: number, body: any ) {
    return new Promise( ( resolve, reject ) => {
      Api().put( `${ this.basePath }/${ id }`, body )
        .then( ( res ) => {
          resolve( res.data );
        } )
        .catch( ( err ) => {
          reject( err );
        } );
    } );
  }

  public destroy( id: number ) {
    return new Promise( ( resolve, reject ) => {
      Api().delete( `${ this.basePath }/${ id }` )
        .then( ( res ) => {
          resolve( res.data );
        } )
        .catch( ( err ) => {
          reject( err );
        } );
    } );
  }
}
