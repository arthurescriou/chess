<template>
<div id="app">
  <h2>Chess</h2>
  <h3>{{message}}</h3>
  <div style="text-align: center;">
    <h2 v-if="chess.game_over()">FINI</h2> {{chess.turn()}}
    <div style="display: flex;">
      <div v-for="move, i in chess.moves()" style="flex-direction: row;">
        <button @click="socket.emit('play', move)">{{move}}</button>
      </div>
    </div>
    <div style="font-family: monospace; whitespace: pre;">
      <div v-for="line, i in string.split('\n')">
        <div v-for="square, i in line" style="flex-direction: row;" class="case">
          <!-- {{square}} -->
        </div>
        {{line}}
      </div>
    </div>
    <input type="text" v-model="move"></input>
    <button @click="send()">Send</button>
  </div>
</div>
</template>

<script>
import Chess from 'chess.js'
const io = require('socket.io-client')

export default {
  name: 'app',
  mounted() {
    let socket = io.connect('http://localhost:3000')
    this.socket = socket
    socket.on('chess', (chess) => {
      this.chess.load(chess)
      this.string = this.chess.ascii()
    })
  },
  data() {
    return {
      string: '',
      chess: new Chess(),
      message: 'placeholder',
      socket: null,
      move: ''
    }
  },
  methods: {
    send() {
      this.socket.emit('play', this.move)
    }
  }
}
</script>

<style>
.wrapper {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-gap: 10px;
  grid-auto-rows: minmax(100px, auto);
}

.case {
  grid-column: 1;
  grid-row: 1;
}
</style>
