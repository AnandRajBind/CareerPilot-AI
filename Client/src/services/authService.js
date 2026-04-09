import api from './api'

export const authService = {
  register: async (data) => {
    const response = await api.post('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      companyName: data.companyName,
      industry: data.industry,
    })
    return response.data
  },

  login: async (data) => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/users/profile')
    return response.data
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data)
    return response.data
  },
}
