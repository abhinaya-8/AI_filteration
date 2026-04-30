import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const signup = (data) => api.post('/auth/signup', data)
export const login = (data) => api.post('/auth/login', data)

// Users
export const getMe = () => api.get('/users/me')
export const getKnowledgeProgress = () => api.get('/users/knowledge-progress')
export const updateKnowledgeProgress = (data) => api.post('/users/knowledge-progress', data)
export const getKnowledgeDatasetStats = () => api.get('/users/knowledge-dataset/stats')
export const hintChat = (data) => api.post('/users/hint-chat', data)

// Companies (for User dashboard)
export const getCompanies = () => api.get('/companies')

// Recruitment drives
export const getDrives = (companyId) => api.get('/drives', { params: companyId ? { companyId } : {} })
export const getDrive = (id) => api.get(`/drives/${id}`)
export const createDrive = (data) => api.post('/drives', data)
export const updateDrive = (id, data) => api.patch(`/drives/${id}`, data)

// Resumes
export const uploadResume = (driveId, file) => {
  const form = new FormData()
  form.append('recruitmentDriveId', driveId)
  form.append('file', file)
  return api.post('/resumes/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}
export const getResumesByDrive = (driveId) => api.get(`/resumes/drive/${driveId}`)
export const runAnalyze = (driveId, keywords = '') => api.post(`/resumes/ai/filter-applicants`, { jobId: driveId, keywords })
export const getMyApplications = (driveId) => api.get('/resumes/my-applications', { params: driveId ? { driveId } : {} })

export const getResumeTemplates = () => api.get('/resumes/templates')
export const scoreResume = (resumeData) => api.post('/resumes/builder/score', { resumeData })
export const suggestBullet = (bullet) => api.post('/resumes/builder/suggest', { bullet })
export const extractSkills = (text) => api.post('/resumes/builder/extract-skills', { text })

export default api
