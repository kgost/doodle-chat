const actions = {
  handleResponse: ( result, res ) => {
    res.status( result.status ).json( result.data )
  },

  handleError: ( err, res ) => {
    if ( !err.status ) {
      console.log( err )
      return res.status( 500 ).json({ userMessage: 'An error occured' })
    }

    res.status( err.status ).json( err.error )
  },
}

module.exports = actions
