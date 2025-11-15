'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Search, User } from 'lucide-react'
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
import { createUser, updateUser, deleteUser } from '@/lib/actions/user'

const userSchema = z.object({
  nama: z.string().min(1, 'Nama harus diisi'),
  username: z.string().min(3, 'Username minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  role: z.enum(['admin', 'mandor', 'pelanggan']),
  telpon: z.string().optional(),
  alamat: z.string().optional(),
})

type UserFormData = z.infer<typeof userSchema>

// Mock data - replace dengan data dari API
const mockUsers = [
  {
    id: '1',
    nama: 'Administrator Renovi',
    username: 'admin',
    email: 'admin@renovi.com',
    role: 'admin',
    telpon: '081234567890',
    alamat: 'Jl. Sudirman No. 123, Pekanbaru',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    nama: 'Ahmad Suryadi',
    username: 'ahmad_mandor',
    email: 'ahmad@renovi.com',
    role: 'mandor',
    telpon: '082345678901',
    alamat: 'Jl. Jendral Sudirman No. 45, Pekanbaru',
    createdAt: '2024-01-05',
  },
  {
    id: '3',
    nama: 'Dewi Lestari',
    username: 'dewi_lestari',
    email: 'dewi@email.com',
    role: 'pelanggan',
    telpon: '085678901234',
    alamat: 'Perumahan Griya Asri Blok A No. 15',
    createdAt: '2024-01-10',
  },
]

export default function ManajemenPenggunaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<any>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  const filteredUsers = users.filter((user) => {
    const matchSearch = 
      user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchRole = filterRole ? user.role === filterRole : true
    
    return matchSearch && matchRole
  })

  const handleOpenModal = (user?: any) => {
    if (user) {
      setEditingUser(user)
      reset({
        nama: user.nama,
        username: user.username,
        email: user.email,
        role: user.role,
        telpon: user.telpon || '',
        alamat: user.alamat || '',
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
    try {
      if (editingUser) {
        // Update user
        console.log('Update user:', data)
        alert('User berhasil diupdate!')
      } else {
        // Create user
        console.log('Create user:', data)
        alert('User berhasil ditambahkan!')
      }
      handleCloseModal()
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan!')
    }
  }

  const handleDelete = (user: any) => {
    setDeletingUser(user)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    try {
      console.log('Delete user:', deletingUser.id)
      setUsers(users.filter((u) => u.id !== deletingUser.id))
      alert('User berhasil dihapus!')
      setIsDeleteModalOpen(false)
      setDeletingUser(null)
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan!')
    }
  }

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      admin: 'danger',
      mandor: 'warning',
      pelanggan: 'info',
    }
    return variants[role] || 'info'
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Admin',
      mandor: 'Mandor',
      pelanggan: 'Pelanggan',
    }
    return labels[role] || role
  }

  return (
    <div>
      <DashboardHeader
        title="Manajemen Pengguna"
        description="Kelola semua pengguna sistem Renovi"
        action={
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Pengguna
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama, username, atau email..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="select"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="mandor">Mandor</option>
              <option value="pelanggan">Pelanggan</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Telepon</th>
                <th>Alamat</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-light-primary/10 dark:bg-dark-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-light-primary dark:text-dark-primary" />
                      </div>
                      <span className="font-medium">{user.nama}</span>
                    </div>
                  </td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <Badge variant={getRoleBadge(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </td>
                  <td>{user.telpon || '-'}</td>
                  <td className="max-w-xs truncate">{user.alamat || '-'}</td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleOpenModal(user)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">
              {searchTerm || filterRole ? 'Tidak ada pengguna yang ditemukan' : 'Belum ada pengguna'}
            </div>
          )}
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

          <div className="grid grid-cols-2 gap-4">
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

          <Select
            label="Role"
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'mandor', label: 'Mandor' },
              { value: 'pelanggan', label: 'Pelanggan' },
            ]}
            error={errors.role?.message}
            {...register('role')}
          />

          <Input
            label="Nomor Telepon"
            placeholder="08xxxxxxxxxx"
            error={errors.telpon?.message}
            {...register('telpon')}
          />

          <Input
            label="Alamat"
            placeholder="Alamat lengkap"
            error={errors.alamat?.message}
            {...register('alamat')}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
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
        <p className="mb-6">
          Apakah Anda yakin ingin menghapus pengguna{' '}
          <strong>{deletingUser?.nama}</strong>? 
          Semua data terkait pengguna ini akan ikut terhapus.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
            Batal
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Hapus
          </Button>
        </div>
      </Modal>
    </div>
  )
}