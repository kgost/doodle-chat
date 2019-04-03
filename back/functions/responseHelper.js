const actions = {
  handleResponse: ( result, res ) => {
    if ( result == undefined ) {
      result = {}
    }

    res.status( result.status || 200 ).json( result.body )
  },

  handleError: ( err, res ) => {
    console.log( err )

    if ( !err.status ) {
      return res.status( 500 ).json({ message: 'An error occured' })
    }

    res.status( err.status ).json({ message: err.message })
  },

  handleActions: ( fileActions ) => {
    const resultActions = {}

    for ( const action of Object.keys( fileActions ) ) {
      resultActions[action] = async ( req, res ) => {
        try {
          const result = await fileActions[action]( req )
          actions.handleResponse( result, res )
        } catch( e ) {
          actions.handleError( e, res )
        }
      }
    }

    return resultActions
  },

  handleMiddleware: ( fileActions ) => {
    const resultActions = {}

    for ( const action of Object.keys( fileActions ) ) {
      resultActions[action] = async ( req, res, next ) => {
        try {
          await fileActions[action]( req )
          next()
        } catch( e ) {
          actions.handleError( e, res )
        }
      }
    }

    return resultActions
  },
}

module.exports = actions
