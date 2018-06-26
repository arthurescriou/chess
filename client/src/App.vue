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
    <Login></Login>
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
        this.$store.state.socket.emit('pseudo', {uuid})
        return 'unknown'
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
        invitation: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNGJhZDAyOTctNmE2NC00ZDZhLTliNzctMDQ4OWY1MmU3NTA4IiwiaWF0IjoxNTI5MzM2NzA2LCJleHAiOjE1Mjk0MjMxMDZ9.nxXtgKxOYPUHDGchPezcHhVrvvFxcrBLDOZk2VErpti7oBmlRheDNrud8j_6qEy77Qk8hh1LbsxizwTaTg-EL2L9usZ1nCthrB2bxpgBOVYRYpJmcAtYQ8MPsBotC66fMEQc6WEUtlt_dfozV2XRIhJ5cY1klXJGXBIeriQmOQ-RCnJW28onHoJoGX_GpVXqneDwOJ2hOe0Fpieliur8ECYLD7a_K-H1Mwnl21DZtY9TefqcascDb4mMYLH7dxZ4iOwrXJjD9TRgGMewjDFbVSKvH7uU3f9PkVStqoRGsVUjstpzJ27e96mCPDdsCN7f_Q_khwsO_vkpPq0Fds7HOAIo4hNuX6iXWwPhcUi9YJq8ImWeXtI4ImZT6ufN8aFiLlOJWD48odmANKjHDLyVHvr-VXzvVGGsga1YygVMonEcmzz3rQX1siQjSwv8kO54sLHByj15rpuciPzhhYieBJtFf3JdoD4_XFn5_njK5rM0vVdPLTH07ltaIdnt5wwz935jgjq0KuS4Jfv48N9e-451ai2aVNgJrL91noGI850Vm-rRzj34w_OUBHhPzQrFiPP6JkPnXjfsGGq3LdkxK5Ax7pdybtuoRZmsZAEm0sziEjiE9AcKkuxoQmjY6UpeeRy8qGTg6xpxRPdYwDiEYFvr38eJWIc9QBn6fOkll2E'
      })
    },
    disconnect() {
      this.$store.commit('disconnect')
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
body {
font-family: "code";

}
</style>
