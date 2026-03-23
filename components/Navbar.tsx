"use client"
import { useAuth } from "@/features/auth/context"
import { useRouter } from "next/navigation"

export default function Navbar() {

  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <div style={styles.navbar}>

      <div style={styles.top}>
        <div style={styles.left}>
          <h2 style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
            KTOuIP
          </h2>
        </div>
      </div>

      <div style={styles.middle}>
        {/* Dashboard - visible to both Admin and Nephrologist */}
        {(user?.role === "ADMIN" || user?.role === "NEPHROLOGIST") && (
          <button onClick={() => router.push("/dashboard")} style={styles.link}>
            Dashboard
          </button>
        )}

        {/* Patients - only visible to Nephrologist */}
        {user?.role === "NEPHROLOGIST" && (
          <button onClick={() => router.push("/patients")} style={styles.link}>
            Patients
          </button>
        )}
      </div>

      <div style={styles.bottom}>
        <span style={styles.user}>
          {user?.email}
        </span>

        <button onClick={logout} style={styles.logout}>
          Logout
        </button>
      </div>

    </div>
  )
}

const styles = {
  navbar: {
    width: "250px",
    height: "100vh",
    backgroundColor: "#79b0d7",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "29px 0",
    position: "fixed" as const,
    top: 0,
    left: 0,
    zIndex: 1000
  },
  top: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "0 20px"
  },
  left: {
    fontWeight: "bold",
    textAlign: "center"
  },
  middle: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
    width: "100%"
  },
  bottom: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
    width: "100%",
    padding: "0 20px"
  },
  link: {
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer",
    padding: "8px 16px",
    width: "100%",
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "500",
    transition: "background-color 0.2s",
    borderRadius: "8px"
  },
  logout: {
    backgroundColor: "#183eff",
    border: "none",
    padding: "8px 20px",
    color: "white",
    cursor: "pointer",
    borderRadius: "15px",
    width: "100%",
    minWidth: "150px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s"
  },
  user: {
    fontSize: "12px",
    opacity: 0.8,
    textAlign: "center",
    wordBreak: "break-word"
  }
}