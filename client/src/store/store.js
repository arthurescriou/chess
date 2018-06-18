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
  allUsers: [],
  error: ''

}

const mutations = {
  pool(state, ret){
    ret.pool.forEach(game => {
      const players = [game.players.w, game.players.b]
      players.filter(uuid =>
              !state.allUsers
                .map(user => user.uuid).includes(uuid))
                .forEach(uuid => state.socket.emit('pseudo', {uuid}))
    })
    state.games = ret.pool
  },
  pseudo(state, param) {
    if (state.allUsers.filter(u => u.uuid.localeCompare(param.user.uuid) === 0).length === 0) {
      state.allUsers.push(param.user)
    }
  },
  userConnected(state, users) {
    state.users = users
    state.users.forEach(user => {
      store.commit('pseudo', {user: {uuid: user.uuid, login: user.pseudo}})
    })
  },
  connect(state, param) {
    state.socket = io.connect('http://localhost:3500')
    // state.uuid = param.uuid
    state.socket.emit('auth', param)
    state.socket.on('auth', ret => {
      console.log(ret);
      if (Object.keys(ret).includes('error')) {
        state.error = ret.error
      } else {
        state.login = param.email
        state.uuid = ret.uuid
        state.connected = true
        state.socket.emit('user', {
          uuid: ret.uuid
        })
      }
    })
    state.socket.on('pool', ret => {
      state.games = ret.pool
    })
    state.socket.on('listUsers', param => {
      store.commit('userConnected', param.listUsers.map(user => {
        return {
          pseudo: user.login,
          uuid: user.uuid
        }
      }))
    })
    state.socket.on('pseudo', (param) => {
      store.commit('pseudo', param)
    })
  },
  disconnect(state) {
    state.socket.disconnect()
    state.connected = false
  },
  newGame(state, param) {
    state.socket.emit('new-game', {
      uuid: state.uuid,
      invitation: param.invitation
    })
  },
  enterGame(state, game) {
    state.gid = game.gid
    state.outgame = false
  },
  exitGame(state) {
    state.gid = 0
    state.outgame = true
  }
}
const store = new Vuex.Store({
  state,
  mutations
});
export default store
