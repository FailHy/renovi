"use client"

import { useMemo } from "react"

export default function WiseWords() {
    const words = [
    "Progress is progress, no matter how small.",
    "Focus on the process, not the pressure.",
    "Small habits build big results.",
    "Success begins with disciplined routines.",
    "Do what matters, not what’s easy.",
    "Consistency beats intensity.",
    "Choose improvement over perfection.",
    "Your future is built by what you do today.",
    "Every day is a chance to reset and grow.",
    "Clarity creates confidence.",
    "Great work comes from great focus.",
    "Better decisions start with a calm mind."
    ]

    const kataKataHariIni = useMemo(() => {
        const hariIni = new Date()
        const seed = hariIni.getFullYear() + hariIni.getMonth() + hariIni.getDate()
        return seed % words.length
    }, [])

    
  const todayQuote = words[kataKataHariIni];

    return (
    <div className="mt-2 text-sm text-muted-foreground italic">
      “{todayQuote}”
    </div>
  )
}