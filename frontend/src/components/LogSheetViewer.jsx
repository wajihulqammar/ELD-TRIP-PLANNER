import React, { useState } from 'react';
import LogSheet from './LogSheet';
import CarrierProfileModal from './CarrierProfileModal';
import { ChevronLeft, ChevronRight, Download, Printer, FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';

export default function LogSheetViewer({ dailyLogs, tripData }) {
  const [currentDay, setCurrentDay] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [customProfile, setCustomProfile] = useState({
    driver_name: 'Wajih Ul Qammar',
    carrier_name: 'Spotter Logistics LLC',
    truck_number: 'TK-9901',
    shipping_manifest: 'BOL-449102',
    main_office: '100 Logistics Blvd, Chicago, IL',
    home_terminal: 'Terminal 4, St. Louis, MO',
  });

  if (!dailyLogs || dailyLogs.length === 0) return null;

  const log = dailyLogs[currentDay];
  const driverInfo = {
    current_location: tripData?.summary?.current_location || '',
    dropoff_location: tripData?.summary?.dropoff_location || '',
    total_distance_miles: tripData?.total_distance_miles || 0,
    num_days: dailyLogs.length,
    cycle_hours_used_at_end: tripData?.summary?.cycle_hours_used_at_end || 0,
    ...customProfile,
  };

  const handlePrint = () => {
    const canvases = document.querySelectorAll('[id^="log-sheet-canvas-day-"]');
    const printWindow = window.open('', '_blank');

    const imgs = Array.from(canvases).map((canvas) => {
      return `<img src="${canvas.toDataURL('image/png')}" style="width:100%;max-width:850px;margin:0 auto 20px;display:block;page-break-after:always;" />`;
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ELD Daily Log Sheets</title>
        <style>
          body { margin: 0; padding: 20px; background: white; font-family: sans-serif; }
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

  const handleExportCSV = () => {
    let csv = 'Day,Date,Status,Start_Hour,End_Hour,Duration_Hrs,Description,Location\n';
    dailyLogs.forEach((dayLog) => {
      dayLog.events.forEach((ev) => {
        const dur = (ev.end_hour - ev.start_hour).toFixed(2);
        csv += `${dayLog.day_number},${dayLog.date_label},"${ev.status}",${ev.start_hour.toFixed(2)},${ev.end_hour.toFixed(2)},${dur},"${ev.description || ''}","${ev.location || ''}"\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'ELD_Duty_Status_Audit_Log.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card">
      <div className="card-title-bar" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={18} style={{ color: 'var(--primary)' }} />
          <div>
            <h2>FMCSA 24-Hour ELD Daily Log Sheets</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Driver: <strong>{driverInfo.driver_name}</strong> · Carrier: <strong>{driverInfo.carrier_name}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <CarrierProfileModal
            driverInfo={customProfile}
            onSave={(newProf) => setCustomProfile(newProf)}
          />

          <button
            className="btn btn-outline btn-sm"
            onClick={handleExportCSV}
            title="Download DOT Inspection CSV Audit Log"
          >
            <FileSpreadsheet size={14} /> Audit CSV
          </button>

          <button
            className="btn btn-primary btn-sm"
            style={{ width: 'auto' }}
            onClick={handleExportPDF}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : <><Download size={14} /> PDF Download</>}
          </button>

          <button
            className="btn btn-outline btn-sm"
            onClick={handlePrint}
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setCurrentDay((d) => Math.max(0, d - 1))}
          disabled={currentDay === 0}
        >
          <ChevronLeft size={15} /> Prev Day
        </button>

        <div style={{ display: 'flex', gap: '6px' }}>
          {dailyLogs.map((_, i) => (
            <button
              key={i}
              className={`btn btn-sm ${currentDay === i ? 'btn-primary' : 'btn-outline'}`}
              style={{ width: '32px', height: '32px', padding: 0 }}
              onClick={() => setCurrentDay(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          className="btn btn-outline btn-sm"
          onClick={() => setCurrentDay((d) => Math.min(dailyLogs.length - 1, d + 1))}
          disabled={currentDay === dailyLogs.length - 1}
        >
          Next Day <ChevronRight size={15} />
        </button>
      </div>

      {/* Daily Summary Chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1.25rem' }}>
        {[
          { label: 'Off Duty', value: log.total_off_duty.toFixed(1), color: '#475569', bg: '#f1f5f9' },
          { label: 'Sleeper', value: log.total_sleeper.toFixed(1), color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Driving', value: log.total_driving.toFixed(1), color: '#059669', bg: '#ecfdf5' },
          { label: 'On Duty', value: log.total_on_duty.toFixed(1), color: '#d97706', bg: '#fffbeb' },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: item.bg,
              border: `1px solid ${item.color}30`,
              borderRadius: 'var(--radius-sm)',
              padding: '8px 12px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              {item.label}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: item.color, fontFamily: 'JetBrains Mono, monospace' }}>
              {item.value}h
            </div>
          </div>
        ))}
      </div>

      {/* Canvas Log Sheet Container */}
      <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '12px', background: '#ffffff', boxShadow: 'var(--shadow-sm)' }}>
        {dailyLogs.map((dayLog, i) => (
          <div key={i} style={{ display: i === currentDay ? 'block' : 'none' }}>
            <LogSheet log={dayLog} driverInfo={driverInfo} />
          </div>
        ))}
        {/* Hidden canvases for non-visible days to enable PDF export */}
        {dailyLogs.map((dayLog, i) => (
          i !== currentDay && (
            <div key={`hidden-${i}`} style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px' }}>
              <LogSheet log={dayLog} driverInfo={driverInfo} />
            </div>
          )
        ))}
      </div>
    </div>
  );
}
