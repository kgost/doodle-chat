export default ( serviceFunction: any, commits: string[][] = [[]] ) => {
  return ( { commit, state }, body = null ) => {
    return new Promise( ( resolve, reject ) => {
      serviceFunction( body )
        .then( ( res: any ) => {
          for ( const c of commits ) {
            if ( c.length > 1 ) {
              commit( c[0], res.data[c[1]] );
            } else if ( c.length ) {
              commit( c[0], res.data );
            }
          }

          resolve( res );
        } )
        .catch( ( err ) => {
          reject( err );
        } );
    } );
  };
};
