/**
 * Data Export Utilities
 *
 * Supports exporting health data in multiple formats:
 * - PDF: Medical records, reports, summaries
 * - CSV: Spreadsheet-compatible data
 * - JSON: Raw data backup and migration
 * - Excel: Formatted spreadsheets with multiple sheets
 */

import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

// Export types
export type ExportFormat = 'pdf' | 'csv' | 'json' | 'excel'

//========================================================================
// CSV Export
//==========================================================================

export function exportToCSV(data: any[], headers?: string[]): Blob {
  if (!Array.isArray(data) || data.length === 0) {
    return new Blob([''], { type: 'text/csv' })
  }

  const cols = headers || Object.keys(data[0])
  const csvRows: string[] = []

  csvRows.push(cols.map((h) => escapeCSV(h)).join(','))

  for (const row of data) {
    const values = cols.map((col) => escapeCSV(formatValue(row[col])))
    csvRows.push(values.join(','))
  }

  return new Blob([csvRows.join('\n')], { type: 'text/csv' })
}

function escapeCSV(value: string): string {
  if (value == null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

//==========================================================================
// JSON Export
//==========================================================================

export function exportToJSON(data: any, pretty = true): Blob {
  const json = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)
  return new Blob([json], { type: 'application/json' })
}

//==========================================================================
// PDF Export
//==========================================================================

export async function exportToPDF(
  data: any,
  options: {
    title?: string
    fileName?: string
  } = {}
): Promise<Blob> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  let yPos = 20

  // Title
  doc.setFontSize(20)
  doc.text(options.title || 'Health Data Export', pageWidth / 2, yPos, { align: 'center' })
  yPos += 15

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: 'center' })
  yPos += 15
  doc.setTextColor(0)

  // Content
  doc.setFontSize(12)

  if (Array.isArray(data)) {
    for (const item of data) {
      const lines = formatForPDF(item)
      for (const line of lines) {
        if (yPos > pageHeight - 20) {
          doc.addPage()
          yPos = 20
        }
        doc.text(line, 15, yPos)
        yPos += 7
      }
      yPos += 5
    }
  } else {
    const lines = formatForPDF(data)
    for (const line of lines) {
      if (yPos > pageHeight - 20) {
        doc.addPage()
        yPos = 20
      }
      doc.text(line, 15, yPos)
      yPos += 7
    }
  }

  return doc.output('blob')
}

function formatForPDF(item: any): string[] {
  const lines: string[] = []
  for (const [key, value] of Object.entries(item)) {
    if (value === null || value === undefined) continue
    const k = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim()
    const v = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
    lines.push(`${k}: ${v}`)
  }
  return lines
}

//==========================================================================
// Excel Export
//==========================================================================

export function exportToExcel(
  data: any[] | Record<string, any[]>,
  options: { fileName?: string; sheetName?: string } = {}
): Blob {
  const workbook = XLSX.utils.book_new()

  if (Array.isArray(data)) {
    const worksheet = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Sheet1')
  } else {
    for (const [sheetName, sheetData] of Object.entries(data)) {
      if (Array.isArray(sheetData) && sheetData.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(sheetData)
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
      }
    }
  }

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

//==========================================================================
// Download Helper
//==========================================================================

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function getFileExtension(format: ExportFormat): string {
  const ext: Record<ExportFormat, string> = {
    pdf: 'pdf',
    csv: 'csv',
    json: 'json',
    excel: 'xlsx',
  }
  return ext[format]
}

export function generateFileName(baseName: string, format: ExportFormat): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const ext = getFileExtension(format)
  return `${baseName}_${timestamp}.${ext}`
}
