<template>
<div id="app">
  <h2>Chess</h2>
  <div v-if="connected">
    <button @click="disconnect">Disconnect</button>
    <div v-if="outgame">
      <button @click="newGame">New game</button>
      <div v-for="game in games" style="display: flex;">
        <a @click='enterGame(game)'style="flex-direction: row;">
          <h5>{{game.gid}}</h5>
          {{turn(game)}}
        </a>
      </div>
    </div>
    <div v-else>
      <button @click="exitGame()">Back</button>
      <Game :uuid='uuid' :socket='socket' :gid='gid'></Game>
    </div>
  </div>
  <div v-else>
    <Login v-on:connected="connect"></Login>
  </div>
</div>
</template>

<script>
import Login from './pages/Login'
import Game from './pages/Game'
const io = require('socket.io-client')

import Chess from 'chess.js'

export default {
  name: 'app',
  mounted() {
    this.socket = io.connect('http://localhost:3000')
  },
  data() {
    return {
      outgame: true,
      games: [],
      connected: false,
      string: '',
      message: '',
      socket: null,
      login: '',
      gid: 0,
      uuid: ''
    }
  },
  methods: {
    turn(game){
      console.log(game.chess);
      return new Chess(game.chess).turn()
    },
    exitGame(){
      this.gid = 0
      this.outgame = true
    },
    enterGame(game){
      this.gid = game.gid
      this.outgame = false
      console.log(game.gid);
    },
    newGame() {
      this.socket.emit('new-game', {
        uuid: this.uuid,
        invitation: 'other'
      })
    },
    disconnect() {
      console.log('disconnect');
      this.connected = false
    },
    connect(param) {
      console.log('connect', param.login);
      this.login = param.login
      this.uuid = param.uuid
      this.connected = true
      const zis = this
      this.socket.on('pool', ret => {
        console.log(ret);
        zis.games = ret.pool
      })
      this.socket.emit('user', {
        uuid: param.uuid
      })
    }
  },
  components: {
    Login,
    Game
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
