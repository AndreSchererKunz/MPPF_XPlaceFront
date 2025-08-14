<script setup lang="ts">
import { ref } from 'vue';
import { Eye, EyeOff } from 'lucide-vue-next';

import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const showPassword = ref(false);

const username = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();
const errorMessage = ref('');

const login = async () => {
  try {
    await authStore.login(username.value, password.value);
    router.push('/');
  } catch (error) {
    console.log(error)
    errorMessage.value = 'Credenciais inválidas. Tente novamente.';
  }
};
/*
Tenta fazer login com os dados digitados;
Se der certo, vai para a página principal (/);
Se falhar, mostra uma mensagem de erro.
*/

</script>

<template>
  <div class="container">
    <img alt="xplace logo" src="@/assets/logo2.png" class="logo" />
    <h2> Entrar no XPlace</h2>
    <form @submit.prevent="login">
      <div class="input-field">
        <input v-model="username" type="text" placeholder="usuário" />
      </div>
      <div class="input-field password">
        <input :type="showPassword ? 'text' : 'password'" placeholder="senha" v-model="password" />
        <span @click="showPassword = !showPassword" class="toggle-icon">
          <Eye v-if="!showPassword" />
          <EyeOff v-else />
        </span>
      </div>
      <h5>
        <a href="/password"> Esqueci minha senha</a>
      </h5>
      <button type="submit">Entrar</button>
      <h4>Ainda não é registrado? <a href="/register">Registre aqui</a></h4>
    </form>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
  <!--
  Link para recuperar a senha;
  Botão de login;
  Link para criar uma conta;
  Mensagem de erro caso as credenciais estejam incorretas.
  -->
</template>

<style scoped>
.input-field.password {
  position: relative;
}

.toggle-icon {
  opacity: 0.8;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: var(--blue-dust);
}

.error-message {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}

a {
  text-decoration: none;
  font-weight: 800;
  color: var(--brown-mud);
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
  color: var(--brown-mud);

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

  @media screen and (max-width: 900px) {
    background-color: var(--blue-container);
  }
}

h2 {
  margin: 20px;
}
</style>

<!--
Esse componente é a página de login do sistema:
Permite o usuário digitar seu nome e senha;
Faz o login usando um sistema de autenticação (authStore);
Redireciona para a página principal se der certo;
Mostra erro se as credenciais estiverem erradas;
Visual agradável, com suporte a dispositivos móveis.
-->
