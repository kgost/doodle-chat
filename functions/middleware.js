var express 				= require( 'express' ),
	jwt						= require( 'jsonwebtoken' ),
	User					= require( '../models/user' ),
	Conversation					= require( '../models/conversation' );


var actions = {

	// Middleware

	authenticate: function(req, res, next) {
		if (!req.query.token || req.query.token == 'null') {
			return res.status(401).json({
				title: 'User not logged in.',
				error: {message: 'Invalid JWT to server.'}
			});
		}
		var decoded = jwt.decode(req.query.token);
		User.findById(decoded.user._id, function(err, user) {
			if (err) {
				res.redirect('/login');
				return res.status(500).json({
					title: 'An error occurred',
					error: err
				});
			}
			if (!user) {
				return res.status(401).json({
					title: 'User not logged in.',
					error: {message: 'Invalid JWT to server.'}
				});
			}
			return next();
		});
	},

	inConversation: function( req, res, next ) {
		if ( !req.params.conversationId || req.params.conversationId == 'null' ) {
			return res.status(400).json({
				title: 'No conversation provided.',
				error: {message: 'Invalid conversation id sent to server.'}
			});
		}

		Conversation.findById( req.params.conversationId, function( err, conversation ) {
			if ( !conversation ) {
				return res.status(404).json({
					title: 'No conversation found.',
					error: {message: 'Invalid conversation id sent to server.'}
				});
			}

			var decoded = jwt.decode(req.query.token);

			if ( conversation.participants.indexOf( decoded.user._id ) == -1 ) {
				return res.status( 401 ).json({
					title: 'Unauthorized User.',
					error: {message: 'You are not in this conversation.'}
				});
			}

			return next();
		} );
	},

	//Check if user making request is the owner
	isConversationOwner: function(req, res, next) {
		if ( !req.params.id || req.params.id == 'null' ) {
			return res.status(400).json({
				title: 'No conversation provided.',
				error: {message: 'Invalid conversation id sent to server.'}
			});
		}

		Conversation.findById( req.params.id, function( err, conversation ) {
			if ( !conversation ) {
				return res.status(404).json({
					title: 'No conversation found.',
					error: {message: 'Invalid conversation id sent to server.'}
				});
			}

			var decoded = jwt.decode(req.query.token);

			if ( conversation.owner != decoded.user._id ) {
				return res.status( 401 ).json({
					title: 'Unauthorized User.',
					error: {message: 'You are not the owner of this conversation.'}
				});
			}

			return next();
		} );
	}

};

module.exports = actions;
