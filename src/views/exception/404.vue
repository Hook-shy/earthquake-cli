<template>
  <a-result status="404" title="404" sub-title="抱歉，您访问的页面不存在。">
    <template #extra>
      <router-link to="/home">
        <a-button type="primary">
          回到首页
        </a-button>
      </router-link>
    </template>
  </a-result>
</template>

<script>
export default {
name: "404"
}
</script>

<style scoped>

</style>