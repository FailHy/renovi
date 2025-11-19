// app/(dashboard)/admin/pengguna/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search, User, Shield, Briefcase, Loader2, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { DashboardHeader } from '@/components/dashboard/Sidebar'
import { createUser, updateUser, deleteUser, getUsers } from '@/lib/actions/user'

// Type untuk UI - sesuaikan dengan data dari database
type User = {
  id: string;
  nama: string;
  username: string;
  email: string;
  role: string; // ✅ Ubah dari enum ke string
  telpon?: string | null;
  alamat?: string | null;
  createdAt: string;
}

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

  // Fetch data dari database
  const loadUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await getUsers()
      
      if (result.success && result.data) {
        // ✅ Langsung set data dari server tanpa conversion
        setUsers(result.data.map(user => ({
          ...user,
          createdAt: user.createdAt.toISOString() // Convert Date to string jika perlu
        })))
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

  useEffect(() => {
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
    setEditingUser(user || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const handleFormSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Debug: Lihat data yang dikirim
      console.log('FormData entries:')
      for (let [key, value] of formData.entries()) {
        console.log(key, value)
      }

      if (editingUser) {
        const result = await updateUser(editingUser.id, formData)
        if (!result.success) {
          throw new Error(result.error || 'Gagal mengupdate pengguna')
        }
      } else {
        const result = await createUser(formData)
        if (!result.success) {
          throw new Error(result.error || 'Gagal membuat pengguna')
        }
      }
      
      await loadUsers()
      handleCloseModal()
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
        await loadUsers()
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
      admin: 'danger',
      mandor: 'info', 
      pelanggan: 'success',
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
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white shadow-lg hover:shadow-xl transition-all duration-300 group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          <span>Tambah Pengguna</span>
        </Button>
        }
      />

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-lg rounded-2xl bg-white">
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari nama, username, atau email..."
                className="pl-10 border-gray-200 focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-900 appearance-none cursor-pointer"
              >
                <option value="">Semua Role</option>
                <option value="admin" className="text-red-600">Admin</option>
                <option value="mandor" className="text-blue-600">Mandor</option>
                <option value="pelanggan" className="text-green-600">Pelanggan</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Pengguna</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Kontak</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Alamat</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-gray-600 font-medium">Memuat data pengguna...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                          {user.nama.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">{user.nama}</p>
                          <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge 
                        variant={getRoleBadge(user.role)} 
                        className="flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full font-medium"
                      >
                        {getRoleIcon(user.role)}
                        {getRoleLabel(user.role)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{user.telpon || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 text-gray-600 max-w-xs">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm line-clamp-2">{user.alamat || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          
                          onClick={() => handleOpenModal(user)}
                          className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 p-2"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          
                          onClick={() => handleDelete(user)}
                          className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:text-red-600 p-2"
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
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <User className="w-16 h-16 text-gray-300" />
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 text-lg mb-2">
                          {searchTerm || filterRole ? 'Tidak ada pengguna yang ditemukan' : 'Belum ada pengguna'}
                        </p>
                        <p className="text-gray-500 max-w-sm">
                          {searchTerm || filterRole 
                            ? 'Coba ubah kata kunci pencarian atau filter role' 
                            : 'Mulai dengan menambahkan pengguna pertama ke dalam sistem'
                          }
                        </p>
                        {!searchTerm && !filterRole && (
                          <Button 
                            onClick={() => handleOpenModal()}
                            className="mt-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Pengguna Pertama
                          </Button>
                        )}
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
        title={editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
        size="lg"
      >
        <form action={handleFormSubmit} className="space-y-5">
          <input type="hidden" name="id" value={editingUser?.id || ''} />
          
          <Input
            label="Nama Lengkap"
            name="nama"
            placeholder="Masukkan nama lengkap pengguna"
            defaultValue={editingUser?.nama || ''}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Username"
              name="username"
              placeholder="username unik"
              defaultValue={editingUser?.username || ''}
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="email@example.com"
              defaultValue={editingUser?.email || ''}
              required
            />
          </div>

          <Input
            label={editingUser ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'}
            type="password"
            name="password"
            placeholder="Minimal 6 karakter"
            required={!editingUser}
            minLength={6}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Pengguna
            </label>
            <select
              name="role"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-900"
              defaultValue={editingUser?.role || ''}
              required
            >
              <option disabled className="text-gray-400">
                Pilih Role
              </option>
              <option value="pelanggan">Pelanggan</option>
              <option value="mandor">Mandor</option>
            </select>
          </div>

          <Input
            label="Nomor Telepon"
            name="telpon"
            placeholder="08xxxxxxxxxx"
            defaultValue={editingUser?.telpon || ''}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alamat Lengkap
            </label>
            <textarea
              name="alamat"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              rows={3}
              placeholder="Masukkan alamat lengkap pengguna"
              defaultValue={editingUser?.alamat || ''}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCloseModal}
              className="border-gray-300 hover:bg-gray-50"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingUser ? 'Mengupdate...' : 'Menyimpan...'}
                </>
              ) : (
                editingUser ? 'Update Pengguna' : 'Simpan Pengguna'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Pengguna"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed">
            Apakah Anda yakin ingin menghapus pengguna <strong>{deletingUser?.nama}</strong>? 
            Tindakan ini tidak dapat dibatalkan dan semua data terkait akan dihapus permanen.
          </p>
          
          {deletingUser && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-white font-bold">
                  {deletingUser.nama.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{deletingUser.nama}</p>
                  <p className="text-sm text-gray-600">{deletingUser.email}</p>
                  <Badge 
                    variant={getRoleBadge(deletingUser.role)} 
                    className="mt-1 inline-flex items-center gap-1"
                  >
                    {getRoleIcon(deletingUser.role)}
                    {getRoleLabel(deletingUser.role)}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
              className="border-gray-300 hover:bg-gray-50"
            >
              Batal
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDelete} 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus Pengguna'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}