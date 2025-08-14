import axios from 'axios'
/*  */
const API_URL = 'https://mpfback-twitterclone.onrender.com/api/token/'

let isRefreshing = false  /* Impede múltiplos refresh tokens simultâneos. */
let subscribers: ((token: string) => void)[] = [] /* Fila de callbacks que esperam pelo novo token. */

function onAccessTokenFetched(token: string) {
  subscribers.forEach((callback) => callback(token))
  subscribers = []
}/* Dispara todas as requisições pendentes com o novo token. */

function subscribeTokenRefresh(callback: (token: string) => void) {
  subscribers.push(callback)
}/* Adiciona uma nova requisição à fila de espera até que o token seja renovado. */

export default {
  async login(username: string, password: string) {
    const response = await axios.post(`${API_URL}`, { username, password })
    return response.data
  },/* Envia username e password para obter um access e refresh token. */
  async refresh(refreshToken: string) {
    const response = await axios.post(`${API_URL}refresh/`, { refresh: refreshToken })
    return response.data
  },/* Envia o refresh_token para obter um novo access_token. */

  /* Busca o refresh_token do localStorage. */
  async getAccessToken() {
    const storedRefreshToken = localStorage.getItem('refresh_token')
    if (storedRefreshToken) {
      try {
        /* Renova o token. */
        const response = await this.refresh(storedRefreshToken)
        const { access, refresh } = response.data

        /* Salva o novo access token e refresh token. */
        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)

        /* Notifica as requisições que estavam em espera. */
        onAccessTokenFetched(access)

        return access
      } catch (error) {
        console.error('Erro ao tentar renovar o token', error)
        throw error
      }/* Se falhar, lança erro. */
    }
    return null
  },

  /* Adiciona interceptores globais para todas as requisições feitas com axios. */
  setupAxiosInterceptors() {
    axios.interceptors.request.use(
      (config) => {
        const accessToken = localStorage.getItem('access_token')
        if (accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`
        }
        return config
      },  /* Antes de enviar qualquer requisição, anexa o token Bearer se existir. */
      (error) => {
        return Promise.reject(error)
      },
    )

    axios.interceptors.response.use(
      (response) => {
        return response
      },
      async (error) => {
        const originalRequest = error.config
        /* Se a resposta der erro, captura o erro e analisa. */
        if (error.response.status === 401 && !originalRequest._retry) {
          /* Se o erro for 401 e a requisição ainda não foi tentada novamente: */
          originalRequest._retry = true
          if (!isRefreshing) {
            isRefreshing = true
            /* Marca que essa requisição está sendo reprocessada.
            Se ainda não estiver renovando o token, inicia a renovação:*/
            try {
              const newAccessToken = await this.getAccessToken()
              /* Renova o token, atualiza o Authorization e repete a requisição original com o novo token. */
              if (newAccessToken) {
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
                onAccessTokenFetched(newAccessToken)
                return axios(originalRequest)
              }
            } catch (err) {
              console.error('Erro ao renovar o token', err)
            } finally {
              isRefreshing = false
            }
          } else { /* Se já houver uma renovação em andamento, adiciona a requisição à fila e espera o novo token antes de prosseguir. */
            return new Promise((resolve) => {
              subscribeTokenRefresh((newToken: string) => {
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`
                resolve(axios(originalRequest))
              })
            })
          }
        }
        return Promise.reject(error)
      },
    )
  },
}
