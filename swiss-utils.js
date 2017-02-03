const shuffle = require('shuffle-array')
const fs = require('fs')

function randomizedMatches(players) {
  const matches = []
  const shuffledPlayers = shuffle(players)

  for (i = 1; i < players.length; i += 2) {
    matches.push({ white: players[i], black: players[i-1] })
  }

  return matches
}

function buildRound(players, previousRounds = []) {
  if (players.length < 2) {
    throw new Error('Need at least two players')
  }

  if (previousRounds.length === 0) {
    return randomizedMatches(players)
  }

  throw new Error('WIP: Build rounds based on previous results')
}

function createTournament(path, players, numberOfRounds, callback) {
  const tournament = {
    players,
    numberOfRounds,
    rounds: []
  }

  writeTournament(path, tournament, err => {
    if (err) {
      return callback(err)
    }

    callback(null, tournament)
  })
}

function writeTournament(path, tournament, callback = () => {}) {
  fs.writeFile(path, JSON.stringify(tournament), err => {
    if (err) {
      return callback(err)
    }

    callback(null, tournament)
  })
}

function loadTournament(path, callback) {
  fs.readFile(path, (err, contents) => {
    if (err) {
      return callback(err)
    }

    callback(null, JSON.parse(contents))
  })
}

function nextRound(tournament, path) {
  if (tournament.rounds.length > 0) {
    return tournament.rounds[tournament.rounds.length - 1]
  }

  const firstRound = buildRound(tournament.players)

  tournament.rounds = [firstRound]
  writeTournament(path, tournament)

  return firstRound
}

module.exports = {
  buildRound,
  createTournament,
  loadTournament,
  nextRound
}
