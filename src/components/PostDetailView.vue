<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useRoute } from 'vue-router'
import api from '../services/api.js'
import PostList from './PostList.vue'
const route = useRoute()
const authStore = useAuthStore()

const username = computed(() => route.params.username as string)

/* Objeto reativo que armazena os dados retornados da API. */
const userData = ref({
  first_name: '',
  last_name: '',
  avatar: '/default-avatar.png',
  followers_count: 0,
  following_count: 0,
  is_me: false,
  is_following: false
})

/* Função para buscar informações do usuário. */
const fetchUserData = async () => {
  try {
    const response = await api.get(`/api/users/profile/${username.value}/`, {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    })
    userData.value = response.data
  } catch (error) {
    console.error('Erro ao buscar informações do usuário:', error)
  }
}

watch(
  () => route.params.username,
  () => {
    fetchUserData()
  },
  { immediate: true }
) /* Toda vez que a rota mudar (ex: outro perfil), busca novamente os dados.
{ immediate: true }: executa logo na primeira vez.*/

console.log(userData.value.is_me)

interface User {
  id: number;
  name: string;
  username: string;
  avatar: string;
}

const toggleFollow = async () => {
  const username = computed(() => route.params.username as string)
  const userResponse = await api.get(`/api/users/?username=${username.value}`)
  const user = userResponse.data.find((u: User) => u.username === username.value)
  if (!user) {
    console.error('Usuário não encontrado com esse username.')
    return
  }
  const userId = user.id
  await api.post(`/api/users/${userId}/follow/`, {}, {
    headers: { Authorization: `Bearer ${authStore.accessToken}` }
  })
  await fetchUserData()
} /* Encontra o id do usuário pelo username;
  Chama a API de seguir/desseguir;
  Atualiza os dados depois da ação. */

const editProfile = () => {
  console.log("Editar")
}

const first_name = computed(() => userData.value.first_name || 'Nome')
const last_name = computed(() => userData.value.last_name || 'Nome')
const avatar = computed(() => userData.value.avatar || '/default-avatar.png')
const followers_count = computed(() => userData.value.followers_count || 0)
const following_count = computed(() => userData.value.following_count || 0)

</script>

<template>
  <div class="container-post">
    <div class="header-image">
      <div class="card">
        <div class="avatar-container">
          <img :src="avatar" class="avatar-image" alt="Avatar do usuário" />
        </div>
        <div class="details">
          <div>
            <h2>{{ first_name }} {{ last_name }}</h2>
            <h4>@{{ username }}</h4>
          </div>
          <div class="stats">
            <div>
              <h2>{{ following_count }}</h2>
              <h4>seguindo</h4>
            </div>
            <div>
              <h2>{{ followers_count }}</h2>
              <h4>seguidores</h4>
            </div>
          </div>
          <div>
            <!-- Botões de ação do usuário -->
            <img src="../assets/user-pen.png" v-if="userData.is_me" @click="editProfile" class="icon-action"
              alt="Editar" />
            <img src="../assets/user-add.png" v-else-if="!userData.is_following" @click="toggleFollow"
              class="icon-action" alt="Seguir" />
            <img src="../assets/user-trust.png" v-else @click="toggleFollow" class="icon-action"
              alt="Deixar de seguir" />
          </div>
        </div>
      </div>
    </div>
    <div>
      <PostList />
    </div>
  </div>
</template>

<style scoped>
.icon-action {
  height: 25px;
  width: 25px;
  transition: transform 0.1s ease-in-out;
  cursor: pointer;
}

.icon-action:hover {
  transform: scale(1.5);
}

.header-image {
  height: 150px;
  background-color: var(--blue-sky);
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  display: flex;
  padding: 20px;
}

.card {
  align-items: center;
  display: flex;
  gap: 20px;
  line-height: 20px;
  width: 100%;
}

.details {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;
}

.stats {
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: center;
  text-align: center;
}

.avatar-image {
  height: 100px;
  width: 100px;
  object-fit: cover;
  border-radius: 50%;
}

h4 {
  font-weight: 300;
  font-size: 14px;
}
</style>

<!--
Este componente:
Exibe perfis públicos ou do usuário logado;
Mostra avatar, nome, seguidores, seguindo;
Permite seguir ou deixar de seguir usuários;
Se for o próprio perfil, mostra botão para editar;
Atualiza automaticamente ao navegar entre perfis;
Usa Pinia para obter token de autenticação;
Usa axios para acessar uma API protegida;
Integra o componente PostList para exibir os posts do usuário.
-->
