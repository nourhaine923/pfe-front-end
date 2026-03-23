"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Navbar from "./Navbar"
import CreatePatientModal from "@/components/modals/CreatePatientModal"

export default function LayoutWrapper({ children }: any) {

  const pathname = usePathname()
  const isAuthPage = pathname === "/login"
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Listen for custom event to open the create patient modal
  useEffect(() => {
    const handleOpenModal = () => {
      setIsCreateModalOpen(true)
    }
    
    window.addEventListener('openCreatePatientModal', handleOpenModal)
    
    return () => {
      window.removeEventListener('openCreatePatientModal', handleOpenModal)
    }
  }, [])

  const handleModalClose = () => {
    setIsCreateModalOpen(false)
  }

  const handlePatientCreated = () => {
    // Refresh the page or refetch data
    window.location.reload()
  }

  return (
    <>
      {!isAuthPage && <Navbar />}

      <div style={{ 
        marginLeft: !isAuthPage ? "250px" : 0,
        padding: "20px",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5"
      }}>
        {children}
      </div>

      {/* Create Patient Modal */}
      <CreatePatientModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onCreated={handlePatientCreated}
      />
    </>
  )
}