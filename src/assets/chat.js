/* Polished Nail Bar DTLA — chat assistant widget.
   Talks to the Cloudflare Worker, which holds the API key.
   The salon's knowledge is loaded from /knowledge.txt, which Eleventy
   rewrites on every build — so editing the CMS updates the assistant. */
(function () {
  'use strict';

  var WORKER = 'https://polished-chat.polishedmanager25.workers.dev';

  var css = `
  .pc-tag{position:fixed;right:80px;bottom:29px;z-index:199;background:#fff;color:#141414;
    border:1px solid #141414;border-left:3px solid #DCB63F;padding:9px 12px;font-size:12px;
    line-height:1.3;max-width:180px;box-shadow:0 4px 16px rgba(0,0,0,.18);cursor:pointer}
  .pc-tag{font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:600}
  .pc-tag b{display:block;font-size:14px;letter-spacing:.06em;font-weight:700;margin-top:2px}
  .pc-tag.gone{display:none}
  @media(max-width:420px){.pc-tag{max-width:150px;font-size:11.5px}}
  .pc-btn{position:fixed;right:16px;bottom:16px;z-index:200;width:56px;height:56px;
    border-radius:50%;background:#141414;color:#fff;display:grid;place-items:center;
    box-shadow:0 6px 24px rgba(0,0,0,.34);border:1px solid #DCB63F;cursor:pointer}
  .pc-btn svg{width:24px;height:24px;fill:#DCB63F}
  .pc-btn:focus-visible{outline:2px solid #DCB63F;outline-offset:3px}
  .pc-panel{position:fixed;right:16px;bottom:82px;z-index:200;width:min(380px,calc(100vw - 32px));
    height:min(560px,calc(100vh - 130px));background:#fff;border:1px solid #141414;
    display:none;flex-direction:column;box-shadow:0 12px 44px rgba(0,0,0,.28)}
  .pc-panel.open{display:flex}
  .pc-head{background:#141414;color:#fff;padding:12px 14px;display:flex;
    justify-content:space-between;align-items:center;flex:none}
  .pc-head b{font-size:11px;letter-spacing:.18em;text-transform:uppercase;font-weight:600}
  .pc-head button{color:#fff;font-size:18px;line-height:1;background:none;border:0;cursor:pointer}
  .pc-log{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
  .pc-msg{max-width:86%;padding:10px 12px;font-size:14px;line-height:1.55;white-space:pre-wrap}
  .pc-msg.bot{background:#F3F1EF;color:#141414;align-self:flex-start}
  .pc-msg.me{background:#141414;color:#fff;align-self:flex-end}
  .pc-msg.err{background:#FDECEE;color:#8E0C22}
  .pc-form{display:flex;gap:8px;padding:10px;border-top:1px solid #E2E2E2;flex:none}
  .pc-form input{flex:1;padding:11px 12px;border:1px solid #E2E2E2;font:inherit;font-size:14px}
  .pc-form input:focus{outline:0;border-color:#141414}
  .pc-form button{padding:0 16px;background:#141414;color:#fff;border:0;cursor:pointer;
    font-size:10px;letter-spacing:.16em;text-transform:uppercase;font-weight:600}
  .pc-form button:disabled{opacity:.45;cursor:default}
  .pc-foot{padding:0 14px 10px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#6E6E6E}
  @media(prefers-reduced-motion:no-preference){.pc-panel.open{animation:pcIn .18s ease}}
  @keyframes pcIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  `;

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var wrap = document.createElement('div');
  wrap.innerHTML =
    
    '<button class="pc-btn" type="button" aria-label="Ask Baby P">' +
      '<svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>' +
      '<span class="pc-label">Ask Baby P</span>' +
    '</button>' +
    '<div class="pc-panel" role="dialog" aria-label="Baby P, the Polished assistant">' +
      '<div class="pc-head"><b>Ask Baby P</b><button type="button" aria-label="Close">&#10005;</button></div>' +
      '<div class="pc-log" aria-live="polite"></div>' +
      '<form class="pc-form"><input type="text" placeholder="Ask about pricing, parking\u2026" autocomplete="off"><button type="submit">Send</button></form>' +
      '<p class="pc-foot">Answers may be imperfect \u2014 text us to confirm.</p>' +
    '</div>';
  document.body.appendChild(wrap);

  var btn   = wrap.querySelector('.pc-btn');
  var panel = wrap.querySelector('.pc-panel');
  var close = wrap.querySelector('.pc-head button');
  var log   = wrap.querySelector('.pc-log');
  var form  = wrap.querySelector('.pc-form');
  var input = form.querySelector('input');
  var send  = form.querySelector('button');

  var GREETING = "Hi, I'm Baby P! Ask me about services, pricing, timing, parking or booking.";
  var knowledge = null;
  var history = [];
  var greeted = false;

  function say(text, cls) {
    var el = document.createElement('div');
    el.className = 'pc-msg ' + (cls || 'bot');
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  // pulled once, then reused for the session
  function loadKnowledge() {
    if (knowledge) return Promise.resolve(knowledge);
    return fetch('/knowledge.txt', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (t) { knowledge = t; return t; })
      .catch(function () { return ''; });
  }

  function open() {
    panel.classList.add('open');
    input.focus();
    if (!greeted) {
      greeted = true;
      say(GREETING);
      loadKnowledge();
    }
  }

  btn.addEventListener('click', function () {
    panel.classList.contains('open') ? panel.classList.remove('open') : open();
  });
  close.addEventListener('click', function () { panel.classList.remove('open'); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') panel.classList.remove('open');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q) return;
    say(q, 'me');
    input.value = '';
    send.disabled = true;
    var thinking = say('\u2026');

    loadKnowledge().then(function (kb) {
      return fetch(WORKER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, knowledge: kb, history: history.slice(-6) })
      });
    })
    .then(function (r) {
      if (!r.ok) throw new Error('status ' + r.status);
      return r.json();
    })
    .then(function (data) {
      thinking.textContent = data.reply || 'Sorry, I did not catch that.';
      history.push({ role: 'user', content: q });
      history.push({ role: 'assistant', content: data.reply });
    })
    .catch(function () {
      thinking.className = 'pc-msg err';
      thinking.textContent =
        'Sorry \u2014 I could not reach the assistant. Text us at 323-379-3469 and a person will help.';
    })
    .finally(function () {
      send.disabled = false;
      input.focus();
      log.scrollTop = log.scrollHeight;
    });
  });
})();
