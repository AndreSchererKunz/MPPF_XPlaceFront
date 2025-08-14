<script setup lang="ts">
import { RouterLink } from 'vue-router'

</script>

<template>
  <div class="container-group">
    <div class="container">
      <img alt="XPlace logo" src="@/assets/welcome.png" class="welcome-img" />
      <h2>Bem-vindo ao <b>XPlace</b>!</h2>
      <p class="texto">Uma rede de microblog inspirada no Twitter.</p>
    </div>
    <div class="container">
      <h2>O que você deseja fazer?</h2>
      <RouterLink to="/login" class="button">Entrar</RouterLink>
      <RouterLink to="/register" class="button">Registrar</RouterLink>
    </div>

  </div>
</template>

<style scoped>
.texto {
  text-align: center;
  margin: 0 50px;
}

h2 {
  text-align: center;
  margin: 0 50px;
}

.welcome-img {
  height: 300px;
  width: 300px;
  border-radius: 25%;
}

.container-group {
  display: flex;
  width: 100vw;
  height: 100vh;

  @media screen and (max-width: 900px) {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
  }
}

.container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @media screen and (max-width: 900px) {
    height: 200vh;
    width: 100%;
    align-items: center;
    justify-content: center;
    padding-bottom: 20px;
  }
}

h2 {
  color: var(--blue-midnight);
  font-size: 30px;
  margin-bottom: 8px;
}

p {
  color: var(--blue-accent);
  font-weight: 400;
  font-size: 16px;
  line-height: 18px;
  text-align: center;
  margin-top: 8px;
  white-space: normal;
}

.button {
  display: flex;
  background-color: var(--blue-sky);
  border: none;
  width: 60%;
  height: 40px;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 40px;
  color: var(--light-cream);
  text-align: center;
  text-decoration: none;
  align-items: center;
  justify-content: center;
}

.button:hover {
  background-color: var(--blue-accent);
}

.logo {
  height: 100px;
  width: 100px;
  margin-top: 40px;
}
</style>
