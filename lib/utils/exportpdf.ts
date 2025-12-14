import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency } from './mandorUtils'

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
  // Use 'p' (portrait), 'mm' (millimeters), 'a4' format
  const doc = new jsPDF('p', 'mm', 'a4')
  
  // Margins in mm (3 cm = 30 mm)
  const margin = 30
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const contentWidth = pageWidth - (margin * 2)

  // Set default font to Times New Roman
  doc.setFont('times', 'normal')

  // Helper to add centered text
  const addCenteredText = (text: string, y: number, fontSize: number, fontStyle: 'normal' | 'bold' = 'normal') => {
    doc.setFont('times', fontStyle)
    doc.setFontSize(fontSize)
    doc.text(text, pageWidth / 2, y, { align: 'center' })
  }

  // Helper to get image data from URL
  const getImageData = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (error) {
      console.error('Error fetching image:', error)
      return ''
    }
  }

  // Iterate through each nota to create pages
  for (let i = 0; i < notaList.length; i++) {
    const nota = notaList[i]
    
    // --- PAGE 1: HEADER & PHOTO ---
    if (i > 0) doc.addPage() // Add new page for subsequent notas

    // Header
    let yPos = margin
    addCenteredText('LAPORAN NOTA BELANJA', yPos, 14, 'bold')
    yPos += 7
    addCenteredText(projectName, yPos, 12, 'bold')
    yPos += 10

    // Nota Info Table (Manual positioning)
    doc.setFontSize(12)
    doc.setFont('times', 'normal')
    
    const infoStartY = yPos
    const labelX = margin
    const valueX = margin + 35
    const rowHeight = 6

    // Left Column Info
    doc.text('Nomor Nota', labelX, yPos)
    doc.text(`: ${nota.nomorNota || '-'}`, valueX, yPos)
    yPos += rowHeight
    doc.text('Tanggal', labelX, yPos)
    doc.text(`: ${new Date(nota.tanggalBelanja).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, valueX, yPos)
    yPos += rowHeight
    doc.text('Toko', labelX, yPos)
    doc.text(`: ${nota.namaToko || '-'}`, valueX, yPos)
    
    // Reset Y for Right Column (if needed, but simple list is fine for A4)
    yPos += rowHeight
    doc.text('Pembeli', labelX, yPos)
    doc.text(`: ${nota.creator?.nama || '-'}`, valueX, yPos)
    yPos += rowHeight
    
    // Separator line
    yPos += 5
    doc.setLineWidth(0.5)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 10

    // Photo Section Title
    doc.setFontSize(14)
    doc.setFont('times', 'bold')
    doc.text('I. BUKTI FISIK NOTA', margin, yPos)
    yPos += 10

    // Image
    if (nota.fotoNotaUrl) {
      try {
        const imgData = await getImageData(nota.fotoNotaUrl)
        if (imgData) {
          // Calculate image dimensions to fit within margins
          const maxImgHeight = pageHeight - yPos - margin
          const imgProps = doc.getImageProperties(imgData)
          let imgWidth = contentWidth
          let imgHeight = (imgProps.height * imgWidth) / imgProps.width

          if (imgHeight > maxImgHeight) {
            imgHeight = maxImgHeight
            imgWidth = (imgProps.width * imgHeight) / imgProps.height
          }

          // Center image
          const xPos = margin + (contentWidth - imgWidth) / 2
          doc.addImage(imgData, 'JPEG', xPos, yPos, imgWidth, imgHeight)
        }
      } catch (e) {
        doc.setFontSize(12)
        doc.setFont('times', 'italic')
        doc.text('(Gagal memuat gambar nota)', margin, yPos)
      }
    } else {
      doc.setFontSize(12)
      doc.setFont('times', 'italic')
      doc.text('(Tidak ada foto nota)', margin, yPos)
    }

    // --- PAGE 2: ITEM LIST ---
    doc.addPage()
    yPos = margin

    // Header for Page 2 (Optional, keeps context)
    addCenteredText('RINCIAN BARANG', yPos, 14, 'bold')
    yPos += 10

    // Item List Title
    doc.setFontSize(14)
    doc.setFont('times', 'bold')
    doc.text('II. DAFTAR BAHAN', margin, yPos)
    yPos += 5

    // Prepare table data
    const tableBody = nota.items.map((item, index) => [
      (index + 1).toString(),
      item.nama,
      `${parseFloat(item.kuantitas)} ${item.satuan}`,
      formatCurrency(parseFloat(item.harga)),
      formatCurrency(parseFloat(item.harga) * parseFloat(item.kuantitas))
    ])

    // Add Total Row
    const totalNota = nota.items.reduce((sum, item) => sum + (parseFloat(item.harga) * parseFloat(item.kuantitas)), 0)
    tableBody.push([
      '', 
      'TOTAL', 
      '', 
      '', 
      formatCurrency(totalNota)
    ])

    // Generate Table
    autoTable(doc, {
      startY: yPos,
      head: [['No', 'Nama Barang', 'Qty', 'Harga Satuan', 'Total']],
      body: tableBody,
      margin: { top: margin, right: margin, bottom: margin, left: margin },
      theme: 'plain', // Simple theme to match Times New Roman style
      styles: {
        font: 'times',
        fontSize: 12,
        cellPadding: 3,
        lineColor: [0, 0, 0], // Black lines
        lineWidth: 0.1,
        textColor: [0, 0, 0]
      },
      headStyles: {
        fontStyle: 'bold',
        fillColor: [240, 240, 240], // Light gray header
        textColor: [0, 0, 0],
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 }, // No
        1: { cellWidth: 'auto' }, // Nama
        2: { halign: 'center', cellWidth: 30 }, // Qty
        3: { halign: 'right', cellWidth: 35 }, // Harga
        4: { halign: 'right', cellWidth: 35 }  // Total
      },
      didParseCell: function(data) {
        // Bold the Total row
        if (data.row.index === tableBody.length - 1) {
          data.cell.styles.fontStyle = 'bold'
        }
      }
    })

    // Footer / Signature (on the last page of items)
    const finalY = (doc as any).lastAutoTable.finalY + 20
    
    // Check if enough space for signature, else add page
    if (finalY + 40 > pageHeight - margin) {
      doc.addPage()
      yPos = margin
    } else {
      yPos = finalY
    }

    const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    
    // Right aligned signature
    const signatureX = pageWidth - margin - 50
    doc.setFontSize(12)
    doc.setFont('times', 'normal')
    doc.text(`Padang, ${dateStr}`, signatureX, yPos, { align: 'center' })
    yPos += 25
    doc.setFont('times', 'bold')
    doc.text(`( ${nota.creator?.nama || 'Admin'} )`, signatureX, yPos, { align: 'center' })
  }

  // Save the PDF
  const timestamp = new Date().toISOString().split('T')[0]
  const safeProjectName = projectName.replace(/[^a-zA-Z0-9]/g, '_')
  doc.save(`Laporan_Nota_${safeProjectName}_${timestamp}.pdf`)
}