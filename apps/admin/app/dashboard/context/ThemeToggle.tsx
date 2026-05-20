"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "../context/ThemeProvider"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // ✅ Fix hydration mismatch (VERY IMPORTANT)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <button
      onClick={toggleTheme}
      title="Toggle theme"
      className="relative p-2 rounded-lg border border-gray-200 dark:border-gray-700 
                 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
    >
      {/* Animated Icon */}
      <div className="relative w-5 h-5 flex items-center justify-center">
        
        {/* Sun */}
        <Sun
          size={18}
          className={`absolute transition-all duration-300 ${
            isDark
              ? "opacity-100 rotate-0 scale-100 text-yellow-500"
              : "opacity-0 rotate-90 scale-50"
          }`}
        />

        {/* Moon */}
        <Moon
          size={18}
          className={`absolute transition-all duration-300 ${
            !isDark
              ? "opacity-100 rotate-0 scale-100 text-gray-700 dark:text-gray-300"
              : "opacity-0 -rotate-90 scale-50"
          }`}
        />
      </div>
    </button>
  )
}