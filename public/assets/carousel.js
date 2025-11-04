(() => {
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function initCarousel(root) {
    const track = root.querySelector('[data-carousel-track]');
    const slides = $$( '[data-carousel-slide]', root);
    const prevBtn = root.querySelector('[data-carousel-prev]');
    const nextBtn = root.querySelector('[data-carousel-next]');
    const dots = root.querySelector('[data-carousel-dots]');
    const intervalMs = parseInt(root.dataset.interval || '6000', 10);

    let index = 0;
    let timer;

    function update() {
      track.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((s, i) => s.setAttribute('aria-hidden', String(i !== index)));
      if (dots) {
        $$('.min-w-2.min-h-2', dots).forEach((b, i) => {
          b.classList.toggle('pointer-events-none', i === index);
          b.classList.toggle('btn-neutral', i !== index);
          b.setAttribute('aria-current', i === index ? 'true' : 'false');
        });
      }
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      update();
      resetTimer();
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function startTimer() {
      if (intervalMs > 0) timer = setInterval(next, intervalMs);
    }
    function stopTimer() { if (timer) clearInterval(timer); }
    function resetTimer() { stopTimer(); startTimer(); }

    // Ensure slides are full-width + pause when hovering over a slide
    slides.forEach(s => {
      s.style.minWidth = '100%';
      s.addEventListener('mouseenter', stopTimer);
      s.addEventListener('mouseleave', startTimer);
    });

    // Build dots
    if (dots) {
      dots.innerHTML = '';
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'h-2 w-2 min-w-2 min-h-2 p-0 flex-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500';
        b.setAttribute('aria-label', `Go to slide ${i + 1}`);
        b.addEventListener('click', () => goTo(i));
        dots.appendChild(b);
      });
    }

    prevBtn?.addEventListener('click', prev);
    nextBtn?.addEventListener('click', next);

    // Also pause on hover/focus over the whole carousel region
    root.addEventListener('mouseenter', stopTimer);
    root.addEventListener('mouseleave', startTimer);
    root.addEventListener('focusin', stopTimer);
    root.addEventListener('focusout', startTimer);

    // Init
    update();
    startTimer();
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-carousel]').forEach(initCarousel);
  });
})();