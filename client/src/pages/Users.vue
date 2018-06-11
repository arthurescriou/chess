<template lang="html">
<div>
  <div v-for="user in $store.state.users">
    {{user.pseudo}}
  </div>
</div>
</template>

<script>
export default {}
</script>

<style lang="css">
</style>
