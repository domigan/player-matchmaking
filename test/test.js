let assert = require('assert');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
let server = 'http://localhost:4200';
const rankSpread = 3;

chai.use(chaiHttp);


const player = {
  _id: "5b3e4cf0a6ef1e6c5d7aeabc",
  gamertag: "domigan16",
  rank: 10
};

const badPlayer = {
  _id: "xxxxxxxxx",
  gamertag: "bad_player",
  rank: -1,
  lastOpponent: null
}

describe('Matchmaking API', function() {

  describe('Good Player/Match data', function() {
    it('should return a player with gamertag and rank given an gamertag', function() {
      chai.request(server).get(`/players/gamer/${player.gamertag}`)
        .end((err, res) => {
          if (err) {
            console.log(err);
          }
          res.should.have.status(200);
          res.body.should.have.property('gamertag');
          res.body.should.have.property('rank');
          res.body.should.have.property('_id');
          done();
        });
    });

    it('should return a set of potential opponents given a rank', function() {
      chai.request(server)
        .get(`/match/findOpponents/${player.rank}`)
        .end((err, res) => {
          if (err) {
            console.log(err);
          }

          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.forEach((o) =>{
            expect(o.rank).to.be.above(player.rank - rankSpread);
            expect(o.rank).to.be.below(player.rank + rankSpread);
          });
          done();
        });
    });

    it('should return an opponent for a player given a registered gamertag', function() {
      chai.request(server)
        .get(`/match/findMatch/${player.gamertag}`)
        .end((err, res) => {
          if (err) {
            console.log(err);
          }

          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('gamertag');
          res.body.should.have.property('rank');
          res.body.gamertag.should.not.be(player.gamertag);
          res.body.rank.to.be.above(player.rank - rankSpread);
          res.body.rank.to.be.below(player.rank + rankSpread);
          done();
        });
    });
  });

  describe('Bad Player/Match data', function() {
    it('should return null given a non-existing gamertag', function() {
      chai.request(server).get(`/players/gamer/${badPlayer.gamertag}`)
        .end((err, res) => {
          if (err) console.log(err);
          res.should.have.status(200);
          res.body.should.be(null);
        });
    });

    it('should return an empty given a negative rank', function() {
      chai.request(server)
        .get(`/match/findOpponents/${badPlayer.rank}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          done();
        });
    });

    it('should return null for a player given an unregistered gamertag', function() {
      chai.request(server)
        .get(`/match/findMatch/${badPlayer.gamertag}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be(null);
          done();
        });
    });
  });
});