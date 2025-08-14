<script setup lang="ts">
import { ref } from 'vue'

const email = ref('') /*Email: armazena o e-mail digitado.*/
const message = ref('') /*Message: mensagem de feedback (sucesso ou erro).*/
const error = ref(false) /*Error: controla a cor do texto da message.*/

const requestNewPassword = async () => {
  try {
    console.log('Email enviado:', email.value)
    /*Exibe o e-mail no console para debug.*/

    const response = await fetch('https://mpfback-twitterclone.onrender.com/forgot-password/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.value }),
    })
    /*Envia o e-mail para o backend via POST.*/

    const data = await response.json()
    /*Lê a resposta como JSON.*/

    if (response.ok) {
      message.value = data.message || 'Nova senha enviada para seu e-mail.'
      error.value = false
    } else {
      message.value = data.error || 'Erro ao enviar a nova senha. Entre em contato com o administrador do site.'
      error.value = true
    }
  } catch (err) {
    console.error(err)
    message.value = 'Erro de conexão. Tente novamente mais tarde.'
    error.value = true
  }
}
</script>

<template>
  <div class="container">
    <img alt="logo" src="@/assets/logo2.png" class="logo" />
    <h2> Entrar no XPlace</h2>
    <form @submit.prevent="requestNewPassword">
      <div class="input-field">
        <input type="text" placeholder="email" v-model="email" />
      </div>
      <button type="submit">Enviar</button>
      <h5 v-if="message" :style="{ color: error ? 'red' : 'green' }">{{ message }}</h5>
      <h4><a href="/login">Voltar</a></h4>
    </form>
  </div>
</template>

<style scoped>
a {
  text-decoration: none;
  font-weight: 800;
  color: var(--blue-midnight);
}

.input-field {
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  border: 2px solid var(--blue-cream);
  background-color: var(--blue-background);
  height: 50px;
  width: 300px;
  margin-top: 20px;
}

h4 {
  color: var(--blue-midnight);
  font-size: 14px;
  font-weight: 500;
  margin-top: 8px;
}

h5 {
  color: var(--blue-midnight);
  font-size: 12px;
  font-weight: 500;
  align-self: flex-end;
  margin-right: 20px;
  margin-top: 4px;
}

input {
  height: 100%;
  background-color: transparent;
  border: none;
  outline: none;
  color: var(--blue-dust);
  font-weight: 400;
  font-size: 20px;
  align-items: center;
  text-align: center;
  justify-content: center;
}

h2 {
  color: var(--blue-midnight);
}

button {
  background-color: var(--blue-sky);
  border: none;
  width: 60%;
  height: 40px;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 40px;
  color: var(--blue-cream);
}

button:hover {
  background-color: var(--blue-accent);
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  height: 100px;
  width: 100px;
  margin-top: 40px;
}

.container {
  height: 600px;
  width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--blue-background);
  border-radius: 16px;
}

h2 {
  margin: 20px;
}
</style>
