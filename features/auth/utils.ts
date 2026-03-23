export function decodeToken(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))

    return {
      email: payload.email,
      role: payload.role
    }
  } catch {
    return null
  }
}