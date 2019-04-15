export default ( service: any, func: string, commits: string[][] = [[]] ) => {
  return ( { commit, state }, body = null ) => {
    return new Promise( ( resolve, reject ) => {
      service[func]( body )
        .then( ( data: any ) => {
          for ( const c of commits ) {
            if ( c.length > 1 ) {
              commit( c[0], data.data[c[1]] );
            } else if ( c.length ) {
              commit( c[0], data );
            }
          }

          resolve( data );
        } )
        .catch( ( err ) => {
          reject( err );
        } );
    } );
  };
};
