'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Plus, BarChart3 } from 'lucide-react'

export function CTAButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      {/* Primary Button - Solid White */}
      <Link href="/kontak" className="w-full sm:w-auto">
        <Button  
          className="w-full bg-white text-primary hover:bg-gray-50 hover:scale-105 shadow-2xl hover:shadow-3xl transition-all duration-300 group flex items-center justify-center gap-3 h-16 px-8 py-4 rounded-xl font-bold text-lg"
        >
          <Plus className="w-6 h-6" />
          <span>Mulai Proyek Baru</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>

      {/* Secondary Button - Outline White */}
      <Link href="/login" className="w-full sm:w-auto">
        <Button  
          variant="outline"
          className="w-full bg-transparent text-white border-2 border-white hover:bg-white hover:text-primary hover:scale-105 transition-all duration-300 group flex items-center justify-center gap-3 h-16 px-8 py-4 rounded-xl font-bold text-lg"
        >
          <BarChart3 className="w-6 h-6" />
          <span>Lihat Progress</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>
    </div>
  )
}