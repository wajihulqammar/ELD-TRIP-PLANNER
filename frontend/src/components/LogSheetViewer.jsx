import React, { useState, useRef } from 'react';
import LogSheet from './LogSheet';
import { ChevronLeft, ChevronRight, Download, Printer, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function LogSheetViewer({ dailyLogs, tripData }) {
  const [currentDay, setCurrentDay] = useState(0);
  const [exporting, setExporting] = useState(false);
  const sheetRef = useRef(null);

  if (!dailyLogs || dailyLogs.length === 0) return null;

  const log = dailyLogs[currentDay];
  const driverInfo = {
    current_location: tripData?.summary?.current_location || '',
    dropoff_location: tripData?.summary?.dropoff_location || '',
    total_distance_miles: tripData?.total_distance_miles || 0,
    num_days: dailyLogs.length,
    cycle_hours_used_at_end: tripData?.summary?.cycle_hours_used_at_end || 0,
    carrier_name: 'Independent',
    truck_number: 'TK-001',
    main_office: 'N/A',
    home_terminal: 'N/A',
  };

  const handlePrint = () => {
    const canvases = document.querySelectorAll('[id^="log-sheet-canvas-day-"]');
    const printWindow = window.open('', '_blank');

    const imgs = Array.from(canvases).map((canvas) => {
      return `<img src="${canvas.toDataURL('image/png')}" style="width:100%;max-width:850px;margin:0 auto;display:block;page-break-after:always;" />`;
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ELD Daily Log Sheets</title>
        <style>
          body { margin: 0; padding: 10px; background: white; }
          img { margin-bottom: 20px; }
          @media print { img { page-break-after: always; } }
        </style>
      </head>
      <body>${imgs.join('')}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const canvases = document.querySelectorAll('[id^="log-sheet-canvas-day-"]');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < canvases.length; i++) {
        const canvas = canvases[i];
        const imgData = canvas.toDataURL('image/png');
        const ratio = canvas.width / canvas.height;
        const h = pdfWidth / ratio;
        const yOffset = (pdfHeight - h) / 2;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, h);
      }

      pdf.save('ELD_Daily_Logs.pdf');
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleExportCurrentPDF = async () => {
    setExporting(true);
    try {
      const canvas = document.getElementById(`log-sheet-canvas-day-${log.day_number}`);
      if (!canvas) return;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const ratio = canvas.width / canvas.height;
      const h = pdfWidth / ratio;
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const yOffset = (pdfHeight - h) / 2;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, yOffset, pdfWidth, h);
      pdf.save(`ELD_Log_Day_${log.day_number}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="card fade-in" id="log-sheet-viewer">
      <div className="card-header">
        <div className="card-icon purple">
          <FileText size={18} color="#8b5cf6" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="card-title">ELD Daily Log Sheets</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            FMCSA 70-Hour/8-Day Property Carrier Logs · {dailyLogs.length} sheet{dailyLogs.length !== 1 ? 's' : ''} generated
          </div>
        </div>
        <div className="export-bar">
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExportCurrentPDF}
            disabled={exporting}
            id="btn-export-current-pdf"
            title="Export current day as PDF"
          >
            <Download size={14} />
            Day {log.day_number} PDF
          </button>
          <button
            className="btn btn-green btn-sm"
            onClick={handleExportPDF}
            disabled={exporting}
            id="btn-export-all-pdf"
            title="Export all log sheets as PDF"
          >
            {exporting ? '...' : <><Download size={14} /> All Logs PDF</>}
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handlePrint}
            id="btn-print-logs"
            title="Print all log sheets"
          >
            <Printer size={14} />
            Print
          </button>
        </div>
      </div>

      {/* Day navigator */}
      <div className="log-nav">
        <div className="log-nav-controls">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setCurrentDay((d) => Math.max(0, d - 1))}
            disabled={currentDay === 0}
            id="btn-prev-day"
          >
            <ChevronLeft size={16} />
            Previous Day
          </button>
          <span className="log-page-indicator">
            Day {currentDay + 1} of {dailyLogs.length}
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setCurrentDay((d) => Math.min(dailyLogs.length - 1, d + 1))}
            disabled={currentDay === dailyLogs.length - 1}
            id="btn-next-day"
          >
            Next Day
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day tabs */}
        {dailyLogs.length > 1 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {dailyLogs.map((_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${currentDay === i ? 'btn-primary' : 'btn-secondary'}`}
                style={{ minWidth: '36px', padding: '5px 8px', fontSize: '0.78rem' }}
                onClick={() => setCurrentDay(i)}
                id={`btn-day-tab-${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Daily Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginBottom: '1rem',
        }}
      >
        {[
          { label: 'Off Duty', value: log.total_off_duty.toFixed(1), color: '#475569', icon: '😴' },
          { label: 'Sleeper Berth', value: log.total_sleeper.toFixed(1), color: '#7c3aed', icon: '🛌' },
          { label: 'Driving', value: log.total_driving.toFixed(1), color: '#059669', icon: '🚛' },
          { label: 'On Duty', value: log.total_on_duty.toFixed(1), color: '#d97706', icon: '📋' },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: `${item.color}18`,
              border: `1px solid ${item.color}35`,
              borderRadius: '8px',
              padding: '10px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.1rem' }}>{item.icon}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: item.color, fontFamily: 'JetBrains Mono, monospace' }}>
              {item.value}h
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Render ALL canvases (hidden except current) so PDF export works */}
      <div style={{ position: 'relative' }}>
        {dailyLogs.map((dayLog, i) => (
          <div
            key={i}
            style={{ display: i === currentDay ? 'block' : 'none' }}
          >
            <LogSheet log={dayLog} driverInfo={driverInfo} />
          </div>
        ))}
        {/* Hidden canvases for all other days for PDF export */}
        {dailyLogs.map((dayLog, i) => (
          i !== currentDay && (
            <div key={`hidden-${i}`} style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px' }}>
              <LogSheet log={dayLog} driverInfo={driverInfo} />
            </div>
          )
        ))}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginTop: '1rem',
          flexWrap: 'wrap',
          padding: '10px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
        }}
      >
        {[
          { color: '#475569', label: 'Off Duty' },
          { color: '#7c3aed', label: 'Sleeper Berth' },
          { color: '#059669', label: 'Driving' },
          { color: '#d97706', label: 'On Duty (Not Driving)' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div style={{ width: 24, height: 4, background: item.color, borderRadius: 2 }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
