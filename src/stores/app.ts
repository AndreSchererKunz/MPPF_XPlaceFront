import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const route = useRoute()

  const publicRoutes = ['/login', '/register', '/welcome', '/password'] /* Define as rotas que não exigem autenticação. */

  /* Verifica se a rota atual é pública. */
  const isPublicRoute = computed(() => {
    return publicRoutes.includes(route.path) || route.name === 'NotFound'
  })

  return {
    isPublicRoute,
  }
})
