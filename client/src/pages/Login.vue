<template>
<div class="login-container">
  <form @submit.prevent="auth()">
    <input type="text" v-model="login"></input>
    <input type="password" v-model="password"></input>
    <input type="checkbox" v-model="stayConnected"></input>
    <input type="submit" @click="" value="connect"></input>
  </form>
</div>
</template>

<script>
export default {
  data() {
    return {
      login: '',
      password: '',
      stayConnected: false
    }
  },
  methods: {
    auth() {
      this.$store.commit('connect', {
        email: this.login,
        password: this.password,
        stayConnected: this.stayConnected
      })
    }
  }
}
</script>

<style lang="css">
</style>
