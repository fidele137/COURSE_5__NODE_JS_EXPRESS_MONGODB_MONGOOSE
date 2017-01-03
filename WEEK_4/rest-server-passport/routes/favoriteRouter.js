var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorites');
var Verify = require('./verify');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());



favoriteRouter.route('/')

.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.find({'postedBy': req.decoded._doc._id})
        .populate('postedBy') // dishes._id')
        .populate('dishes')
        .exec(function (err, favorite) {
        if (err) throw err;
        res.json(favorite);
        })
})

.post(Verify.verifyOrdinaryUser, function (req, res, next) {

    Favorites.findOne({'postedBy': req.decoded._doc._id}, function (err, favorite) {
        if(err) throw err;

        if (!favorite) {

            Favorites.create({'postedBy': req.decoded._doc._id}, function (err, favorite) {
                if (err) next(err);
                favorite.dishes.push(req.body._id);
                favorite.save(function (err, favorite) {
                    if (err) next(err);
                    console.log('Created your list of favorites and added this one!');
                    res.json(favorite);
                });
            });

        }  else if (favorite.dishes.indexOf(req.body._id) == -1) {
                favorite.dishes.push(req.body._id);
                favorite.save(function (err, favorite) {
                  if (err) throw err;
                  res.json(favorite);
                });
        } else {
              var err = new Error('Favorite already added');
              err.status = 403;
              return next(err);
        }; 

      });
    })


.delete(Verify.verifyOrdinaryUser, function(req, res, next){
  Favorites.remove({
    'postedBy': req.decoded._doc._id
  }, function (err, favorite) {
    if (err) throw err;
    res.json(favorite);
  });
});



favoriteRouter.route('/:favoriteId')

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
  Favorites.findOne({
    postedBy: req.decoded._doc._id
  },
  function (err, favorite) {
    console.log
    //favorite.dishes.pull(req.params.favoriteId); 
    var index = favorite.dishes.indexOf(req.params.favoriteId); 
    favorite.dishes.splice(index, 1);
    favorite.save(function(err, resp) {
      if(err) throw err;
      res.json(resp);
    });
  });
});



module.exports = favoriteRouter;