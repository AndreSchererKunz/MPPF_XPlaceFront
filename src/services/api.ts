import axios from 'axios'
import router from '@/router'

import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: 'https://mpfback-twitterclone.onrender.com/',
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore()
    const originalRequest = error.config

    if (error.response && error.response.status === 401 && originalRequest?.method !== 'get') {
      console.warn('Token expirado ou inválido. Fazendo logout...')
      console.log('Token expirado ou inválido. Fazendo logout...')

      authStore.logout()
      router.push('/welcome')
    }
    return Promise.reject(error)
  },
)
export default api
