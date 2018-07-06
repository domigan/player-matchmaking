// routes/player_routes.js

// Basic get/add for players to be added to the DB
const ObjectID = require('mongodb').ObjectID;

module.exports = function(app, db) {
  // GET METHODS
  // GET Player by ID
  app.get('/players/id/:id', (req, res) => {
	const id = req.params.id;
    const details = { '_id': new ObjectID(id) };
    db.collection('players').findOne(details, (err, item) => {
      if (err) {
        res.send({'GET /players/:id error: ': err});
      } else {
        res.send(item);
      }
    });
  });

  // GET Player by gamertag
  app.get('/players/gamer/:gamertag', (req, res) => {
    const gamertag = req.params.gamertag;
    const details = { 'gamertag': gamertag };
    db.collection('players').findOne(details, (err, item) => {
      if (err) {
        res.send({'GET /players/:gamertag error: ': err});
      } else {
        res.send(item);
      }
    });
  });

  // POST METHODS
  // Add Player to DB
  app.post('/players/add', (req, res) => {
    // You'll create your note here.
    const player = { gamertag: req.body.gamertag, rank: parseInt(req.body.rank) };

    db.collection('players').insert(player, (err, result) => {
      if (err) { 
        res.send({ 'POST /players/add error: ': err }); 
      } else {
        res.send(result.ops[0]);
      }
    });
  });



};