(() => {
  let loaderSeen = false;
  try { loaderSeen = sessionStorage.getItem('portfolio-loader-seen') === '1'; } catch {}
  const loader = document.querySelector('.loader');
  const labels = [...document.querySelectorAll('.loader [data-final]')];
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const showLoader = loader && !loaderSeen && !window.location.hash && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (showLoader) {
    try { sessionStorage.setItem('portfolio-loader-seen', '1'); } catch {}
    const scrambleLabels = () => labels.forEach((label) => {
      const finalText = label.dataset.final;
      label.textContent = [...finalText].map((character) => character === ' ' ? ' ' : glyphs[Math.floor(Math.random() * glyphs.length)]).join('');
    });
    const scrambleTimer = setInterval(scrambleLabels, 85);
    setTimeout(() => {
      clearInterval(scrambleTimer);
      labels.forEach((label) => { label.textContent = label.dataset.final; });
      loader?.classList.add('reveal');
    }, 2250);
    window.addEventListener('load', () => setTimeout(() => loader?.classList.add('done'), 2700), { once: true });
    setTimeout(() => loader?.classList.add('done'), 3250);
  } else {
    loader?.classList.add('done');
  }

  const menu = document.querySelector('.menu');
  const toggle = document.querySelector('.menu-toggle');
  const shade = document.querySelector('.menu-shade');
  const close = document.querySelector('.menu-close');
  const setMenu = (open) => {
    menu.classList.toggle('open', open);
    shade.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menu.inert = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
    if (open) close.focus(); else toggle.focus();
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  close.addEventListener('click', () => setMenu(false));
  shade.addEventListener('click', () => setMenu(false));
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false);
    if (event.key === 'Tab' && toggle.getAttribute('aria-expanded') === 'true') {
      const focusable = [...menu.querySelectorAll('button:not([disabled]), a[href]')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  const sectionLinks = [...document.querySelectorAll('.side-nav a')];
  const sections = sectionLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const active = `#${entry.target.id}`;
      sectionLinks.forEach((link) => {
        const selected = link.getAttribute('href') === active;
        link.classList.toggle('active', selected);
        if (selected) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  sections.forEach((section) => observer.observe(section));
  const footer = document.querySelector('.footer');
  if (footer) {
    const footerObserver = new IntersectionObserver(([entry]) => {
      document.body.classList.toggle('in-footer', entry.isIntersecting);
    }, { threshold: 0.08 });
    footerObserver.observe(footer);
  }
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.18 });
  document.querySelectorAll('.statement').forEach((section) => revealObserver.observe(section));

  const stage = document.querySelector('.about');
  if (stage && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const paths = [...stage.querySelectorAll('.data-paths path')];
    const nodes = [...stage.querySelectorAll('.data-nodes circle')];
    const stageLabels = [...stage.querySelectorAll('.data-labels text')];
    const caption = stage.querySelector('.about-copy');
    paths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    });

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const desktop = window.matchMedia('(min-width: 761px)').matches;
    if (reducedMotion) {
      gsap.set(paths, { strokeDashoffset: 0 });
      gsap.set(nodes, { scale: 1 });
      gsap.set(stageLabels, { autoAlpha: 1, y: 0 });
      gsap.set(caption, { autoAlpha: 1, y: 0 });
    } else {
      gsap.set(nodes, { scale: 0, transformOrigin: 'center center' });
      gsap.set(stageLabels, { autoAlpha: 0, y: 12 });
      gsap.set(caption, { autoAlpha: 0, y: 24 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: desktop ? 'top top' : 'top 82%',
          end: desktop ? '+=155%' : 'bottom 18%',
          pin: desktop,
          pinSpacing: desktop,
          scrub: 0.65,
          invalidateOnRefresh: true
        }
      });

      timeline
        .to(paths, { strokeDashoffset: 0, duration: 0.76, stagger: 0.08, ease: 'none' }, 0)
        .to(nodes, { scale: 1, duration: 0.1, stagger: 0.13, ease: 'back.out(1.7)' }, 0.42)
        .to(stageLabels, { autoAlpha: 1, y: 0, duration: 0.12, stagger: 0.1, ease: 'power2.out' }, 0.48)
        .to(caption, { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power2.out' }, 0.78);

      ScrollTrigger.refresh();
    }
  }

  const services = document.querySelector('.services');
  if (services && window.gsap && window.ScrollTrigger && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.registerPlugin(ScrollTrigger);
    const cards = [...services.querySelectorAll('[data-service-card]')];
    const orbitLines = [...services.querySelectorAll('.orbit-line')];
    const orbitDots = [...services.querySelectorAll('.orbit-dot')];
    const chartLine = services.querySelector('.chart-line');
    const chartPoints = [...services.querySelectorAll('.chart-point')];
    const timerRings = [...services.querySelectorAll('.timer-ring')];
    const drawables = [...orbitLines, chartLine].filter(Boolean);
    const lengths = new Map(drawables.map((line) => [line, line.getTotalLength()]));

    drawables.forEach((line) => {
      const length = lengths.get(line);
      gsap.set(line, { strokeDasharray: length, strokeDashoffset: length });
    });
    gsap.set(timerRings, { strokeDasharray: 157, strokeDashoffset: 157 });
    gsap.set(chartPoints, { scale: 0, transformOrigin: 'center center' });

    const servicesTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: services.querySelector('.service-grid'),
        start: 'top 82%',
        end: 'bottom 48%',
        scrub: 0.55,
        invalidateOnRefresh: true
      }
    });

    servicesTimeline
      .fromTo(cards, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.1, ease: 'none' }, 0)
      .to(drawables, { strokeDashoffset: 0, duration: 0.48, stagger: 0.08, ease: 'none' }, 0.22)
      .to(timerRings, { strokeDashoffset: 0, duration: 0.44, stagger: 0.08, ease: 'none' }, 0.34)
      .to(chartPoints, { scale: 1, duration: 0.12, stagger: 0.08, ease: 'back.out(1.5)' }, 0.68)
      .fromTo(orbitDots, { scale: 0.4, autoAlpha: 0.3 }, { scale: 1, autoAlpha: 1, duration: 0.2, stagger: 0.06, ease: 'none' }, 0.62);
  }

  const outro = document.querySelector('.soar');
  if (outro && window.gsap && window.ScrollTrigger && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const copy = outro.querySelector('.soar-copy');
    const rings = outro.querySelector('.rings');
    const floor = outro.querySelector('.floor-grid');
    const footer = document.querySelector('.footer');
    const legal = footer?.querySelector('.legal');
    const ringOpacity = window.matchMedia('(max-width: 760px)').matches ? 0.34 : 0.52;

    gsap.timeline({
      scrollTrigger: { trigger: outro, start: 'top bottom', end: 'top 24%', scrub: 0.65, invalidateOnRefresh: true }
    })
      .fromTo(rings, { autoAlpha: 0, scale: 0.04 }, { autoAlpha: ringOpacity, scale: 1, duration: 0.78, ease: 'none' }, 0)
      .fromTo(copy, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'none' }, 0.18);

    gsap.timeline({
      scrollTrigger: { trigger: outro, start: 'top bottom', end: 'bottom top', scrub: 0.7 }
    })
      .to(floor, { opacity: 0.27, backgroundPosition: '0px 280px, 0px 0px', duration: 0.65, ease: 'none' }, 0.3);

    if (legal) {
      gsap.fromTo(legal, { autoAlpha: 0, y: -16 }, {
        autoAlpha: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: { trigger: legal, start: 'top bottom', end: 'top 78%', scrub: 0.5, invalidateOnRefresh: true }
      });
    }
  }

  const updateScrollState = () => document.body.classList.toggle('has-scrolled', window.scrollY > window.innerHeight * .72);
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });

  const glow = document.querySelector('.cursor-glow');
  if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('pointermove', (event) => {
      glow.style.opacity = '.9';
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }, { passive: true });
    document.addEventListener('pointerleave', () => { glow.style.opacity = '0'; });
  }
})();
