var express 				= require( 'express' ),
	jwt						= require( 'jsonwebtoken' ),
	User					= require( '../models/user' ),
	Conversation			= require( '../models/conversation' );


var actions = {

	// Middleware

	/**
	* Should determine whether or not the user is logged in and respond with an error if they are not,
	* return next if they are
	* @param  {Object}   req  request object from user to server
	* @param  {Object}   res  response object to user from server
	* @param  {Function} next next function in express function list
	* @return {Object}        Returns res with an error code 401 or next if the user is logged in
	*/
	authenticate: function(req, res, next) {
		// if no token was sent under query or the token was null then respond with the error
		if (!req.query.token || req.query.token == 'null') {
			return res.status(401).json({
				title: 'User not logged in.',
				error: {message: 'Invalid JWT to server.'}
			});
		}

		// decode the token using the jwt library
		var decoded = jwt.decode(req.query.token);

		// find a user with the id of the decoded token
		User.findById(decoded.user._id, function(err, user) {
			// if an error occured respond with the error
			if (err) {
				res.redirect('/login');
				return res.status(500).json({
					title: 'An error occurred',
					error: err
				});
			}

			// no user was found then the token is invalid and respond with an error
			if (!user) {
				return res.status(401).json({
					title: 'User not logged in.',
					error: {message: 'Invalid JWT to server.'}
				});
			}

			return next();
		});
	},

	/**
	* Check if the user is in the conversation being accessed, return error if they are not
	* @param  {String}   req.params.conversationId  id of the conversation being accessed
	* @param  {Object}   req												request object from user to server
	* @param  {Object}   res												response object to user from server
	* @param  {Function} next												next function in express function list
	* @return {Object}															Returns res with an error code 401 or next if the user is in the conversation
	*/
	inConversation: function( req, res, next ) {
		// if no id was sent under params or the id was null then respond with the error
		if ( !req.params.conversationId || req.params.conversationId == 'null' ) {
			return res.status(400).json({
				title: 'No conversation provided.',
				error: {message: 'Invalid conversation id sent to server.'}
			});
		}

		// find the conversation with the provided id
		Conversation.findById( req.params.conversationId, function( err, conversation ) {
			// if no conversation was found respond with the invalid resource error
			if ( !conversation ) {
				return res.status(404).json({
					title: 'No conversation found.',
					error: {message: 'Invalid conversation id sent to server.'}
				});
			}

			// it is assumed the user is authenticated, decode their token
			var decoded = jwt.decode(req.query.token);

			// if the user is not in the participants list, respond with a 401 error
			if ( conversation.participants.indexOf( decoded.user.username ) == -1 ) {
				return res.status( 401 ).json({
					title: 'Unauthorized User.',
					error: {message: 'You are not in this conversation.'}
				});
			}

			return next();
		} );
	},

	/**
	* Check if the user is the owner of the conversation being accessed, return error if they are not
	* @param  {String}   req.params.id  id of the conversation accessed
	* @param  {Object}   req						request object from user to server
	* @param  {Object}   res						response object to user from server
	* @param  {Function} next						next function in express function list
	* @return {Object}									Returns res with an error code 401 or next if the user is the owner
	*/
	isConversationOwner: function(req, res, next) {
		// if no id was sent or the id is null then return with an input error
		if ( !req.params.id || req.params.id == 'null' ) {
			return res.status(400).json({
				title: 'No conversation provided.',
				error: {message: 'Invalid conversation id sent to server.'}
			});
		}

		// find the conversation with the given id
		Conversation.findById( req.params.id, function( err, conversation ) {
			// if no conversation was found then return an invalid resource error
			if ( !conversation ) {
				return res.status(404).json({
					title: 'No conversation found.',
					error: {message: 'Invalid conversation id sent to server.'}
				});
			}

			// it is assumed the user is authenticated, decode their token
			var decoded = jwt.decode(req.query.token);

			// if the user is not the owner then return a 401 error
			if ( conversation.owner != decoded.user._id ) {
				return res.status( 401 ).json({
					title: 'Unauthorized User.',
					error: {message: 'You are not the owner of this conversation.'}
				});
			}

			return next();
		} );
	},
	
	isMessageOwner: function(req, res, next) {
		if ( !req.params.id || req.params.id == 'null' ) {
			return res.status(400).json({
				title: 'No message provided.',
				error: {message: 'Invalid message id sent to server.'}
			});
		}
		Message.findById( req.params.id, function( err, message) {
			if ( !message ) {
				return res.status(404).json({
					title: 'No message found.',
					error: {message: 'Invalid message id sent to server.'}
				});
			}

			var decoded = jwt.decode(req.query.token);
			
			if ( message.user != decoded.user._id ) {
				return res.status( 401 ).json({
					title: 'Unauthorized User.',
					error: {message: 'You are not the owner of this message.'}
				});
			}
			return next();
		});		
	}
}

module.exports = actions;
