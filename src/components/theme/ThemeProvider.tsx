import { useLayoutEffect } from 'react'

function enforceLightTheme() {
  document.documentElement.classList.remove('dark')
  document.documentElement.style.colorScheme = 'light'
  try {
    localStorage.setItem('edurapay_theme', 'light')
  } catch {
    /* storage blocked */
  }
}

if (typeof document !== 'undefined') {
  enforceLightTheme()
}

/** App uses light mode only — no dark theme toggle. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    enforceLightTheme()
  }, [])

  return children
}
