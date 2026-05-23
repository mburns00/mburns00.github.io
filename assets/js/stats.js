document.addEventListener('DOMContentLoaded', function () {
  var stats = window.siteStats;
  if (!stats) return;

  // ─── Light-theme palette (matches site SCSS variables) ───
  var COLOR = {
    text: '#374151',
    textMuted: '#6b7280',
    grid: '#f3f4f6',
    gridDark: '#e5e7eb',
    blue: '#2563eb',
    blueLight: '#3b82f6',
    blueFill: 'rgba(37, 99, 235, 0.08)',
    green: '#16a34a',
    orange: '#d97706',
    red: '#dc2626',
    purple: '#7c3aed',
    cyan: '#0891b2',
    track: '#f3f4f6'
  };

  Chart.defaults.color = COLOR.text;
  Chart.defaults.borderColor = COLOR.gridDark;
  Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
  Chart.defaults.font.size = 12;

  var sharedDoughnutOpts = {
    responsive: true,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 14,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11 },
          color: COLOR.text
        }
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#0f172a',
        bodyColor: '#374151',
        borderColor: COLOR.gridDark,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        titleFont: { weight: 600, size: 12 },
        bodyFont: { size: 12 },
        displayColors: true,
        boxPadding: 4
      }
    }
  };

  // ─── Difficulty doughnut ───
  var diffLabels = [];
  var diffData = [];
  var diffColors = [];
  if (stats.difficulty.veryEasy) { diffLabels.push('Very Easy'); diffData.push(stats.difficulty.veryEasy); diffColors.push(COLOR.cyan); }
  if (stats.difficulty.easy)     { diffLabels.push('Easy');      diffData.push(stats.difficulty.easy);     diffColors.push(COLOR.green); }
  if (stats.difficulty.medium)   { diffLabels.push('Medium');    diffData.push(stats.difficulty.medium);   diffColors.push(COLOR.orange); }
  if (stats.difficulty.hard)     { diffLabels.push('Hard');      diffData.push(stats.difficulty.hard);     diffColors.push(COLOR.red); }
  if (stats.difficulty.insane)   { diffLabels.push('Insane');    diffData.push(stats.difficulty.insane);   diffColors.push(COLOR.purple); }

  new Chart(document.getElementById('difficultyChart'), {
    type: 'doughnut',
    data: {
      labels: diffLabels,
      datasets: [{
        data: diffData,
        backgroundColor: diffColors,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: sharedDoughnutOpts
  });

  // ─── OS doughnut ───
  new Chart(document.getElementById('osChart'), {
    type: 'doughnut',
    data: {
      labels: ['Linux', 'Windows'],
      datasets: [{
        data: [stats.os.linux, stats.os.windows],
        backgroundColor: [COLOR.blue, COLOR.orange],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: sharedDoughnutOpts
  });

  // ─── 30-box goal ring (large central count) ───
  var goal = stats.boxGoal || 30;
  var done = stats.total;
  var remaining = Math.max(0, goal - done);
  var goalEl = document.getElementById('goalChart');

  if (goalEl) {
    new Chart(goalEl, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Remaining'],
        datasets: [{
          data: [done, remaining],
          backgroundColor: [COLOR.blue, COLOR.track],
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#ffffff',
            titleColor: '#0f172a',
            bodyColor: '#374151',
            borderColor: COLOR.gridDark,
            borderWidth: 1,
            padding: 10,
            cornerRadius: 6,
            callbacks: { label: function(ctx) { return ctx.label + ': ' + ctx.raw + ' boxes'; } }
          }
        }
      },
      plugins: [{
        id: 'goalText',
        afterDraw: function(chart) {
          var area = chart.chartArea;
          if (!area) return;
          var ctx = chart.ctx;
          var cx = (area.left + area.right) / 2;
          var cy = (area.top + area.bottom) / 2;
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#0f172a';
          ctx.font = '700 30px "JetBrains Mono", monospace';
          ctx.fillText(done, cx, cy - 10);
          ctx.fillStyle = COLOR.textMuted;
          ctx.font = '500 13px "JetBrains Mono", monospace';
          ctx.fillText('/ ' + goal, cx, cy + 18);
          ctx.restore();
        }
      }]
    });
  }

  // ─── Progress timeline (line) ───
  var sorted = stats.timeline.slice().sort(function (a, b) {
    return new Date(a.date) - new Date(b.date);
  });
  var cumulative = [];
  sorted.forEach(function (entry, i) {
    cumulative.push({ x: entry.date, y: i + 1 });
  });

  var timelineEl = document.getElementById('timelineChart');
  if (timelineEl && cumulative.length > 0) {
    new Chart(timelineEl, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Boxes Completed',
          data: cumulative,
          borderColor: COLOR.blue,
          backgroundColor: COLOR.blueFill,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: COLOR.blue,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#ffffff',
            titleColor: '#0f172a',
            bodyColor: '#374151',
            borderColor: COLOR.gridDark,
            borderWidth: 1,
            padding: 10,
            cornerRadius: 6,
            displayColors: false
          }
        },
        scales: {
          x: {
            type: 'time',
            time: { unit: 'week', displayFormats: { week: 'MMM d' } },
            grid: { color: COLOR.grid, drawTicks: false },
            border: { color: COLOR.gridDark },
            ticks: { color: COLOR.textMuted, font: { size: 11 } }
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, color: COLOR.textMuted, font: { size: 11 } },
            grid: { color: COLOR.grid, drawTicks: false },
            border: { display: false }
          }
        }
      }
    });
  }
});
