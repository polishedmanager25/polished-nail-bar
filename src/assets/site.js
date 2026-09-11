/* Polished Nail Bar DTLA — shared behaviour, all pages. */
(function () {
  'use strict';

  /* ---- menu drawer ---- */
  var drawer = document.getElementById('dw');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-menu-open]'))  { e.preventDefault(); setDrawer(true); }
    if (e.target.closest('[data-menu-close]')) { e.preventDefault(); setDrawer(false); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });

  /* ---- accordions ---- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.acc-b');
    if (!b) return;
    var open = b.parentElement.classList.toggle('open');
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* ---- filter chips ---- */
  var bar = document.querySelector('[data-filter-bar]');
  if (bar) {
    bar.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      var want = chip.dataset.filter;
      bar.querySelectorAll('.chip').forEach(function (c) {
        c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
      });
      document.querySelectorAll('[data-tags]').forEach(function (card) {
        card.classList.toggle('hidden',
          !(want === 'all' || card.dataset.tags.split(' ').indexOf(want) > -1));
      });
    });
  }

  /* ---- journal: index <-> single post ---- */
  if (document.getElementById('journal')) {
    var show = function (id) {
      var idx = document.getElementById('journal-index');
      document.querySelectorAll('.post').forEach(function (p) {
        p.classList.toggle('on', p.id === id);
      });
      if (idx) idx.classList.toggle('hidden', !!id);
      window.scrollTo(0, 0);
    };
    document.addEventListener('click', function (e) {
      var open = e.target.closest('[data-post]');
      var back = e.target.closest('[data-post-back]');
      if (open) { e.preventDefault(); show(open.dataset.post); history.replaceState(null, '', '#' + open.dataset.post); }
      if (back) { e.preventDefault(); show(null); history.replaceState(null, '', location.pathname); }
    });
    if (location.hash && document.getElementById(location.hash.slice(1))) show(location.hash.slice(1));
  }

  /* ---- scroll reveal ---- */
  var t = document.querySelectorAll('.rv');
  if (!t.length) return;
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    t.forEach(function (e) { e.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  t.forEach(function (e) { io.observe(e); });
})();

/* ---- the deck: drive --cover on the pinned panel and --drift on photo
       panels from scroll position. One rAF loop, transforms only. ---- */
(function () {
  'use strict';
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pin  = null, pans = [], ticking = false;

  function collect() {
    pin  = document.querySelector('.pg.on .pin, .pin');
    pans = [].slice.call(document.querySelectorAll('.pg.on .pan, .pan'));
  }

  function frame() {
    ticking = false;
    var vh = window.innerHeight;

    if (pin) {
      var h = pin.offsetHeight || vh;
      var c = Math.min(1, Math.max(0, window.scrollY / h));
      pin.style.setProperty('--cover', c.toFixed(4));
    }

    if (calm) return;
    for (var i = 0; i < pans.length; i++) {
      var el = pans[i], r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      // -1 above the fold .. +1 below it
      var p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      el.style.setProperty('--drift', (Math.max(-1, Math.min(1, p)) * 42).toFixed(1));
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }

  collect();
  frame();
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { collect(); frame(); }, { passive: true });
  // the single-file preview swaps pages in place
  addEventListener('pagechange', function () { collect(); frame(); });
})();

/* ---- the sticky header's height, so a pinned panel stops below it
       instead of sliding underneath and clipping its own top line ---- */
(function () {
  'use strict';
  var head = document.querySelector('header.top');
  if (!head) return;
  function measure() {
    document.documentElement.style.setProperty('--head-h', head.offsetHeight + 'px');
  }
  measure();
  addEventListener('resize', measure, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
})();

/* ---- hero + about video: reveal only once really loaded ---- */
(function () {
  'use strict';
  var vids = [].slice.call(document.querySelectorAll('.hv,.av'));
  if (!vids.length) return;

  vids.forEach(function (v) {
    function live() {
      if (v.readyState < 2) return;      // no decoded frame yet
      v.classList.add('live');
      var go = v.play();
      if (go && go.catch) go.catch(function () { v.classList.remove('live'); });
    }
    v.addEventListener('loadeddata', live);
    v.addEventListener('canplay', live);
    live();
  });

  // don't burn battery off-screen — each video watches itself
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (!v.classList.contains('live')) return;
        if (e.isIntersecting) v.play().catch(function () {});
        else v.pause();
      });
    }, { threshold: 0.01 });
    vids.forEach(function (v) { io.observe(v); });
  }
})();
