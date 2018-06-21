const app = require('express')();
const http = require('http').Server(app);

const jwt = require('jsonwebtoken')

const io = require('socket.io')(http);
const WebSocket = require('ws')

const Chess = require('chess.js').Chess;

const games = []
let idCpt = 0
let sessions = []
const users = [
  {
    login: 'example@example.com',
    pseudo : 'Potam',
    uuid: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiYTBkYjY5MjgtOWQxYS00YWI0LTg5ZjItMDBlNTZmNGI3OGNmIiwiaWF0IjoxNTI5MzM0MDYxLCJleHAiOjE1Mjk0MjA0NjF9.jBlquo9nVxn4_NAp8IQj3BvLDqGTNq6F-0J117ZZGLT_ox4aTXrsA4pMqcf7XjlyC7p_uJgT6l9XF9AZ2_glZaQp-8NWbNUXdeNizcHeZ3YTU0XsfFdpiEl3ynJL5FnjUt3rwZioSEFo2oFfiVXghYKc5SiIT32biBO1FQX-Lq8cRpNwK8I__kVoWz3Kecz6ozMJnXn_tPixl-zLbICgdCqyI48dWz5aUi7pBXHOTuMe15gkxZVzmP9rLV-PGeg7mrQ-eIoGm566-W5IW497mr22y-iBLxZSVfNMZ7cd4Iqv6oRJS3BFdy8z4M2lz12TckMrBJeJYM52jmdNq-EuY8VFMWUSVC29fFz6KDc5zZ1G0gx5KFYN_D5XLHCbteHT-AGJjdlVqoye-t7dY-DAFNJNSE00cRVoV1SqXI4EqiQs2YMA9kDb7xr3Ln5eBJ79dP4fCWqN6zXvpkDxK2tWPQ2kbmK8tAwvUpaTAAeME4-caWRDMPt4IT_solcyguoq-JdlA-ZyRVI7aIBfMMGsqo4XEsV9WDhfX4wMXPX_upKj9ttBtSCHKFYs1hqFL77L_YWaARqqrLuZSf9frjqBByfaeMQCdslecblFIyoAy8ecSJvlqrAd0AHP1KjNgXpHkDJ3_MyaBFhvtupcWxiQtnzAekTfoeTYt61ya8rK4Sg'
  },
  {
    login: 'loulou@example.com',
    pseudo: 'Loulou',
    uuid: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNGJhZDAyOTctNmE2NC00ZDZhLTliNzctMDQ4OWY1MmU3NTA4IiwiaWF0IjoxNTI5MzM2NzA2LCJleHAiOjE1Mjk0MjMxMDZ9.nxXtgKxOYPUHDGchPezcHhVrvvFxcrBLDOZk2VErpti7oBmlRheDNrud8j_6qEy77Qk8hh1LbsxizwTaTg-EL2L9usZ1nCthrB2bxpgBOVYRYpJmcAtYQ8MPsBotC66fMEQc6WEUtlt_dfozV2XRIhJ5cY1klXJGXBIeriQmOQ-RCnJW28onHoJoGX_GpVXqneDwOJ2hOe0Fpieliur8ECYLD7a_K-H1Mwnl21DZtY9TefqcascDb4mMYLH7dxZ4iOwrXJjD9TRgGMewjDFbVSKvH7uU3f9PkVStqoRGsVUjstpzJ27e96mCPDdsCN7f_Q_khwsO_vkpPq0Fds7HOAIo4hNuX6iXWwPhcUi9YJq8ImWeXtI4ImZT6ufN8aFiLlOJWD48odmANKjHDLyVHvr-VXzvVGGsga1YygVMonEcmzz3rQX1siQjSwv8kO54sLHByj15rpuciPzhhYieBJtFf3JdoD4_XFn5_njK5rM0vVdPLTH07ltaIdnt5wwz935jgjq0KuS4Jfv48N9e-451ai2aVNgJrL91noGI850Vm-rRzj34w_OUBHhPzQrFiPP6JkPnXjfsGGq3LdkxK5Ax7pdybtuoRZmsZAEm0sziEjiE9AcKkuxoQmjY6UpeeRy8qGTg6xpxRPdYwDiEYFvr38eJWIc9QBn6fOkll2E'
  }
]


app.get('/', function(req, res) {
  res.send(
    {
      games: games.map(game => {
        let niouGame = {}
        niouGame.gid = game.gid
        niouGame.players = game.players
        return niouGame
      }),
      sessions: sessions.map(session =>{
        let niouSession = {}
        niouSession.uuid = session.uuid
        niouSession.gid = session.gid
        return niouSession
      })
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

http.listen(3500, () => {
    console.log('Chess server\nlistening on port 3500');
});

io.on('connection', (socket) => {
    const host = socket.request.headers.host
    console.log('a user connected: ', socket.request.headers.origin)
    socket.on('disconnect', () => {
        console.log('user disconnected: ', host)
        sessions = sessions.filter(session => session.socket!==socket)
        sessions.forEach(session => {
          const uuids = sessions.map(session => session.uuid)
          const listUsers = users.filter(user => uuids.includes(user.uuid))
          session.socket.emit('listUsers', {listUsers})
        })
    });

    socket.on('auth', ({email, password, stayConnected}) => {
        console.log('auth', email);
        let ws = new WebSocket('ws://localhost:3000', {
            perMessageDeflate: false
        })
        ws.on('message', res => {
          const response = JSON.parse(res)
            if(socket.id.localeCompare(response.sender) === 0){
              Object.keys(response).filter(key => key.localeCompare('error')===0 || key.localeCompare('result')===0).forEach(key => socket.emit('auth', response[key]))
            }else{
              console.error('Wrong sender', response.sender)
            }
        })
        ws.on('open', () => {
            const message = {
                version: '1.0.0',
                method: 'signin',
                sender: socket.id,
                params: {
                    email,
                    password,
                    stayConnected
                }
            }
            ws.send(JSON.stringify(message))
        })
    })

    socket.on('user', ({uuid}) => {
      console.log('user', uuid);
      sessions.push({uuid, socket, gid: -1})
      socket.emit('pool', poolUser(uuid))
      sessions.forEach(session => {
        const uuids = sessions.map(session => session.uuid)
        const listUsers = users.filter(user => uuids.includes(user.uuid))
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

    socket.on('pseudo', ({uuid}) => {
      console.log('ici',uuid);
      users.filter(u => u.uuid.localeCompare(uuid)===0).forEach(user => {
        socket.emit('pseudo', {user})
      })
    });

});
