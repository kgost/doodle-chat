const express  = require('express'),
  router       = express.Router(),
  jwt          = require( 'jsonwebtoken' ),
  async        = require( 'async' ),
  mongoose     = require( 'mongoose' ),
  streamifier  = require( 'streamifier' ),
  Message      = require( '../models/message' ),
  Media        = require( '../models/media' ),
  User         = require( '../models/user' ),
  Friendship   = require( '../models/friendship' ),
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
    convo.participants = results

    convo.name = req.sanitize( convo.name )

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

    convo.name = req.sanitize( convo.name )

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

router.get( '/conversations/:id/leave', middleware.authenticate, ( req, res ) => {
  const user = jwt.decode(req.query.token).user //Pull user from the JWT

  conversation.name = req.sanitize( conversation.name )

  Conversation.findById( req.params.id, ( err, conversation ) => {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }

    for ( let i = 0; i < conversation.participants.length; i++ ) {
      if ( conversation.participants[i] == user._id ) {
        conversation.participants.splice( i, 1 )
        break
      }
    }

    conversation.save( ( err ) => {
      if ( err ) {
        return res.status( 500 ).json({
          title: 'An error occured',
          error: err
        })
      }

      res.status( 200 ).json({ message: 'Left Converrsation' })
    } )
  } )
} )

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
    Message.find( { conversation_id: req.params.id }, ( err, messages ) => {
      if ( err ) {
        return res.status( 500 ).json({
          title: 'An error occured',
          error: err
        })
      }

      async.map( messages, ( message, cb ) => {
        if ( message.media ) {
          Media.findByIdAndRemove( message.media.id, ( err ) => {
            message.remove( ( err ) => {
              cb( err )
            } )
          } )
        } else {
          message.remove( ( err ) => {
            cb( err )
          } )
        }
      }, ( err ) => {

        res.status( 200 ).json({
          message: 'Conversation deleted'
        })
      } )
    } )
  })
})

//Friendship Routes
router.post( '/friendships', middleware.authenticate, middleware.inSentFriendship, ( req, res ) => {
  const user = jwt.decode(req.query.token).user
  let otherUsername = ''

  for ( let i = 0; i < req.body.users.length; i++ ) {
    if ( req.body.users[i].id.username != user.username ) {
      otherUsername = req.body.users[i].id.username
    }
  }

  User.findOne( { username: otherUsername }, '_id username', ( err, usr ) =>  {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }

    if ( !usr || !usr._id ) {
      return res.status( 400 ).json({
        title: 'Invalid friendship request',
        error: { message: 'The Friendship Request Was Invalid' }
      })
    }

    Friendship.create( { users: [{ id: user._id, accepted: true }, { id: usr._id, accepted: false }] }, ( err ) => {
      if ( err ) {
        return res.status( 500 ).json({
          title: 'An error occured',
          error: err
        })
      }

      res.status( 201 ).json({
        users: [
          { id: { _id: user._id, username: user.username }, accepted: true },
          { id: { _id: usr._id, username: usr.username }, accepted: false }
        ]
      })
    } )
  } )
} )

router.get( '/friendships', middleware.authenticate, ( req, res ) => {
  const user = jwt.decode(req.query.token).user

  Friendship.find({ 'users.id': mongoose.Types.ObjectId( user._id ) }).populate( 'users.id' ).exec( ( err, friendships ) => {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }

    return res.status( 200 ).json({
      obj: friendships
    })
  } )
} )

router.put( '/friendships/:friendshipId', middleware.authenticate, middleware.inFriendship, middleware.inSentFriendship, ( req, res ) => {
  const user = jwt.decode(req.query.token).user

  Friendship.findById( req.params.friendshipId, ( err, friendship ) => {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }

    for ( let i = 0; i < friendship.users.length; i++ ) {
      if ( friendship.users[i].id == user._id ) {
        friendship.users[i].accepted = true
      }
    }

    friendship.save( ( err ) => {
      if ( err ) {
        return res.status( 500 ).json({
          title: 'An error occured',
          error: err
        })
      }
      
      res.status( 201 ).json( friendship )
    } )
  } )
} )

router.delete( '/friendships/:friendshipId', middleware.authenticate, middleware.inFriendship, ( req, res ) => {
  Friendship.findByIdAndRemove( req.params.friendshipId, ( err ) => {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }

    //Removes all messages that reference the conversation
    Message.find( { friendship_id: req.params.friendshipId }, ( err, messages ) => {
      if ( err ) {
        return res.status( 500 ).json({
          title: 'An error occured',
          error: err
        })
      }

      async.map( messages, ( message, cb ) => {
        if ( message.media ) {
          Media.findByIdAndRemove( message.media.id, ( err ) => {
            message.remove( ( err ) => {
              cb( err )
            } )
          } )
        } else {
          message.remove( ( err ) => {
            cb( err )
          } )
        }
      }, ( err ) => {

        res.status( 200 ).json({
          message: 'Conversation deleted'
        })
      } )
    } )
  } )
} )

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
  let message = {
    text: req.sanitize( req.body.text ),
    conversation_id: req.params.conversationId,
    user: user._id,
    username: user.username
  }

  if ( req.body.media ) {
    Media.create( { data: new Buffer( req.body.media.data ), mime: req.body.media.mime }, ( err, media ) => {
      if ( err ) {
        return res.status( 500 ).json({
          title: 'An error occured',
          error: err
        })
      }

      message.media = { mime: req.body.media.mime, id: media._id }

      Message.create( message, ( err, message ) => {
        if ( err ) {
          return res.status( 500 ).json({
            title: 'An error occured',
            error: err
          })
        }
        // respond with success message
        res.status( 201 ).json(message)
      } )
    })
  } else {
    Message.create( message, ( err, message ) => {
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
 * CREATE route for messages:
 *    Creates message and saves to MongoDB
 * @param  {[type]}   conversationId conversationID sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code and corresponding message.
 */
router.post( '/privateMessages/:friendshipId', middleware.authenticate, middleware.inFriendship, ( req, res ) => {
  const user = jwt.decode(req.query.token).user
  // Save new message with corresponding conversationId
  let message = {
    text: req.sanitize( req.body.text ),
    friendship_id: req.params.friendshipId,
    user: user._id,
    username: user.username
  }

  if ( req.body.media ) {
    Media.create( { data: new Buffer( req.body.media.data ), mime: req.body.media.mime }, ( err, media ) => {
      if ( err ) {
        return res.status( 500 ).json({
          title: 'An error occured',
          error: err
        })
      }

      message.media = { mime: req.body.media.mime, id: media._id }

      Message.create( message, ( err, message ) => {
        if ( err ) {
          return res.status( 500 ).json({
            title: 'An error occured',
            error: err
          })
        }
        // respond with success message
        res.status( 201 ).json(message)
      } )
    })
  } else {
    Message.create( message, ( err, message ) => {
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
  Message.find( { conversation_id: req.params.conversationId } ).sort( '+createdAt' ).exec( ( err, messages ) => {
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
 * READ route for message:
 *    Finds and returns all messages for a given conversation
 * @param  {[type]}   conversationId conversationID sent in req.params
 * @param  {[type]}   req  request object from user to server
 * @param  {[type]}   res  response object to user from server
 * @param  {Function} next next function in express function list
 * @return {[type]}        Returns a status code along with an object containing the conversation's messages.
 */
router.get( '/privateMessages/:friendshipId', middleware.authenticate, middleware.inFriendship, ( req, res ) => {
  //Finds all messages associated with given conversationId
  Message.find( { friendship_id: req.params.friendshipId } ).sort( '+createdAt' ).exec( ( err, messages ) => {
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

router.get( '/message/:conversationId/:messageId', middleware.authenticate, middleware.inConversation, ( req, res ) => {
  //Finds all messages associated with given conversationId
  Message.findById( req.params.messageId, ( err, message ) => {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }

    //Return success code and object with all messages
    res.status( 200 ).json(message)
  })
})

router.get( '/privateMessage/:friendshipId/:messageId', middleware.authenticate, middleware.inFriendship, ( req, res ) => {
  //Finds all messages associated with given conversationId
  Message.findById( req.params.messageId, ( err, message ) => {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }

    //Return success code and object with all messages
    res.status( 200 ).json(message)
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
  req.body.text = req.sanitize( req.body.text )
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
  Message.findByIdAndRemove(req.params.id, req.body, (err, message) => {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }

    if ( message.media ) {
      Media.findByIdAndRemove( message.media.id, ( err ) => {
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
    } else {
      res.status( 200 ).json({
        message: 'Message deleted'
      })
    }
  } )
})

router.get( '/media/:id', ( req, res ) => {
  Media.findById( req.params.id, ( err, file ) => {
    if ( err ) {
      return res.status( 500 ).json({
        title: 'An error occured',
        error: err
      })
    }

    if ( file.mime.indexOf( 'video' ) !== -1 ) {
      const fileSize = file.data.length
      const range = req.headers.range

      if ( range ) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt( parts[0], 10 )
        const end = parts[1] ? parseInt( parts[1], 10 ) : fileSize - 1
        const chunksize = ( end - start ) + 1
        const chunk = file.data.slice( start, end + 1 )
        const stream = streamifier.createReadStream( chunk )
        const head = {
          'Content-Range': `bytes ${ start }-${ end }/${ fileSize }`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': file.mime
        }

        res.writeHead( 206, head )
        stream.pipe( res )
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': file.mime
        }

        res.writeHead( 200, head )
        streamifier.createReadStream( file.data ).pipe( res )
      }
    } else {
      res.contentType( file.mime )
      res.end( file.data, 'binary' )
    }
  } )
} )

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
