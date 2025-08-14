import axios from 'axios'

const API_BASE = 'https://mpfback-twitterclone.onrender.com/api/posts/'

export const createPost = async (content: string, token: string) => {
  const response = await axios.post(
    API_BASE,
    { content },
    {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}

/* Este componente:
Cria um novo post no servidor autenticado via token;
Usa axios.post() com o corpo contendo content;
Define corretamente os headers exigidos pela API para autorização e formato;
Retorna os dados da resposta (geralmente o post recém-criado). */
