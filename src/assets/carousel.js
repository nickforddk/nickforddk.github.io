(() => {
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function initCarousel(root) {
    const track = root.querySelector('[data-carousel-track]');
    const slides = $$('[data-carousel-slide]', root);
    const prevBtn = root.querySelector('[data-carousel-prev]');
    const nextBtn = root.querySelector('[data-carousel-next]');
    const dots = root.querySelector('[data-carousel-dots]');
    if (!track || !slides.length) return;

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const intervalMs = reduce ? 0 : parseInt(root.dataset.interval || '6000', 10);

    let index = 0;
    let timerId = null; // single interval
    const pauses = new Set(); // reasons keeping autoplay paused

    function startTimer() {
      if (intervalMs <= 0) return;
      if (pauses.size > 0) return;
      if (timerId !== null) return;
      timerId = setInterval(next, intervalMs);
    }
    function stopTimer() {
      if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
      }
    }
    function pause(reason) {
      pauses.add(reason);
      stopTimer();
    }
    function resume(reason) {
      pauses.delete(reason);
      if (pauses.size === 0) startTimer();
    }

    function update() {
      track.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((s, i) => s.setAttribute('aria-hidden', String(i !== index)));
      if (dots) {
        Array.from(dots.querySelectorAll('button')).forEach((b, i) => {
          b.classList.toggle('bg-blue-600', i === index);
          b.classList.toggle('bg-gray-300', i !== index);
          b.setAttribute('aria-current', i === index ? 'true' : 'false');
        });
      }
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      update();
      // do not forcibly reset autoplay if currently paused
      if (pauses.size === 0) {
        stopTimer();
        startTimer();
      }
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    // Ensure slides are full-width
    slides.forEach(s => { s.style.minWidth = '100%'; });

    // Build dots
    if (dots) {
      dots.innerHTML = '';
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'h-2 w-2 rounded-full bg-gray-300 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500';
        b.setAttribute('aria-label', `Go to slide ${i + 1}`);
        b.addEventListener('click', () => goTo(i));
        dots.appendChild(b);
      });
    }

    prevBtn?.addEventListener('click', prev);
    nextBtn?.addEventListener('click', next);

    // Pause/resume on hover/focus (both slide and root) without stacking timers
    slides.forEach(s => {
      s.addEventListener('mouseenter', () => pause('hover-slide'));
      s.addEventListener('mouseleave', () => resume('hover-slide'));
    });
    root.addEventListener('mouseenter', () => pause('hover-root'));
    root.addEventListener('mouseleave', () => resume('hover-root'));
    root.addEventListener('focusin', () => pause('focus'));
    root.addEventListener('focusout', () => resume('focus'));

    // Mobile swipe
    root.style.touchAction = 'pan-y';
    let startX = 0, startY = 0, deltaX = 0, swiping = false;
    const SWIPE_ACTIVATE_PX = 12;
    const SWIPE_TRIGGER_PX = 48;

    function onTouchStart(e) {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      startX = t.clientX; startY = t.clientY; deltaX = 0; swiping = false;
      pause('touch');
    }
    function onTouchMove(e) {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (!swiping && Math.abs(dx) > SWIPE_ACTIVATE_PX && Math.abs(dx) > Math.abs(dy)) {
        swiping = true;
      }
      if (swiping) {
        e.preventDefault();
        deltaX = dx;
      }
    }
    function onTouchEnd() {
      if (swiping) {
        if (Math.abs(deltaX) > SWIPE_TRIGGER_PX) (deltaX < 0 ? next : prev)();
        else update();
      }
      swiping = false; deltaX = 0;
      resume('touch');
    }

    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchmove', onTouchMove, { passive: false });
    root.addEventListener('touchend', onTouchEnd, { passive: true });
    root.addEventListener('touchcancel', onTouchEnd, { passive: true });

    // Pause when tab is hidden to avoid drift, resume when visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pause('visibility');
      else resume('visibility');
    });

    // Init
    update();
    startTimer();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-carousel]').forEach(initCarousel);
  });
})();