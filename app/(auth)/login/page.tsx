'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Building2, Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const loginSchema = z.object({
  username: z.string().min(1, 'Username harus diisi'),
  password: z.string().min(1, 'Password harus diisi'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
        setError('Kredensial tidak valid. Silakan periksa username dan password Anda.')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Terjadi kesalahan sistem. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4">

      {/* Background Ornaments */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-[500px] h-[500px] bg-primary/20 blur-3xl rounded-full absolute -top-20 -left-20 opacity-40" />
        <div className="w-[400px] h-[400px] bg-blue-400/10 blur-2xl rounded-full absolute bottom-0 right-0 opacity-40" />
      </div>

      <div className="relative w-full max-w-md">

{/* login card */}
        <Card className="backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl">
          <CardContent className="p-8 space-y-8">
            <div className="flex flex-col items-center text-center space-y-4 mb-2">
              <div className="w-20 h-20 bg-white border border-primary/40 border-slate-500  text-primary-foreground flex items-center justify-center rounded-3xl">
                <Building2 className="w-9 h-9" />
              </div>

              <div>
                <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
                  Selamat Datang
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Masuk ke akun Renovi Anda untuk melanjutkan ke dashboard.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-5">

              {/* Username */}
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Username"
                    className="pl-11 h-12 rounded-xl text-base border-slate-300"
                    disabled={isLoading}
                    {...register('username')}
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="pl-11 pr-12 h-12 rounded-xl text-base border-slate-300"
                    disabled={isLoading}
                    {...register('password')}
                  />
                
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

                {/* Error */}
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-400/30 text-red-700 rounded-lg text-sm text-center font-medium">
                    {error}
                  </div>
                )}

              {/* Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl text-base font-semibold shadow-lg bg-primary hover:bg-primary/90 transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Masuk <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>

            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-700 transition"
          >
            ← Kembali ke halaman utama
          </Link>

          <p className="text-xs text-slate-400 mt-4">
            © {new Date().getFullYear()} Renovi Systems
          </p>
        </div>
      </div>
    </div>
  )
}
