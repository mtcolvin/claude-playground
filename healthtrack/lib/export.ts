// Data export utilities
import type { HealthMetric, PatientProfile, LabResult, MedicalFile } from './types';
import { METRIC_CONFIGS } from './types';
import { formatDateShort } from './utils';

// Export metrics to CSV
export function exportMetricsToCSV(metrics: HealthMetric[]): void {
  const headers = ['Date', 'Metric Type', 'Value', 'Unit', 'Notes'];
  const rows = metrics.map((m) => [
    m.date,
    METRIC_CONFIGS[m.type]?.label || m.type,
    m.value.toString(),
    m.unit,
    m.notes || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  downloadCSV(csvContent, 'health-metrics.csv');
}

// Export lab results to CSV
export function exportLabResultsToCSV(labResults: LabResult[]): void {
  const headers = ['Test Date', 'Test Name', 'Biomarker', 'Value', 'Unit', 'Normal Range', 'Status'];
  const rows = labResults.flatMap((result) =>
    result.results.map((item) => [
      result.date,
      result.testName,
      item.biomarker,
      item.value.toString(),
      item.unit,
      item.normalRange,
      item.status,
    ])
  );

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  downloadCSV(csvContent, 'lab-results.csv');
}

// Export complete health report to CSV
export function exportCompleteReport(
  profile: PatientProfile | null,
  metrics: HealthMetric[],
  labResults: LabResult[]
): void {
  let csvContent = '';

  // Profile section
  if (profile) {
    csvContent += 'PATIENT PROFILE\n';
    csvContent += `Name,${profile.name}\n`;
    csvContent += `Date of Birth,${profile.dateOfBirth}\n`;
    csvContent += `Gender,${profile.gender}\n`;
    csvContent += `Blood Type,${profile.bloodType || 'N/A'}\n`;
    csvContent += `Allergies,"${profile.allergies.join(', ')}"\n`;
    csvContent += `Conditions,"${profile.conditions.join(', ')}"\n`;
    csvContent += '\n';
  }

  // Metrics section
  csvContent += 'HEALTH METRICS\n';
  csvContent += 'Date,Metric Type,Value,Unit,Notes\n';
  metrics.forEach((m) => {
    csvContent += `${m.date},"${METRIC_CONFIGS[m.type]?.label || m.type}",${m.value},${m.unit},"${m.notes || ''}"\n`;
  });
  csvContent += '\n';

  // Lab results section
  csvContent += 'LAB RESULTS\n';
  csvContent += 'Test Date,Test Name,Biomarker,Value,Unit,Normal Range,Status\n';
  labResults.forEach((result) => {
    result.results.forEach((item) => {
      csvContent += `${result.date},"${result.testName}","${item.biomarker}",${item.value},${item.unit},"${item.normalRange}",${item.status}\n`;
    });
  });

  downloadCSV(csvContent, 'complete-health-report.csv');
}

// Helper function to trigger download
function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Generate printable HTML report
export function generatePrintableReport(
  profile: PatientProfile | null,
  metrics: HealthMetric[],
  labResults: LabResult[]
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Health Report - ${profile?.name || 'Patient'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
          }
          h2 {
            color: #1e40af;
            margin-top: 30px;
            border-bottom: 2px solid #ddd;
            padding-bottom: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          .profile-info {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .profile-info p {
            margin: 8px 0;
          }
          .status-normal { color: #10b981; font-weight: bold; }
          .status-high { color: #f59e0b; font-weight: bold; }
          .status-low { color: #f59e0b; font-weight: bold; }
          .status-critical { color: #ef4444; font-weight: bold; }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <h1>Health Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>

        ${profile ? `
          <h2>Patient Profile</h2>
          <div class="profile-info">
            <p><strong>Name:</strong> ${profile.name}</p>
            <p><strong>Date of Birth:</strong> ${formatDateShort(profile.dateOfBirth)}</p>
            <p><strong>Gender:</strong> ${profile.gender}</p>
            <p><strong>Blood Type:</strong> ${profile.bloodType || 'N/A'}</p>
            <p><strong>Allergies:</strong> ${profile.allergies.join(', ') || 'None'}</p>
            <p><strong>Medical Conditions:</strong> ${profile.conditions.join(', ') || 'None'}</p>
          </div>
        ` : ''}

        <h2>Health Metrics</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Metric</th>
              <th>Value</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${metrics.map((m) => `
              <tr>
                <td>${formatDateShort(m.date)}</td>
                <td>${METRIC_CONFIGS[m.type]?.label || m.type}</td>
                <td>${m.value} ${m.unit}</td>
                <td>${m.notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Lab Results</h2>
        ${labResults.map((result) => `
          <h3>${result.testName} - ${formatDateShort(result.date)}</h3>
          <table>
            <thead>
              <tr>
                <th>Biomarker</th>
                <th>Value</th>
                <th>Normal Range</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${result.results.map((item) => `
                <tr>
                  <td>${item.biomarker}</td>
                  <td>${item.value} ${item.unit}</td>
                  <td>${item.normalRange}</td>
                  <td class="status-${item.status}">${item.status.toUpperCase()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `).join('')}

        <p style="margin-top: 40px; font-size: 12px; color: #666;">
          This report is for informational purposes only and should not be used for diagnosis or treatment.
          Always consult with a qualified healthcare professional.
        </p>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}
