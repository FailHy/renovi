'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  FolderKanban,
  Briefcase,
  Newspaper,
  Users,
  MessageSquare,
  LogOut,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface SidebarProps {
  role: 'admin' | 'mandor' | 'pelanggan'
  userName: string
}

const menuItems = {
  admin: [
    { 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      label: 'Beranda', 
      href: '/admin' 
    },
    { 
      icon: <FolderKanban className="w-5 h-5" />, 
      label: 'Manajemen Proyek', 
      href: '/admin/proyek' 
    },
    { 
      icon: <Briefcase className="w-5 h-5" />, 
      label: 'Manajemen Portfolio', 
      href: '/admin/portfolio' 
    },
    { 
      icon: <Newspaper className="w-5 h-5" />, 
      label: 'Manajemen Artikel', 
      href: '/admin/artikel' 
    },
    { 
      icon: <Users className="w-5 h-5" />, 
      label: 'Manajemen Pengguna', 
      href: '/admin/pengguna' 
    },
    { 
      icon: <MessageSquare className="w-5 h-5" />, 
      label: 'Manajemen Testimoni', 
      href: '/admin/testimoni' 
    },
  ],

  mandor: [
    { 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      label: 'Beranda', 
      href: '/mandor' 
    },
    { 
      icon: <FolderKanban className="w-5 h-5" />, 
      label: 'Proyek Anda', 
      href: '/mandor/proyek' 
    },
  ],

  pelanggan: [
    { 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      label: 'Beranda', 
      href: '/pelanggan' 
    },
    { 
      icon: <FolderKanban className="w-5 h-5" />, 
      label: 'Proyek Saya', 
      href: '/pelanggan/proyek' 
    },
  ],
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const items = menuItems[role] || []

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const isActiveRoute = (href: string) => {
    // Handle beranda routes
    if (href === '/admin' || href === '/mandor' || href === '/pelanggan') {
      return pathname === href
    }
    
    // Untuk route lainnya, gunakan prefix matching
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className={cn(
        "h-16 flex items-center justify-between px-4 border-b border-gray-200",
        isCollapsed && "justify-center"
      )}>
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-lg text-gray-900">Renovi</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={cn(
              'w-5 h-5 transition-transform text-gray-600',
              isCollapsed && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* User Info */}
      <div className={cn("p-4 border-b border-gray-200", isCollapsed && "px-2")}>
        {!isCollapsed ? (
          <div>
            <p className="font-semibold text-gray-900 truncate">{userName}</p>
            <p className="text-sm text-gray-500 capitalize">
              {role}
            </p>
          </div>
        ) : (
          <div 
            className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto"
            title={userName}
          >
            <Users className="w-5 h-5 text-blue-600" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {items.map((item) => {
            const isActive = isActiveRoute(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className={cn("p-4 border-t border-gray-200", isCollapsed && "px-2")}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

// ========================================
// Dashboard Header Component
// ========================================

interface DashboardHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function DashboardHeader({ title, description, action }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {title}
        </h1>
        {description && (
          <p className="text-gray-600 mt-1">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}