<template>
  <div>
    <a-menu v-model="current" mode="horizontal">
      <a-menu-item key="home">
        <router-link to="/home">
          <a-icon type="dashboard"/>
          首页
        </router-link>
      </a-menu-item>
      <a-menu-item key="recent">
        <router-link to="/recent">
          <a-icon type="clock-circle"/>
          最近
        </router-link>
      </a-menu-item>
      <a-menu-item key="rise">
        <router-link to="/rise">
          <a-icon type="rise"/>
          历史变化
        </router-link>
      </a-menu-item>
      <a-menu-item key="search">
        <router-link to="/search">
          <a-icon type="search"/>
          历史查询
        </router-link>
      </a-menu-item>
      <a-menu-item key="book">
        <router-link to="/book">
          <a-icon type="book"/>
          知识库
        </router-link>
      </a-menu-item>
    </a-menu>
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: "navView",
  data() {
    return {
      current: ['home'],
    }
  },
  mounted() {
    this.current = [this.$route.name]
  }
}
</script>

<style scoped>

</style>