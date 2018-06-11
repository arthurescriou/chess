import Vue from 'vue';
import Vuex from 'vuex';
const io = require('socket.io-client')

Vue.use(Vuex);

const state = {
  connected: false,
  socket: null,
  uuid: '',
  gid: 0,
  games: [],
  outgame: true,
  login: '',
  users: [],
  allUsers: []

}

const mutations = {
  userConnected(state, users) {
    state.users = users
  },
  connect(state, param) {
    state.socket = io.connect('http://localhost:3000')
    state.login = param.login
    state.uuid = param.uuid
    state.connected = true
    state.socket.on('pool', ret => {
      state.games = ret.pool
    })
    state.socket.emit('user', {
      uuid: param.uuid
    })
    state.socket.on('listUsers', param => {
      store.commit('userConnected', param.listUsers.map(user => {
        return {
          pseudo: user.login,
          uuid: user.uuid
        }
      }))
    })
  },
  disconnect(state) {
    state.socket.disconnect()
    state.connected = false
  },
  newGame(state, param) {
    //uuid of other player
    const other = param.invitation
    state.socket.emit('new-game', {
      uuid: state.uuid,
      invitation: other
    })
  },
  enterGame(state, game) {
    state.gid = game.gid
    state.outgame = false
  },
  exitGame(state){
    state.gid = 0
    state.outgame = true
  }
}
const store = new Vuex.Store({
  state,
  mutations
});
export default store
