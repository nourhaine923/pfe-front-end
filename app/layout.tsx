import "./globals.css"
import { AuthProvider } from "@/features/auth/context"
import Navbar from "@/components/Navbar"
import LayoutWrapper from "@/components/LayoutWrapper"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>

        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>

      </body>
    </html>
  )
}