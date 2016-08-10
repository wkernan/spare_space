var express = require('express');
var db = require('../models');

module.exports = function(app, passport) {

	app.get('/', function(req, res){
	    res.render('home', {user: req.user});
	});

	app.post('/spaces/create', function(req, res) {
		var user = req.user;
			db.Space.create({address: req.body.address, city: req.body.city, state: req.body.state, zipcode: req.body.zipcode, description: req.body.description, price: req.body.price, from: req.body.from, to: req.body.to, photo: req.body.photo})
			.then(function(space) {
				user.addSpace(space);
			}).then(function() {
				req.flash('success', 'Your space at ' + req.body.address + ' has been created');
				res.redirect('/spaces');
			})
	})

	app.get('/spaces', function(req, res){
		db.Space.findAll({

		}).then(function(data) {
			res.render('spaces', {spaces: data});
		});
	});

	app.get('/profile', isLoggedIn, function(req, res){
		var queries = [];
		req.user.space = [];
		db.Space.findAll({where: {userID: req.user.id}}).then(function(data) {
			for(var i = 0; i < data.length; i++){
				data[i].dataValues.from = data[i].dataValues.from.toString().substring(4, 15);
				data[i].dataValues.to = data[i].dataValues.to.toString().substring(4, 15);
			}	
			data.forEach(function(space) {
				queries.push(space);
			})
			Promise.all(queries).then(function(result) {
				for(var i=0; i<result.length; i++) {
					req.user.space.push({
						space_address: result[i].address,
						space_city: result[i].city,
						space_state: result[i].state,
						space_zipcode: result[i].zipcode,
						space_description: result[i].description,
						space_price: result[i].price,
						space_to: result[i].to,
						space_from: result[i].from,
						space_status: result[i].status,
						space_photo: result[i].photo
					})
					console.log("space:",req.user);
				}
			})
		});
		res.render('profile', {
			user: req.user
		});
	});

	app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get('/auth/google',
    passport.authenticate('google', { scope: [
      'https://www.googleapis.com/auth/plus.login',
      'https://www.googleapis.com/auth/plus.profile.emails.read'
    ]}
  ));
  app.get('/oauth2callback',
    passport.authenticate('google', { 
      successRedirect: '/profile',
      failureRedirect: '/' 
  }));

	app.use(function (req, res){
		res.redirect('/');
	});
}

function isLoggedIn(req, res, next) {
	console.log(req.isAuthenticated);
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
      return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}