import axios from 'axios'
import { toast } from 'sonner'
import { getToken } from '@/lib/cookie-storage'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000/api',
})

// Interceptor para añadir token a cada request
api.interceptors.request.use(
  (config) => {
    const token = getToken('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Ocurrió un error inesperado'

    if (status === 401) {
      toast.error('Sesión expirada. Vuelve a iniciar sesión.');
    } else {
      toast.error(message)
    }

    return Promise.reject(error)
  },
)

export default api
