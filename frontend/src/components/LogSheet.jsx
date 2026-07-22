import React, { useRef, useEffect } from 'react';

const STATUS_COLORS = {
  off_duty: '#475569',
  sleeper: '#7c3aed',
  driving: '#059669',
  on_duty: '#d97706',
};

const STATUS_ROW = {
  off_duty: 0,
  sleeper: 1,
  driving: 2,
  on_duty: 3,
};

const STATUS_LABELS = ['1. Off Duty', '2. Sleeper Berth', '3. Driving', '4. On Duty (Not Driving)'];

// Layout constants (in pixels, at 800px wide)
const LOG_WIDTH = 800;
const LOG_HEIGHT = 520;
const MARGIN_LEFT = 20;
const MARGIN_RIGHT = 20;
const HEADER_HEIGHT = 140;
const GRID_LEFT = 70;           // left of time grid
const GRID_RIGHT = LOG_WIDTH - MARGIN_RIGHT - 60; // right of time grid
const GRID_TOP = HEADER_HEIGHT + 5;
const ROW_HEIGHT = 38;
const GRID_WIDTH = GRID_RIGHT - GRID_LEFT;
const TOTAL_ROWS = 4;
const GRID_HEIGHT = ROW_HEIGHT * TOTAL_ROWS;
const TOTAL_HOURS_CELL_WIDTH = 55;

function hoursToPx(hours) {
  return GRID_LEFT + (hours / 24) * GRID_WIDTH;
}

function padTime(h, m = 0) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function hoursToTimeLabel(h) {
  if (h === 0 || h === 24) return 'Mid';
  if (h === 12) return 'Noon';
  if (h < 12) return String(h);
  return String(h);
}

export default function LogSheet({ log, driverInfo = {} }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!log || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = LOG_WIDTH * dpr;
    canvas.height = LOG_HEIGHT * dpr;
    canvas.style.width = `${LOG_WIDTH}px`;
    canvas.style.height = `${LOG_HEIGHT}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    drawLog(ctx, log, driverInfo);
  }, [log, driverInfo]);

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: `${LOG_WIDTH}px`,
        margin: '0 auto',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: 'auto' }}
        id={`log-sheet-canvas-day-${log?.day_number}`}
      />
    </div>
  );
}

function drawLog(ctx, log, driverInfo) {
  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, LOG_WIDTH, LOG_HEIGHT);

  drawHeader(ctx, log, driverInfo);
  drawGridArea(ctx, log);
  drawStatusLines(ctx, log);
  drawHourTotals(ctx, log);
  drawRemarks(ctx, log);
  drawRecapTable(ctx, log, driverInfo);
}

function drawHeader(ctx, log, driverInfo) {
  // Title
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 15px Arial';
  ctx.fillText("Driver's Daily Log", MARGIN_LEFT, 22);

  ctx.font = '10px Arial';
  ctx.fillStyle = '#555';
  ctx.fillText('(24 hours)', MARGIN_LEFT, 34);

  // Date line
  const dateY = 22;
  ctx.font = '10px Arial';
  ctx.fillStyle = '#333';
  ctx.fillText('Date:', 220, dateY);
  ctx.font = 'bold 10px Arial';
  ctx.fillText(log.date_label, 250, dateY);

  // Original/Duplicate note
  ctx.font = '9px Arial';
  ctx.fillStyle = '#555';
  ctx.fillText('Original – File at home terminal.', 490, 14);
  ctx.fillText('Duplicate – Driver retains in his/her possession for 8 days.', 490, 25);

  // Horizontal rule
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(MARGIN_LEFT, 40);
  ctx.lineTo(LOG_WIDTH - MARGIN_RIGHT, 40);
  ctx.stroke();

  // From / To fields
  ctx.font = '9px Arial';
  ctx.fillStyle = '#333';
  ctx.fillText('From:', MARGIN_LEFT, 55);
  ctx.font = 'bold 10px Arial';
  ctx.fillText(driverInfo.current_location || '---', MARGIN_LEFT + 35, 55);

  ctx.font = '9px Arial';
  ctx.fillStyle = '#333';
  ctx.fillText('To:', 280, 55);
  ctx.font = 'bold 10px Arial';
  ctx.fillText(driverInfo.dropoff_location || '---', 300, 55);

  // Box fields row 1
  const boxY = 65;
  const boxH = 22;
  drawLabeledBox(ctx, MARGIN_LEFT, boxY, 90, boxH, 'Total Miles Driving Today', String(Math.round((driverInfo.total_distance_miles || 0) / Math.max(driverInfo.num_days || 1, 1))));
  drawLabeledBox(ctx, 120, boxY, 80, boxH, 'Total Mileage Today', '---');

  // Carrier / Office
  const rightBoxX = 270;
  drawLabeledBox(ctx, rightBoxX, boxY, 240, boxH, 'Name of Carrier or Carriers', driverInfo.carrier_name || 'Independent Owner-Operator');

  // Row 2
  const box2Y = 95;
  drawLabeledBox(ctx, MARGIN_LEFT, box2Y, 200, boxH, 'Truck/Tractor and Trailer Numbers or License Plates(s)/State', driverInfo.truck_number || '---');
  drawLabeledBox(ctx, rightBoxX, box2Y, 240, boxH, 'Main Office Address', driverInfo.main_office || '---');
  drawLabeledBox(ctx, rightBoxX, box2Y + 28, 240, boxH, 'Home Terminal Address', driverInfo.home_terminal || '---');
}

function drawLabeledBox(ctx, x, y, w, h, label, value) {
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 0.7;
  ctx.strokeRect(x, y, w, h);
  ctx.font = '7px Arial';
  ctx.fillStyle = '#999';
  ctx.fillText(label, x + 3, y + 8);
  ctx.font = 'bold 9px Arial';
  ctx.fillStyle = '#222';
  ctx.fillText(value.substring(0, Math.floor(w / 6)), x + 3, y + 18);
}

function drawGridArea(ctx, log) {
  const gridBottom = GRID_TOP + GRID_HEIGHT;

  // Grid background
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(GRID_LEFT, GRID_TOP, GRID_WIDTH, GRID_HEIGHT);

  // Row labels (left side)
  const rowLabelX = MARGIN_LEFT;
  STATUS_LABELS.forEach((label, i) => {
    const rowY = GRID_TOP + i * ROW_HEIGHT;
    ctx.font = '7.5px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    const lines = label.split(' ');
    lines.forEach((line, li) => {
      ctx.fillText(line, rowLabelX, rowY + 14 + li * 10);
    });
  });
  ctx.textAlign = 'left';

  // Draw hour tick marks and labels across the top
  for (let h = 0; h <= 24; h++) {
    const x = hoursToPx(h);
    const isMajor = h % 1 === 0;
    const isLabelHour = h % 1 === 0;

    // Major tick
    ctx.strokeStyle = h % 6 === 0 ? '#999' : '#ccc';
    ctx.lineWidth = h % 6 === 0 ? 1 : 0.5;
    ctx.beginPath();
    ctx.moveTo(x, GRID_TOP);
    ctx.lineTo(x, gridBottom);
    ctx.stroke();

    // 30-min tick marks
    if (h < 24) {
      const xHalf = hoursToPx(h + 0.5);
      ctx.strokeStyle = '#e5e5e5';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(xHalf, GRID_TOP);
      ctx.lineTo(xHalf, gridBottom);
      ctx.stroke();
    }

    // Hour label above grid
    if (isLabelHour) {
      const label = hoursToTimeLabel(h);
      ctx.font = h === 0 || h === 12 || h === 24 ? 'bold 7.5px Arial' : '7px Arial';
      ctx.fillStyle = '#555';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, GRID_TOP - 3);
    }
  }

  // Row separator lines
  for (let i = 0; i <= TOTAL_ROWS; i++) {
    const y = GRID_TOP + i * ROW_HEIGHT;
    ctx.strokeStyle = i === 0 || i === TOTAL_ROWS ? '#888' : '#bbb';
    ctx.lineWidth = i === 0 || i === TOTAL_ROWS ? 1 : 0.5;
    ctx.beginPath();
    ctx.moveTo(GRID_LEFT, y);
    ctx.lineTo(GRID_RIGHT, y);
    ctx.stroke();
  }

  // Left and right borders of grid
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.strokeRect(GRID_LEFT, GRID_TOP, GRID_WIDTH, GRID_HEIGHT);

  ctx.textAlign = 'left';

  // "Total Hours" column header
  ctx.font = 'bold 7px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.fillText('Total', GRID_RIGHT + 30, GRID_TOP + 10);
  ctx.fillText('Hours', GRID_RIGHT + 30, GRID_TOP + 20);
  ctx.textAlign = 'left';
}

function drawStatusLines(ctx, log) {
  if (!log.events || log.events.length === 0) return;

  log.events.forEach((event) => {
    const rowIdx = STATUS_ROW[event.status];
    if (rowIdx === undefined) return;

    const x1 = hoursToPx(Math.max(0, Math.min(24, event.start_hour)));
    const x2 = hoursToPx(Math.max(0, Math.min(24, event.end_hour)));
    if (x2 <= x1 + 0.5) return;

    const rowY = GRID_TOP + rowIdx * ROW_HEIGHT;
    const lineY = rowY + ROW_HEIGHT * 0.5;
    const color = STATUS_COLORS[event.status] || '#888';

    // Filled status block
    ctx.fillStyle = color + '22'; // transparent fill
    ctx.fillRect(x1, rowY + 1, x2 - x1, ROW_HEIGHT - 2);

    // Draw horizontal line in the middle of the row
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, lineY);
    ctx.lineTo(x2, lineY);
    ctx.stroke();

    // Draw vertical connectors (status change lines) at transitions
    if (event.start_hour > 0) {
      // Check if previous event ends here (draw vertical down/up line)
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      // Vertical line from top to bottom of this row at start
      ctx.beginPath();
      ctx.moveTo(x1, rowY + 1);
      ctx.lineTo(x1, rowY + ROW_HEIGHT - 1);
      ctx.stroke();
    }

    // End vertical line
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x2, rowY + 1);
    ctx.lineTo(x2, rowY + ROW_HEIGHT - 1);
    ctx.stroke();
  });

  // Draw connecting vertical lines between status changes (ELD style)
  const sorted = [...log.events].sort((a, b) => a.start_hour - b.start_hour);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (Math.abs(prev.end_hour - curr.start_hour) < 0.05) {
      const x = hoursToPx(curr.start_hour);
      const prevRow = STATUS_ROW[prev.status];
      const currRow = STATUS_ROW[curr.status];
      if (prevRow !== undefined && currRow !== undefined && prevRow !== currRow) {
        const y1 = GRID_TOP + prevRow * ROW_HEIGHT + ROW_HEIGHT * 0.5;
        const y2 = GRID_TOP + currRow * ROW_HEIGHT + ROW_HEIGHT * 0.5;
        ctx.strokeStyle = STATUS_COLORS[curr.status] || '#888';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();
      }
    }
  }
}

function drawHourTotals(ctx, log) {
  const totals = [
    log.total_off_duty,
    log.total_sleeper,
    log.total_driving,
    log.total_on_duty,
  ];

  totals.forEach((total, i) => {
    const rowY = GRID_TOP + i * ROW_HEIGHT;
    ctx.font = 'bold 10px Arial';
    ctx.fillStyle = '#222';
    ctx.textAlign = 'center';
    ctx.fillText(total.toFixed(1), GRID_RIGHT + 30, rowY + ROW_HEIGHT / 2 + 4);
  });

  ctx.textAlign = 'left';

  // Total line
  const totalOnDuty = log.total_driving + log.total_on_duty;
  ctx.font = '8px Arial';
  ctx.fillStyle = '#555';
  ctx.fillText(`On-Duty Total: ${totalOnDuty.toFixed(1)} hrs`, GRID_RIGHT - 10, GRID_TOP + GRID_HEIGHT + 12);
}

function drawRemarks(ctx, log) {
  const remarksY = GRID_TOP + GRID_HEIGHT + 28;

  ctx.font = 'bold 9px Arial';
  ctx.fillStyle = '#1a1a1a';
  ctx.fillText('Remarks', MARGIN_LEFT, remarksY);

  // Remarks box
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 0.7;
  ctx.strokeRect(MARGIN_LEFT, remarksY + 4, LOG_WIDTH - MARGIN_LEFT - MARGIN_RIGHT - 80, 40);

  ctx.font = '8px Arial';
  ctx.fillStyle = '#444';
  const remarks = log.remarks || [];
  remarks.slice(0, 4).forEach((remark, i) => {
    ctx.fillText(remark.substring(0, 60), MARGIN_LEFT + 4, remarksY + 14 + i * 10);
  });

  // Shipping Documents
  const shipY = remarksY;
  ctx.font = 'bold 8px Arial';
  ctx.fillStyle = '#1a1a1a';
  ctx.fillText('Shipping Documents:', LOG_WIDTH - 150, shipY);
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(LOG_WIDTH - 150, shipY + 4, 130, 18);

  ctx.font = 'bold 8px Arial';
  ctx.fillText('DVL or Manifest No.:', LOG_WIDTH - 150, shipY + 32);
  ctx.strokeRect(LOG_WIDTH - 150, shipY + 36, 130, 12);
}

function drawRecapTable(ctx, log, driverInfo) {
  const tableY = LOG_HEIGHT - 125;

  ctx.font = 'bold 8.5px Arial';
  ctx.fillStyle = '#1a1a1a';
  ctx.fillText('Recap: Complete at end of day', MARGIN_LEFT, tableY);

  // 70 Hour column
  const col1X = MARGIN_LEFT + 130;
  const col2X = col1X + 200;
  const rowH = 18;
  const headerY = tableY + 10;

  ctx.font = 'bold 8px Arial';
  ctx.fillStyle = '#1a1a1a';
  ctx.fillText('70 Hour / 8 Day', col1X, headerY);
  ctx.fillText('Drivers', col1X + 80, headerY);
  ctx.fillText('60 Hour / 7 Day', col2X, headerY);
  ctx.fillText('Drivers', col2X + 80, headerY);

  const labels = ['A.', 'B.', 'C.'];
  const aLabels = [
    'A. Total hours on duty today',
    'B. Total hours on duty last 7 days',
    'C. Total hours available tomorrow',
  ];

  const totalOnDutyToday = (log.total_driving + log.total_on_duty).toFixed(1);
  const cycleUsed = ((driverInfo.cycle_hours_used_at_end || 0)).toFixed(1);

  const values70 = [
    totalOnDutyToday,
    `${cycleUsed} hrs`,
    `${Math.max(0, 70 - parseFloat(cycleUsed)).toFixed(1)} hrs`,
  ];

  const values60 = [
    totalOnDutyToday,
    '---',
    '---',
  ];

  aLabels.forEach((label, i) => {
    const y = headerY + (i + 1) * rowH;
    ctx.font = '7.5px Arial';
    ctx.fillStyle = '#444';
    ctx.fillText(label, MARGIN_LEFT, y);

    ctx.font = 'bold 8px Arial';
    ctx.fillStyle = '#111';
    ctx.fillText(values70[i], col1X + 80, y);
    ctx.fillText(values60[i], col2X + 80, y);

    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(MARGIN_LEFT, y + 3);
    ctx.lineTo(LOG_WIDTH - MARGIN_RIGHT, y + 3);
    ctx.stroke();
  });

  // 34-hr restart note
  ctx.font = 'italic 7px Arial';
  ctx.fillStyle = '#888';
  ctx.fillText('*If you took 34 consecutive hours off duty you have 60/70 hours available', col2X + 100, headerY + rowH);

  // Signature line
  ctx.strokeStyle = '#aaa';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(MARGIN_LEFT, LOG_HEIGHT - 8);
  ctx.lineTo(300, LOG_HEIGHT - 8);
  ctx.stroke();
  ctx.font = '8px Arial';
  ctx.fillStyle = '#666';
  ctx.fillText("Driver's Signature", MARGIN_LEFT, LOG_HEIGHT - 2);
}
