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

// Get transplantations that have follow-ups (with cache busting)
export const getTransplantationsWithFollowups = async (params?: any) => {
  try {
    // Add cache-busting timestamp to prevent caching
    const cacheBuster = { _t: Date.now() }
    
    // Get all transplantations
    const txRes = await api.get("/transplantations", { 
      params: { 
        page: 1, 
        limit: 100,
        ...cacheBuster
      } 
    })
    const allTransplantations = txRes.data?.data || txRes.data || []
    
    // Get all follow-ups with cache-busting
    const followUpRes = await api.get("/followups", { 
      params: { 
        page: 1, 
        limit: 100,
        ...cacheBuster
      } 
    })
    const followUps = followUpRes.data?.data || followUpRes.data || []
    
    // Create maps for efficient lookup
    const followUpCountMap = new Map()
    const latestFollowUpMap = new Map()
    
    // Process follow-ups to build counts and track latest
    followUps.forEach((followUp: any) => {
      const txId = followUp.transplantation_id
      
      // Count follow-ups per transplantation
      followUpCountMap.set(txId, (followUpCountMap.get(txId) || 0) + 1)
      
      // Track the latest follow-up (by visit date)
      const existingLatest = latestFollowUpMap.get(txId)
      if (!existingLatest || new Date(followUp.visitDate) > new Date(existingLatest.visitDate)) {
        latestFollowUpMap.set(txId, followUp)
      }
    })
    
    // Filter transplantations that have follow-ups
    let filtered = (Array.isArray(allTransplantations) ? allTransplantations : [])
      .filter((tx: any) => followUpCountMap.has(tx._id))
    
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
    
    // Enrich data with follow-up information
    const enrichedData = filtered.slice(start, end).map((tx: any) => {
      const latestFollowUp = latestFollowUpMap.get(tx._id)
      
      return {
        ...tx,
        _id: tx._id,
        followUpCount: followUpCountMap.get(tx._id) || 0,
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

// Get adverse events by treatment ID (not follow-up)
export const getAdverseEventsByTreatment = async (treatmentId: string) => {
  try {
    const res = await api.get(`/adverse-events/by-treatment/${treatmentId}`)
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

export const updateAdverseEvent = async (id: string, data: any) => {
  const res = await api.patch(`/adverse-events/${id}`, data)
  return res.data
}

export const deleteAdverseEvent = async (id: string) => {
  const res = await api.delete(`/adverse-events/${id}`)
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