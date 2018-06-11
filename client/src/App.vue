<template>
<div id="app">
  <!-- <h2>Chess</h2> -->

  <div v-if="$store.state.connected">
    <button @click="disconnect">Disconnect</button>
    <div v-if="$store.state.outgame">
      <button @click="newGame()">New game</button>
      <div v-for="game in $store.state.games" style="display: flex;">
        <a @click='enterGame(game)'style="flex-direction: row;">
          <h5>{{game.gid}}</h5>
          {{turn(game)}}
        </a>
      </div>
    </div>
    <div v-else>
      <button @click="exitGame()">Back</button>
      <Game></Game>
    </div>
  </div>
  <div v-else>
    <Login v-on:connected="connect"></Login>
  </div>
</div>
</template>

<script>
import Store from './store/store.js';

import Login from './pages/Login'
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
    turn(game){
      return new Chess(game.chess).turn()
    },
    exitGame(){
      this.$store.commit('exitGame')
    },
    enterGame(game){
      this.$store.commit('enterGame', game)
    },
    newGame() {
      this.$store.commit('newGame', {invitation: 'other'})
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
