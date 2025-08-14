<script setup lang="ts">
import api from '../services/api'
import { ref, computed } from 'vue'
import PostList from './PostList.vue';
import { useAuthStore } from '@/stores/auth'

const text = ref('')  /* Armazena o conteúdo do texto digitado pelo usuário. */
const maxLength = 140 /*  Define o limite de caracteres do post. */

const characterCount = computed(() => `${text.value.length}/${maxLength}`)  /* Retorna uma string mostrando quantos caracteres foram digitados. */
const isMaxed = computed(() => text.value.length >= maxLength)  /* Retorna true se o limite de caracteres foi atingido ou ultrapassado. .*/

const isDisabled = computed(() => text.value.length === 0 || isMaxed.value) /* O botão de envio é desativado se o texto estiver vazio ou no limite. */

const authStore = useAuthStore()
const id = authStore.user?.id
/* Pega o store de autenticação e extrai o id do usuário autenticado. */

const postListRef = ref()

const postContent = async () => {
  try {
    const token = authStore.accessToken
    console.log(id)
    const response = await api.post(
      'https://mpfback-twitterclone.onrender.com/api/posts/',
      {
        content: text.value,
        user: id
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
/* Envia o post com o conteúdo digitado e o ID do usuário para a API.
Inclui o token JWT no cabeçalho para autenticação.*/

    console.log('Post enviado com sucesso!', response.data)
    text.value = ''
    postListRef.value?.refresh()
    /* Limpa o campo de texto.
    Chama o método refresh() do PostList para atualizar a lista de posts. */

  } catch (err) {
    console.error('Erro ao enviar post:', err)
  }
}

const handleInput = (e: Event) => {
  const input = (e.target as HTMLTextAreaElement).value
  text.value = input.slice(0, maxLength)
}/* Atualiza o valor do text conforme o usuário digita.
Garante que o valor não ultrapasse maxLength. */

</script>

<template>
  <div class="container-post">
    <div class="header">
      <h3>Qual a novidade do dia?</h3>
      <div class="post-area">
        <textarea :value="text" @input="handleInput" placeholder="Digite aqui..."></textarea>
        <div class="btn-group">
          <button :disabled="isDisabled" @click="postContent">Postar</button>
          <span :class="{ 'maxed-out': isMaxed }">{{ characterCount }}</span>
        </div>
      </div>
    </div>
    <div>
      <PostList ref="postListRef" />
    </div><!-- Renderiza a lista de posts abaixo da área de postagem. -->
  </div>

</template>

<style scoped>
button:disabled {
  background-color: var(--blue-disabled);
  cursor: not-allowed;
}

button:disabled:hover {
  background-color: var(--blue-disabled);
  cursor: not-allowed;
}

span {
  font-family: Inter;
  text-align: center;
  font-weight: bold;
  font-size: 12px;
  color: var(--blue-midnight);
}

span.maxed-out {
  color: var(--error-red);
}

.header {
  width: 100%;
  padding: 0 16px;
}

.header h3 {
  font-family: Inter;
  font-weight: 800;
  color: var(--blue-midnight);
  font-size: 24px;
}

.post-area {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
  border: 1px solid var(--blue-background);
  background-color: var(--blue-cream);
  border-radius: 8px;
  width: 100%;
  height: 70px;
  position: relative;
}

.btn-group {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 6px;
  right: 8px;
}

button {
  background-color: var(--blue-sky);
  border: none;
  width: 100px;
  height: 40px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  color: var(--blue-cream);
}

button:hover {
  background-color: var(--blue-accent);
}

textarea {
  background-color: transparent;
  padding: 4px;
  border: none;
  height: 100%;
  width: 100%;
  font-size: 16px;
  font-weight: 200;
  resize: none;
  align-items: center;
  outline: none;
  padding-right: 120px;
}

textarea:hover {
  border: none;
}

textarea:focus:hover {
  border: none;
}
</style>
