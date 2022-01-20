<template>
  <div class="the-navbar">
    <div class="the-navbar__main">
      <div v-for="(item, idx) in navbarItems" :key="idx" class="the-navbar__item">
        <router-link :to="item.route">
          <div class="the-navbar__item-title">
            {{ item.title }}
          </div>
        </router-link>
      </div>
    </div>
    <div class="the-navbar__add">
      <div class="the-navbar__item">
        <router-link :to="adminPage.route">
          <div class="the-navbar__item-title">
            {{ adminPage.title }}
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const navbarItems = [
  {
    title: 'Main',
    route: '/',
  },
  {
    title: 'RMS Testing',
    route: '/rms-testing',
  },
  {
    title: 'About',
    route: '/about',
  },
];
const adminPage = {
  title: 'Admin',
  route: '/admin-page',
};
</script>

<style lang="scss">
.the-navbar {
  background-color: white;
  height: 3rem;
  box-shadow: 0px 4px 8px 0px rgba(34, 60, 80, 0.1);
  margin: 0 auto;
  &__main {
    height: 100%;
    display: flex;
    justify-content: center;
  }
  &__item {
    height: 100%;
    &:hover {
      background-color: grey;
    }
    a {
      padding: 0 1rem;
      display: flex;
      text-decoration: none;
      color: inherit;
    }
    display: flex;
  }
  &__item-title {
    margin: auto;
  }
  &__add {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
  }
}
</style>
