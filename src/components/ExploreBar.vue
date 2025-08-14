<script setup lang="ts">

import PostList from './PostList.vue';

</script>

<template>
  <div class="container-post">
    <div class="header">
      <h3>Explorar</h3>
    </div>
    <div>
      <PostList />
    </div>
  </div>
</template>

<style scoped>
.header {
  max-width: 100%;
  margin: 8px 8px;
}

.header h3 {
  font-family: Inter;
  font-weight: 800;
  color: #1e355e;
  font-size: 24px;
}
</style>
