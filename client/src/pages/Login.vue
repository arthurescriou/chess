<template>
<div class="login-container">
  <form @submit.prevent="auth()">
    <input type="text" v-model="login"></input>
    <input type="text" v-model="password"></input>
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
    }
  },
  methods: {
    auth() {
      const login = this.login
      this.$emit('connected', {
        login,
        uuid: this.password
      })
    }
  }
}
</script>

<style lang="css">
</style>
