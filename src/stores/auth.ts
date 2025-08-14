import router from '@/router'
import api from '@/services/api'
import { defineStore } from 'pinia'

let notificationInterval: ReturnType<typeof setInterval> | null = null
/* Usado para controlar o setInterval que busca notificações não lidas.
Mantido fora da store para garantir que a referência persista entre renders. */

interface User {
  id: number
  name: string
  username: string
  email: string
  posts_count: number
  followers_count: number
  following_count: number
  avatar: string
} /* Define os tipos de dados para User*/

interface Notification {
  id: number
  recipient: string
  sender: {
    username: string
  }
  message: string
  created_at: string
  is_read: boolean
  post?: {
    id: number
  }
} /* Define os tipos de dados para Notification. */

function isTokenExpired(token: string): boolean {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch {
    return true
  }
} /* Verifica se o token JWT está expirado:
  Decodifica o payload base64 do JWT;
  Compara o tempo de expiração com o horário atual;
  Se inválido ou erro na leitura, assume que está expirado. */

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('access') || '', /* Obtém os tokens salvos localmente. */
    refreshToken: localStorage.getItem('refresh') || '', /* Obtém os tokens salvos localmente. */
    user: null as User | null, /* Informações do usuário autenticado. */
    unreadNotifications: 0, /* Contador de notificações não lidas. */
    notifications: [] as Notification[], /* Lista com todas as notificações recebidas. */
  }),

  getters: {
    isAuthenticated: (state) => {
      return !!state.accessToken && !isTokenExpired(state.accessToken)
    },
  }, /* Retorna true se existe um token válido;
    Usa a função isTokenExpired para garantir validade real. */

  actions: {
    setTokens(access: string, refresh: string) {
      this.accessToken = access
      this.refreshToken = refresh
      localStorage.setItem('access', access)
      localStorage.setItem('refresh', refresh)
    }, /* Armazena os tokens tanto da memória da aplicação quanto do localStorage. */

    clearTokens() {
      this.accessToken = ''
      this.refreshToken = ''
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      this.user = null
    }, /* Remove os tokens tanto da memória da aplicação quanto do localStorage. */

    async fetchUnreadNotifications() {
      if (this.isAuthenticated) {
        try {
          const response = await api.get(
            'https://mpfback-twitterclone.onrender.com/api/notifications/unread_count/',
            {
              headers: {
                Authorization: `Bearer ${this.accessToken}`,
              },
            },
          )
          this.unreadNotifications = response.data.unreadNotifications
        } catch (error) {
          console.error('Erro ao buscar notificações não lidas:', error)
        }
      }
    }, /* Consulta à API o número de notificações não lidas.
      Atualiza o contador unreadNotifications. */

    async fetchNotifications() {
      if (this.isAuthenticated) {
        try {
          const response = await api.get(
            'https://mpfback-twitterclone.onrender.com/api/notifications/',
            {
              headers: {
                Authorization: `Bearer ${this.accessToken}`,
              },
            },
          )
          this.notifications = response.data.results
        } catch (error) {
          console.error('Erro ao buscar notificações:', error)
        }
      }
    }, /* Busca a lista completa de notificações.
      Armazena no array notifications. */

    async readNotification(notificationId: number) {
      if (this.isAuthenticated) {
        try {
          const response = await api.post(
            `https://mpfback-twitterclone.onrender.com/api/notifications/${notificationId}/mark_as_read/`,
            {
              headers: {
                Authorization: `Bearer ${this.accessToken}`,
              },
            },
          )
          this.notifications = response.data.results
        } catch (error) {
          console.error('Erro ao buscar notificações:', error)
        }
      }
    }, /* Marca uma notificação como lida no backend.
      Atualiza a lista com as notificações atualizadas da API.*/

    startNotificationPolling() {
      if (notificationInterval) return
      this.fetchUnreadNotifications()
      notificationInterval = setInterval(() => {
        this.fetchUnreadNotifications()
      }, 30000)
    },
    stopNotificationPolling() {
      if (notificationInterval) {
        clearInterval(notificationInterval)
        notificationInterval = null
      }
    }, /* Inicia/para o intervalo que busca o número de notificações não lidas a cada 30 segundos.
      Evita múltiplas execuções com if (notificationInterval). */

    async login(username: string, password: string) {
      try {
        const response = await fetch('https://mpfback-twitterclone.onrender.com/api/token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })
        if (response.ok) {
          const data = await response.json()
          this.setTokens(data.access, data.refresh)
          await this.fetchUserData()
          await this.fetchUnreadNotifications()
          this.startNotificationPolling()
        } else {
          throw new Error('Credenciais inválidas')
        }
      } catch (error) {
        console.error(error)
        throw error
      }
    },
    /* Envia login e senha para a API.
    Se sucesso:
    Salva os tokens;
    Busca os dados do usuário;
    Inicia o polling de notificações.*/

    async refreshAccessToken() {
      try {
        const response = await fetch(
          'https://mpfback-twitterclone.onrender.com/api/token/refresh/',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: this.refreshToken }),
          },
        )
        if (response.ok) {
          const data = await response.json()
          this.accessToken = data.access
          localStorage.setItem('access', data.access)
        } else {
          this.logout()
        }
      } catch (error) {
        console.error('Erro ao renovar o token:', error)
        this.logout()
      }
    }, /* Renova o accessToken usando o refreshToken.
      Se falhar, faz logout automático. */

    async fetchUserData() {
      try {
        const response = await fetch('https://mpfback-twitterclone.onrender.com/api/users/me/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          this.user = data
        } else {
          throw new Error('Erro ao buscar os dados do usuário')
        }
      } catch (error) {
        console.error(error)
      }
    }, /* Requisição para pegar os dados do usuário autenticado.
      Salva os dados no estado user. */

    async logout() {
      this.clearTokens()
      this.stopNotificationPolling()
      router.push('/welcome')
    },  /* Apaga tokens, para polling e redireciona o usuário para a tela de boas-vindas. */

    async initializeAuth() {
      const access = localStorage.getItem('access')
      const refresh = localStorage.getItem('refresh')

      this.accessToken = access || ''
      this.refreshToken = refresh || ''

      if (this.accessToken && isTokenExpired(this.accessToken)) {
        await this.refreshAccessToken()
      }

      if (!isTokenExpired(this.accessToken)) {
        await this.fetchUserData()
        this.startNotificationPolling()
      }
    },
    /* Usado ao iniciar o app:
    Restaura tokens salvos;
    Renova o token se expirado;
    Se válido, busca dados e inicia polling de notificações.*/
  },
})
