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
  ChevronRight,
  Home,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect, useCallback } from 'react'

interface SidebarProps {
  role: 'admin' | 'mandor' | 'pelanggan'
  userName: string
  userEmail?: string
  isMobileMenuOpen?: boolean
  onMobileMenuClose?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const menuItems = {
  admin: [
    { 
      icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />, 
      label: 'Beranda', 
      href: '/admin',
      exact: true
    },
    { 
      icon: <FolderKanban className="w-5 h-5 flex-shrink-0" />, 
      label: 'Manajemen Proyek', 
      href: '/admin/proyek' 
    },
    { 
      icon: <Briefcase className="w-5 h-5 flex-shrink-0" />, 
      label: 'Manajemen Portfolio', 
      href: '/admin/portfolio' 
    },
    { 
      icon: <Newspaper className="w-5 h-5 flex-shrink-0" />, 
      label: 'Manajemen Artikel', 
      href: '/admin/artikel' 
    },
    { 
      icon: <Users className="w-5 h-5 flex-shrink-0" />, 
      label: 'Manajemen Pengguna', 
      href: '/admin/pengguna' 
    },
    { 
      icon: <MessageSquare className="w-5 h-5 flex-shrink-0" />, 
      label: 'Manajemen Testimoni', 
      href: '/admin/testimoni' 
    },
  ],

  mandor: [
    { 
      icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />, 
      label: 'Beranda', 
      href: '/mandor',
      exact: true
    },
    { 
      icon: <FolderKanban className="w-5 h-5 flex-shrink-0" />, 
      label: 'Proyek Anda', 
      href: '/mandor/proyek' 
    },
  ],

  pelanggan: [
    { 
      icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" />, 
      label: 'Beranda', 
      href: '/pelanggan',
      exact: true
    },
    { 
      icon: <FolderKanban className="w-5 h-5 flex-shrink-0" />, 
      label: 'Proyek Saya', 
      href: '/pelanggan/proyek' 
    },
  ],
}

export function Sidebar({ 
  role, 
  userName, 
  userEmail,
  isMobileMenuOpen = false,
  onMobileMenuClose,
  isCollapsed = false,
  onToggleCollapse
}: SidebarProps) {
  const pathname = usePathname()
  const [isClosing, setIsClosing] = useState(false)

  const items = menuItems[role] || []

  // Auto-close mobile menu when clicking a link
  const handleNavClick = () => {
    if (onMobileMenuClose) {
      onMobileMenuClose()
    }
  }

  // Close mobile menu with animation
  const handleCloseMobileMenu = () => {
    if (onMobileMenuClose) {
      setIsClosing(true)
      setTimeout(() => {
        onMobileMenuClose()
        setIsClosing(false)
      }, 200)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const isActiveRoute = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    
    // Untuk route nested
    if (href === '/admin' || href === '/mandor' || href === '/pelanggan') {
      return pathname === href
    }
    
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    return userName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className={cn(
            "lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-200",
            isClosing ? "opacity-0" : "opacity-100"
          )}
          onClick={handleCloseMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-white border-r border-slate-200',
          'transition-all duration-300 z-50 shadow-sm',
          isCollapsed ? 'w-20' : 'w-64',
          'lg:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Sidebar navigasi"
        role="navigation"
      >
        {/* Header */}
        <div className={cn(
          "h-16 flex items-center justify-between px-4 border-b border-slate-200",
          isCollapsed && "justify-center px-3"
        )}>
          {!isCollapsed ? (
            <Link 
              href="/" 
              className="flex items-center gap-2 group"
              onClick={handleNavClick}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                Renovi
              </span>
            </Link>
          ) : (
            <Link 
              href="/" 
              className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
              onClick={handleNavClick}
              title="Renovi"
            >
              <Home className="w-4 h-4 text-white" />
            </Link>
          )}
          
          {/* Desktop Collapse Toggle - Always show on desktop */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className={cn(
                "hidden lg:flex p-1.5 hover:bg-slate-100 rounded-lg transition-colors",
                isCollapsed && "absolute -right-3 top-4 bg-white border border-slate-200 shadow-md hover:bg-slate-50"
              )}
              aria-label={isCollapsed ? 'Perlebar sidebar' : 'Persempit sidebar'}
              title={isCollapsed ? 'Perlebar' : 'Persempit'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              )}
            </button>
          )}
        </div>

        {/* User Info */}
        <div className={cn(
          "p-4 border-b border-slate-200", 
          isCollapsed ? "px-3 py-4" : "px-4 py-4"
        )}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-semibold text-blue-600 text-sm">
                  {getUserInitials()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 truncate">
                  {userName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize font-medium">
                    {role}
                  </span>
                </div>
                {userEmail && (
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {userEmail}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div 
                className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center cursor-help hover:bg-blue-200 transition-colors"
                title={`${userName} (${role})`}
              >
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive = isActiveRoute(item.href, item.exact)

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                      'group relative',
                      isActive
                        ? [
                            'bg-blue-50',
                            'text-blue-700 font-semibold',
                            'border-l-4 border-blue-500 pl-2.5'
                          ]
                        : [
                            'text-slate-600',
                            'hover:bg-slate-50',
                            'hover:text-slate-900',
                            'border-l-4 border-transparent'
                          ]
                    )}
                    title={isCollapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={cn(
                      "transition-colors",
                      isActive 
                        ? "text-blue-600" 
                        : "text-slate-500 group-hover:text-slate-700"
                    )}>
                      {item.icon}
                    </span>
                    
                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}

                    {/* Active indicator dot for collapsed mode */}
                    {isCollapsed && isActive && (
                      <span className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className={cn(
          "p-4 border-t border-slate-200", 
          isCollapsed ? "px-3" : "px-4"
        )}>
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
              "text-rose-600 hover:bg-rose-50 font-semibold",
              "w-full group"
            )}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="truncate">Keluar</span>}
          </button>
        </div>
      </aside>
    </>
  )
}