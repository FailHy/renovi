// FILE: lib/utils/exportUtils.ts
// ========================================

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency } from './mandorUtils'

// Interface tetap sama...
export interface NotaExportData {
  id: string
  nomorNota: string | null
  namaToko: string | null
  tanggalBelanja: Date
  fotoNotaUrl: string | null
  createdAt: Date
  items: Array<{
    id: string
    nama: string
    harga: string
    kuantitas: string
    satuan: string
    kategori: string | null
    status: string
  }>
  milestone: {
    id: string
    nama: string
  } | null
  creator: {
    id: string
    nama: string
  }
}

export async function exportBahanToPDF(
  projectName: string,
  notaList: NotaExportData[],
  stats: {
    totalItems: number
    totalCost: number
    totalNota: number
  }
) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  
  // --- HEADER (Sama) ---
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.text('LAPORAN NOTA BELANJA', pageWidth / 2, 20, { align: 'center' })
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(`${projectName}`, pageWidth / 2, 27, { align: 'center' })
  
  doc.setDrawColor(226, 232, 240)
  doc.line(15, 32, pageWidth - 15, 32)

  // --- INFO SUMMARY (Disingkat) ---
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(15, 38, pageWidth - 30, 15, 2, 2, 'FD')

  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  doc.text('Periode:', 20, 46)
  doc.text('Nota:', 85, 46)
  doc.text('Item:', 120, 46)
  doc.text('Total:', 150, 46)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  
  // Hitung periode
  let periodeText = 'Tidak ada data'
  if (notaList.length > 0) {
    const dates = notaList.map(n => new Date(n.tanggalBelanja))
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
    
    periodeText = minDate.getDate() === maxDate.getDate() 
      ? minDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : `${minDate.getDate()}-${maxDate.getDate()} ${maxDate.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}`
  }

  doc.text(periodeText, 35, 46)
  doc.text(`${stats.totalNota}`, 100, 46)
  doc.text(`${stats.totalItems}`, 135, 46)
  doc.text(formatCurrency(stats.totalCost), 170, 46)

  // --- TABEL DATA YANG LEBIH KOMPAK ---
  const tableRows = notaList.flatMap((nota, notaIndex) => {
    // Sort items
    const sortedItems = [...nota.items].sort((a, b) => a.nama.localeCompare(b.nama))
    
    return sortedItems.map((item, itemIndex) => {
      const rowNum = notaIndex * 100 + itemIndex + 1
      const notaNum = nota.nomorNota || `N-${rowNum.toString().padStart(3, '0')}`
      const tanggal = new Date(nota.tanggalBelanja)
      
      return [
        {
          content: notaNum,
          styles: { 
            fontSize: 8,
            cellPadding: 1,
            fontStyle: 'bold'
          }
        },
        {
          content: nota.namaToko || '-',
          styles: { 
            fontSize: 8,
            cellPadding: 1,
            lineWidth: 0.1
          }
        },
        {
          content: item.nama,
          styles: { 
            fontSize: 8,
            cellPadding: 1,
            lineWidth: 0.1
          }
        },
        {
          content: `${parseFloat(item.kuantitas).toFixed(1)} ${item.satuan}`,
          styles: { 
            fontSize: 8,
            cellPadding: 1,
            halign: 'center',
            lineWidth: 0.1
          }
        },
        {
          content: formatCurrency(parseFloat(item.harga)),
          styles: { 
            fontSize: 8,
            cellPadding: 1,
            halign: 'right',
            lineWidth: 0.1
          }
        },
        {
          content: formatCurrency(parseFloat(item.harga) * parseFloat(item.kuantitas)),
          styles: { 
            fontSize: 8,
            cellPadding: 1,
            halign: 'right',
            fontStyle: 'bold',
            lineWidth: 0.1
          }
        },
        // Tanggal dipisah 3 baris
        {
          content: [
            tanggal.getDate().toString(), // Tanggal
            tanggal.toLocaleDateString('id-ID', { month: 'short' }), // Bulan (singkat)
            tanggal.getFullYear().toString() // Tahun
          ],
          styles: { 
            fontSize: 7,
            cellPadding: 1,
            halign: 'center',
            valign: 'middle',
            lineWidth: 0.1
          }
        }
      ]
    })
  })

  // Buat tabel dengan autotable
  autoTable(doc, {
    startY: 60,
    head: [[
      'No. Nota', 
      'Toko', 
      'Nama Bahan', 
      'Qty', 
      'Harga', 
      'Total',
      { 
        content: 'Tanggal\nBeli',
        styles: { 
          halign: 'center',
          valign: 'middle',
          fontSize: 8
        }
      }
    ]],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246], // Blue 500
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: { top: 2, bottom: 2, left: 2, right: 2 }
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: { top: 1, bottom: 1, left: 2, right: 2 },
      lineWidth: 0.1,
      lineColor: [226, 232, 240]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Slate 50
    },
    // Kolom lebih kompak
    columnStyles: {
      
      0: { cellWidth: 20 },                     // No. Nota
      1: { cellWidth: 25 },                     // Toko
      2: { cellWidth: 40 },                     // Nama Bahan
      3: { cellWidth: 15, halign: 'center' },   // Qty
      4: { cellWidth: 25, halign: 'right' },    // Harga
      5: { cellWidth: 25, halign: 'right' },    // Total
      6: { 
        cellWidth: 15, 
        halign: 'center',
        valign: 'middle'
      } // Tanggal (3 baris)
    },
    margin: { top: 60, left: 10, right: 10, bottom: 20 },
    tableWidth: 'wrap',
    styles: {
      overflow: 'linebreak',
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    didDrawPage: function(data) {
      // Footer page number
      doc.setFontSize(7)
      doc.setTextColor(148, 163, 184)
      doc.text(
        `Hal. ${data.pageNumber} dari ${data.pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      )
      
      // Jika ada sisa ruang, tambahkan summary
      if (data.pageNumber === data.pageCount) {
        const finalY = data.cursor.y + 5
        
        if (finalY < pageHeight - 30) {
          doc.setDrawColor(226, 232, 240)
          doc.setLineWidth(0.5)
          doc.line(15, finalY, pageWidth - 15, finalY)
          
          doc.setFontSize(10)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(30, 41, 59)
          doc.text('TOTAL SELURUH:', pageWidth - 90, finalY + 8)
          
          doc.setFontSize(11)
          doc.setTextColor(37, 99, 235)
          doc.text(formatCurrency(stats.totalCost), pageWidth - 15, finalY + 8, { align: 'right' })
          
          // Info pembuat laporan
          doc.setFontSize(8)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(100, 116, 139)
          doc.text(
            `Dicetak oleh: ${notaList[0]?.creator?.nama || 'System'} | ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
            15,
            finalY + 15
          )
        }
      }
    }
  })

  // --- WATERMARK SAAT TIDAK ADA DATA ---
  if (notaList.length === 0) {
    doc.setFontSize(40)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(226, 232, 240, 0.3)
    doc.text('TIDAK ADA DATA', pageWidth / 2, pageHeight / 2, { 
      align: 'center', 
      angle: 45 
    })
  }

  // Save
  const timestamp = new Date().toISOString().split('T')[0]
  const safeProjectName = projectName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 20)
  
  doc.save(`NOTA_${safeProjectName}_${timestamp}.pdf`)
}

// ==============================
// VERSI ALTERNATIF: TANGGAL FORMAT SINGKAT
// ==============================

export async function exportBahanToPDFCompact(
  projectName: string,
  notaList: NotaExportData[],
  stats: {
    totalItems: number
    totalCost: number
    totalNota: number
  }
) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Header lebih sederhana
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('LAPORAN NOTA BELANJA', pageWidth / 2, 15, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(projectName, pageWidth / 2, 22, { align: 'center' })
  
  // Info singkat dalam satu baris
  doc.setFontSize(9)
  doc.text(
    `Periode: ${notaList.length > 0 ? new Date(notaList[0].tanggalBelanja).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-'} | Nota: ${stats.totalNota} | Item: ${stats.totalItems} | Total: ${formatCurrency(stats.totalCost)}`,
    15,
    30
  )

  // TABEL SANGAT KOMPAK
  const tableRows = notaList.flatMap((nota) => {
    return nota.items.map((item) => {
      const tanggal = new Date(nota.tanggalBelanja)
      const tanggalStr = `${tanggal.getDate().toString().padStart(2, '0')}/${(tanggal.getMonth() + 1).toString().padStart(2, '0')}/${tanggal.getFullYear().toString().slice(-2)}`
      
      return [
        nota.nomorNota?.substring(0, 8) || 'N/A',
        (nota.namaToko || '-').substring(0, 15),
        item.nama.substring(0, 20),
        `${parseFloat(item.kuantitas).toFixed(0)} ${item.satuan.substring(0, 3)}`,
        formatCurrency(parseFloat(item.harga)).replace('Rp', '').trim(),
        formatCurrency(parseFloat(item.harga) * parseFloat(item.kuantitas)).replace('Rp', '').trim(),
        tanggalStr
      ]
    })
  })

  autoTable(doc, {
    startY: 35,
    head: [['Nota', 'Toko', 'Bahan', 'Qty', 'Harga', 'Total', 'Tgl']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 1,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7,
      cellPadding: 1,
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center', fontSize: 7 },
      1: { cellWidth: 20, fontSize: 7 },
      2: { cellWidth: 35, fontSize: 7 },
      3: { cellWidth: 15, halign: 'center', fontSize: 7 },
      4: { cellWidth: 20, halign: 'right', fontSize: 7 },
      5: { cellWidth: 25, halign: 'right', fontSize: 7, fontStyle: 'bold' },
      6: { cellWidth: 12, halign: 'center', fontSize: 7 }
    },
    margin: { top: 35, left: 10, right: 10 }
  })

  // Save
  doc.save(`NOTA_${projectName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`)
}