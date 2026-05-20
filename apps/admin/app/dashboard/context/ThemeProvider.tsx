"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  isDark: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [isDark, setIsDark] = useState(false)

  // 🔍 Detect system preference
  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches

  // 📦 Load from storage
  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme) || "system"
    setThemeState(saved)
  }, [])

  // 🎨 Apply theme
  useEffect(() => {
    let darkMode = false

    if (theme === "dark") darkMode = true
    else if (theme === "light") darkMode = false
    else darkMode = getSystemTheme()

    setIsDark(darkMode)

    const root = document.documentElement

    if (darkMode) root.classList.add("dark")
    else root.classList.remove("dark")

    localStorage.setItem("theme", theme)

    // ✨ Smooth transition
    root.style.transition = "background-color 0.3s, color 0.3s"
  }, [theme])

  // 🔁 Listen system change (if system mode)
  useEffect(() => {
    if (theme !== "system") return

    const media = window.matchMedia("(prefers-color-scheme: dark)")

    const handler = () => {
      const darkMode = media.matches
      setIsDark(darkMode)

      if (darkMode) document.documentElement.classList.add("dark")
      else document.documentElement.classList.remove("dark")
    }

    media.addEventListener("change", handler)
    return () => media.removeEventListener("change", handler)
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)

  const toggleTheme = () => {
    setThemeState((prev) =>
      prev === "dark" ? "light" : "dark"
    )
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

// 🧠 Hook
export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}