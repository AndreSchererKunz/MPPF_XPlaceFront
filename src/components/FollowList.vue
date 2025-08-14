<script setup lang="ts">

import { ref, onMounted, watch } from 'vue'
import api from '../services/api.js'
import { useRoute } from 'vue-router'
import loader from '../assets/loader.gif'
import { useAuthStore } from '@/stores/auth.js'

interface User {
  id: number;
  name: string;
  username: string;
  avatar: string;
} /* Define a estrutura esperada dos dados de usuário. */

const isLoading = ref(true) /* Exibe spinner de carregamento. */
const route = useRoute()  /* Dados da rota atual. */
const authStore = useAuthStore()  /* Acesso ao token de autenticação. */
const users = ref<User[]>([]) /* Lista de usuários carregados. */
const errorMessage = ref('')  /* Mensagem de erro. */

const fetchUsers = async () => {
  isLoading.value = true
  const MIN_LOADING_TIME = 2000
  const delay = new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME))
  /* Garante que o loader fique visível por pelo menos 2 segundos, mesmo que a requisição seja rápida. */

  try {
    const token = authStore.accessToken
    errorMessage.value = ''

    let endpoint = '/api/users/profile'
    const username = route.params.username as string

    if (route.name === 'followers') {
      endpoint = `/api/users/profile/${username}/followers/`
    }
    if (route.name === 'following') {
      endpoint = `/api/users/profile/${username}/following/`
    }
    /* Define dinamicamente o endpoint da API com base na rota. */

    const [response] = await Promise.all([
      api.get(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      delay
    ])  /* Espera tanto o tempo mínimo quanto a resposta da API. */

    users.value = response.data.results || []
    nextPageUrl.value = response.data.next || null
  } catch (error) {
    console.error("Erro ao buscar usuários: ", error)
    errorMessage.value = 'Erro ao carregar usuários. Tente novamente mais tarde.'
  } finally {
    isLoading.value = false
  }
  /*
  Atualiza a lista de usuários.
  Trata erros de rede ou autenticação.
  Finaliza o loading em qualquer cenário.
  */
}

onMounted(fetchUsers)
watch(() => route.fullPath, () => {
  fetchUsers()
})
/*Executa fetchUsers() ao montar o componente.
Reexecuta ao mudar a rota (ex: de followers para following).*/

defineExpose({
  refresh: fetchUsers
})  /* Permite que o componente pai chame manualmente refresh(). */

const nextPageUrl = ref<string | null>(null)
const sentinel = ref<HTMLElement | null>(null)

</script>

<template>
  <h2 v-if="route.name === 'followers'"> Seguidores</h2>
  <h2 v-if="route.name === 'following'"> Seguindo</h2>
  <div class="container">
    <div v-if="isLoading" class="loading-wrapper">
      <img :src="loader" alt="Carregando..." class="loading-img" />
    </div>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    <div v-else-if="users.length === 0 && !isLoading" class="no-posts">
      <img src="../assets/sleep3.png" class="no-posts-img" alt="Balao mostrando ZZZ" />
      <span>Ninguém por aqui....</span>
    </div>
    <ul v-else-if="!isLoading" class="users-list">
      <li v-for="user in users" :key="user.id">
        <router-link :to="`/profile/${user.username}`" class="card-add-list">
          <div class="profile-feat">
            <img :src="user.avatar" alt="user" class="avatar-feat" />
            <div class="user-group">
              <h3>{{ user.name }}</h3>
              <h4>@{{ user.username }}</h4>
            </div>
          </div>
        </router-link>
      </li>
    </ul>
    <div ref="sentinel" v-show="nextPageUrl"></div>
  </div>
  <!--
  Título com base na rota;
  Imagem de loading;
  Mensagem de erro;
  Mensagem de “ninguém por aqui” se a lista estiver vazia;
  Lista de usuários com link para o perfil.
  -->

</template>

<style scoped>
h2 {
  color: var(--blue-midnight);
  margin: 8px 24px;
}

.card-add-list {
  padding-top: 8px;
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
  text-decoration: none;
  cursor: pointer;
  color: inherit;
}

.profile-feat {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border-radius: 8px;
}

.profile-feat:hover {
  background-color: var(--blue-sky);
}

.user-group {
  display: flex;
  padding: 8px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  line-height: 18px;
  gap: 4px;
}

li {
  width: 100%;
}

.user-group h4 {
  font-size: 12px;
}

.avatar-feat {
  height: 40px;
  width: 40px;
  object-fit: cover;
  border-radius: 50%;
}

.container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.users-list {
  height: auto;
  width: 100%;
  padding-top: 8px;
  overflow-x: hidden;
  padding: 10px 30px;
  margin: 8px;
}

.repost-info {
  font-size: 12px;
  color: var(--blue-sky);
  font-weight: 500;
  white-space: nowrap;
}

.repost-icon {
  height: 15px;
  width: 15px;
  flex-shrink: 0;
}

.repost {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
}

.no-posts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.no-posts-img {
  margin-top: 40px;
  height: 250px;
  width: 250px;
  border-radius: 20%;
}

.loading-wrapper {
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-wrapper img {
  height: 75px;
  width: 75px;
}

.card {
  width: 100%;
  margin-top: 8px;
  border-bottom: 1px solid var(--blue-background);
  padding-bottom: 8px;
  padding-right: 8px;
  display: flex;
}

small {
  font-size: 10px;
}

ul {
  max-height: 500px;
  overflow-y: auto;
}

.avatar-img {
  margin: 8px 16px;
  height: 70px;
  width: 70px;
  object-fit: cover;
  border-radius: 50%;

  @media screen and (max-width:900px) {
    height: 40px;
    width: 40px;
  }
}

.title {
  display: flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
}

.title h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--blue-midnight);
}

.title h4 {
  font-size: 14px;
  color: var(--blue-sky);
  font-weight: 400;
}

.content {
  width: 0;
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
}

.post {
  padding-bottom: 8px;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.actions {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 20px;
}

.icon-set {
  display: flex;
  align-items: center;
  gap: 0px;
}

.icon-set-trash {
  position: absolute;
  top: 0;
  right: 0;
}

.icon-post {
  height: 15px;
  width: 15px;
  margin-right: 8px;
  cursor: pointer;
  transition: transform 0.1s ease-in-out;
}

.repost {
  height: 20px;
  width: 20px;
}

.icon-post:hover {
  transform: scale(1.5);
}
</style>
