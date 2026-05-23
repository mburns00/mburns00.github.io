document.addEventListener('DOMContentLoaded', function () {
  var stats = window.siteStats;
  if (!stats) return;

  Chart.defaults.color = '#a4b1cd';
  Chart.defaults.borderColor = '#2a3a4e';

  // Difficulty doughnut
  var diffLabels = [];
  var diffData = [];
  var diffColors = [];
  if (stats.difficulty.veryEasy) { diffLabels.push('Very Easy'); diffData.push(stats.difficulty.veryEasy); diffColors.push('#4fc3f7'); }
  if (stats.difficulty.easy)     { diffLabels.push('Easy');      diffData.push(stats.difficulty.easy);     diffColors.push('#9fef00'); }
  if (stats.difficulty.medium)   { diffLabels.push('Medium');    diffData.push(stats.difficulty.medium);   diffColors.push('#ffab40'); }
  if (stats.difficulty.hard)     { diffLabels.push('Hard');      diffData.push(stats.difficulty.hard);     diffColors.push('#ff4444'); }
  if (stats.difficulty.insane)   { diffLabels.push('Insane');    diffData.push(stats.difficulty.insane);   diffColors.push('#b388ff'); }

  new Chart(document.getElementById('difficultyChart'), {
    type: 'doughnut',
    data: {
      labels: diffLabels,
      datasets: [{ data: diffData, backgroundColor: diffColors, borderWidth: 0 }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { padding: 16 } } }
    }
  });

  // OS doughnut
  new Chart(document.getElementById('osChart'), {
    type: 'doughnut',
    data: {
      labels: ['Linux', 'Windows'],
      datasets: [{ data: [stats.os.linux, stats.os.windows], backgroundColor: ['#4fc3f7', '#ffab40'], borderWidth: 0 }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { padding: 16 } } }
    }
  });

  // 100-box goal gauge
  var goal = stats.boxGoal || 100;
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
          backgroundColor: ['#60a5fa', 'rgba(107, 123, 149, 0.2)'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(ctx) { return ctx.label + ': ' + ctx.raw + ' boxes'; }
            }
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
          ctx.fillStyle = '#60a5fa';
          ctx.font = 'bold 28px "JetBrains Mono", monospace';
          ctx.fillText(done, cx, cy - 8);
          ctx.fillStyle = '#6b7b95';
          ctx.font = '12px "JetBrains Mono", monospace';
          ctx.fillText('/ ' + goal, cx, cy + 16);
          ctx.restore();
        }
      }]
    });
  }

  // Progress timeline
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
          borderColor: '#60a5fa',
          backgroundColor: 'rgba(96,165,250,0.1)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#60a5fa',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            type: 'time',
            time: { unit: 'week', displayFormats: { week: 'MMM dd' } },
            grid: { color: '#2a3a4e' }
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: '#2a3a4e' }
          }
        }
      }
    });
  }
});
