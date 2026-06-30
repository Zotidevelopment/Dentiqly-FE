import { useState, useEffect } from 'react'

// Detecta el país del usuario por IP usando ipapi.co (free tier, sin API key)
// Cachea en sessionStorage para no repetir el request en cada render
export const useCountry = (): string | null => {
  const [country, setCountry] = useState<string | null>(() => {
    return sessionStorage.getItem('user_country')
  })

  useEffect(() => {
    if (country) return
    fetch('https://ipapi.co/country/')
      .then(r => r.text())
      .then(code => {
        const c = code.trim().toUpperCase()
        sessionStorage.setItem('user_country', c)
        setCountry(c)
      })
      .catch(() => {})
  }, [])

  return country
}
