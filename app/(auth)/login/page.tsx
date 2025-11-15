'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Building2 } from 'lucide-react'

const loginSchema = z.object({
  username: z.string().min(1, 'Username harus diisi'),
  password: z.string().min(1, 'Password harus diisi'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      setError('')

      const result = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        return
      }

      // Redirect berdasarkan role akan ditangani oleh middleware
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{ 
           background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)' 
         }}>
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-4">
            <Building2 className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Renovi</h1>
          <p className="text-white/90">Platform Pelacakan Renovasi & Konstruksi</p>
        </div>

        {/* Login Card */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-6 text-center">Masuk ke Akun Anda</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Username"
              type="text"
              placeholder="Masukkan username"
              error={errors.username?.message}
              {...register('username')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Masukkan password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          {/* Demo Accounts Info */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Demo Accounts:
            </p>
            <div className="text-xs space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
              <p>Admin: admin / admin123</p>
              <p>Mandor: mandor / mandor123</p>
              <p>Klien: klien / klien123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/80 text-sm mt-6">
          © 2024 Renovi. All rights reserved.
        </p>
      </div>
    </div>
  )
}