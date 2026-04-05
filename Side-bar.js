 /* ══════════════════════════════════════════════
       SIDEBAR — single source of truth: body.sidebar-hidden
    ══════════════════════════════════════════════ */
    const toggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('backdrop');

    // Returns true if the screen is 768px wide or less (mobile)
    function isMobile() {
      return window.innerWidth <= 768;
    }

    // Returns true if the sidebar is currently hidden
    function isHidden() {
      return document.body.classList.contains('sidebar-hidden');
    }

    // Opens the sidebar — removes the hidden class and shows the backdrop on mobile
    function showSidebar() {
      document.body.classList.remove('sidebar-hidden');
      sidebar.classList.remove('hidden');
      toggle.textContent = '✕ close';
      if (isMobile()) {
        // Show the dark overlay behind the sidebar on mobile
        backdrop.style.display = 'block';
        // requestAnimationFrame ensures the display:block is painted first
        // before we add the 'visible' class that triggers the CSS fade-in transition
        requestAnimationFrame(() => backdrop.classList.add('visible'));
      }
    }

    // Closes the sidebar — adds the hidden class and hides the backdrop
    function hideSidebar() {
      document.body.classList.add('sidebar-hidden');
      sidebar.classList.add('hidden');
      toggle.textContent = '☰ menu';
      backdrop.classList.remove('visible');
      // We wait 250ms before display:none because the CSS fade-out transition
      // takes 250ms — if we set display:none immediately the transition is skipped
      setTimeout(() => { backdrop.style.display = 'none'; }, 250);
    }

    // Clicking the backdrop (dark overlay) closes the sidebar
    backdrop.addEventListener('click', hideSidebar);

    // The hamburger button toggles the sidebar open or closed
    toggle.addEventListener('click', () => {
      isHidden() ? showSidebar() : hideSidebar();
    });

    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        if (isMobile()) {
          // STEP 1 — cancel the browser's default anchor jump
          // Without this, the browser would instantly jump to #ch1 at t=0ms
          // while the sidebar is still open and covering the screen
          // which means it reads the WRONG content position (sidebar open layout)
          e.preventDefault();

          // Save the href (#ch1, #ch2, etc.) before we do anything else
          const href = link.getAttribute('href');

          // STEP 2 — start closing the sidebar
          // The CSS transition takes 250ms to slide the sidebar off screen
          // The layout is still changing at this point — not settled yet
          hideSidebar();

          // STEP 3 — wait for the sidebar to fully close before scrolling
          // 280ms = 250ms (sidebar transition) + 30ms (small safety buffer)
          // After 280ms the sidebar is gone, the layout is fully settled,
          // and the content is now at its CORRECT final position
          setTimeout(() => {
            const target = document.querySelector(href);
            if (target) {
              // STEP 4 — NOW we scroll
              // scrollIntoView reads the position at this exact moment (t=280ms)
              // so it sees the correct layout with the sidebar closed
              // and lands exactly in the right place
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }, 280);
        }
        // On desktop we do nothing — the browser's default anchor jump works fine
        // because the sidebar sits BESIDE the content (not on top of it)
        // so the layout does not change vertically when the sidebar opens or closes
      });
    });

    // On mobile the sidebar starts closed (it would cover the whole screen)
    // On desktop the sidebar starts open (it sits beside the content)
    if (isMobile()) {
      hideSidebar();
    } else {
      showSidebar();
    }

    /* ══════════════════════════════════════════════
       SIDEBAR TABS
    ══════════════════════════════════════════════ */
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active from all buttons and panels first
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        // Then activate only the clicked button and its matching panel
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      });
    });

    /* ══════════════════════════════════════════════
       THEME TOGGLE
    ══════════════════════════════════════════════ */
    const themeBtn = document.getElementById('theme-toggle');
    const root = document.documentElement;

    // On page load, restore the theme the user chose last time
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      root.classList.add('light');
      themeBtn.textContent = '◑ dark';
    }

    themeBtn.addEventListener('click', () => {
      // Toggle the 'light' class on <html> — all CSS variables update automatically
      const isLight = root.classList.toggle('light');
      themeBtn.textContent = isLight ? '◑ dark' : '◑ parchment';
      // Save the choice in localStorage so it persists across page reloads
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });

    /* ══════════════════════════════════════════════
       ACTIVE NAV LINK ON SCROLL
    ══════════════════════════════════════════════ */
    const sections = document.querySelectorAll('section.book-section[id]');
    const navLinks = document.querySelectorAll('#sidebar nav a');

    function getActiveSection() {
      const viewportHeight = window.innerHeight;

      // Define a detection zone between 15% and 50% of the viewport height
      // A section is "active" when it enters this zone
      // Using percentages instead of fixed pixels makes it work on any screen size
      const zoneTop = viewportHeight * 0.15;
      const zoneBottom = viewportHeight * 0.50;

      let best = null;
      let bestTop = Infinity;

      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        // Check if the section overlaps with our detection zone
        if (rect.bottom > zoneTop && rect.top < zoneBottom) {
          // If multiple sections are in the zone, pick the topmost one
          if (rect.top < bestTop) {
            bestTop = rect.top;
            best = section;
          }
        }
      });

      // Fallback — if no section is in the zone (e.g. between two sections)
      // pick the last section that has scrolled past the top of the zone
      if (!best) {
        sections.forEach(section => {
          const rect = section.getBoundingClientRect();
          if (rect.top <= zoneTop) best = section;
        });
      }

      return best;
    }

    function updateNav() {
      const active = getActiveSection();
      if (!active) return;
      const id = active.getAttribute('id');
      // Remove active class from all links first
      navLinks.forEach(l => l.classList.remove('active'));
      // Then highlight only the link matching the current section
      const activeLink = document.querySelector(`#sidebar nav a[href="#${id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }

    // Re-run on every scroll and resize event
    // passive:true tells the browser we won't call preventDefault()
    // which allows it to optimise scrolling performance
    window.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', updateNav, { passive: true });

    // Run once immediately so the correct link is highlighted on page load
    updateNav();