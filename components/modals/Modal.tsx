//This modal provides:dark overlay/centered popup/close button/content area
"use client"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {

  if (!isOpen) return null

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.4)",
      backdropFilter: "blur(4px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>

      <div style={{
        background: "white",
        padding: "25px",
        borderRadius: "10px",
        minWidth: "400px"
      }}>

        <button
          onClick={onClose}
          style={{
            float: "right",
            border: "none",
            background: "transparent",
            fontSize: "18px",
            cursor: "pointer"
          }}
        >
          ✖
        </button>

        {children}

      </div>

    </div>
  )
}