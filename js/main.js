/* Горизонты | Horizons — поведение сайта */
(function () {
  'use strict';

  var root = document.documentElement;
  var SITE = window.SITE || {};

  /* ---------- помощники ---------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function safeUrl(u) {                      // запрещаем javascript: в ссылках
    return u && !/^\s*javascript:/i.test(u) ? u : '';
  }
  function photo(src, alt, label, extraClass) {
    var box = el('div', 'ph' + (extraClass ? ' ' + extraClass : ''));
    box.textContent = label;
    if (src) {
      var img = el('img');
      img.src = src;
      img.alt = alt || '';
      img.loading = 'lazy';
      img.addEventListener('error', function () { img.remove(); });   // нет файла — остаётся заглушка
      box.appendChild(img);                                            // картинка закрывает подпись-заглушку
    }
    return box;
  }
  function render(id, items, build) {
    var host = document.getElementById(id);
    if (!host || !Array.isArray(items)) return;
    items.forEach(function (it) { host.appendChild(build(it)); });
  }

  /* ---------- содержимое ---------- */
  render('places-list', SITE.places, function (p) {
    var f = el('figure');
    f.appendChild(photo(p.image, p.alt, 'Фото'));
    f.appendChild(el('figcaption', null, p.caption || ''));
    return f;
  });

  render('news-list', SITE.news, function (n) {
    var a = el('article', 'card');
    var url = safeUrl(n.url);
    var pic = photo(n.image, n.alt, 'Фото');
    if (url) {
      var cover = el('a'); cover.href = url; cover.setAttribute('aria-label', n.title || 'Читать'); pic.appendChild(cover);
    }
    a.appendChild(pic);
    a.appendChild(el('div', 'date', n.date || ''));
    var h = el('h3');
    if (url) { var l = el('a', null, n.title || ''); l.href = url; h.appendChild(l); }
    else h.textContent = n.title || '';
    a.appendChild(h);
    return a;
  });

  render('partners-list', SITE.partners, function (p) {
    var box = photo(p.logo, p.name, p.name || 'Логотип', 'logo-ph');
    var url = safeUrl(p.url);
    if (url) {
      var l = el('a'); l.href = url; l.target = '_blank'; l.rel = 'noopener';
      l.setAttribute('aria-label', p.name || 'Партнёр'); box.appendChild(l);
    }
    return box;
  });

  /* ---------- контакты ---------- */
  var c = SITE.contacts || {};
  document.querySelectorAll('[data-contact]').forEach(function (a) {
    var kind = a.getAttribute('data-contact');
    if (kind === 'email' && c.email) {
      var subj = a.getAttribute('data-subject');
      a.href = 'mailto:' + c.email + (subj ? '?subject=' + encodeURIComponent(subj) : '');
      if (a.hasAttribute('data-text')) a.textContent = c.email;
    }
    if (kind === 'telegram' && c.telegram) {
      a.href = 'https://t.me/' + c.telegram.replace(/^@/, '');
      if (a.hasAttribute('data-text')) a.textContent = '@' + c.telegram.replace(/^@/, '');
    }
  });

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- тема: чёрное на белом / белое на чёрном ---------- */
  var btn = document.getElementById('theme');
  var metaTheme = document.querySelector('meta[name="theme-color"]');
  function current() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  }
  function paint(t) {
    root.setAttribute('data-theme', t);
    if (btn) btn.setAttribute('aria-pressed', String(t === 'dark'));
    if (metaTheme) metaTheme.setAttribute('content', t === 'dark' ? '#000000' : '#ffffff');
  }
  paint(current());
  if (btn) btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    paint(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- подсветка текущего раздела в меню ---------- */
  var nav = document.querySelector('.menu nav');
  var links = nav ? nav.querySelectorAll('a') : [];
  if (links.length && 'IntersectionObserver' in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('on'); a.removeAttribute('aria-current'); });
        var a = map[e.target.id];
        if (!a) return;
        a.classList.add('on');
        a.setAttribute('aria-current', 'true');
        nav.scrollTo({ left: a.offsetLeft - nav.clientWidth / 2 + a.clientWidth / 2, behavior: 'smooth' });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }
})();
