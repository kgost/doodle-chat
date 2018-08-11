const
  jwt      = require( 'jsonwebtoken' ),
  responseHelper = require( './responseHelper' ),
  User         = require( '../models/user' ),
  Conversation = require( '../models/conversation' ),
  Friendship = require( '../models/friendship' ),
  Message      = require( '../models/message' )

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
  authenticate: (req, res, next) => {
    // if no token was sent under query or the token was null then respond with the error
    if (!req.query.token || req.query.token == 'null') {
      return responseHelper.handleError( { status: 400, userMessage: 'You Must Login.' }, res )
    }

    // decode the token using the jwt library
    jwt.verify( req.query.token, process.env.JWTKEY, ( err, decoded ) => {
      if ( err ) {
        if ( err.name === 'TokenExpiredError' ) {
          err.userMessage = 'Session Expired, Please Login.'
          err.status = 401
        } else if ( err.message === 'invalid signature' ) {
          err.userMessage = 'Invalid Login.'
          err.status = 401
        } else {
          err.userMessage = 'Authentication Error Has Occured.'
          err.status = 500
        }

        return responseHelper.handleError( err, res )
      }

      req.user = decoded.user
      return next()
    } )
  },

  /**
  * Check if the user is in the conversation being accessed, return error if they are not
  * @param  {String}   req.params.conversationId  id of the conversation being accessed
  * @param  {Object}   req                        request object from user to server
  * @param  {Object}   res                        response object to user from server
  * @param  {Function} next                       next function in express function list
  * @return {Object}                              Returns res with an error code 401 or next if the user is in the conversation
  */
  inConversation: ( req, res, next ) => {
    // if no id was sent under params or the id was null then respond with the error
    if ( !req.params.conversationId || req.params.conversationId == 'null' ) {
      return responseHelper.handleError( { status: 400, userMessage: 'Invalid Conversation.' }, res )
    }

    // find the conversation with the provided id
    Conversation.findById( req.params.conversationId, ( err, conversation ) => {
      // if no conversation was found respond with the invalid resource error
      if ( !conversation._id ) {
        return responseHelper.handleError( { status: 404, userMessage: 'Conversation Not Found.' }, res )
      }

      let found = false

      for ( let i = 0; i < conversation.participants.length; i++ ) {
        if ( conversation.participants[i].id == req.user._id ) {
          found = true
          break
        }
      }

      if ( !found ) {
        return responseHelper.handleError( { status: 403, userMessage: 'You Are Not In This Conversation.' }, res )
      }

      return next()
    } )
  },

  /**
  * Check if the user is in the conversation being accessed, return error if they are not
  * @param  {String}   req.params.friendshipId    id of the friendship being accessed
  * @param  {Object}   req                        request object from user to server
  * @param  {Object}   res                        response object to user from server
  * @param  {Function} next                       next function in express function list
  * @return {Object}                              Returns res with an error code 401 or next if the user is in the conversation
  */
  inFriendship: ( req, res, next ) => {
    // if no id was sent under params or the id was null then respond with the error
    if ( !req.params.friendshipId || req.params.friendshipId == 'null' ) {
      return responseHelper.handleError( { status: 400, userMessage: 'Invalid Friendship.' }, res )
    }

    // find the conversation with the provided id
    Friendship.findById( req.params.friendshipId, ( err, friendship ) => {
      // if no conversation was found respond with the invalid resource error
      if ( !friendship || !friendship._id ) {
        return responseHelper.handleError( { status: 404, userMessage: 'Friendship Not Found.' }, res )
      }

      // if the user is not in the participants list, respond with a 401 error
      if ( friendship.users[0].id != req.user._id && friendship.users[1].id != req.user._id ) {
        return responseHelper.handleError( { status: 403, userMessage: 'You Are Not In This Friendship.' }, res )
      }

      return next()
    } )
  },

  validSentFriendship: ( req, res, next ) => {
    if ( !req.body || !req.body.users || !req.body.users[0] || !req.body.users[1] ||
         ( req.body.users[0].id.username != req.user.username && req.body.users[1].id.username != req.user.username ) ) {
      return responseHelper.handleError( { status: 400, userMessage: 'Invalid Friendship Sent.' }, res )
    }

    if ( req.body.users[0].id.username === req.body.users[1].id.username ) {
      return responseHelper.handleError( { status: 400, userMessage: 'You Cannot Be Friends With Yourself, That\'s Just Sad' }, res )
    }

    User.find( { username: { '$in': [req.body.users[0].id.username, req.body.users[1].id.username] } }, '_id', ( err, users ) => {
      if ( !users || users.length < 2 ) {
        return responseHelper.handleError( { status: 400, userMessage: 'Invalid Friendship Sent.' }, res )
      }

      const ids = users.map( ( user ) => {
        return user._id
      } )

      Friendship.find( { 'users.id': ids }, 'users', ( err, friendships ) => {
        for ( let i = 0; i < friendships.length; i++ ) {
          const friendshipIds = friendships[i].users.map( ( user ) => {
            return user.id.toString()
          } )

          if ( friendshipIds.indexOf( ids[0].toString() ) !== -1 &&
            friendshipIds.indexOf( ids[1].toString() ) !== -1 ) {
            return responseHelper.handleError( { status: 400, userMessage: 'Friendship Already Exists' }, res )
          }
        }

        return next()
      } )
    } )
  },

  /**
  * Check if the user is the owner of the conversation being accessed, return error if they are not
  * @param  {String}   req.params.id  id of the conversation accessed
  * @param  {Object}   req            request object from user to server
  * @param  {Object}   res            response object to user from server
  * @param  {Function} next           next function in express function list
  * @return {Object}                  Returns res with an error code 401 or next if the user is the owner
  */
  isConversationOwner: (req, res, next) => {
    // if no id was sent or the id is null then return with an input error
    if ( !req.params.id || req.params.id == 'null' ) {
      return responseHelper.handleError( { status: 400, userMessage: 'Invalid Conversation.' }, res )
    }

    // find the conversation with the given id
    Conversation.findById( req.params.id, ( err, conversation ) => {
      // if no conversation was found then return an invalid resource error
      if ( !conversation ) {
        return responseHelper.handleError( { status: 404, userMessage: 'Conversation Not Found.' }, res )
      }

      // if the user is not the owner then return a 401 error
      if ( conversation.owner != req.user._id ) {
        return responseHelper.handleError( { status: 403, userMessage: 'You Are Not The Owner Of This Conversation.' }, res )
      }

      return next()
    } )
  },

  isMessageOwner: (req, res, next) => {
    if ( !req.params.id || req.params.id == 'null' ) {
      return responseHelper.handleError( { status: 400, userMessage: 'Invalid Message.' }, res )
    }

    Message.findById( req.params.id, ( err, message) => {
      if ( !message ) {
        return responseHelper.handleError( { status: 404, userMessage: 'Message Not Found.' }, res )
      }

      if ( message.user != req.user._id ) {
        return responseHelper.handleError( { status: 403, userMessage: 'You Are Not The Owner Of This Message.' }, res )
      }
      return next()
    })
  }
}

module.exports = actions
