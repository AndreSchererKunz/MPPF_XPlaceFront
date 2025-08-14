<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useRoute } from 'vue-router'
import api from '../services/api.js'
import PostList from './PostList.vue'
import FollowList from './FollowList.vue'
import userAdd from '@/assets/user-add.png'
import userTrust from '@/assets/user-trust.png'
import userPen from '@/assets/user-pen.png'
import xMark from '@/assets/xmark.png'

const route = useRoute()
const authStore = useAuthStore()

const username = computed(() => route.params.username as string)

const editedFirstName = ref('')
const editedLastName = ref('')
const editedUsername = ref('')

const selectedAvatarFile = ref<File | null>(null)

const saveProfileChanges = async () => {
  const formData = new FormData()

  if (editedFirstName.value.trim()) {
    formData.append('first_name', editedFirstName.value.trim())
  }
  if (editedLastName.value.trim()) {
    formData.append('last_name', editedLastName.value.trim())
  }
  if (editedUsername.value.trim()) {
    formData.append('username', editedUsername.value.trim())
  }
  if (selectedAvatarFile.value) {
    formData.append('avatar', selectedAvatarFile.value)
  }

  if ([...formData.entries()].length === 0) {
    console.log('Nenhum campo foi preenchido.')
    return
  }

  try {
    await api.patch('/api/users/me/', formData, {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    })

    await fetchUserData()
    isEditing.value = false
    editedFirstName.value = ''
    editedLastName.value = ''
    editedUsername.value = ''
    selectedAvatarFile.value = null

    console.log('Perfil atualizado com sucesso!')
  } catch (error) {
    console.error('Erro ao salvar perfil:', error)
  }
} /* Monta um FormData com os campos preenchidos;
  Envia um PATCH para a API /api/users/me/;
  Após sucesso: atualiza a tela e reseta os campos de edição. */

const userData = ref({
  first_name: '',
  last_name: '',
  avatar: '/default-avatar.png',
  followers_count: 0,
  following_count: 0,
  is_me: false,
  is_following: false,
  username: '',
})

const isEditing = ref(false)

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
)/* Toda vez que a rota mudar (ex: outro perfil), busca novamente os dados.
{ immediate: true }: executa logo na primeira vez.*/

const toggleFollow = async () => {
  const userResponse = await api.get(`/api/users/profile/${username.value}`)
  const user = userResponse.data
  if (!user) {
    console.error('Usuário não encontrado com esse username.')
    return
  }
  const userId = user.id
  await api.post(`/api/users/${userId}/follow/`, {}, {
    headers: { Authorization: `Bearer ${authStore.accessToken}` }
  })
  await fetchUserData()
}/* Encontra o id do usuário pelo username;
  Chama a API de seguir/desseguir;
  Atualiza os dados depois da ação. */

const toggleEditProfile = () => {
  isEditing.value = !isEditing.value
}

const handleAvatarUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    selectedAvatarFile.value = file
    const reader = new FileReader()
    reader.onload = () => {
      userData.value.avatar = reader.result as string
    }
    reader.readAsDataURL(file)
  }
}

const first_name = computed(() => userData.value.first_name || 'Nome')
const last_name = computed(() => userData.value.last_name || 'Nome')
const avatar = computed(() => userData.value.avatar || '/default-avatar.png')
const followers_count = computed(() => userData.value.followers_count || 0)
const following_count = computed(() => userData.value.following_count || 0)

</script>

<template>
  <div class="container-post">
    <div class="header-image" :class="{ 'editing': isEditing }">
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
              <RouterLink :to="'/profile/' + username + '/following/'" class="follow-link">
                <h2>{{ following_count }}</h2>
                <h4>seguindo</h4>
              </RouterLink>
            </div>
            <div>
              <RouterLink :to="'/profile/' + username + '/followers/'" class="follow-link">
                <h2>{{ followers_count }}</h2>
                <h4>seguidores</h4>
              </RouterLink>
            </div>
          </div>
          <div class=" icons-group">
            <!-- Botão de editar perfil, altera o ícone quando em modo de edição -->
            <div v-if="userData.is_me" class="hide-group">
              <img @click="toggleEditProfile" class="icon-action" alt="Editar" :src="isEditing ? xMark : userPen" />
              <div class="hide-text">
              </div>
            </div>
            <div v-else-if="!userData.is_following" class="hide-group">
              <img :src="userAdd" @click="toggleFollow" class="icon-action" alt="Seguir" />
              <div class="hide-text">
              </div>
            </div>
            <div v-else @click="toggleFollow" class="hide-group">
              <img :src="userTrust" class="icon-action" alt="Deixar de seguir" />
              <div class="hide-text">
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="toggle" v-show="isEditing">
        <form class="edit">
          <div class="input-field">
            <input type="text" :placeholder="userData.first_name" v-model="editedFirstName" />
          </div>
          <div class="input-field">
            <input type="text" :placeholder="userData.last_name" v-model="editedLastName" />
          </div>
          <div class="input-field">
            <input type="text" :placeholder="userData.username || username" v-model="editedUsername" />
          </div>
          <label for="avatar-upload" class="custom-upload-button">Clique aqui para escolher uma nova foto</label>
          <input type="file" id="avatar-upload" @change="handleAvatarUpload" accept="image/*" class="hidden-input" />
          <button type="button" @click="saveProfileChanges"
            :disabled="(!editedFirstName && !editedLastName && !editedUsername) && !selectedAvatarFile">Salvar</button>
        </form>
      </div>
    </div>
    <div>
      <PostList v-if="!isEditing && route.name === 'profile'" />
      <FollowList v-if="!isEditing && (route.name === 'followers' || route.name === 'following')" />
    </div>
  </div>
</template>

<style scoped>
.follow-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.container-post {
  width: 100%;
}

.hidden-input {
  display: none;
}

.hide-text {
  width: 20px;
}

.hide-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  justify-items: center;
  text-align: center;
  width: 100%;
  gap: 4px;
  font-size: 10px;
  margin: 0 auto;
}

.hide-group h4 {
  font-size: 12px;
}

.custom-upload-button {
  background-color: var(--blue-dust);
  color: rgb(28, 27, 27);
  padding: 8px 16px;
  border-radius: 8px;
  width: 250px;
  cursor: pointer;
  text-align: center;
  font-weight: 600;
  transition: background-color 0.2s ease-in-out;
}

.custom-upload-button:hover {
  background-color: var(--blue-dust);
}

button {
  background-color: transparent;
  border: 1px solid var(--blue-cream);
  width: 200px;
  height: 40px;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 40px;
  color: var(--blue-cream);
}

button:hover {
  background-color: var(--blue-cream);
  border: 1px solid var(--blue-cream);
  color: var(--blue-dust)
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.input-group {
  display: flex;
  flex-direction: row;
  gap: 16px;
}

.edit {
  display: flex;
  flex-direction: column;
  justify-items: center;
  justify-content: center;
  align-items: center;

  width: 100%;
  gap: 20px;
  height: 450px;
}

.input-field {
  display: flex;
  flex-direction: column;
  border-radius: 3px;
  border: 1px solid var(--blue-cream);
  background-color: var(--blue-background);
  height: 30px;
  width: 300px;
  margin: 0 auto;
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

.icon-action {
  height: 15px;
  width: 15px;
  transition: transform 0.1s ease-in-out;
  cursor: pointer;
}

.icon-action:hover {
  transform: scale(1.5);
}

.header-image {
  background-color: var(--blue-sky);
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  display: flex;
  flex-direction: column;
  padding: 20px 40px;
  transition: all 0.3s ease;
}

.header-image.editing {
  padding: 50px 20px;
}

.card {
  align-items: center;
  display: flex;
  gap: 10px;
  line-height: 18px;
  width: 100%;
  position: relative;
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
  border: none;

  @media screen and (max-width:900px) {
    height: 70px;
    width: 70px;
  }
}

.details {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between;

  @media screen and (max-width:600px) {
    flex-direction: column;
    gap: 20px;
  }
}

h4 {
  font-weight: 300;
  font-size: 14px;
}
</style>

<!--
Este componente:
Exibe avatar, nome, username, seguidores e seguindo;
Permite editar informações do próprio perfil (nome, username, avatar);
Permite seguir/deixar de seguir outros usuários;
Reage automaticamente a mudanças na rota para recarregar os dados;
Alterna dinamicamente entre visualização de posts e seguidores/seguidos com base na URL.
-->
