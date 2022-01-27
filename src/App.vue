<template>
  <div class="the-app">
    <TheNavBar class="the-app__navbar" />
    <router-view class="the-app__main" />
  </div>
</template>

<script setup>
import TheNavBar from './components/TheNavBar.vue';
</script>

<style lang="scss">
.the-app {
  min-height: 100vh;
  &__navbar {
    position: sticky;
    top: 0;
  }
  &__main {
    width: 80%;
    margin: 1rem auto;
  }
}
</style>
