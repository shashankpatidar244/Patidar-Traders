import Navbar from "./components/Navbar"
import { ReactNode } from "react"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <Navbar />

      {/* USER CONTAINER */}
      <div className="p-8">
        {children}
      </div>
    </div>
  )
}
