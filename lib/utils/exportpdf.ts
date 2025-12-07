import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency } from './mandorUtils'

interface BahanExportData {
  nama: string
  deskripsi: string
  status: string
  kuantitas: number
  satuan: string
  harga: number
  total: number
  tanggal: string
  milestone: string
}

export async function exportBahanToPDF(
  projectName: string,
  bahanList: BahanExportData[],
  stats: {
    totalItems: number
    totalCost: number
  }
) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(`LAPORAN BAHAN PROYEK`, pageWidth / 2, 20, { align: 'center' })
  
  doc.setFontSize(14)
  doc.text(`${projectName}`, pageWidth / 2, 30, { align: 'center' })
  
  // Info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Dibuat: ${new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth / 2, 40, { align: 'center' })
  
  // Stats Box
  doc.setFillColor(241, 245, 249)
  doc.rect(20, 50, pageWidth - 40, 20, 'F')
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Ringkasan:', 25, 60)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total Bahan: ${stats.totalItems} item`, 80, 60)
  doc.text(`Total Biaya: ${formatCurrency(stats.totalCost)}`, 130, 60)
  
  // Table
  autoTable(doc, {
    startY: 75,
    head: [['No', 'Nama Bahan', 'Status', 'Qty', 'Harga', 'Total', 'Tanggal']],
    body: bahanList.map((item, index) => [
      (index + 1).toString(),
      item.nama,
      item.status,
      `${item.kuantitas} ${item.satuan}`,
      formatCurrency(item.harga),
      formatCurrency(item.total),
      item.tanggal
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: 'linebreak'
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 40 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30 },
      5: { cellWidth: 30 },
      6: { cellWidth: 25 }
    }
  })
  
  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || 75
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text('© RENOVI - Sistem Manajemen Proyek', pageWidth / 2, finalY + 20, { align: 'center' })
  
  // Save
  const fileName = `Bahan-Proyek-${projectName.replace(/\s+/g, '-')}-${Date.now()}.pdf`
  doc.save(fileName)
}