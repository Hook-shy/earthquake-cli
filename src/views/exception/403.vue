<template>
  <a-result status="403" title="403" sub-title="抱歉，您无权访问此页。">
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
  name: "403"
}
</script>

<style scoped>

</style>