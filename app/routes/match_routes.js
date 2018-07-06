// routes/match_routes.js

const ObjectID = require('mongodb').ObjectID;
const rankSpread = 3;

function getRandomIndex(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// All endpoints for finding a player match
module.exports = function(app, db) {

  //Find List of similar-ranked Opponents
  app.get('/match/findOpponents/:rank', (req, res) =>{
    const rank = parseInt(req.params.rank);
    if (rank > 0){
      const query = { "rank": { $gte: rank - rankSpread, $lte: rank + rankSpread } };
      db.collection('players').find(query).toArray((err, item) => {
        if (err) {
          res.send({'GET /findOpponents error: ': err});
        } else {
          res.send(JSON.stringify(item));
        }
      });
    }
    else{
      res.send(null);
    }

  });

  // Find a match based on your gamertag
  app.get('/match/findMatch/:gamertag', (req, res) =>{
    db.collection('players').findOne({ 'gamertag': req.params.gamertag }, (err, player) => {
      if (player === null){
        res.send(null);
      }
      else if (err) {
        res.send({'GET /findMatch error: ': err});
      } else {
        // query for finding new opponent
        // similar rank
        // do not want same opponent back-to-back)
        // opponent should not have played given player last
        const opponentQuery = { 
          "rank": { $gte: player.rank - rankSpread, $lte: player.rank + rankSpread },
          "gamertag": { $nin: [player.gamertag, player.lastOpponent] } ,
          "lastOpponent": { $ne: player.gamertag }
        };

        // Find all possible opponents
        db.collection('players').find(opponentQuery).toArray((err, possibleOpponents) => {
          if (err) {
            res.send({'GET /findMatch error: ': err});
          } else {
            if (possibleOpponents.length === 0) {
              res.send({'GET /findMatch error: ': 'no appropriate opponents found'});
            }

            // Random opponent from list
            const opponent = possibleOpponents[getRandomIndex(possibleOpponents.length)];

            // send opponent data back
            res.send(JSON.stringify(opponent));

            // Update player with new opponent
            db.collection('players').update(
              { '_id': new ObjectID(player._id) }, 
              {...player, lastOpponent: opponent.gamertag}, 
              (err) => { if (err) res.send({'GET /findMatch update error: ': err});
            });

            // Update Opponent with new opponent
            db.collection('players').update(
              { '_id': new ObjectID(opponent._id) }, 
              {...opponent, lastOpponent: player.gamertag}, 
              (err) => { if (err) res.send({'GET /findMatch update error: ': err});
            });
          }
        });
      }
    });
  });
};