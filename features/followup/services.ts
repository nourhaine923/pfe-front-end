// features/followup/services.ts

import api from "@/services/api"

// Follow-up CRUD
export const getFollowUps = async (params?: any) => {
  try {
    const res = await api.get("/followups", { params })
    return res.data
  } catch (error: any) {
    console.error("Error fetching follow-ups:", error)
    if (error.response?.status === 404) {
      return { data: [], total: 0, page: 1, limit: 10, totalPages: 1 }
    }
    throw error
  }
}

export const getFollowUpById = async (id: string) => {
  const res = await api.get(`/followups/${id}`)
  return res.data
}

export const createFollowUp = async (data: any) => {
  const res = await api.post("/followups", data)
  return res.data
}

export const updateFollowUp = async (id: string, data: any) => {
  const res = await api.patch(`/followups/${id}`, data)
  return res.data
}

export const deleteFollowUp = async (id: string) => {
  const res = await api.delete(`/followups/${id}`)
  return res.data
}

// Get transplantations that have follow-ups
export const getTransplantationsWithFollowups = async (params?: any) => {
  try {
    // Get all transplantations - remove limit parameter that might cause 422
    const txRes = await api.get("/transplantations", { 
      params: { 
        page: 1, 
        limit: 100 
      } 
    })
    const allTransplantations = txRes.data?.data || txRes.data || []
    
    // Get all follow-ups
    const followUpRes = await api.get("/followups", { 
      params: { 
        page: 1, 
        limit: 100 
      } 
    })
    const followUps = followUpRes.data?.data || followUpRes.data || []
    
    // Find which transplantations have follow-ups
    const txWithFollowUpsIds = new Set(followUps.map((f: any) => f.transplantation_id))
    
    // Filter transplantations that have follow-ups
    let filtered = (Array.isArray(allTransplantations) ? allTransplantations : [])
      .filter((tx: any) => txWithFollowUpsIds.has(tx._id))
    
    // Apply search if provided
    const search = params?.search
    if (search && search.trim()) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter((tx: any) => {
        const transplantNumberMatch = tx.transplantNumber?.toLowerCase().includes(searchLower)
        const recipientNameMatch = tx.recipient?.firstName?.toLowerCase().includes(searchLower) ||
                                   tx.recipient?.lastName?.toLowerCase().includes(searchLower)
        return transplantNumberMatch || recipientNameMatch
      })
    }
    
    // Apply pagination
    const page = params?.page || 1
    const limit = params?.limit || 10
    const start = (page - 1) * limit
    const end = start + limit
    
    // For each transplantation, get follow-up info
    const enrichedData = filtered.slice(start, end).map((tx: any) => {
      const txFollowUps = followUps.filter((f: any) => f.transplantation_id === tx._id)
      const latestFollowUp = txFollowUps.sort((a: any, b: any) => 
        new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
      )[0]
      
      return {
        ...tx,
        _id: tx._id,
        followUpCount: txFollowUps.length,
        latestFollowUp: latestFollowUp ? {
          id: latestFollowUp._id,
          visitDate: latestFollowUp.visitDate,
          clinicalStatus: latestFollowUp.clinicalStatus
        } : null
      }
    })
    
    return {
      data: enrichedData,
      total: filtered.length,
      page: page,
      limit: limit,
      totalPages: Math.ceil(filtered.length / limit) || 1
    }
  } catch (error: any) {
    console.error("Error fetching transplantations with follow-ups:", error)
    return { data: [], total: 0, page: 1, limit: 10, totalPages: 1 }
  }
}

// Vital Signs
export const getVitalSigns = async (followupId: string) => {
  try {
    const res = await api.get(`/vitals/by-followup/${followupId}`)
    return res.data
  } catch (error) {
    console.error("Error fetching vital signs:", error)
    return []
  }
}

export const createVitalSigns = async (data: any) => {
  const res = await api.post("/vitals", data)
  return res.data
}

// Biological Measurements
export const getBiologicalMeasurements = async (followupId: string) => {
  try {
    const res = await api.get(`/biological/by-followup/${followupId}`)
    return res.data
  } catch (error) {
    console.error("Error fetching biological measurements:", error)
    return []
  }
}

export const createBiologicalMeasurement = async (data: any) => {
  const res = await api.post("/biological", data)
  return res.data
}

// Immunological Markers
export const getImmunologicalMarkers = async (followupId: string) => {
  try {
    const res = await api.get(`/immunological/by-followup/${followupId}`)
    return res.data
  } catch (error) {
    console.error("Error fetching immunological markers:", error)
    return []
  }
}

export const createImmunologicalMarker = async (data: any) => {
  const res = await api.post("/immunological", data)
  return res.data
}

// Rejection Episodes
export const getRejectionEpisodes = async (followupId: string) => {
  try {
    const res = await api.get(`/rejections/by-followup/${followupId}`)
    return res.data
  } catch (error) {
    console.error("Error fetching rejection episodes:", error)
    return []
  }
}

export const createRejectionEpisode = async (data: any) => {
  const res = await api.post("/rejections", data)
  return res.data
}

// Adverse Events
export const getAdverseEvents = async (followupId: string) => {
  try {
    const res = await api.get(`/adverse-events/by-followup/${followupId}`)
    return res.data
  } catch (error) {
    console.error("Error fetching adverse events:", error)
    return []
  }
}

export const createAdverseEvent = async (data: any) => {
  const res = await api.post("/adverse-events", data)
  return res.data
}

// Adherence Assessments
export const getAdherenceAssessments = async (followupId: string) => {
  try {
    const res = await api.get(`/adherence/by-followup/${followupId}`)
    return res.data
  } catch (error) {
    console.error("Error fetching adherence assessments:", error)
    return []
  }
}

export const createAdherenceAssessment = async (data: any) => {
  const res = await api.post("/adherence", data)
  return res.data
}

// Therapeutic Treatments
export const getTherapeuticTreatments = async (followupId: string) => {
  try {
    const res = await api.get(`/treatments/by-followup/${followupId}`)
    return res.data
  } catch (error) {
    console.error("Error fetching treatments:", error)
    return []
  }
}

export const createTherapeuticTreatment = async (data: any) => {
  const res = await api.post("/treatments", data)
  return res.data
}

// Immunosuppression Regimens
export const getImmunosuppressionRegimens = async () => {
  try {
    const res = await api.get("/immunosuppressions")
    return res.data
  } catch (error) {
    console.error("Error fetching immunosuppression regimens:", error)
    return []
  }
}

export const getImmunosuppressionRegimenByFollowUp = async (followupId: string) => {
  try {
    const res = await api.get(`/immunosuppressions/by-followup/${followupId}`)
    return res.data
  } catch (error) {
    console.error("Error fetching immunosuppression regimen:", error)
    return null
  }
}

export const createImmunosuppressionRegimen = async (data: any) => {
  const res = await api.post("/immunosuppressions", data)
  return res.data
}

// Transplantations for dropdown
export const getTransplantationsList = async () => {
  try {
    const res = await api.get("/transplantations", { params: { page: 1, limit: 100 } })
    return res.data.data || res.data || []
  } catch (error) {
    console.error("Error fetching transplantations:", error)
    return []
  }
}