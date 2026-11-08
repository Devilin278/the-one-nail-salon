/* ============================================================
   The One Nail Salon - Silver Spring, MD
   Interactive UI Script (Powered by Official Instagram Photos)
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  
  /* ================= 1. Mobile Menu ================= */
  (function initMobileMenu() {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.mnav');
    if (!toggle || !menu) return;

    function setMenu(open) {
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setMenu(!isOpen);
    });

    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        setMenu(false);
      }
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setMenu(false);
      });
    });
  })();

  /* ================= 2. Booking Modal ================= */
  (function initBookingModal() {
    var modal = document.getElementById('bookingModal');
    var closeBtn = document.getElementById('closeModal');
    var bookBtns = document.querySelectorAll('.btn-book-modal, a[href="#book"]');
    var bookingForm = document.getElementById('appointmentForm');
    var bookingSuccess = document.getElementById('bookingSuccess');

    if (!modal) return;

    function openModal(e) {
      if (e) e.preventDefault();
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (bookingForm) bookingForm.style.display = 'flex';
      if (bookingSuccess) bookingSuccess.classList.remove('show');
    }

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    bookBtns.forEach(function (btn) {
      btn.addEventListener('click', openModal);
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });

    if (bookingForm) {
      bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();
        bookingForm.style.display = 'none';
        if (bookingSuccess) {
          bookingSuccess.classList.add('show');
        }
      });
    }

    window.openBookingModal = openModal;
  })();

  /* ================= 3. Hero 3D Coverflow Carousel (Randomized Instagram Photos) ================= */
  (function initHeroCarousel() {
    var root = document.getElementById('heroCarousel');
    if (!root) return;
    var wrap = root.querySelector('.hero-carousel__wrap');
    if (!wrap) return;

    // Full pool of authentic photos from images/instagram/ (insta-1.jpg through insta-48.jpg)
    var ALL_INSTA_IMAGES = [];
    for (var k = 1; k <= 48; k++) {
      ALL_INSTA_IMAGES.push('images/instagram/insta-' + k + '.jpg');
    }

    // Fisher-Yates shuffle to pick random photos on every page visit/load
    function shuffle(arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = a[i];
        a[i] = a[j];
        a[j] = temp;
      }
      return a;
    }

    // Select 14 randomized distinct photos from the Instagram collection
    var IMAGES = shuffle(ALL_INSTA_IMAGES).slice(0, 14);
    var SPACE = 12, SPEED = 2200, DELAY = 200;
    var ROTATE = 45, DEPTH = 120, MODIFIER = 1;

    var slides = [], slideW = 0, setW = 0, pos = 0, from = 0, to = 0, t0 = 0, moving = false;
    var paused = false, timer = null, REPEAT = 5;

    function perView() {
      var w = window.innerWidth;
      if (w <= 767) return 1;
      if (w <= 1024) return 3;
      return 4;
    }

    function build() {
      wrap.innerHTML = '';
      slides = [];
      var n = IMAGES.length * REPEAT;
      for (var i = 0; i < n; i++) {
        var d = document.createElement('div');
        d.className = 'hero-carousel__slide';
        d.style.backgroundImage = 'url("' + IMAGES[i % IMAGES.length] + '")';
        wrap.appendChild(d);
        slides.push(d);
      }
      layout();
    }

    function layout() {
      var vw = root.clientWidth;
      var pv = perView();
      slideW = (vw - SPACE * (pv - 1)) / pv;
      setW = (slideW + SPACE) * IMAGES.length;
      for (var i = 0; i < slides.length; i++) {
        slides[i].style.width = slideW + 'px';
        slides[i].style.left = (i * (slideW + SPACE)) + 'px';
      }
      render();
    }

    function render() {
      var vw = root.clientWidth;
      var center = pos + vw / 2;
      wrap.style.transform = 'translate3d(' + (-pos) + 'px,0,0)';
      for (var i = 0; i < slides.length; i++) {
        var off = i * (slideW + SPACE);
        var m = ((center - off - slideW / 2) / slideW) * MODIFIER;
        var rotY = ROTATE * m;
        var z = -DEPTH * Math.abs(m);
        slides[i].style.transform = 'translate3d(0,0,' + z + 'px) rotateY(' + rotY + 'deg)';
        slides[i].style.zIndex = String(Math.round(1000 - Math.abs(m) * 100));
      }
    }

    function ease(t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

    function step(ts) {
      if (!moving) return;
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / SPEED);
      pos = from + (to - from) * ease(k);
      render();
      if (k < 1) { requestAnimationFrame(step); return; }
      moving = false; t0 = 0;
      if (pos >= setW) { pos -= setW; to -= setW; render(); }
      timer = setTimeout(next, DELAY);
    }

    function next() {
      if (paused) { timer = setTimeout(next, DELAY); return; }
      from = pos; to = pos + slideW + SPACE; moving = true; t0 = 0;
      requestAnimationFrame(step);
    }

    root.addEventListener('mouseenter', function () { paused = true; });
    root.addEventListener('mouseleave', function () { paused = false; });
    
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { pos = 0; layout(); }, 150);
    });

    build();
    timer = setTimeout(next, DELAY);
  })();

  /* ================= 4. Gallery Masonry & Lightbox ================= */
  window.initGallery = function (rootId, items) {
    var root = document.getElementById(rootId);
    if (!root) return;

    var lb = document.getElementById('lightbox');
    var lbImg = document.getElementById('lbImg');
    var lbClose = document.getElementById('lbClose');
    var lbPrev = document.getElementById('lbPrev');
    var lbNext = document.getElementById('lbNext');
    var curIdx = 0;

    function cols() {
      var w = window.innerWidth;
      if (w <= 600) return 1;
      if (w <= 950) return 2;
      if (w <= 1200) return 3;
      return 4;
    }

    root.innerHTML = '';
    var nodes = items.map(function (it, idx) {
      var a = document.createElement('a');
      a.className = 'gallery__item';
      a.href = it.src;
      a.setAttribute('data-index', String(idx));
      a.style.backgroundImage = 'url("' + it.src + '")';
      a.setAttribute('aria-label', it.title || 'The One Nail Salon Instagram photo');
      
      var ov = document.createElement('span');
      ov.className = 'gallery__overlay';
      ov.innerHTML = '<svg viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>';
      a.appendChild(ov);
      root.appendChild(a);

      a.addEventListener('click', function (e) {
        e.preventDefault();
        openLb(idx);
      });

      return a;
    });

    function layout() {
      var C = cols(), gap = 16;
      var W = root.clientWidth;
      var colW = (W - gap * (C - 1)) / C;
      var sum = new Array(C).fill(0), count = new Array(C).fill(0);

      for (var i = 0; i < items.length; i++) {
        var h = colW * (items[i].h / items[i].w);
        var col = 0;
        for (var c = 1; c < C; c++) {
          if (sum[c] < sum[col]) col = c;
        }
        var top = sum[col] + gap * count[col];
        var left = col * (colW + gap);
        nodes[i].style.width = colW + 'px';
        nodes[i].style.height = h + 'px';
        nodes[i].style.transform = 'translate3d(' + left + 'px,' + top + 'px,0)';
        sum[col] += h;
        count[col]++;
      }

      var maxH = 0;
      for (var k = 0; k < C; k++) {
        var totalColH = sum[k] + gap * Math.max(0, count[k] - 1);
        if (totalColH > maxH) maxH = totalColH;
      }
      root.style.height = maxH + 'px';
    }

    function showLb(n) {
      curIdx = (n + items.length) % items.length;
      if (lbImg) lbImg.src = items[curIdx].src;
    }

    function openLb(n) {
      if (!lb) return;
      showLb(n);
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLb() {
      if (!lb) return;
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (lbClose) lbClose.addEventListener('click', closeLb);
    if (lbPrev) lbPrev.addEventListener('click', function (e) { e.stopPropagation(); showLb(curIdx - 1); });
    if (lbNext) lbNext.addEventListener('click', function (e) { e.stopPropagation(); showLb(curIdx + 1); });
    if (lb) {
      lb.addEventListener('click', function (e) {
        if (e.target === lb) closeLb();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (!lb || !lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') showLb(curIdx - 1);
      if (e.key === 'ArrowRight') showLb(curIdx + 1);
    });

    layout();
    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(layout, 100);
    });
  };

  /* Auto-init Home Gallery with Instagram Photos */
  (function initHomeGal() {
    if (!document.getElementById('homeGallery')) return;
    var instaGalleryData = [
      { src: 'images/instagram/insta-1.jpg', w: 360, h: 640, title: 'The One Nail Salon Instagram Set 1' },
      { src: 'images/instagram/insta-2.jpg', w: 360, h: 640, title: 'The One Nail Salon Instagram Set 2' },
      { src: 'images/instagram/insta-3.jpg', w: 360, h: 640, title: 'The One Nail Salon Instagram Set 3' },
      { src: 'images/instagram/insta-4.jpg', w: 361, h: 640, title: 'The One Nail Salon Instagram Set 4' },
      { src: 'images/instagram/insta-5.jpg', w: 361, h: 640, title: 'The One Nail Salon Instagram Set 5' },
      { src: 'images/instagram/insta-6.jpg', w: 482, h: 640, title: 'The One Nail Salon Instagram Set 6' },
      { src: 'images/instagram/insta-7.jpg', w: 361, h: 640, title: 'The One Nail Salon Instagram Set 7' },
      { src: 'images/instagram/insta-8.jpg', w: 360, h: 640, title: 'The One Nail Salon Instagram Set 8' },
      { src: 'images/instagram/insta-9.jpg', w: 360, h: 640, title: 'The One Nail Salon Instagram Set 9' },
      { src: 'images/instagram/insta-10.jpg', w: 360, h: 640, title: 'The One Nail Salon Instagram Set 10' },
      { src: 'images/instagram/insta-11.jpg', w: 640, h: 640, title: 'The One Nail Salon Instagram Set 11' },
      { src: 'images/instagram/insta-12.jpg', w: 361, h: 640, title: 'The One Nail Salon Instagram Set 12' }
    ];
    window.initGallery('homeGallery', instaGalleryData);
  })();

  /* ================= 5. Testimonials Carousel ================= */
  (function initTestimonials() {
    var root = document.getElementById('tstCarousel');
    if (!root) return;
    var track = root.querySelector('.tst__track');
    var dotsBox = document.getElementById('tstDots');
    if (!track || !dotsBox) return;

    var REVIEWS = [
      {
        t: "The staff at The One Nail Salon is fantastic! Lena always takes her time to ensure every nail is shaped to perfection. The salon is pristine, calm, and so welcoming. My dip powder lasted over 3 weeks without lifting!",
        n: "Michelle K.",
        r: "5-Star Yelp Review • Silver Spring, MD"
      },
      {
        t: "By far the most relaxing pedicure in Montgomery County! The hot stone massage and orange sugar scrub melted away all my stress. You get top-notch service at fair, transparent prices.",
        n: "David P.",
        r: "Local Guide • Silver Spring"
      },
      {
        t: "I came in as a walk-in on a busy Saturday and was seated quickly with a warm smile. The technician did incredible custom flower nail art that looked even better than the Instagram reference I showed her!",
        n: "Sarah M.",
        r: "Yelp Elite Reviewer"
      },
      {
        t: "Very clean instruments, luxury massage chairs, and high quality gel polish that doesn't chip. I love supporting this local Silver Spring gem. Highly recommend booking your appointments here!",
        n: "Jasmine T.",
        r: "Verified Customer"
      }
    ];

    var N = REVIEWS.length, SPEED = 600, DELAY = 3000;
    var idx = 0, paused = false, timer = null, slides = [];

    function perView() { return window.innerWidth <= 1024 ? 1 : 3; }
    function space() { return window.innerWidth <= 1024 ? 16 : 24; }

    function build() {
      track.innerHTML = '';
      slides = [];
      var total = N + 3;
      for (var i = 0; i < total; i++) {
        var d = REVIEWS[i % N];
        var s = document.createElement('div');
        s.className = 'tst__slide';
        s.innerHTML =
          '<div class="tst__card">' +
            '<div class="tst__stars">★★★★★</div>' +
            '<div class="tst__content">' +
              '<div class="tst__text">“' + d.t + '”</div>' +
              '<cite class="tst__cite">' +
                '<span class="tst__name">' + d.n + '</span>' +
                '<span class="tst__title">' + d.r + '</span>' +
              '</cite>' +
            '</div>' +
          '</div>';
        track.appendChild(s);
        slides.push(s);
      }

      dotsBox.innerHTML = '';
      for (var j = 0; j < N; j++) {
        var b = document.createElement('button');
        b.className = 'tst__dot' + (j === 0 ? ' is-active' : '');
        b.type = 'button';
        b.setAttribute('aria-label', 'Go to review ' + (j + 1));
        (function (k) {
          b.addEventListener('click', function () { go(k, true); });
        })(j);
        dotsBox.appendChild(b);
      }
      size();
    }

    function size() {
      var pv = perView(), sp = space();
      var w = (root.clientWidth - sp * (pv - 1)) / pv;
      track.style.gap = sp + 'px';
      slides.forEach(function (s) { s.style.width = w + 'px'; });
      place(false);
    }

    function place(anim) {
      var pv = perView(), sp = space();
      var w = (root.clientWidth - sp * (pv - 1)) / pv;
      track.style.transition = anim ? ('transform ' + SPEED + 'ms cubic-bezier(0.25, 1, 0.5, 1)') : 'none';
      track.style.transform = 'translate3d(' + (-idx * (w + sp)) + 'px,0,0)';
      [].forEach.call(dotsBox.children, function (d, k) {
        d.classList.toggle('is-active', k === (idx % N));
      });
    }

    function go(n, user) {
      idx = n;
      place(true);
      if (idx >= N) {
        setTimeout(function () { idx = idx % N; place(false); }, SPEED + 20);
      }
      if (user) restart();
    }

    function tick() { if (!paused) go(idx + 1); }
    function restart() { clearInterval(timer); timer = setInterval(tick, DELAY + SPEED); }

    root.addEventListener('mouseenter', function () { paused = true; });
    root.addEventListener('mouseleave', function () { paused = false; });

    var x0 = null;
    root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; paused = true; }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(dx < 0 ? idx + 1 : Math.max(0, idx - 1), true);
      x0 = null;
      paused = false;
    });

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(size, 120);
    });

    build();
    restart();
  })();

});
