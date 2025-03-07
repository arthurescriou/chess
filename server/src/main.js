const app = require('express')();
const http = require('http').Server(app);

const io = require('socket.io')(http);

const Chess = require('chess.js').Chess;

const games = []
let idCpt = 0
let sessions = []
const users = [
  {
    login: 'Potam',
    uuid: 'admin'
  },
  {
    login: 'Loulou',
    uuid: 'other'
  }
]

app.get('/', function(req, res) {
  res.send(
    {
      games: games.map(game => Object.keys(game).filter(key => key.localeCompare('chess')!==0).map(key=>game[key])),
      sessions: sessions.map(session =>  Object.keys(session).filter(key => key.localeCompare('socket')!==0).map(key=>session[key]))
     });
});

const checkTurn = (uuid, game) => {
    return game.players[game.chess.turn()].localeCompare(uuid) === 0
}

const userGame = (uuid) => {
    return games.filter(game => game.players.w.localeCompare(uuid)===0 || game.players.b.localeCompare(uuid)===0)
}

const sessionUser = (socket) => {
  return sessions.filter(session => session.socket===socket)[0]
}

const sessionGame = (game) => {
  return sessions.filter(session => session.uuid.localeCompare(game.players.w)===0 || session.uuid.localeCompare(game.players.b)===0)
}

const poolUser = (uuid) => {
    return {
        pool: userGame(uuid)
            .map(game => {
                return {
                    gid: game.gid,
                    players: game.players,
                    chess: game.chess.fen()
                }
            })
    }
}

http.listen(3000, () => {
    console.log('listening on port 3000');
});

io.on('connection', (socket) => {
    const host = socket.request.headers.host
    console.log('a user connected: ', socket.request.headers.origin)
    socket.on('disconnect', () => {
        console.log('user disconnected: ', host)
        sessions = sessions.filter(session => session.socket!==socket)
        sessions.forEach(session => {
          const uuids = sessions.map(session => session.uuid)
          console.log(uuids, session.uuid);
          const listUsers = users.filter(user => uuids.includes(user.uuid))
          console.log(listUsers);
          session.socket.emit('listUsers', {listUsers})
        })
    });

    socket.on('user', ({uuid}) => {
        sessions.push({uuid, socket, gid: -1})
        console.log(uuid);
        socket.emit('pool', poolUser(uuid))
        sessions.forEach(session => {
          const uuids = sessions.map(session => session.uuid)
          console.log(uuids, session.uuid);
          const listUsers = users.filter(user => uuids.includes(user.uuid))
          console.log(listUsers);
          session.socket.emit('listUsers', {listUsers})
        })
    });


    socket.on('new-game', ({uuid, invitation}) => {
      console.log('new game ', {uuid, invitation})

        const niouGame = {
          gid: idCpt++,
          players :{
            w: uuid,
            b: invitation
          },
          chess: new Chess()
        }
        games.push(niouGame)
        sessions.filter(session => session.uuid.localeCompare(uuid)===0 || session.uuid.localeCompare(invitation)===0)
        .forEach(session => {
          session.socket.emit('pool', poolUser(session.uuid))
        })
    });

    socket.on('game', ({uuid, gid}) => {
        sessionUser(socket).gid = gid
        console.log('game', {uuid, gid});
        games.filter(game => game.gid === gid && (game.players.w.localeCompare(uuid) === 0 || game.players.b.localeCompare(uuid) === 0)).forEach(game => {
          console.log(uuid, game.gid);
          socket.emit('chess', game.chess.fen())
        })
    })


    socket.on('play', ({uuid, gid, move}) => {
        console.log('move', {uuid, gid, move})
        games
        .filter(game => game.gid === gid)
        .filter(game => game.players.w.localeCompare(uuid)===0 || game.players.b.localeCompare(uuid)===0)
        .forEach(game => {
          if (checkTurn(uuid, game)) {
              game.chess.move(move)
              sessionGame(game)
                  .forEach(session => {
                      if (session.gid === gid) {
                          session.socket.emit('chess', game.chess.fen())
                      }
                      session.socket.emit('pool', poolUser(session.uuid))
                  })
          }
        })

    });

    socket.on('allUsers', () => {
      console.log('allUsers')
      let listUsers = users
        socket.emit('allUsers', {listUsers})
    });



});
