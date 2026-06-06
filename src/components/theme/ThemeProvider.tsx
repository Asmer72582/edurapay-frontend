import { createContext, useContext, useEffect } from 'react'

type Theme = 'light'

const ThemeContext = createContext<{ theme: Theme } | null>(null)

/** App uses light mode only (no day/night toggle). */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('edurapay_theme', 'light')
  }, [])

  return <ThemeContext.Provider value={{ theme: 'light' }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
