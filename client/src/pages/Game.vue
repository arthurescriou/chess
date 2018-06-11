<template lang="html">
  <div style="text-align: center;">
    <h2 v-if="chess.game_over()">FINI</h2> {{chess.turn()}}
    <div style="display: flex;">
      <div v-for="move, i in chess.moves()" style="flex-direction: row;">
        <button @click="send(move)">{{move}}</button>
      </div>
    </div>
    <div v-for="line, i in string.split('\n')">
      <div style="font-family: monospace; whitespace: pre;">
        {{line}}
      </div>
    </div>
    <input type="text" v-model="move"></input>
    <button @click="send(move)">Send</button>
  </div>
</template>

<script>
import Chess from 'chess.js'

export default {
  mounted() {
    this.$store.state.socket.on('chess', (chess) => {
      this.chess.load(chess)
      this.string = this.chess.ascii()
    })
    this.$store.state.socket.emit('game', {uuid: this.$store.state.uuid, gid: this.$store.state.gid})
  },
  data() {
    return {
      move: '',
      string: '',
      chess: new Chess()
    }
  },
  methods: {
    send(move) {
      this.$store.state.socket.emit('play', {uuid: this.$store.state.uuid, gid: this.$store.state.gid, move})
    }
  }
}
</script>

<style lang="css">
</style>
