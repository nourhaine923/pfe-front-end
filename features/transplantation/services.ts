import api from "@/services/api"

export const getTransplantations = async (params?: any) => {
  const res = await api.get("/transplantations", { params })
  return res.data
}

export const getTransplantationById = async (id: string) => {
  const res = await api.get(`/transplantations/${id}`)
  return res.data
}

export const createTransplantation = async (data: any) => {
  const res = await api.post("/transplantations", data)
  return res.data
}

export const updateTransplantation = async (id: string, data: any) => {
  const res = await api.patch(`/transplantations/${id}`, data)
  return res.data
}

export const deleteTransplantation = async (id: string) => {
  const res = await api.delete(`/transplantations/${id}`)
  return res.data
}