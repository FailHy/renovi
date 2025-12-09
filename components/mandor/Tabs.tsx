// FILE: components/mandor/Tabs.tsx
'use client'

import { Info, Calendar, Package } from 'lucide-react'
import { ReactNode } from 'react'

// Tipe untuk tabs utama (info, milestone, bahan)
export type MainTabValue = 'info' | 'milestone' | 'bahan'

// Tipe untuk subtabs di bahan (nota, bahan)
export type BahanTabValue = 'nota' | 'bahan'

// Props untuk tabs utama
interface TabsProps {
  activeTab: MainTabValue
  onTabChange: (tab: MainTabValue) => void
}

// Component tabs utama (untuk DetailProyekClient)
export function Tabs({ activeTab, onTabChange }: TabsProps) {
  const tabs = [
    { 
      id: 'info' as const, 
      label: 'Informasi Proyek',
      icon: <Info className="w-5 h-5" />
    },
    { 
      id: 'milestone' as const, 
      label: 'Milestone',
      icon: <Calendar className="w-5 h-5" />
    },
    { 
      id: 'bahan' as const, 
      label: 'Bahan Harian',
      icon: <Package className="w-5 h-5" />
    }
  ]

  return (
    <div className="w-full">
      <div className="flex gap-1 mb-6 p-1 bg-white rounded-lg shadow-sm border border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================
// KOMPONEN UNTUK SHADCN/UI STYLE (BahanHarianTab)
// ============================================

// Props untuk shadcn/ui style tabs
interface ShadcnTabsProps {
  defaultValue?: BahanTabValue
  value?: BahanTabValue
  onValueChange?: (value: BahanTabValue) => void
  className?: string
  children: ReactNode
}

// Wrapper untuk shadcn/ui style
export function ShadcnTabs({ 
  defaultValue = 'nota',
  value,
  onValueChange,
  className = '',
  children 
}: ShadcnTabsProps) {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  )
}

// TabsList untuk shadcn/ui style
export function TabsList({ 
  children,
  className = '' 
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`flex gap-1 mb-6 p-1 bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  )
}

// TabsTrigger untuk shadcn/ui style
export function TabsTrigger({ 
  value,
  children,
  className = '',
  onClick
}: { 
  value: BahanTabValue
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium rounded-md transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  )
}

// TabsContent untuk shadcn/ui style
export function TabsContent({ 
  value,
  children,
  className = ''
}: { 
  value: BahanTabValue
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  )
}

// Helper untuk mendapatkan icon
export function getTabIcon(value: MainTabValue | BahanTabValue) {
  switch (value) {
    case 'info': return <Info className="w-5 h-5" />
    case 'milestone': return <Calendar className="w-5 h-5" />
    case 'bahan': return <Package className="w-5 h-5" />
    case 'nota': return <Package className="w-5 h-5" />
    default: return <Info className="w-5 h-5" />
  }
}