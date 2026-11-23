/* ==========================================================================
   Asmit Gupta — Personal Academic Website
   Interactive Engine, Keplerian Disk & Star-Planet Magnetic Interaction
   Directly crafted after tanmay1902.github.io
   ========================================================================== */

(function () {
  'use strict';

  // Respect user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. Interactive Astronomical Simulation Canvas (#field)
        - Keplerian Accretion Disk with Shear (v ~ r^-1.5)
        - Host Star with Limb Darkening & Coronal Magnetic Loops
        - Planet GJ 486b in Eccentric Keplerian Orbit with Annular Gap
        - Dynamic Star-Planet Magnetic Interaction (Alfvén Wings / Flux Tube)
     ========================================================================== */
  const canvas = document.getElementById('field');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, dpr;
    let particles = [];
    let star = { x: 0, y: 0, r: 26 };
    let planet = {
      a: 165,        // semi-major axis (px)
      e: 0.08,       // orbital eccentricity
      theta: 0.8,    // true anomaly
      period: 14.0,  // seconds per revolution
      size: 5.5,
      x: 0, y: 0
    };
    let companion = {
      a: 285,
      e: 0.03,
      theta: 2.4,
      period: 32.0,
      size: 4.0,
      x: 0, y: 0
    };

    // Magnetic flux packets streaming between star and planet
    let fluxPackets = [];
    for (let i = 0; i < 14; i++) {
      fluxPackets.push({
        s: Math.random(), // progress along flux tube [0, 1]
        speed: 0.25 + Math.random() * 0.45,
        lane: (Math.random() - 0.5) * 1.6,
        size: 1.2 + Math.random() * 1.2,
        alpha: 0.4 + Math.random() * 0.5
      });
    }

    // Disk geometry
    let diskInclination = 64 * (Math.PI / 180); // tilt angle
    let diskAngle = -22 * (Math.PI / 180);       // position angle
    let mouse = { x: -1e4, y: -1e4, tx: 0, ty: 0, tiltX: 0, tiltY: 0 };

    // Palette: warm chondrite ochre & mantle olivine sage
    const DUST_COLORS = [
      { r: 226, g: 138, b: 82 },   // Warm Chondrite Ochre
      { r: 245, g: 158, b: 11 },   // Starlight Amber
      { r: 74,  g: 222, b: 128 },  // Mantle Olivine Sage
      { r: 240, g: 242, b: 245 }   // Cold Carbonaceous Starlight
    ];

    function createDiskParticles() {
      const count = Math.round(Math.min(650, Math.max(300, (W * H) / 2800)));
      particles = [];
      const minR = Math.max(45, star.r * 1.8);
      const maxR = Math.min(W * 0.46, 380);

      for (let i = 0; i < count; i++) {
        // Power-law radial distribution for protoplanetary disks (Sigma ~ r^-1)
        let u = Math.random();
        let r = minR + (maxR - minR) * Math.pow(u, 1.35);

        // Annular Gap: Clear density depletion around planet GJ 486b orbit
        const gapCenter = planet.a;
        const gapWidth = 26;
        if (Math.abs(r - gapCenter) < gapWidth && Math.random() > 0.12) {
          // Push particles outside the gap or into trojan/lagrange points
          r = r < gapCenter ? gapCenter - gapWidth - Math.random() * 8 : gapCenter + gapWidth + Math.random() * 8;
        }

        const theta = Math.random() * Math.PI * 2;
        const col = DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)];
        const zJitter = (Math.random() - 0.5) * 12 * (r / maxR); // flared disk thickness

        particles.push({
          r: r,
          theta: theta,
          z: zJitter,
          size: Math.random() < 0.85 ? 0.9 + Math.random() * 1.2 : 2.2 + Math.random() * 1.4,
          baseAlpha: 0.18 + Math.random() * 0.55,
          color: col,
          // Keplerian angular velocity: Omega proportional to r^-1.5
          omega: 75.0 / Math.pow(r, 1.5)
        });
      }
    }

    let lastWidth = 0;
    function resize(forceRebuild) {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Star location: framed on right side on desktop, center on mobile
      if (W > 960) {
        star.x = W * 0.64;
        star.y = H * 0.44;
        star.r = Math.min(32, Math.max(22, W * 0.024));
        planet.a = Math.min(185, Math.max(130, W * 0.135));
        companion.a = planet.a * 1.72;
      } else {
        star.x = W * 0.5;
        star.y = H * 0.38;
        star.r = Math.min(26, Math.max(18, W * 0.038));
        planet.a = Math.min(145, Math.max(105, W * 0.22));
        companion.a = planet.a * 1.68;
      }

      if (forceRebuild || Math.abs(W - lastWidth) > 20 || particles.length === 0) {
        lastWidth = W;
        createDiskParticles();
      }
    }

    // Pointer Parallax & Subtle Disk Interaction
    const heroSection = canvas.parentElement;
    if (heroSection) {
      heroSection.addEventListener('pointermove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.tx = (mouse.x - star.x) / (W * 0.5);
        mouse.ty = (mouse.y - star.y) / (H * 0.5);
      });
      heroSection.addEventListener('pointerleave', () => {
        mouse.x = mouse.y = -1e4;
        mouse.tx = mouse.ty = 0;
      });
    }

    // Mathematical coordinate transform: Inclined 3D Disk Projection
    function project3D(r, theta, z, tiltModX, tiltModY) {
      const inc = diskInclination + (tiltModY || 0);
      const pa = diskAngle + (tiltModX || 0);

      // Orbital plane coords
      const x0 = r * Math.cos(theta);
      const y0 = r * Math.sin(theta);
      const z0 = z || 0;

      // Rotate by inclination (x-axis)
      const x1 = x0;
      const y1 = y0 * Math.cos(inc) - z0 * Math.sin(inc);
      const z1 = y0 * Math.sin(inc) + z0 * Math.cos(inc);

      // Rotate by position angle (z-axis)
      const xProj = star.x + (x1 * Math.cos(pa) - y1 * Math.sin(pa));
      const yProj = star.y + (x1 * Math.sin(pa) + y1 * Math.cos(pa));

      return { x: xProj, y: yProj, z: z1 };
    }

    // Keplerian Orbit Solver for True Anomaly & Radius
    function getKeplerPosition(body, dt, tiltModX, tiltModY) {
      // Angular velocity varies with distance (vis-viva / conservation of angular momentum)
      const r_inst = (body.a * (1 - body.e * body.e)) / (1 + body.e * Math.cos(body.theta));
      const meanOmega = (Math.PI * 2) / body.period;
      const instantOmega = meanOmega * Math.pow(body.a / r_inst, 2) * Math.sqrt(1 - body.e * body.e);

      body.theta = (body.theta + instantOmega * dt) % (Math.PI * 2);
      const r = (body.a * (1 - body.e * body.e)) / (1 + body.e * Math.cos(body.theta));

      const proj = project3D(r, body.theta, 0, tiltModX, tiltModY);
      body.x = proj.x;
      body.y = proj.y;
      body.z = proj.z;
      body.r_inst = r;
      return body;
    }

    // Draw Central Host Star (M-Dwarf with Authentic Limb Darkening & Coronal Loops)
    function drawHostStar(time) {
      ctx.save();

      // Coronal magnetic field loops (Solar/Stellar Prominences)
      ctx.lineWidth = 1.0;
      for (let i = 0; i < 4; i++) {
        const loopAngle = (i * Math.PI) / 2 + Math.sin(time * 0.4 + i) * 0.2;
        const loopReach = star.r * (1.5 + 0.35 * Math.sin(time * 0.8 + i * 1.8));

        ctx.beginPath();
        const p1x = star.x + Math.cos(loopAngle - 0.3) * star.r;
        const p1y = star.y + Math.sin(loopAngle - 0.3) * star.r;
        const p2x = star.x + Math.cos(loopAngle + 0.3) * star.r;
        const p2y = star.y + Math.sin(loopAngle + 0.3) * star.r;
        const cpx = star.x + Math.cos(loopAngle) * loopReach;
        const cpy = star.y + Math.sin(loopAngle) * loopReach;

        ctx.moveTo(p1x, p1y);
        ctx.quadraticCurveTo(cpx, cpy, p2x, p2y);
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.18 + 0.12 * Math.sin(time + i)})`;
        ctx.stroke();
      }

      // Outer Corona Glow
      const coronaGrad = ctx.createRadialGradient(star.x, star.y, star.r * 0.4, star.x, star.y, star.r * 3.4);
      coronaGrad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
      coronaGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.16)');
      coronaGrad.addColorStop(0.75, 'rgba(217, 119, 6, 0.04)');
      coronaGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');

      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r * 3.4, 0, Math.PI * 2);
      ctx.fill();

      // Stellar Photosphere with Limb Darkening: I(mu) = 1 - u(1 - mu)
      const starGrad = ctx.createRadialGradient(
        star.x - star.r * 0.22,
        star.y - star.r * 0.22,
        star.r * 0.08,
        star.x,
        star.y,
        star.r
      );
      starGrad.addColorStop(0, '#fffbf0');                   // Bright Core
      starGrad.addColorStop(0.28, '#fed7aa');                // Deep Warm Transition
      starGrad.addColorStop(0.65, '#f59e0b');                // Solar Amber
      starGrad.addColorStop(0.92, '#b45309');                // Limb Darkening
      starGrad.addColorStop(1, 'rgba(120, 53, 15, 0.95)');   // Sharp Limb

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = starGrad;
      ctx.shadowColor = 'rgba(245, 158, 11, 0.85)';
      ctx.shadowBlur = 24;
      ctx.fill();

      ctx.restore();
    }

    // Draw Star-Planet Magnetic Interaction (Alfvén Wings / Magnetic Flux Tube)
    function drawStarPlanetInteraction(time) {
      if (!planet.x || !planet.y) return;

      ctx.save();

      // Vector from Star to Planet
      const dx = planet.x - star.x;
      const dy = planet.y - star.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Auroral footprint on host star at the base of the flux tube
      const footX = star.x + Math.cos(angle) * (star.r - 1);
      const footY = star.y + Math.sin(angle) * (star.r - 1);

      ctx.beginPath();
      ctx.arc(footX, footY, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = '#34d399';
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 10;
      ctx.fill();

      // Magnetic field lines bridging star and planet (Alfvén wings)
      // Because planet orbits, magnetic field lines twist backward relative to orbital motion
      const sweepAngle = angle - 0.28;
      const midDist = dist * 0.52;
      const ctrlX = star.x + Math.cos(sweepAngle) * midDist;
      const ctrlY = star.y + Math.sin(sweepAngle) * midDist;

      // 3 magnetic lines (flux bundle)
      const bundleOffsets = [-2.5, 0, 2.5];
      for (let j = 0; j < bundleOffsets.length; j++) {
        const off = bundleOffsets[j];
        ctx.beginPath();
        ctx.moveTo(footX, footY);
        ctx.quadraticCurveTo(ctrlX + off * 2, ctrlY + off * 2, planet.x, planet.y);
        ctx.strokeStyle = j === 1 ? 'rgba(52, 211, 153, 0.35)' : 'rgba(245, 158, 11, 0.22)';
        ctx.lineWidth = j === 1 ? 1.4 : 0.8;
        ctx.stroke();
      }

      // Stream plasma / Alfvén wave packets along the magnetic flux tube
      for (let p of fluxPackets) {
        p.s = (p.s + p.speed * 0.016) % 1;
        // Quadratic bezier interpolation: B(s) = (1-s)^2 P0 + 2(1-s)s P1 + s^2 P2
        const s = p.s;
        const px = (1 - s) * (1 - s) * footX + 2 * (1 - s) * s * (ctrlX + p.lane * 3) + s * s * planet.x;
        const py = (1 - s) * (1 - s) * footY + 2 * (1 - s) * s * (ctrlY + p.lane * 3) + s * s * planet.y;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52, 211, 153, ${p.alpha * Math.sin(s * Math.PI)})`;
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 6;
        ctx.fill();
      }

      ctx.restore();
    }

    // Draw Elliptical Orbit Paths (Hairline Scientific Traces)
    function drawOrbitPaths(tiltModX, tiltModY) {
      ctx.save();
      ctx.lineWidth = 1.0;
      ctx.setLineDash([3, 7]);

      // Planet GJ 486b Orbit Trace
      ctx.beginPath();
      const steps = 90;
      for (let i = 0; i <= steps; i++) {
        const th = (i / steps) * Math.PI * 2;
        const r = (planet.a * (1 - planet.e * planet.e)) / (1 + planet.e * Math.cos(th));
        const pt = project3D(r, th, 0, tiltModX, tiltModY);
        i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      ctx.stroke();

      // Outer companion orbit trace
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const th = (i / steps) * Math.PI * 2;
        const r = (companion.a * (1 - companion.e * companion.e)) / (1 + companion.e * Math.cos(th));
        const pt = project3D(r, th, 0, tiltModX, tiltModY);
        i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.stroke();

      ctx.restore();
    }

    // Draw Rocky Exoplanet (GJ 486b) and Companion
    function drawPlanets() {
      ctx.save();

      // Planet GJ 486b: Rocky Super-Earth with iron core & silicate mantle
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
      ctx.fillStyle = '#ededf0';
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 12;
      ctx.fill();

      // Planet night-side shadow (facing away from star)
      const sunAngle = Math.atan2(planet.y - star.y, planet.x - star.x);
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, planet.size, sunAngle - Math.PI / 2, sunAngle + Math.PI / 2);
      ctx.fillStyle = 'rgba(5, 5, 6, 0.75)';
      ctx.fill();

      // Outer Companion / Resonant planetesimal
      ctx.beginPath();
      ctx.arc(companion.x, companion.y, companion.size, 0, Math.PI * 2);
      ctx.fillStyle = '#94a3b8';
      ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
      ctx.shadowBlur = 8;
      ctx.fill();

      ctx.restore();
    }

    // Animation Loop with Precise Elapsed Timer
    const clockEl = document.getElementById('clock');
    let t0 = performance.now();
    let lastTime = t0;
    let isVisible = true;
    let animId = null;

    // Pause when scrolled past viewport to save CPU / battery
    if ('IntersectionObserver' in window) {
      const canvasObserver = new IntersectionObserver((entries) => {
        const visible = entries[0].isIntersecting;
        if (visible && !isVisible) {
          isVisible = true;
          lastTime = performance.now();
          if (!prefersReducedMotion && !animId) {
            animId = requestAnimationFrame(render);
          }
        } else if (!visible && isVisible) {
          isVisible = false;
          if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
          }
        }
      }, { threshold: 0.05 });
      canvasObserver.observe(canvas);
    }

    function render(now) {
      if (!isVisible) {
        animId = null;
        return;
      }

      const totalSeconds = (now - t0) / 1000;
      const dt = Math.min((now - lastTime) / 1000, 0.08);
      lastTime = now;

      // Update HUD Telemetry Clock: mm:ss.s
      if (clockEl) {
        const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toFixed(1).padStart(4, '0');
        clockEl.textContent = `${mins}:${secs}`;
      }

      // Smooth tilt easing from cursor
      mouse.tiltX += (mouse.tx * 0.08 - mouse.tiltX) * 0.05;
      mouse.tiltY += (mouse.ty * 0.08 - mouse.tiltY) * 0.05;

      ctx.clearRect(0, 0, W, H);

      // 1. Draw Orbit Wireframe Traces
      drawOrbitPaths(mouse.tiltX, mouse.tiltY);

      // 2. Advance Keplerian Positions for Planets
      getKeplerPosition(planet, dt, mouse.tiltX, mouse.tiltY);
      getKeplerPosition(companion, dt * 0.65, mouse.tiltX, mouse.tiltY);

      // 3. Draw Back-Half of Protoplanetary Disk Particles (behind star / z < 0)
      ctx.save();
      for (let p of particles) {
        p.theta = (p.theta + p.omega * dt) % (Math.PI * 2);
        const pt = project3D(p.r, p.theta, p.z, mouse.tiltX, mouse.tiltY);
        p.projX = pt.x;
        p.projY = pt.y;
        p.projZ = pt.z;

        if (pt.z < 0) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, p.size * 0.8, 0, Math.PI * 2);
          const depthAlpha = p.baseAlpha * 0.7;
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${depthAlpha})`;
          ctx.fill();
        }
      }
      ctx.restore();

      // 4. Draw Central Host Star & Coronal Loops
      drawHostStar(totalSeconds);

      // 5. Draw Star-Planet Magnetic Interaction (Alfvén Wings)
      drawStarPlanetInteraction(totalSeconds);

      // 6. Draw Planets
      drawPlanets();

      // 7. Draw Front-Half of Protoplanetary Disk Particles (in front of star / z >= 0)
      ctx.save();
      for (let p of particles) {
        if (p.projZ >= 0) {
          ctx.beginPath();
          ctx.arc(p.projX, p.projY, p.size, 0, Math.PI * 2);
          const depthAlpha = Math.min(1.0, p.baseAlpha * 1.15);
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${depthAlpha})`;
          ctx.fill();
        }
      }
      ctx.restore();

      if (!prefersReducedMotion && isVisible) {
        animId = requestAnimationFrame(render);
      } else {
        animId = null;
      }
    }

    resize(true);
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => resize(false), 140);
    });

    if (!prefersReducedMotion) {
      animId = requestAnimationFrame(render);
    } else {
      render(performance.now());
    }
  }

  /* ==========================================================================
     2. Fixed Navigation Bar Scroll State & Mobile Menu Toggle
     ========================================================================== */
  const nav = document.getElementById('nav');
  if (nav) {
    const handleScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');
  if (menuBtn && navLinks) {
    const menuIcon = menuBtn.querySelector('i');
    const closeMenu = () => {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      if (menuIcon) menuIcon.className = 'fas fa-bars';
    };

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (menuIcon) menuIcon.className = open ? 'fas fa-times' : 'fas fa-bars';
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('open') && nav && !nav.contains(e.target)) {
        closeMenu();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  /* ==========================================================================
     3. Scroll Reveal Engine (.rv -> .rv.in)
     ========================================================================== */
  const heroRevealEls = document.querySelectorAll('.hero .rv');
  heroRevealEls.forEach((el, index) => {
    setTimeout(() => el.classList.add('in'), 110 * index);
  });

  const scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          scrollObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('main .rv, .contact .rv').forEach((el) => {
    scrollObserver.observe(el);
  });

  /* ==========================================================================
     4. Interactive Sarcastic Status Cycler
        Clicking #statusPill cycles through authentic 5th-year student quotes
     ========================================================================== */
  const statusPill = document.getElementById('statusPill');
  const wittyQuotes = [
    'Final Year BS–MS · Asking whether a star\'s chemistry tells you what a planet is made of',
    'Currently writing MS thesis at NISER and waiting for thermodynamic models to converge',
    'Conducting fieldwork on rhythm in front of the mirror (safe from peer review)',
    'Power Forward on court, Taekwondo instructor in dojo, room chef at night',
    '2.5m telescope photometrist: 5% science, 95% praying it doesn\'t cloud over',
    'Fest tandoor chef: 400°C charcoal heat tolerance and real-time thermodynamics',
    'Geology major who got curious about what stars have to say about rocks'
  ];
  let quoteIndex = 0;

  if (statusPill) {
    const statusText = statusPill.querySelector('.status-text');
    const cycleStatus = () => {
      quoteIndex = (quoteIndex + 1) % wittyQuotes.length;
      statusPill.style.transform = 'scale(0.97)';
      setTimeout(() => {
        if (statusText) {
          statusText.textContent = wittyQuotes[quoteIndex];
        }
        statusPill.style.transform = '';
      }, 150);
    };

    statusPill.addEventListener('click', cycleStatus);
    statusPill.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cycleStatus();
      }
    });
  }

  /* ==========================================================================
     5. Photography Lightbox Modal (Observational Perspectives)
     ========================================================================== */
  const modal = document.getElementById('photo-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCap = document.getElementById('modal-cap');
  const modalClose = document.getElementById('modal-close');
  let lastActivePhotoItem = null;

  if (modal && modalImg && modalCap) {
    const openModalWithItem = (item) => {
      const img = item.querySelector('img');
      const cap = item.querySelector('.photo-item-cap span');
      if (img) {
        lastActivePhotoItem = item;
        modalImg.src = img.src;
        modalImg.alt = img.alt || 'Photograph by Asmit Gupta';
        modalCap.textContent = cap ? cap.textContent : img.alt;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (modalClose) modalClose.focus();
      }
    };

    document.querySelectorAll('.photo-item').forEach((item) => {
      item.addEventListener('click', () => openModalWithItem(item));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModalWithItem(item);
        }
      });
    });

    const closeModal = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastActivePhotoItem) {
        lastActivePhotoItem.focus();
      }
    };

    if (modalClose) modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }

  /* ==========================================================================
     6. Navigation Scroll Spy (Highlights Active Section)
     ========================================================================== */
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinkList = document.querySelectorAll('.nav-links a[href^="#"]');

  let spyRaf = null;
  const updateScrollSpy = () => {
    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach((section) => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinkList.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!spyRaf) {
        spyRaf = requestAnimationFrame(() => {
          updateScrollSpy();
          spyRaf = null;
        });
      }
    },
    { passive: true }
  );
  updateScrollSpy();

  /* ==========================================================================
     7. Dynamic Copyright Year
     ========================================================================== */
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

})();
