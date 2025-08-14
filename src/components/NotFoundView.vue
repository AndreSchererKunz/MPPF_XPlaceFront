<script setup lang="ts">
</script>

<template>
  <div class="container">
    <img src="@/assets/404.png" class="img-404" />
    <h3>erro 404</h3>
    <p class="text-lg">não tem nada aqui</p>
    <RouterLink to="/" class="button-link button">
      voltar
    </RouterLink>
  </div>
</template>

<style scoped>
.button-link {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.back {
  text-decoration: none;
  color: inherit;
}

.button {
  background-color: var(--blue-sky);
  border: none;
  width: 70%;
  height: 40px;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 40px;
  color: var(--blue-cream);
  text-align: center;
  align-items: center;
  align-content: center;
  text-decoration: none;
}

.button:hover {
  background-color: var(--blue-accent);
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.img-404 {
  width: 300px;
  height: 300px;
}
</style>
