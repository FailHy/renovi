'use client'

import { useState, useEffect } from 'react'

export function useMedia(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query)
      setMatches(media.matches)

      const listener = () => setMatches(media.matches)
      media.addEventListener('change', listener)
      
      return () => media.removeEventListener('change', listener)
    }
  }, [query])

  return matches
}