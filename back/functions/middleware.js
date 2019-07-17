const
  jwt                 = require( 'jsonwebtoken' ),
  db                  = require( '../models' ),
  Conversation        = db.Conversation,
  ConversationMessage = db.ConversationMessage,
  Participant         = db.Participant,
  Friendship          = db.Friendship,
  FriendshipMessage   = db.FriendshipMessage,
  responseHelper      = require( './responseHelper' )

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

  validFriendship: async ( req ) => {
    if ( req.body.userOneId != req.user.id && req.body.userTwoId != req.user.id ) {
      throw { status: 400, message: 'you must be in the friendship' }
    }

    if ( req.body.userOneId == req.body.userTwoId ) {
      throw { status: 400, message: 'you cannot be friends with yourself' }
    }
  },

  inFriendship: async ( req ) => {
    const friendship = await Friendship.findByPk( req.params.id )

    if ( friendship.userOneId != req.user.id && friendship.userTwoId != req.user.id ) {
      throw { status: 400, message: 'you are not in this friendship' }
    }
  },

  activeFriendship: async ( req ) => {
    const friendship = await Friendship.findByPk( req.params.id )

    if ( !friendship.userOneAccepted || !friendship.userTwoAccepted ) {
      throw { status: 400, message: 'this friendship is not active' }
    }
  },

  ownsConversationMessage: async ( req ) => {
    const message = await ConversationMessage.findByPk( req.params.messageId )

    if ( message.userId != req.user.id ) {
      throw { status: 400, message: 'you do not own that message' }
    }
  },

  ownsFriendshipMessage: async ( req ) => {
    const message = await FriendshipMessage.findByPk( req.params.messageId )

    if ( message.userId != req.user.id ) {
      throw { status: 400, message: 'you do not own that message' }
    }
  },
}

module.exports = responseHelper.handleMiddleware( actions )
