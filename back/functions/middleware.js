const
  jwt            = require( 'jsonwebtoken' ),
  db             = require( '../models' ),
  Conversation   = db.Conversation,
  Participant    = db.Participant,
  responseHelper = require( './responseHelper' )

const actions = {

  // Middleware

  /**
  * Should determine whether or not the user is logged in and respond with an error if they are not,
  * return next if they are
  * @param  {Object}   req  request object from user to server
  * @param  {Object}   res  response object to user from server
  * @param  {Function} next next function in express function list
  * @return {Object}        Returns res with an error code 401 or next if the user is logged in
  */
  authenticate: async ( req ) => {
    // if no token was sent under query or the token was null then respond with the error
    if (!req.headers.authorization || req.headers.authorization == 'null') {
      throw { status: 401, message: 'You Must Login.' }
    }

    let status
    let message

    // decode the token using the jwt library
    jwt.verify( req.headers.authorization, process.env.JWTKEY, ( err, decoded ) => {
      if ( err ) {
        if ( err.name === 'TokenExpiredError' ) {
          message = 'Session Expired, Please Login.'
          status = 401
        } else if ( err.message === 'invalid signature' ) {
          message = 'Invalid Login.'
          status = 401
        } else {
          message = 'Authentication Error Has Occured.'
          status = 500
        }

        throw { status: status, message: message }
      }

      req.user = decoded.user
    } )
  },

  validConversation: async ( req ) => {
    if ( !req.body.participants || !req.body.conversation ) {
      throw { status: 400, message: 'missing conversation and participants' }
    }

    if ( req.body.participants.length < 2 ) {
      throw { status: 400, message: 'conversation must have more than one participant' }
    }

    let found = false

    for ( let i = 0; i < req.body.participants.length; i++ ) {
      const participant = req.body.participants[i]

      if ( participant.userId == req.user.id ) {
        found = true
      }

      for ( let j = 1 + i; j < req.body.participants; j++ ) {
        const p = req.body.participants[j]

        if ( participant.userId == p.userId ) {
          throw { status: 400, message: 'duplicate participants' }
        }
      }
    }

    if ( !found ) {
      throw { status: 400, message: 'you must be in the conversation' }
    }
  },

  /**
  * Check if the user is in the conversation being accessed, return error if they are not
  * @param  {String}   req.params.conversationId  id of the conversation being accessed
  * @param  {Object}   req                        request object from user to server
  * @param  {Object}   res                        response object to user from server
  * @param  {Function} next                       next function in express function list
  * @return {Object}                              Returns res with an error code 401 or next if the user is in the conversation
  */
  inConversation: async ( req ) => {
    const count = await Participant.count({
      where: { userId: req.user.id, conversationId: req.params.id }
    })

    if ( !count ) {
      throw { status: 400, message: 'you must be in the conversation' }
    }
  },

  ownsConversation: async ( req ) => {
    const count = await Conversation.count({
      where: { id: req.params.id, userId: req.user.id }
    })

    if ( !count ) {
      throw { status: 400, message: 'you must own the conversation' }
    }
  },

  /**
  * Check if the user is in the conversation being accessed, return error if they are not
  * @param  {String}   req.params.friendshipId    id of the friendship being accessed
  * @param  {Object}   req                        request object from user to server
  * @param  {Object}   res                        response object to user from server
  * @param  {Function} next                       next function in express function list
  * @return {Object}                              Returns res with an error code 401 or next if the user is in the conversation
  */
  // inFriendship: ( req, res, next ) => {
    // // if no id was sent under params or the id was null then respond with the error
    // if ( !req.params.friendshipId || req.params.friendshipId == 'null' ) {
      // return responseHelper.handleError( { status: 400, userMessage: 'Invalid Friendship.' }, res )
    // }

    // // find the conversation with the provided id
    // Friendship.findById( req.params.friendshipId, ( err, friendship ) => {
      // // if no conversation was found respond with the invalid resource error
      // if ( !friendship || !friendship._id ) {
        // return responseHelper.handleError( { status: 404, userMessage: 'Friendship Not Found.' }, res )
      // }

      // // if the user is not in the participants list, respond with a 401 error
      // if ( friendship.users[0].id != req.user._id && friendship.users[1].id != req.user._id ) {
        // return responseHelper.handleError( { status: 403, userMessage: 'You Are Not In This Friendship.' }, res )
      // }

      // return next()
    // } )
  // },

  // validSentFriendship: ( req, res, next ) => {
    // if ( !req.body || !req.body.users || !req.body.users[0] || !req.body.users[1] ||
         // ( req.body.users[0].id.username != req.user.username && req.body.users[1].id.username != req.user.username ) ) {
      // return responseHelper.handleError( { status: 400, userMessage: 'Invalid Friendship Sent.' }, res )
    // }

    // if ( req.body.users[0].id.username === req.body.users[1].id.username ) {
      // return responseHelper.handleError( { status: 400, userMessage: 'You Cannot Be Friends With Yourself, That\'s Just Sad' }, res )
    // }

    // User.find( { username: { '$in': [req.body.users[0].id.username, req.body.users[1].id.username] } }, '_id', ( err, users ) => {
      // if ( !users || users.length < 2 ) {
        // return responseHelper.handleError( { status: 400, userMessage: 'Invalid Friendship Sent.' }, res )
      // }

      // const ids = users.map( ( user ) => {
        // return user._id
      // } )

      // Friendship.find( { 'users.id': ids }, 'users', ( err, friendships ) => {
        // for ( let i = 0; i < friendships.length; i++ ) {
          // const friendshipIds = friendships[i].users.map( ( user ) => {
            // return user.id.toString()
          // } )

          // if ( friendshipIds.indexOf( ids[0].toString() ) !== -1 &&
            // friendshipIds.indexOf( ids[1].toString() ) !== -1 ) {
            // return responseHelper.handleError( { status: 400, userMessage: 'Friendship Already Exists' }, res )
          // }
        // }

        // return next()
      // } )
    // } )
  // },

  // isMessageOwner: (req, res, next) => {
    // if ( !req.params.id || req.params.id == 'null' ) {
      // return responseHelper.handleError( { status: 400, userMessage: 'Invalid Message.' }, res )
    // }

    // Message.findById( req.params.id, ( err, message) => {
      // if ( !message ) {
        // return responseHelper.handleError( { status: 404, userMessage: 'Message Not Found.' }, res )
      // }

      // if ( message.user != req.user._id ) {
        // return responseHelper.handleError( { status: 403, userMessage: 'You Are Not The Owner Of This Message.' }, res )
      // }
      // return next()
    // })
  // }
}

module.exports = responseHelper.handleMiddleware( actions )
