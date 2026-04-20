export const formatDate = (dateString?: string) => {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}

export const formatDateTime = (dateTimeString?: string) => {
  if (!dateTimeString) return "—"
  return new Date(dateTimeString).toLocaleString()
}