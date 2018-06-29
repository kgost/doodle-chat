const jwt      = require( 'jsonwebtoken' ),
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
      return res.status(401).json({
        title: 'User not logged in.',
        error: {message: 'Invalid JWT to server.'}
      })
    }

    // decode the token using the jwt library
    const decoded = jwt.decode(req.query.token)

    // find a user with the id of the decoded token
    User.findById(decoded.user._id, (err, user) => {
      // if an error occured respond with the error
      if (err) {
        return res.status(500).json({
          title: 'An error occurred',
          error: err
        })
      }

      // no user was found then the token is invalid and respond with an error
      if (!user) {
        return res.status(401).json({
          title: 'User not logged in.',
          error: {message: 'Invalid JWT to server.'}
        })
      }

      return next()
    })
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
      return res.status(400).json({
        title: 'No conversation provided.',
        error: {message: 'Invalid conversation id sent to server.'}
      })
    }

    // find the conversation with the provided id
    Conversation.findById( req.params.conversationId, ( err, conversation ) => {
      // if no conversation was found respond with the invalid resource error
      if ( !conversation._id ) {
        return res.status(404).json({
          title: 'No conversation found.',
          error: {message: 'Invalid conversation id sent to server.'}
        })
      }

      // it is assumed the user is authenticated, decode their token
      const decoded = jwt.decode(req.query.token)

      // if the user is not in the participants list, respond with a 401 error

      let found = false

      for ( let i = 0; i < conversation.participants.length; i++ ) {
        if ( conversation.participants[i].id == decoded.user._id ) {
          found = true
          break
        }
      }

      if ( !found ) {
        return res.status( 401 ).json({
          title: 'Unauthorized User.',
          error: {message: 'You are not in this conversation.'}
        })
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
      return res.status(400).json({
        title: 'No friendship provided.',
        error: {message: 'Invalid friendship id sent to server.'}
      })
    }

    // find the conversation with the provided id
    Friendship.findById( req.params.friendshipId, ( err, friendship ) => {
      // if no conversation was found respond with the invalid resource error
      if ( !friendship._id ) {
        return res.status(404).json({
          title: 'No friendship provided.',
          error: {message: 'Invalid friendship id sent to server.'}
        })
      }

      // it is assumed the user is authenticated, decode their token
      const decoded = jwt.decode(req.query.token)

      // if the user is not in the participants list, respond with a 401 error
      if ( friendship.users[0].id != decoded.user._id && friendship.users[1].id != decoded.user._id ) {
        return res.status( 401 ).json({
          title: 'Unauthorized User.',
          error: {message: 'You are not in this friendship.'}
        })
      }

      return next()
    } )
  },

  inSentFriendship: ( req, res, next ) => {
    const decoded = jwt.decode(req.query.token)

    if ( !req.body || !req.body.users || !req.body.users[0] || !req.body.users[1] ||
         ( req.body.users[0].id.username != decoded.user.username && req.body.users[1].id.username != decoded.user.username ) ) {
      return res.status( 401 ).json({
        title: 'Unauthorized User.',
        error: {message: 'You are not in this friendship.'}
      })
    }

    return next()
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
      return res.status(400).json({
        title: 'No conversation provided.',
        error: {message: 'Invalid conversation id sent to server.'}
      })
    }

    // find the conversation with the given id
    Conversation.findById( req.params.id, ( err, conversation ) => {
      // if no conversation was found then return an invalid resource error
      if ( !conversation ) {
        return res.status(404).json({
          title: 'No conversation found.',
          error: {message: 'Invalid conversation id sent to server.'}
        })
      }

      // it is assumed the user is authenticated, decode their token
      const decoded = jwt.decode(req.query.token)

      // if the user is not the owner then return a 401 error
      if ( conversation.owner != decoded.user._id ) {
        return res.status( 401 ).json({
          title: 'Unauthorized User.',
          error: {message: 'You are not the owner of this conversation.'}
        })
      }

      return next()
    } )
  },

  isMessageOwner: (req, res, next) => {
    if ( !req.params.id || req.params.id == 'null' ) {
      return res.status(400).json({
        title: 'No message provided.',
        error: {message: 'Invalid message id sent to server.'}
      })
    }
    Message.findById( req.params.id, ( err, message) => {
      if ( !message ) {
        return res.status(404).json({
          title: 'No message found.',
          error: {message: 'Invalid message id sent to server.'}
        })
      }

      const decoded = jwt.decode(req.query.token)

      if ( message.user != decoded.user._id ) {
        return res.status( 401 ).json({
          title: 'Unauthorized User.',
          error: {message: 'You are not the owner of this message.'}
        })
      }
      return next()
    })
  }
}

module.exports = actions
