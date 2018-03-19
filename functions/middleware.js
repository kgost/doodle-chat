var express 				= require( 'express' ),
	jwt						= require( 'jsonwebtoken' ),
	User					= require( './models/user' );

// Middleware

function authenticate(req, res, next) {
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
}
