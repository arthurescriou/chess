const app = require('express')();
const http = require('http').Server(app);

const io = require('socket.io')(http);

const Chess = require('chess.js').Chess;
const chess = new Chess();

console.log(chess.ascii())
http.listen(3000, () => {
  console.log('listening on port 3000');
});

io.on('connection', (socket) => {
  const host = socket.request.headers.host
  console.log('a user connected: ', socket.request.headers.origin)
  socket.emit('chess', chess.fen())
  socket.on('disconnect', () => {
    console.log('user disconnected: ', host)
  });

  socket.on('play', (move) => {
    console.log('move', move)
    chess.move(move)
    console.log(chess.ascii())
    socket.emit('chess', chess.fen())
  });

});
