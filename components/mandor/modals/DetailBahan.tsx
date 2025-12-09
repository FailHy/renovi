// FILE: components/bahan/DetailModal.tsx
'use client'

import { useState } from 'react'
import { X, Package, Tag, DollarSign, Hash, FileText, Image as ImageIcon, Calendar, User, Store, ChevronLeft, ChevronRight } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface BahanDetailModalProps {
  isOpen: boolean
  onClose: () => void
  bahan: {
    id: string
    nama: string
    deskripsi?: string
    harga: number
    kuantitas: number
    satuan: string
    kategori?: string
    status: string
    gambar?: string[]
    createdAt?: string
    updatedAt?: string
    creator?: {
      nama: string
    }
    nota?: {
      namaToko: string
      tanggalBelanja: string
      nomorNota: string
    }
  }
}

export function BahanDetailModal({ isOpen, onClose, bahan }: BahanDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const subtotal = Number(bahan.harga) * Number(bahan.kuantitas)
  
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Digunakan':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Sisa':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  const nextImage = () => {
    if (bahan.gambar && bahan.gambar.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % bahan.gambar!.length)
    }
  }

  const prevImage = () => {
    if (bahan.gambar && bahan.gambar.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + bahan.gambar!.length) % bahan.gambar!.length)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="2xl"
      noPadding
    >
      <div className="max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{bahan.nama}</h2>
                <p className="text-sm text-gray-500">ID: {bahan.id.substring(0, 8)}...</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Images */}
            <div>
              {/* Main Image Container */}
              <div className="relative bg-gray-100 rounded-xl overflow-hidden border border-gray-200 aspect-square mb-4">
                {bahan.gambar && bahan.gambar.length > 0 ? (
                  <>
                    <img 
                      src={bahan.gambar[selectedImageIndex]} 
                      alt={`${bahan.nama} - ${selectedImageIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                    
                    {/* Navigation Arrows */}
                    {bahan.gambar.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                        >
                          <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                      </>
                    )}
                    
                    {/* Image Counter */}
                    {bahan.gambar.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                        {selectedImageIndex + 1} / {bahan.gambar.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-gray-500">Tidak ada gambar</p>
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {bahan.gambar && bahan.gambar.length > 1 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Galeri Gambar</p>
                  <div className="grid grid-cols-4 gap-2">
                    {bahan.gambar.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative rounded-lg overflow-hidden border-2 aspect-square ${
                          selectedImageIndex === index 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        } transition-all`}
                      >
                        <img 
                          src={img} 
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                          {index + 1}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Status & Category Row */}
              <div className="flex flex-wrap gap-3">
                <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusColor(bahan.status)}`}>
                  {bahan.status}
                </span>
                
                {bahan.kategori && (
                  <span className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                    <Tag className="w-4 h-4 mr-2" />
                    {bahan.kategori}
                  </span>
                )}
              </div>

              {/* Price Information Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Informasi Harga</h3>
                <div className="space-y-4">
                  {/* Harga Satuan */}
                  <div className="flex justify-between items-center pb-3 border-b border-blue-200">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">Harga Satuan</span>
                    </div>
                    <span className="text-xl font-bold text-blue-700">
                      {formatCurrency(bahan.harga)}
                    </span>
                  </div>
                  
                  {/* Kuantitas */}
                  <div className="flex justify-between items-center pb-3 border-b border-blue-200">
                    <div className="flex items-center gap-2">
                      <Hash className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">Kuantitas</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {bahan.kuantitas} {bahan.satuan}
                    </span>
                  </div>
                  
                  {/* Subtotal */}
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-lg font-bold text-gray-900">Subtotal</span>
                    <span className="text-2xl font-bold text-green-700">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {bahan.deskripsi && (
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Deskripsi</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-line flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                      <span>{bahan.deskripsi}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Additional Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                {bahan.nota && (
                  <>
                    {/* Toko */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Store className="w-4 h-4 text-gray-500" />
                        <p className="text-sm font-medium text-gray-700">Toko</p>
                      </div>
                      <p className="text-gray-900 font-semibold truncate">{bahan.nota.namaToko}</p>
                    </div>
                    
                    {/* Tanggal Beli */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <p className="text-sm font-medium text-gray-700">Tanggal Beli</p>
                      </div>
                      <p className="text-gray-900 font-semibold">
                        {new Date(bahan.nota.tanggalBelanja).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </>
                )}
                
                {/* Dibuat Oleh */}
                {bahan.creator && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <p className="text-sm font-medium text-gray-700">Dibuat Oleh</p>
                    </div>
                    <p className="text-gray-900 font-semibold truncate">{bahan.creator.nama}</p>
                  </div>
                )}
                
                {/* Tanggal Dibuat */}
                {bahan.createdAt && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-sm font-medium text-gray-700">Dibuat</p>
                    </div>
                    <p className="text-sm text-gray-700">
                      {formatDate(bahan.createdAt)}
                    </p>
                  </div>
                )}
              </div>

              {/* Informasi Nota (jika ada) */}
              {bahan.nota && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">Informasi Nota</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-blue-700">Nomor Nota:</p>
                      <p className="font-medium text-blue-900">{bahan.nota.nomorNota}</p>
                    </div>
                    <div>
                      <p className="text-blue-700">Tanggal:</p>
                      <p className="font-medium text-blue-900">
                        {new Date(bahan.nota.tanggalBelanja).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="min-w-[100px]"
              >
                Tutup
              </Button>
              <Button
                type="button"
                className="min-w-[140px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                onClick={() => {
                  // TODO: Implement edit functionality
                  console.log('Edit bahan:', bahan.id)
                }}
              >
                Edit Bahan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}