// utils/exportUtils.ts

import { FullFollowUpData } from "@/features/followup/types"

interface ExportData {
  followUp: any
  fullData: FullFollowUpData | null
  recipientName: string
  transplantNumber: string
}

export const formatDate = (dateString?: string) => {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}

export const formatDateTime = (dateTimeString?: string) => {
  if (!dateTimeString) return "—"
  return new Date(dateTimeString).toLocaleString()
}

// Print function
export const handlePrint = (followUp: any, fullData: FullFollowUpData | null, recipientName: string, transplantNumber: string) => {
  const printContent = document.getElementById('followup-print-content')
  if (!printContent) return
  
  const originalTitle = document.title
  document.title = `Follow-up_${formatDate(followUp?.visitDate)}_${recipientName}`
  
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert("Please allow popups to print")
    return
  }
  
  // Helper function to get status color class
  const getStatusClass = (status: string) => {
    if (status === "Stable") return "badge-stable"
    if (status === "Critical" || status === "Worsening") return "badge-critical"
    return "badge-warning"
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Follow-up Report - ${recipientName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #333;
        }
        .header h1 {
          margin: 0;
          color: #2563eb;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        .patient-info {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .patient-info h3 {
          margin: 0 0 10px 0;
          color: #1f2937;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .info-item {
          display: flex;
          gap: 10px;
        }
        .info-label {
          font-weight: bold;
          color: #4b5563;
          min-width: 120px;
        }
        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #2563eb;
          border-bottom: 1px solid #d1d5db;
          padding-bottom: 8px;
          margin-bottom: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        th, td {
          border: 1px solid #d1d5db;
          padding: 8px 12px;
          text-align: left;
        }
        th {
          background: #f3f4f6;
          font-weight: bold;
        }
        .badge-stable { background: #d1fae5; color: #065f46; }
        .badge-warning { background: #fed7aa; color: #92400e; }
        .badge-critical { background: #fee2e2; color: #991b1b; }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #d1d5db;
          font-size: 12px;
          color: #6b7280;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      ${printContent.innerHTML}
      <div class="footer">
        <p>Generated on ${new Date().toLocaleString()} | Kidney Transplant Management System</p>
      </div>
    </body>
    </html>
  `)
  
  printWindow.document.close()
  printWindow.print()
  printWindow.onafterprint = () => {
    document.title = originalTitle
    printWindow.close()
  }
}

// Export to PDF function
export const handleExportPDF = async (followUp: any, fullData: FullFollowUpData | null, recipientName: string, transplantNumber: string, showToast?: (message: string, type?: "success" | "error" | "warning") => void) => {
  try {
    showToast?.("Preparing PDF export...", "warning")
    
    // Dynamic import of html2pdf
    const html2pdf = (await import('html2pdf.js')).default
    
    const element = document.getElementById('followup-print-content')
    if (!element) return
    
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `Follow-up_${formatDate(followUp?.visitDate)}_${recipientName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }
    
    await html2pdf().set(opt).from(element).save()
    showToast?.("PDF exported successfully!", "success")
  } catch (error) {
    console.error("PDF export error:", error)
    showToast?.("Failed to export PDF. Please try again.", "error")
  }
}

// Export to CSV function
export const handleExportCSV = (followUp: any, fullData: FullFollowUpData | null, recipientName: string, transplantNumber: string, showToast?: (message: string, type?: "success" | "error" | "warning") => void) => {
  try {
    const data: any[][] = []
    
    // Header
    data.push(['Follow-up Report', ''])
    data.push(['Generated on', new Date().toLocaleString()])
    data.push([])
    
    // Patient Information
    data.push(['PATIENT INFORMATION', ''])
    data.push(['Recipient Name', recipientName])
    data.push(['Transplant Number', transplantNumber])
    data.push(['Transplant Date', formatDate(followUp?.transplantation?.transplantDate)])
    data.push(['Visit Date', formatDate(followUp?.visitDate)])
    data.push(['Post-Transplant Day', followUp?.postTransplantDay])
    data.push(['Post-Transplant Month', followUp?.postTransplantMonth])
    data.push(['Visit Type', followUp?.visitType])
    data.push(['Clinical Status', followUp?.clinicalStatus])
    data.push(['Nephropathy Recurrence', followUp?.nephropathyRecurrence || 'None'])
    if (followUp?.comment) data.push(['Comment', followUp.comment])
    data.push([])
    
    // Vital Signs
    if (fullData?.vitalSigns && fullData.vitalSigns.length > 0) {
      data.push(['VITAL SIGNS', ''])
      data.push(['Date/Time', 'Heart Rate', 'Temperature', 'SpO2', 'Urine Output', 'Blood Pressure'])
      fullData.vitalSigns.forEach(vs => {
        data.push([
          formatDateTime(vs.dateTime),
          `${vs.heartRate} bpm`,
          `${vs.temperature} °C`,
          `${vs.oxygenSaturation}%`,
          `${vs.urineOutputMl} ml`,
          `${vs.bloodPressure} mmHg`
        ])
      })
      data.push([])
    }
    
    // Biological Measurements
    if (fullData?.biologicalMeasurements && fullData.biologicalMeasurements.length > 0) {
      data.push(['BIOLOGICAL MEASUREMENTS', ''])
      data.push(['Date', 'Creatinine', 'Urea', 'eGFR', 'Hb', 'CRP', 'Proteinuria'])
      fullData.biologicalMeasurements.forEach(bm => {
        data.push([
          formatDate(bm.date),
          bm.creatinine || '-',
          bm.urea || '-',
          bm.gfr || '-',
          bm.hemoglobin || '-',
          bm.crp || '-',
          bm.proteinuria || '-'
        ])
      })
      data.push([])
    }
    
    // Immunological Markers
    if (fullData?.immunologicalMarkers && fullData.immunologicalMarkers.length > 0) {
      data.push(['IMMUNOLOGICAL MARKERS', ''])
      data.push(['Marker Type', 'Time Point', 'Value', 'Unit'])
      fullData.immunologicalMarkers.forEach(marker => {
        data.push([marker.markerType, marker.timePoint, marker.value, marker.unit])
      })
      data.push([])
    }
    
    // Rejection Episodes
    if (fullData?.rejectionEpisodes && fullData.rejectionEpisodes.length > 0) {
      data.push(['REJECTION EPISODES', ''])
      data.push(['Date', 'Type', 'Grade', 'Treatment', 'Resolved'])
      fullData.rejectionEpisodes.forEach(rej => {
        data.push([
          formatDate(rej.date),
          rej.type,
          rej.grade || '-',
          rej.treatment,
          rej.resolved ? 'Yes' : 'No'
        ])
      })
      data.push([])
    }
    
    // Adverse Events
    if (fullData?.adverseEvents && fullData.adverseEvents.length > 0) {
      data.push(['ADVERSE EVENTS', ''])
      data.push(['Date', 'Event Type', 'Severity', 'Comment'])
      fullData.adverseEvents.forEach(event => {
        data.push([
          formatDate(event.date),
          event.eventType,
          event.severity,
          event.comment || '-'
        ])
      })
      data.push([])
    }
    
    // Treatments
    if (fullData?.therapeuticTreatments && fullData.therapeuticTreatments.length > 0) {
      data.push(['THERAPEUTIC TREATMENTS', ''])
      data.push(['Drug', 'Dosage', 'Route', 'Start Date', 'End Date', 'Blood Level'])
      fullData.therapeuticTreatments.forEach(tx => {
        data.push([
          tx.drugName,
          `${tx.dosage} ${tx.dosageUnit}`,
          tx.route,
          formatDate(tx.startDate),
          tx.endDate ? formatDate(tx.endDate) : 'Ongoing',
          tx.bloodLevel || '-'
        ])
      })
      data.push([])
    }
    
    // Immunosuppression
    if (fullData?.immunosuppressionRegimen) {
      data.push(['IMMUNOSUPPRESSION REGIMEN', ''])
      data.push(['Start Date', formatDate(fullData.immunosuppressionRegimen.startDate)])
      data.push(['End Date', fullData.immunosuppressionRegimen.endDate ? formatDate(fullData.immunosuppressionRegimen.endDate) : 'Ongoing'])
      const drugs = []
      if (fullData.immunosuppressionRegimen.corticosteroids) drugs.push('Corticosteroids')
      if (fullData.immunosuppressionRegimen.tacrolimus) drugs.push('Tacrolimus')
      if (fullData.immunosuppressionRegimen.ciclosporine) drugs.push('Ciclosporine')
      if (fullData.immunosuppressionRegimen.mmf) drugs.push('MMF')
      if (fullData.immunosuppressionRegimen.azathioprine) drugs.push('Azathioprine')
      if (fullData.immunosuppressionRegimen.sirolimus) drugs.push('Sirolimus')
      data.push(['Medications', drugs.join(', ')])
      data.push([])
    }
    
    // Convert to CSV
    const csvContent = data.map(row => 
      row.map(cell => {
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
          return `"${cell.replace(/"/g, '""')}"`
        }
        return cell
      }).join(',')
    ).join('\n')
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.setAttribute('download', `Follow-up_${formatDate(followUp?.visitDate)}_${recipientName}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    showToast?.("CSV exported successfully!", "success")
  } catch (error) {
    console.error("CSV export error:", error)
    showToast?.("Failed to export CSV", "error")
  }
}