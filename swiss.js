const vorpal = require('vorpal')()

const {
  createTournament,
  loadTournament,
  currentRound,
  unfinishedMatches,
  saveResult
} = require('./swiss-utils')

const context = {}

function printMatch(match) {
  const whitePlayer = `${match.white} [White]`
  const blackPlayer = `${match.black} [Black]`
  const winnerText = match.winner ? ` - [Winner: ${match.winner}]` : ''

  return `${whitePlayer} vs. ${blackPlayer}${winnerText}`
}

vorpal
  .command('new <path>', 'Creates a new tournament and saves it at the given path')
  .action(function(args, callback) {
    this.log(`Creating new tournament, saving in ${args.path}`)

    this.prompt([{
      name: 'players',
      message: 'Write the player names, separated by colons: '
    }, {
      name: 'numberOfRounds',
      message: 'How many rounds? '
    }], result => {
      const players = result.players.split(',')
      context.path = args.path

      this.log(`Got it, the players are\n${players.map(n => `> ${n}`).join('\n')}\nAnd will play for ${result.numberOfRounds} rounds.`)

      createTournament(context.path, players, result.numberOfRounds, (err, tournament) => {
        if (err) {
          return callback(err)
        }

        context.tournament = tournament
        callback()
      })
    })
  })

vorpal
  .command('load <path>', 'Loads an existing tournament')
  .action(function(args, callback) {
    context.path = args.path
    loadTournament(context.path, (err, tournament) => {
      if (err) {
        return callback(err)
      }

      context.tournament = tournament
      this.log('Tournament loaded')
      callback()
    })
  })

vorpal
  .command('round', 'Shows the current round for the loaded tournament')
  .action(function(args, callback) {
    this.log(currentRound(context.tournament, context.path).map(printMatch).join('\n'))
    callback()
  })

vorpal
  .command('result', 'Load a result for the current round')
  .action(function(args, callback) {
    const round = currentRound(context.tournament)

    this.prompt([{
      name: 'matchId',
      message: 'Which match?',
      type: 'list',
      choices: unfinishedMatches(round).map(match => {
        return {
          name: `${match.white} [White] vs ${match.black} [Black]`,
          value: match.id
        }
      })
    }, {
      name: 'winner',
      message: 'And who won?',
      type: 'list',
      choices: ['White', 'Black', 'Tie']
    }], result => {
      saveResult(context.tournament, context.path, result.matchId, result.winner)
      this.log('Result saved')

      callback()
    })
  })

vorpal
  .delimiter('♙ :')
  .show()
