(function() {
  /* ── Scroll Reveal ── */
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('vis');
      var children = e.target.querySelectorAll('.reveal-stagger');
      children.forEach(function(c) {
        Array.from(c.children).forEach(function(child, i) {
          child.style.transitionDelay = (i * 120) + 'ms';
        });
        setTimeout(function() { c.classList.add('vis'); }, 150);
      });
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(function(el) { io.observe(el); });

  /* ── 3D Tilt + Cursor Spotlight ── */
  document.querySelectorAll('[data-tilt]').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      var y = (e.clientY - r.top) / r.height;
      card.style.transform = 'perspective(800px) rotateX(' + ((0.5-y)*10) + 'deg) rotateY(' + ((x-0.5)*10) + 'deg) scale(1.02)';
      card.style.setProperty('--mx', (x*100)+'%');
      card.style.setProperty('--my', (y*100)+'%');
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = '';
      card.style.transition = 'all 600ms cubic-bezier(0.4, 0, 0.2, 1)';
    });
    card.addEventListener('mouseenter', function() {
      card.style.transition = 'box-shadow 400ms ease, background 400ms ease, border-color 400ms ease';
    });
  });

  /* ── Magnetic Links ── */
  document.querySelectorAll('[data-magnetic]').forEach(function(link) {
    link.addEventListener('mousemove', function(e) {
      var r = link.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var dx = (e.clientX - cx) * 0.15;
      var dy = (e.clientY - cy) * 0.15;
      link.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
    });
    link.addEventListener('mouseleave', function() {
      link.style.transform = '';
      link.style.transition = 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)';
    });
    link.addEventListener('mouseenter', function() {
      link.style.transition = 'background 400ms ease, border-color 400ms ease, box-shadow 400ms ease';
    });
  });

  /* ── Animated Counters ── */
  var counterObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      var target = parseFloat(el.dataset.counter);
      var dec = parseInt(el.dataset.decimals || '0');
      var dur = parseInt(el.dataset.duration || '1500');
      var start = performance.now();
      function tick(now) {
        var t = Math.min((now - start) / dur, 1);
        var ease = 1 - Math.pow(1 - t, 3);
        el.textContent = dec > 0 ? (target * ease).toFixed(dec) : Math.round(target * ease);
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-counter]').forEach(function(el) {
    counterObs.observe(el);
  });

  /* ── SVG Ring Progress ── */
  var ringObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (!e.isIntersecting) return;
      var ring = e.target;
      var pct = parseFloat(ring.dataset.progress);
      var r = parseFloat(ring.getAttribute('r'));
      var circ = 2 * Math.PI * r;
      ring.style.strokeDasharray = circ;
      ring.style.strokeDashoffset = circ;
      setTimeout(function() {
        ring.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.4, 0, 0.2, 1)';
        ring.style.strokeDashoffset = circ * (1 - pct);
      }, 300);
      ringObs.unobserve(ring);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-progress]').forEach(function(el) {
    ringObs.observe(el);
  });

  /* ── Scroll-linked Timeline Fill ── */
  var timeline = document.querySelector('[data-scroll-fill]');
  if (timeline) {
    function updateFill() {
      var rect = timeline.getBoundingClientRect();
      var viewH = window.innerHeight;
      var scrolled = viewH - rect.top;
      var pct = Math.max(0, Math.min(100, (scrolled / rect.height) * 100));
      timeline.style.setProperty('--fill', pct + '%');
    }
    window.addEventListener('scroll', updateFill, { passive: true });
    updateFill();
  }

  /* ── Cursor Spotlight (flat, no tilt) ── */
  document.querySelectorAll('[data-spotlight]').forEach(function(el) {
    el.addEventListener('mousemove', function(e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  /* ── Cursor Spotlight (delegated to inner card) ── */
  document.querySelectorAll('[data-tilt-card]').forEach(function(node) {
    var card = node.querySelector('.cert-card');
    if (!card) return;
    node.addEventListener('mousemove', function(e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  /* ── Activity Heatmap ── */
  var heatmapEl = document.getElementById('heatmap');
  if (heatmapEl && window.writeupDates) {
    var today = new Date();
    var start = new Date(today);
    start.setDate(start.getDate() - 363);
    while (start.getDay() !== 0) start.setDate(start.getDate() - 1);

    var counts = {};
    window.writeupDates.forEach(function(d) { counts[d] = (counts[d] || 0) + 1; });

    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var lastMonth = -1;
    var weekIndex = 0;
    var cur = new Date(start);

    while (cur <= today) {
      var ds = cur.toISOString().split('T')[0];
      var c = counts[ds] || 0;
      var cell = document.createElement('div');
      cell.className = 'hm-cell';
      if (c === 0) cell.classList.add('c0');
      else if (c === 1) cell.classList.add('c1');
      else if (c === 2) cell.classList.add('c2');
      else cell.classList.add('c3');
      cell.title = ds + ': ' + c + ' box' + (c !== 1 ? 'es' : '');

      var day = cur.getDay();
      var col = Math.floor((cur - start) / (86400000 * 7));
      cell.style.gridRow = (day + 1);
      cell.style.gridColumn = (col + 1);
      heatmapEl.appendChild(cell);

      // Month labels
      if (day === 0 && cur.getMonth() !== lastMonth) {
        lastMonth = cur.getMonth();
        var label = document.createElement('span');
        label.className = 'hm-month';
        label.textContent = months[cur.getMonth()];
        label.style.gridColumn = (col + 1);
        var monthRow = document.getElementById('heatmap-months');
        if (monthRow) monthRow.appendChild(label);
      }

      cur.setDate(cur.getDate() + 1);
    }
  }
})();
