// routes/index.js
const playerRoutes = require('./player_routes');
const matchRoutes = require('./match_routes');

module.exports = function(app, db) {
  playerRoutes(app, db);
  matchRoutes(app, db);
};