<template>
<div id="app">
  <!-- <h2>Chess</h2> -->
  <div v-if="$store.state.connected">
    <button @click="disconnect">Disconnect</button>
    <div v-if="$store.state.outgame">
      <button @click="newGame()">New game</button>
      <div v-for="game in $store.state.games">
        <a @click='enterGame(game)'>
          <h5 style="display: flex;">
            <div style="flex-direction: row;">Game #{{game.gid}}</div>
            <div style="flex-direction: row; margin-left: 30px;">
              {{turn(game)}}
            </div>
          </h5>
        </a>
      </div>
    </div>
    <div v-else>
      <button @click="exitGame()">Back</button>
      <Game></Game>
    </div>
    <Users></Users>
  </div>
  <div v-else>
    <Login v-on:connected="connect"></Login>
  </div>
</div>
</template>

<script>
import Store from './store/store.js';

import Login from './pages/Login'
import Users from './pages/Users'
import Game from './pages/Game'

import Chess from 'chess.js'

export default {
  store: Store,
  name: 'app',
  mounted() {

  },
  data() {
    return {}
  },
  methods: {
    turn(game) {
      const uuid = game.players[new Chess(game.chess).turn()]
      const ret = this.$store.state.allUsers.filter(user => user.uuid.localeCompare(uuid) === 0)
      if(ret.length === 1){
        return ret[0].login
      } else {
        state.socket.emit('pseudo', {uuid})
      }
    },
    exitGame() {
      this.$store.commit('exitGame')
    },
    enterGame(game) {
      this.$store.commit('enterGame', game)
    },
    newGame() {
      this.$store.commit('newGame', {
        invitation: 'other'
      })
    },
    disconnect() {
      this.$store.commit('disconnect')
    },
    connect(param) {
      this.$store.commit('connect', param)
    }
  },
  components: {
    Login,
    Game,
    Users
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
