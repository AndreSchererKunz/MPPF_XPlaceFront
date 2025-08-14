<script setup lang="ts">
import dayjs from 'dayjs' /* Biblioteca para manipular datas */
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import { ref, onMounted, onUnmounted, watch } from 'vue'
import api from '../services/api.js'
import { useRoute } from 'vue-router'
import loader from '../assets/loader.gif'
import { useAuthStore } from '@/stores/auth.js'

import heartGreen from '@/assets/heart-green.png'
import heartFilled from '@/assets/heart-filled.png'
import bookmarkGreen from '@/assets/bookmark-green.png'
import bookmarkFilled from '@/assets/bookmark-filled.png'
import repostGreen from '@/assets/refresh-green.png'
import respostFilled from '@/assets/refresh-filled.png'
import trash from '@/assets/trash.png'

dayjs.extend(utc)
dayjs.extend(timezone)

const isLoading = ref(true) /* Controle de carregamento.*/
const route = useRoute()
const authStore = useAuthStore()

interface Post {
  id: number;
  name: string;
  username: string;
  content: string;
  created_at: string;
  likes: number;
  user_avatar: string;
  bookmark: number;
  is_liked: boolean;
  is_bookmarked: boolean;
  is_reposted: boolean;
  repost?: Post | null;
}

const posts = ref<Post[]>([]) /* Armazena os posts carregados. */
const errorMessage = ref('')

const fetchPosts = async () => {
  isLoading.value = true
  const MIN_LOADING_TIME = 2000
  const delay = new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME))

  try {
    const token = authStore.accessToken
    errorMessage.value = ''

    let endpoint = '/api/posts'

    if (route.path === '/') {
      endpoint = '/api/posts/feed'
    } else if (route.path.startsWith('/profile/') && route.params.username) {
      const username = route.params.username as string
      const postId = route.params.postId

      if (postId) {
        endpoint = `/api/posts/${postId}`
      } else {
        endpoint = `/api/posts/user/${username}`
      }
    } else if (route.path === '/bookmark') {
      endpoint = '/api/posts/bookmark'
    }

    const [response] = await Promise.all([
      api.get(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      delay
    ])

    if (route.params.postId) {
      posts.value = [response.data]
    } else {
      posts.value = response.data.results || []
    }

    nextPageUrl.value = response.data.next || null

  } catch (error) {
    console.error("Erro ao buscar posts: ", error)
    errorMessage.value = 'Erro ao carregar posts. Tente novamente mais tarde.'
  } finally {
    isLoading.value = false
  }
} /* Responsabilidade: carregar os posts corretos de acordo com a rota atual:
  /: feed principal → api/posts/feed;
  /profile/:username: perfil de usuário → api/posts/user/:username;
  /profile/:username/:postId: post específico → api/posts/:postId;
  /bookmark: favoritos → api/posts/bookmark;
  Usa um delay mínimo de 2 segundos para suavizar o carregamento. */

const fetchPostsPaginated = async (url: string) => {
  try {
    const token = authStore.accessToken
    const response = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    posts.value.push(...response.data.results)
    nextPageUrl.value = response.data.next || null
  } catch (error) {
    console.error("Erro ao buscar posts: ", error)
  }
} /* Carrega a próxima página de posts com base na URL retornada pela API. */

onMounted(fetchPosts)
onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && nextPageUrl.value) {
        fetchPostsPaginated(nextPageUrl.value)
      }
    },/* Quando o sentinel entra em viewport, carrega mais posts (se houver uma próxima página). */
    { root: null, rootMargin: '0px', threshold: 1.0 }
  )
  if (sentinel.value) {
    observer.observe(sentinel.value)
  }
})

onUnmounted(() => {
  if (sentinel.value) {
    observer.unobserve(sentinel.value)
  }
})

watch(() => route.fullPath, () => {
  fetchPosts()
})  /* Sempre que a URL muda, os posts são recarregados para refletir a nova tela. */

defineExpose({
  refresh: fetchPosts
})
const nextPageUrl = ref<string | null>(null)
const sentinel = ref<HTMLElement | null>(null)  /* Usado como marcador para o infinite scroll. */
let observer: IntersectionObserver

const toggleLike = async (post: Post) => {
  try {
    const token = authStore.accessToken
    await api.post(`/api/posts/${post.id}/like/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    post.is_liked = !post.is_liked
  } catch (err) {
    console.error('Erro ao curtir:', err)
  }
}

const toggleBookmark = async (post: Post) => {
  try {
    const token = authStore.accessToken
    await api.post(`/api/posts/${post.id}/bookmark/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    post.is_bookmarked = !post.is_bookmarked
  } catch (err) {
    console.error('Erro ao salvar:', err)
  }
}

const toggleRepost = async (post: Post) => {
  try {
    const token = authStore.accessToken
    await api.post(`/api/posts/${post.id}/repost/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    post.is_reposted = !post.is_reposted
  } catch (err) {
    console.error('Erro ao repostar:', err)
  }
}
const deletePost = async (postId: number) => {
  try {
    const token = authStore.accessToken
    await api.delete(`/api/posts/${postId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    posts.value = posts.value.filter(post => post.id !== postId)
  } catch (err) {
    console.error('Erro ao deletar post:', err)
  }
}
</script>

<template>
  <div class="container">
    <div v-if="isLoading" class="loading-wrapper">
      <img :src="loader" alt="Carregando..." class="loading-img" />
    </div>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    <div v-else-if="posts.length === 0 && !isLoading" class="no-posts">
      <img src="../assets/sleep3.png" class="no-posts-img" alt="balao com as letras ZZZ" />
      <span>Sem postagens por enquanto...</span>
    </div>
    <ul v-else-if="!isLoading" class="posts-list">
      <li v-for="post in posts" :key="post.id">
        <div class="card">
          <div class="avatar-section">
            <img :src="post.user_avatar" class="avatar-img" alt="avatar" />
          </div>
          <div class="content">
            <RouterLink :to="`/profile/${post.username}`" class="title">
              <h3>{{ post.name }}</h3>
              <h4>@{{ post.username }}</h4>
            </RouterLink>

            <!-- Verifica se é repost e exibe o conteúdo adequado -->
            <div class="post">
              <div v-if="post.repost">
                <div class="repost">
                  <img :src="repostGreen" class="repost-icon" />
                  <span class="repost-info">Repostado de @{{ post.repost.username }}</span>
                </div>
                <p>{{ post.repost.content }}</p>
              </div>
              <div v-else>
                {{ post.content }}
              </div>
            </div>

            <small>{{ post.created_at }} (UTC)</small>

            <div class="icon-set-trash" v-if="post.username === authStore.user?.username" @click="deletePost(post.id)">
              <img class="icon-post" alt="delete" :src="trash" />
            </div>
            <div class="actions">
              <div class="icon-set" @click="toggleLike(post)">
                <img class="icon-post" alt="like" :src="post.is_liked ? heartFilled : heartGreen" />
              </div>
              <div class="icon-set" @click="toggleBookmark(post)">
                <img class="icon-post" alt="bookmark" :src="post.is_bookmarked ? bookmarkFilled : bookmarkGreen" />
              </div>
              <div class=" icon-set" @click="toggleRepost(post)">
                <img class="icon-post repost" alt="repost" :src="post.is_reposted ? respostFilled : repostGreen" />
              </div>
            </div>
          </div>
        </div>
      </li>
    </ul>
    <div ref="sentinel" v-show="nextPageUrl"></div>
  </div>
</template>

<style scoped>
.container {
  height: 100%;
}

.posts-list {
  height: auto;
  padding-top: 8px;
  overflow-x: hidden;
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

<!--
Este componente:
Carrega posts dinamicamente com base na rota;
Exibe feedbacks de carregamento e erros;
Suporta scroll infinito com IntersectionObserver;
Permite interações nos posts (curtir, repostar, salvar, deletar);
Usa autenticação via Pinia para chamadas protegidas na API.
-->
