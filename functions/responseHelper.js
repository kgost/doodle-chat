const actions = {
  handleResponse: ( result, res ) => {
    res.status( result.status ).json( result.data )
  },

  handleError: ( err, res ) => {
    console.log( err )

    if ( !err.status ) {
      return res.status( 500 ).json({ userMessage: 'An error occured' })
    }

    res.status( err.status ).json({ userMessage: err.userMessage })
  },
}

module.exports = actions
