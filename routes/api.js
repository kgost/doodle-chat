const express  = require('express'),
  router       = express.Router(),
  jwt          = require( 'jsonwebtoken' ),
  Message      = require( '../models/message' ),
  async        = require( 'async' ),
  mongoose     = require( 'mongoose' ),
  User         = require( '../models/user' ),
  Image        = require( '../models/image' ),
  Conversation = require( '../models/conversation' ),
  middleware   = require( '../functions/middleware' )

//Conversation Routes

/**
 * CREATE route for conversations:
 *    Creates conversation and saves to MongoDB
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding messages.
 */
router.post( '/conversations', middleware.authenticate, ( req, res ) => {
  const user = jwt.decode(req.query.token).user //Pull user from the JWT
  req.body.participants.push(user)   //Add owner to participants list
  const convo = pruneUsers( req.body )

  async.map( convo.participants, ( participant, cb ) => {
    User.findOne( { username: participant.username }, '_id username' ).lean().exec( ( err, usr ) => {
      if ( err ) return cb( err )
      if ( !usr ) return cb( null )
      return cb( null, { _id: usr._id, username: usr.username } )
    } )
  }, ( err, results ) => {
    for ( let i = 0; i < results.length; i++ ) {
      if ( !results[i] ) {
        results.splice( i, 1 )
        i--
      }
    }
    convo.participants = results;

    //Create the new conversation object
    Conversation.create( convo, ( err, conversation ) => {
      if ( err ) {
        return res.status( 500 ).json({
          title: 'An error occured',
          error: err
        })
      }
      //Successful Creation
      res.status( 201 ).json({
        _id: conversation._id,
        name: convo.name,
        owner: { _id: user._id, username: user.username },
        participants: convo.participants
      })
    } )
  } )
} )


/**
 * READ route for conversations:
 *    Finds and returns all conversations that a user is in
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding messages.
 */
router.get( '/conversations', middleware.authenticate, ( req, res ) => {
  const user = jwt.decode(req.query.token).user

  //Find all conversations this user is a part of
  Conversation.find({ participants: mongoose.Types.ObjectId( user._id ) }, '_id name participants owner' ).populate('participants', 'username').populate( 'owner', 'username' ).exec( ( err, conversations ) => {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }

    return res.status( 200 ).json({
      obj: conversations
    })
  })
})



/**
 * UPDATE route for conversations:
 *    Replaces conversation in MongoDB with new data in req
 * @param  {[type]}   id   id sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding messages.
 */
router.put('/conversations/:id', middleware.authenticate, middleware.isConversationOwner, (req, res) => {
  const user = jwt.decode(req.query.token).user //Pull user from the JWT
  req.body.participants.push(user)   //Add owner to participants list
  const convo = pruneUsers( req.body )

  async.map( convo.participants, ( participant, cb ) => {
    User.findOne( { username: participant.username }, '_id username' ).lean().exec( ( err, usr ) => {
      if ( err || !user._id ) return cb( err )
      return cb( null, { _id: usr._id, username: usr.username } )
    } )
  }, ( err, results ) => {
    convo.participants = results

    //Create the new conversation object
    Conversation.findByIdAndUpdate( req.params.id, convo, ( err ) => {
      if ( err ) {
        return res.status( 500 ).json({
          title: 'An error occured',
          error: err
        })
      }
      //Successful Creation
      res.status( 201 ).json({
        _id: req.params.id,
        name: convo.name,
        owner: { _id: user._id, username: user.username },
        participants: convo.participants
      })
    } )
  } )
})

/**
 * Destroy route for conversations:
 *    Deletes conversation and all associated messages in MongoDB
 * @param  {[type]}   id   id sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding message.
 */
router.delete('/conversations/:id', middleware.authenticate, middleware.isConversationOwner, (req, res) => {
  //Finds conversation with given id and removes form the database
  Conversation.findByIdAndRemove(req.params.id, req.body, (err) => {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }
    //Removes all messages that reference the conversation
    Message.remove( { conversation_id: req.params.id }, ( err ) => {
      if ( err ) {
        return res.status( 500 ).json({
          title: 'An error occured',
          error: err
        })
      }

      res.status( 200 ).json({
        message: 'Conversation deleted'
      })
    } )
  })
})

//Message Routes

/**
 * CREATE route for messages:
 *    Creates message and saves to MongoDB
 * @param  {[type]}   conversationId conversationID sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding message.
 */
router.post( '/messages/:conversationId', middleware.authenticate, middleware.inConversation, ( req, res ) => {
  const user = jwt.decode(req.query.token).user
  // Save new message with corresponding conversationId
  // if the message had an image, create that image
  if ( req.body.image ) {
    Image.create( { img: req.body.image }, ( err, image ) => {
      if ( err ) {
        return res.status( 500 ).json({
          title: 'An error occured',
          error: err
        })
      }

      // create the message with the image field populated as the image _id
      Message.create( { text: req.body.text, conversation_id: req.params.conversationId, user: user._id, image: image._id }, ( err, message ) => {
        if ( err ) {
          return res.status( 500 ).json({
            title: 'An error occured',
            error: err
          })
        }

        // respond with success message
        res.status( 201 ).json(message)
      } )
    } )
  // otherwise just save the message as is
  } else {
    Message.create( { text: req.body.text, conversation_id: req.params.conversationId, user: user._id, username: user.username }, ( err, message ) => {
      if ( err ) {
        return res.status( 500 ).json({
          title: 'An error occured',
          error: err
        })
      }
      // respond with success message
      res.status( 201 ).json(message)
    } )
  }
} )


/**
 * READ route for message:
 *    Finds and returns all messages for a given conversation
 * @param  {[type]}   conversationId conversationID sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code along with an object containing the conversation's messages.
 */
router.get( '/messages/:conversationId', middleware.authenticate, middleware.inConversation, ( req, res ) => {
  //Finds all messages associated with given conversationId
  Message.find( { conversation_id: req.params.conversationId } ).sort( '+createdAt' ).populate('image').exec( ( err, messages ) => {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }
    //Return success code and object with all messages
    res.status( 200 ).json({
      obj: messages
    })
  })
})

/**
 * UPDATE route for message:
 *    Updates all messages for a given conversation
 * @param  {[type]}   conversationId conversationID sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code along with an object containing the messages.
 */
router.put( '/messages/:id', middleware.authenticate, middleware.isMessageOwner, ( req, res ) => {
  //Finds all messages associated with given id
  Message.findByIdAndUpdate( req.params.id, req.body ).exec( ( err ) => {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }
    //Return success code and object with all messages
    res.status( 200 ).json({
      message: 'Reply Successful',
    })
  })
})

/**
 * DELETE route for message:
 *    Deletes a specific message
 * @param  {[type]}   id id sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code
 */
router.delete('/messages/:id', middleware.authenticate, middleware.isMessageOwner, (req, res) => {
  //Finds conversation with given id and removes form the database
  Message.findByIdAndRemove(req.params.id, req.body, (err) => {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }
    res.status( 200 ).json({
      message: 'Message deleted'
    })
  } )
})

function pruneUsers( conversation ) {
  for ( let i = 0; i < conversation.participants.length; i++ ) {
    for ( let j = i + 1; j < conversation.participants.length; j++ ) {
      if ( conversation.participants[i].username === conversation.participants[j].username ) {
        conversation.participants.splice( i, 1 )
        i--
        break
      }
    }
  }
  return conversation
}

module.exports = router
