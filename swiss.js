const vorpal = require('vorpal')()

const { createTournament, loadTournament, nextRound } = require('./swiss-utils')
const context = {}

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
    this.log(nextRound(context.tournament, context.path))
    callback()
  })

vorpal
  .delimiter('♙')
  .show()
