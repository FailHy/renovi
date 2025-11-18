'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, User, Shield, Briefcase, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { DashboardHeader } from '@/components/dashboard/Sidebar'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createUser, updateUser, deleteUser, getUsers } from '@/lib/actions/user'

const userSchema = z.object({
  nama: z.string().min(1, 'Nama harus diisi'),
  username: z.string().min(3, 'Username minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal('')),
  role: z.enum(['admin', 'mandor', 'pelanggan']),
  telpon: z.string().optional(),
  alamat: z.string().optional(),
})

type UserFormData = z.infer<typeof userSchema>

// Type yang sesuai dengan data dari database
type DatabaseUser = {
  id: string;
  nama: string;
  username: string;
  email: string;
  password: string;
  alamat: string | null;
  telpon: string | null;
  role: string; // Dari database bisa string, kita convert ke enum
  createdAt: Date;
  updatedAt: Date;
}

// Type untuk UI dengan role yang strict
type User = {
  id: string;
  nama: string;
  username: string;
  email: string;
  role: 'admin' | 'mandor' | 'pelanggan';
  telpon?: string | null;
  alamat?: string | null;
  createdAt: string;
}

// Helper function untuk convert database user ke UI user
const convertDatabaseUserToUIUser = (dbUser: DatabaseUser): User => ({
  id: dbUser.id,
  nama: dbUser.nama,
  username: dbUser.username,
  email: dbUser.email,
  role: dbUser.role as 'admin' | 'mandor' | 'pelanggan', // Type assertion
  telpon: dbUser.telpon,
  alamat: dbUser.alamat,
  createdAt: dbUser.createdAt.toISOString(),
})

export default function ManajemenPenggunaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  // Fetch data dari database
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await getUsers()
        
        if (result.success && result.data) {
          // Convert database users ke UI users
          const uiUsers = result.data.map(convertDatabaseUserToUIUser)
          setUsers(uiUsers)
        } else {
          throw new Error(result.error || 'Gagal memuat data pengguna')
        }
      } catch (error) {
        console.error("Gagal memuat data pengguna:", error)
        setError(error instanceof Error ? error.message : 'Gagal memuat data pengguna')
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchSearch = 
      user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchRole = filterRole ? user.role === filterRole : true
    
    return matchSearch && matchRole
  })

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user)
      reset({
        nama: user.nama,
        username: user.username,
        email: user.email,
        role: user.role,
        telpon: user.telpon || '',
        alamat: user.alamat || '',
        password: '',
      })
    } else {
      setEditingUser(null)
      reset({
        nama: '',
        username: '',
        email: '',
        password: '',
        role: 'pelanggan',
        telpon: '',
        alamat: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
    reset()
  }

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Prepare payload untuk server action
      const payload: any = { 
        nama: data.nama,
        username: data.username,
        email: data.email,
        role: data.role,
        telpon: data.telpon || null,
        alamat: data.alamat || null,
      }

      // Tambahkan password hanya jika ada (untuk create) atau diisi (untuk update)
      if (data.password && data.password.trim() !== '') {
        payload.password = data.password
      }

      if (editingUser) {
        // UPDATE USER
        const result = await updateUser(editingUser.id, payload)
        
        if (result.success && result.data) {
          // Convert dan update state
          const updatedUser = convertDatabaseUserToUIUser(result.data)
          setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u))
          console.log('User berhasil diupdate!')
          handleCloseModal()
        } else {
          throw new Error(result.error || 'Gagal mengupdate pengguna')
        }
      } else {
        // CREATE USER - Pastikan password ada untuk create
        if (!data.password || data.password.trim() === '') {
          throw new Error('Password harus diisi untuk pengguna baru')
        }

        const result = await createUser(payload)
        
        if (result.success && result.data) {
          // Convert dan tambahkan ke state
          const newUser = convertDatabaseUserToUIUser(result.data)
          setUsers([...users, newUser])
          console.log('User berhasil ditambahkan!')
          handleCloseModal()
        } else {
          throw new Error(result.error || 'Gagal membuat pengguna')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = (user: User) => {
    setDeletingUser(user)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingUser) return

    setIsSubmitting(true)
    setError(null)
    
    try {
      const result = await deleteUser(deletingUser.id)
      
      if (result.success) {
        setUsers(users.filter(u => u.id !== deletingUser.id))
        console.log('User berhasil dihapus!')
        setIsDeleteModalOpen(false)
        setDeletingUser(null)
      } else {
        throw new Error(result.error || 'Gagal menghapus pengguna')
      }
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'danger',       // Merah untuk admin
      mandor: 'info',        // Biru untuk mandor  
      pelanggan: 'success',  // Hijau untuk pelanggan
    } as const
    
    return variants[role as keyof typeof variants] || 'info'
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Admin',
      mandor: 'Mandor',
      pelanggan: 'Pelanggan',
    }
    return labels[role] || role
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />
      case 'mandor':
        return <Briefcase className="w-4 h-4" />
      case 'pelanggan':
        return <User className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Manajemen Pengguna"
        description="Kelola semua pengguna sistem Renovi"
        action={
          <Button 
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Pengguna
          </Button>
        }
      />

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari nama, username, atau email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              options={[
                { value: '', label: 'Semua Role' },
                { value: 'admin', label: 'Admin' },
                { value: 'mandor', label: 'Mandor' },
                { value: 'pelanggan', label: 'Pelanggan' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nama</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Username</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Telepon</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Alamat</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                      <p className="text-gray-600">Memuat data pengguna...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold">
                          {user.nama.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{user.nama}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.username}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getRoleBadge(user.role)} className="flex items-center gap-1 w-fit">
                        {getRoleIcon(user.role)}
                        {getRoleLabel(user.role)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.telpon || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{user.alamat || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                        
                          onClick={() => handleOpenModal(user)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          
                          onClick={() => handleDelete(user)}
                          className="hover:bg-red-50 hover:text-red-600"
                          disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <User className="w-16 h-16 text-gray-300" />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">
                          {searchTerm || filterRole ? 'Tidak ada pengguna yang ditemukan' : 'Belum ada pengguna'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {searchTerm || filterRole 
                            ? 'Coba ubah kata kunci pencarian atau filter' 
                            : 'Klik tombol "Tambah Pengguna" untuk menambahkan pengguna pertama'
                          }
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nama Lengkap"
            placeholder="Contoh: Ahmad Suryadi"
            error={errors.nama?.message}
            {...register('nama')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Username"
              placeholder="username"
              error={errors.username?.message}
              {...register('username')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="email@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <Input
            label={editingUser ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}
            type="password"
            placeholder="Minimal 6 karakter"
            error={errors.password?.message}
            {...register('password')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              {...register('role')}
            >
              <option value="pelanggan">Pelanggan</option>
              <option value="mandor">Mandor</option>
            </select>
            {errors.role && (
              <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          <Input
            label="Nomor Telepon"
            placeholder="08xxxxxxxxxx"
            error={errors.telpon?.message}
            {...register('telpon')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alamat
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
              placeholder="Alamat lengkap"
              {...register('alamat')}
            />
            {errors.alamat && (
              <p className="text-red-600 text-sm mt-1">{errors.alamat.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white"
            >
              {isSubmitting ? 'Menyimpan...' : editingUser ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Apakah Anda yakin ingin menghapus pengguna{' '}
            <strong>{deletingUser?.nama}</strong>? 
            Semua data terkait pengguna ini akan ikut terhapus.
          </p>
          
          {deletingUser && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold">
                  {deletingUser.nama.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{deletingUser.nama}</p>
                  <p className="text-sm text-gray-600">{deletingUser.email}</p>
                  <Badge variant={getRoleBadge(deletingUser.role)} className="mt-1">
                    {getRoleLabel(deletingUser.role)}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Batal
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDelete} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menghapus...' : 'Hapus'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}