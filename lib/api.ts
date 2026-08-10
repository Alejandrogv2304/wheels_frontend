import axios from 'axios'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
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
  (response) => {
    return response
  },
  async (error) => {
    const status = error.response?.status
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Ocurrió un error inesperado'
    const originalRequest = error.config

    // Mostrar toast para todos los errores (excepto 401 en login que se maneja aparte)
    if (status === 401 && originalRequest.url?.includes('/auth/login')) {
      const { logout } = useAuth()
      logout(false)
    } else if (status !== 401) {
      // Mostrar toast para todos los errores excepto 401
      toast.error(message)
    }

    return Promise.reject(error)
  },
)

export default api
