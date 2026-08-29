/* Everest Entertainment — shared interactions */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Capture helper: ?capture kills motion; &top=N shifts the page via body
     transform (headless screenshots paint white on real scroll), or scrolls
     normally outside capture mode. */
  var capture = /[?&]capture\b/.test(location.search);
  var topM = location.search.match(/[?&]top=(\d+)/);
  if (capture) {
    document.documentElement.classList.add('capture');
    document.querySelectorAll('img[loading="lazy"]').forEach(function (i) { i.loading = 'eager'; });
    if (topM) document.body.style.transform = 'translateY(-' + topM[1] + 'px)';
  } else if (topM) {
    window.addEventListener('load', function () {
      setTimeout(function () { window.scrollTo(0, +topM[1]); }, 60);
    });
  }
  /* &open=N opens the Nth accordion item (divisions / FAQ) */
  var openM = location.search.match(/[?&]open=(\d+)/);
  if (openM) {
    var items = document.querySelectorAll('[data-acc-item]');
    if (items[+openM[1]]) items[+openM[1]].classList.add('open');
  }
  /* &lscroll=N parks the launch strip at scrollLeft N (screenshots) */
  var lsM = location.search.match(/[?&]lscroll=(\d+)/);
  if (lsM) {
    window.addEventListener('load', function () {
      var ls = document.getElementById('launch-strip');
      if (ls) ls.scrollTo({ left: +lsM[1], behavior: 'auto' });
    });
  }
  /* &xtra opens every expander block */
  if (/[?&]xtra\b/.test(location.search)) {
    document.querySelectorAll('.xtra').forEach(function (x) { x.classList.add('open'); });
  }

  /* Burger menu */
  var menu = document.getElementById('menu');
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('open', open);
    document.body.classList.toggle('locked', open);
  }
  document.querySelectorAll('[data-menu-open]').forEach(function (b) {
    b.addEventListener('click', function () { setMenu(true); });
  });
  document.querySelectorAll('[data-menu-close]').forEach(function (b) {
    b.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* Expanders — "Read the full story +" / "Close −" */
  document.querySelectorAll('[data-expander]').forEach(function (btn) {
    var target = document.getElementById(btn.getAttribute('data-expander'));
    if (!target) return;
    var openLabel = btn.textContent;
    var closeLabel = btn.getAttribute('data-close') || 'Close −';
    btn.addEventListener('click', function () {
      var open = target.classList.toggle('open');
      btn.textContent = open ? closeLabel : openLabel;
    });
  });

  /* Single-open accordions (divisions, FAQ) */
  document.querySelectorAll('[data-accordion]').forEach(function (acc) {
    var items = Array.prototype.slice.call(acc.querySelectorAll('[data-acc-item]'));
    items.forEach(function (item) {
      var head = item.querySelector('[data-acc-head]');
      if (!head) return;
      head.addEventListener('click', function () {
        var wasOpen = item.classList.contains('open');
        items.forEach(function (i) { i.classList.remove('open'); });
        if (!wasOpen) item.classList.add('open');
      });
      head.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); head.click(); }
      });
    });
  });

  /* Division stage — 3D carousel; side cards centre on tap, the centre card
     flips for details, links on the back still navigate */
  var stage = document.getElementById('div-stage');
  if (stage) {
    var sCards = Array.prototype.slice.call(stage.querySelectorAll('.flip-card'));
    var sN = sCards.length;
    var sIdx = 0;
    var sTitle = document.getElementById('stage-title');
    var stName = document.getElementById('st-name');
    var stTag = document.getElementById('st-tag');
    var sDots = Array.prototype.slice.call(document.querySelectorAll('.deck-dots .reel-dot'));

    function stageRender() {
      sCards.forEach(function (c, i) {
        var d = (i - sIdx + sN) % sN;
        c.classList.remove('pos-0', 'pos-l', 'pos-r', 'pos-back', 'flipped');
        if (d === 0) c.classList.add('pos-0');
        else if (d === 1) c.classList.add('pos-r');
        else if (d === sN - 1) c.classList.add('pos-l');
        else c.classList.add('pos-back');
        c.setAttribute('tabindex', d === 0 ? '0' : '-1');
      });
      var a = sCards[sIdx];
      stName.textContent = a.getAttribute('data-name');
      stTag.textContent = a.getAttribute('data-tag');
      sTitle.classList.remove('hide');
      sDots.forEach(function (d, i) { d.classList.toggle('on', i === sIdx); });
    }
    function stageGo(i) { sIdx = (i + sN) % sN; stageRender(); }
    function centreFlip(card) {
      var flipped = card.classList.toggle('flipped');
      sTitle.classList.toggle('hide', flipped);
    }
    sCards.forEach(function (card, i) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        if (i === sIdx) centreFlip(card); else stageGo(i);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (i === sIdx) centreFlip(card); else stageGo(i); }
      });
    });
    document.querySelectorAll('[data-stage-prev]').forEach(function (b) {
      b.addEventListener('click', function () { stageGo(sIdx - 1); });
    });
    document.querySelectorAll('[data-stage-next]').forEach(function (b) {
      b.addEventListener('click', function () { stageGo(sIdx + 1); });
    });
    sDots.forEach(function (d, i) { d.addEventListener('click', function () { stageGo(i); }); });
    var touchX = null;
    stage.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 44) stageGo(sIdx + (dx < 0 ? 1 : -1));
      touchX = null;
    }, { passive: true });

    /* Mouse: horizontal wheel/trackpad rotates the ring (vertical scroll
       passes through untouched); dragging works like a swipe. */
    var wheelLock = 0;
    stage.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      var now = Date.now();
      if (now - wheelLock < 450 || Math.abs(e.deltaX) < 10) return;
      wheelLock = now;
      stageGo(sIdx + (e.deltaX > 0 ? 1 : -1));
    }, { passive: false });
    var dragX = null;
    var dragEnd = 0;
    stage.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') dragX = e.clientX;
    });
    window.addEventListener('pointerup', function (e) {
      if (dragX === null) return;
      var dx = e.clientX - dragX;
      dragX = null;
      if (Math.abs(dx) > 44) { dragEnd = Date.now(); stageGo(sIdx + (dx < 0 ? 1 : -1)); }
    });
    stage.addEventListener('click', function (e) {
      if (Date.now() - dragEnd < 250) { e.stopPropagation(); e.preventDefault(); }
    }, true);
    var flipM = location.search.match(/[?&]flip=(\d+)/);
    stageRender();
    if (flipM && sCards[+flipM[1]]) {
      stageGo(+flipM[1]);
      centreFlip(sCards[sIdx]);
    }
  }

  /* Glass hero — work reel cross-fading behind the frosted panel (home) */
  var ghero = document.getElementById('ghero');
  if (ghero) {
    var slides = Array.prototype.slice.call(ghero.querySelectorAll('.gh-slide'));
    var pips = Array.prototype.slice.call(ghero.querySelectorAll('.gh-pip'));
    var capT = ghero.querySelector('[data-cap-t]');
    var capY = ghero.querySelector('[data-cap-y]');
    var n = slides.length;
    var idx = 0;
    var timer = null;
    var INTERVAL = 5600;

    function paint(i) {
      var s = slides[i];
      if (!s || s.style.backgroundImage) return;
      s.style.backgroundImage = "url('" + s.getAttribute('data-src') + "')";
    }
    var capTimer = null;
    function label(i) {
      if (capT) capT.textContent = slides[i].getAttribute('data-t');
      if (capY) capY.textContent = slides[i].getAttribute('data-y');
    }
    /* The frames cross-fade over ~1.1s, so the caption swaps at the
       midpoint rather than jumping ahead of the picture. */
    function relabel(i) {
      var cap = capT && capT.parentNode;
      if (!cap || reduced || document.documentElement.classList.contains('capture')) { label(i); return; }
      if (capTimer) clearTimeout(capTimer);
      cap.classList.add('swap');
      capTimer = setTimeout(function () { label(i); cap.classList.remove('swap'); }, 420);
    }
    function render() {
      paint(idx); paint((idx + 1) % n);
      slides.forEach(function (s, i) { s.classList.toggle('on', i === idx); });
      pips.forEach(function (p, i) {
        p.classList.toggle('on', i === idx);
        p.setAttribute('aria-current', i === idx ? 'true' : 'false');
      });
      relabel(idx);
    }
    function go(i) { idx = (i + n) % n; render(); restart(); }
    function restart() {
      if (timer) clearInterval(timer);
      if (reduced || document.documentElement.classList.contains('capture')) return;
      timer = setInterval(function () { idx = (idx + 1) % n; render(); }, INTERVAL);
    }

    var ghPrev = ghero.querySelector('[data-gh-prev]');
    var ghNext = ghero.querySelector('[data-gh-next]');
    if (ghPrev) ghPrev.addEventListener('click', function () { go(idx - 1); });
    if (ghNext) ghNext.addEventListener('click', function () { go(idx + 1); });
    pips.forEach(function (p, i) { p.addEventListener('click', function () { go(i); }); });

    /* &slide=N parks the reel on one frame (screenshots) */
    var slideM = location.search.match(/[?&]slide=(\d+)/);
    if (slideM) idx = (+slideM[1]) % n;

    render();
    if (capture) {
      slides.forEach(function (_, i) { paint(i); });
    } else {
      /* Rest of the reel loads once the first frame is on screen */
      window.addEventListener('load', function () {
        setTimeout(function () { slides.forEach(function (_, i) { paint(i); }); }, 500);
      });
      restart();
    }
  }

  /* Horizontal strip scrollers */
  document.querySelectorAll('[data-strip-prev], [data-strip-next]').forEach(function (btn) {
    var id = btn.getAttribute('data-strip-prev') || btn.getAttribute('data-strip-next');
    var strip = document.getElementById(id);
    if (!strip) return;
    var dir = btn.hasAttribute('data-strip-prev') ? -1 : 1;
    btn.addEventListener('click', function () {
      /* mixed-size collage pages by viewport; uniform strips page by cell */
      var amt;
      if (strip.classList.contains('lstrip')) {
        amt = Math.max(strip.clientWidth * 0.75, 260);
      } else {
        var cell = strip.firstElementChild;
        amt = (cell ? cell.getBoundingClientRect().width : 280) * 2;
      }
      strip.scrollBy({ left: dir * amt, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* Mouse drag-to-scroll for [data-drag-scroll] rows (touch already pans natively).
     A drag past 6px suppresses the click so cards don't open mid-swipe. */
  document.querySelectorAll('[data-drag-scroll]').forEach(function (strip) {
    var down = false, moved = false, sx = 0, sl = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft;
      try { strip.setPointerCapture(e.pointerId); } catch (err) { /* released mid-gesture */ }
    });
    strip.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 6) { moved = true; strip.classList.add('dragging'); }
      if (moved) strip.scrollLeft = sl - dx;
    });
    function release() {
      if (!down) return;
      down = false;
      strip.classList.remove('dragging');
      setTimeout(function () { moved = false; }, 0);
    }
    strip.addEventListener('pointerup', release);
    strip.addEventListener('pointercancel', release);
    strip.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  });

  /* Social wall — load more */
  var wallMore = document.getElementById('wall-more');
  if (wallMore) {
    wallMore.addEventListener('click', function () {
      document.getElementById('wall').classList.add('expanded');
      document.getElementById('wall-more-row').style.display = 'none';
    });
  }

  /* Decade filter (films) */
  var libGrid = document.getElementById('lib-grid');
  if (libGrid) {
    var films = Array.prototype.slice.call(libGrid.children);
    var fbtns = Array.prototype.slice.call(document.querySelectorAll('.fbtn'));
    var countEl = document.getElementById('count');
    var allYears = films.map(function (f) { return +f.getAttribute('data-y'); });
    var yMin = Math.min.apply(null, allYears);
    var yMax = Math.max.apply(null, allYears);
    function decadeOf(y) {
      if (y >= 2020) return '2020s';
      if (y >= 2010) return '2010s';
      if (y >= 2000) return '2000s';
      if (y >= 1990) return '90s';
      if (y >= 1980) return '80s';
      if (y >= 1970) return '70s';
      return '60s';
    }
    function applyFilter(label) {
      var shown = 0;
      films.forEach(function (f) {
        var y = +f.getAttribute('data-y');
        var vis = label === 'All films' || decadeOf(y) === label;
        f.style.display = vis ? '' : 'none';
        if (vis) shown++;
      });
      fbtns.forEach(function (b) { b.classList.toggle('on', b.textContent === label); });
      if (countEl) {
        countEl.textContent = '[ ' + shown + (shown === 1 ? ' title' : ' titles') +
          (label === 'All films' ? ' · ' + yMin + ' — ' + yMax : ' · ' + label) + ' ]';
      }
    }
    fbtns.forEach(function (b) {
      b.addEventListener('click', function () { applyFilter(b.textContent); });
    });
  }

  /* Contact form → mailto compose */
  var send = document.getElementById('cf-send');
  if (send) {
    send.addEventListener('click', function () {
      var v = function (id) { var el = document.getElementById(id); return el ? el.value : ''; };
      var topic = v('cf-topic') || 'General Enquiries';
      var body = 'Name: ' + v('cf-name') + '\nEmail: ' + v('cf-email') +
        '\nCompany / Org: ' + v('cf-org') + '\n\n' + v('cf-msg');
      window.location.href = 'mailto:info@everestent.in?subject=' +
        encodeURIComponent(topic + ' — via everestent.in') + '&body=' + encodeURIComponent(body);
    });
  }
})();
