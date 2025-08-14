import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://mpfback-twitterclone.onrender.com/api',
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
/* Antes de qualquer requisição ser enviada, essa função é executada.
Ela busca o accessToken no localStorage;
Se existir um token, ele é adicionado no cabeçalho Authorization da requisição, no formato: Authorization: Bearer <token>
Isso permite autenticação JWT de forma automática e centralizada.
*/

export default instance
