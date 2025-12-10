const text = ["Graphic Design", "Web Developer", "UI/UX Designer"];
let index = 0;
let charIndex = 0;

function typeEffect() {
    const typingElement = document.getElementById("typingText");

    if (charIndex < text[index].length) {
        typingElement.innerHTML = text[index].substring(0, charIndex + 1);
        charIndex++;
        setTimeout(typeEffect, 120);
    } else {
        setTimeout(() => eraseEffect(), 1500);
    }
}



function eraseEffect() {
    const typingElement = document.getElementById("typingText");

    if (charIndex > 0) {
        typingElement.innerHTML = text[index].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(eraseEffect, 80);
    } else {
        index = (index + 1) % text.length;
        setTimeout(typeEffect, 300);
    }
}

typeEffect();

// Logo click/keyboard handler: toggle green and scroll to top
(function () {
    const logo = document.getElementById('logo');
    if (!logo) return;

    let lastTouch = 0;

    function activateLogo(toggle = true) {
        // toggle persistent active class (green) and scroll to top
        if (toggle) {
            if (logo.classList.contains('active')) {
                logo.classList.remove('active');
            } else {
                logo.classList.add('active');
            }
        } else {
            logo.classList.add('active');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Handle touch first (mobile). Use touchend and toggle persistent active state.
    logo.addEventListener('touchend', (e) => {
        // prevent the synthetic click that often follows touch
        e.preventDefault();
        lastTouch = Date.now();
        activateLogo(true);
    }, { passive: false });

    // Click handler ignores synthetic clicks shortly after a touch event
    logo.addEventListener('click', (e) => {
        if (Date.now() - lastTouch < 700) return;
        activateLogo(true);
    });

    // Keyboard accessibility
    logo.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            activateLogo();
        }
    });
})();

// Compute nav height and set CSS variable so anchor targets appear below fixed nav
(function () {
    function updateNavOffset() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        // add a small buffer so headings are comfortably below the nav
        const buffer = 16;
        const navHeight = nav.offsetHeight || 0;
        document.documentElement.style.setProperty('--nav-offset', (navHeight + buffer) + 'px');
    }

    // Run on load and resize
    window.addEventListener('load', updateNavOffset);
    window.addEventListener('resize', updateNavOffset);
    // Also run once now in case script loads after DOM is ready
    updateNavOffset();
})();

// NAV: set active nav link on click and while scrolling
(function () {
    const navLinks = document.querySelectorAll('nav ul li a');
    if (!navLinks || navLinks.length === 0) return;

    // Click behavior: mark clicked link active
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Build list of section elements that correspond to nav hrefs
    const sectionIds = Array.from(navLinks).map(a => a.getAttribute('href')).filter(Boolean).map(h => h.replace('#', ''));
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
    if (sections.length === 0) return;

    // IntersectionObserver to update active link while scrolling (50% visibility threshold)
    const ioOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.target.id) return;
            const id = entry.target.id;
            const link = document.querySelector(`nav ul li a[href="#${id}"]`);
            if (entry.isIntersecting) {
                navLinks.forEach(l => l.classList.remove('active'));
                if (link) link.classList.add('active');
            }
        });
    }, ioOptions);

    sections.forEach(s => observer.observe(s));
})();

// Hero image modal / touch / keyboard handler
(function () {
    const heroPic = document.getElementById('heroPic');
    const imageModal = document.getElementById('imageModal');
    if (!heroPic || !imageModal) return;

    const modalClose = imageModal.querySelector('.modal-close');
    let lastTouch = 0;

    function openModal() {
        imageModal.classList.add('open');
        imageModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        imageModal.classList.remove('open');
        imageModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // Touch handler
    heroPic.addEventListener('touchend', (e) => {
        e.preventDefault();
        lastTouch = Date.now();
        openModal();
    }, { passive: false });

    // Click handler (ignore synthetic clicks after touch)
    heroPic.addEventListener('click', (e) => {
        if (Date.now() - lastTouch < 700) return;
        openModal();
    });

    // Keyboard accessibility
    heroPic.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
        }
    });

    // Close controls
    modalClose.addEventListener('click', closeModal);
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && imageModal.classList.contains('open')) closeModal();
    });
})();


// Scroll / reveal animations: use IntersectionObserver for reliable enter/exit
(() => {
    const revealSelector = '.reveal, .reveal-img, .eduFade';
    const items = Array.from(document.querySelectorAll(revealSelector));
    if (items.length === 0) return;

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const el = entry.target;
            if (entry.isIntersecting) {
                el.classList.add('active');
                // If element is an eduFade item, ensure inline styles show it
                if (el.classList.contains('eduFade')) {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }
            } else {
                // Remove active when leaving viewport so scrolling back up re-triggers
                el.classList.remove('active');
                if (el.classList.contains('eduFade')) {
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(40px)';
                }
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.12 });

    items.forEach(it => revealObserver.observe(it));
})();

// Simple animation when images appear (enter/exit handling)
const images = document.querySelectorAll('.gallery img, .project-preview img, .project-image img, .additional-image');
(() => {
    if (!images || images.length === 0) return;

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const el = entry.target;
            if (entry.isIntersecting) {
                el.classList.add('in-view');
                if (!el.classList.contains('floating-img')) el.classList.add('floating-img');
                if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
                    el.classList.add('animate-bob');
                }
                // animate into view
                el.style.opacity = 1;
                el.style.transform = 'translateY(0)';
            } else {
                // remove classes when scrolled out so re-entering retriggers animation
                el.classList.remove('in-view');
                if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
                    el.classList.remove('animate-bob');
                }
                // reset transform/opacity for smooth re-entry
                el.style.opacity = 0;
                el.style.transform = 'translateY(20px)';
            }
        });
    }, { threshold: 0.25 });

    images.forEach(img => {
        img.classList.add('parallax-layer');
        img.style.opacity = 0;
        img.style.transform = 'translateY(20px)';
        img.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
        imageObserver.observe(img);
    });
})();

// Add a lightweight mousemove parallax for images within their container
function attachParallax(containerSelector) {
    const containers = document.querySelectorAll(containerSelector);
    containers.forEach(container => {
        const img = container.querySelector('img.parallax-layer');
        if (!img) return;
        function onMove(e) {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            const tx = x * 12; // tweak intensity
            const ty = y * 8;
            img.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        }
        function onLeave() { img.style.transform = ''; }
        container.addEventListener('mousemove', onMove);
        container.addEventListener('mouseleave', onLeave);
    });
}

// Attach parallax to gallery item containers
attachParallax('.gallery');
attachParallax('.project-card');
attachParallax('.project-preview');













// (Old scroll-based reveal removed — using IntersectionObserver earlier)




// Initialize marquee content once (clone for seamless loop)
document.addEventListener('DOMContentLoaded', function () {
    const marqueeContent = document.querySelector('.marquee-content');
    if (marqueeContent) {
        marqueeContent.innerHTML += marqueeContent.innerHTML;
    }
});

document.getElementById("userForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let name = document.getElementById("userName").value.trim();
    let email = document.getElementById("userEmail").value.trim();
    let msg = document.getElementById("userMessage").value.trim();

    if (!name || !email || !msg) {
        alert("Please fill out all the fields.");
        return;
    }

    alert("Your message has been sent!");
    this.reset();
});


// Robot and Developer interactive actions
(function () {
    const robot = document.getElementById('robotImg');
    const dev = document.getElementById('devImg');

    // Robot: simple wave animation triggered on hover, focus, click or keyboard
    if (robot) {
        let waving = false;
        function startWave() {
            if (waving) return;
            waving = true;
            robot.classList.add('robot-wave');
            // remove class after animation completes
            setTimeout(() => {
                robot.classList.remove('robot-wave');
                waving = false;
            }, 1200);
        }

        robot.addEventListener('mouseenter', startWave);
        robot.addEventListener('focus', startWave);
        robot.addEventListener('click', startWave);
        robot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                startWave();
            }
        });
    }

    // Developer: show a typing indicator (three dots) on hover/focus, toggle on click
    if (dev) {
        function showTyping() {
            if (document.getElementById('typingIndicator')) return;
            const wrapper = dev.parentElement || document.body;
            const el = document.createElement('div');
            el.id = 'typingIndicator';
            el.className = 'typing-indicator';
            el.innerHTML = '<span></span><span></span><span></span>';
            wrapper.appendChild(el);
        }

        function hideTyping() {
            const el = document.getElementById('typingIndicator');
            if (el) el.remove();
        }

        dev.addEventListener('mouseenter', showTyping);
        dev.addEventListener('focus', showTyping);
        dev.addEventListener('mouseleave', hideTyping);
        dev.addEventListener('blur', hideTyping);

        // Click toggles the typing indicator (useful for touch)
        dev.addEventListener('click', () => {
            if (!document.getElementById('typingIndicator')) showTyping();
            else hideTyping();
        });

        dev.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!document.getElementById('typingIndicator')) showTyping();
                else hideTyping();
            }
        });
    }
})();





const fadeItems = document.querySelectorAll(".eduFade");

function revealBoxes() {
    fadeItems.forEach(card => {
        const boxPos = card.getBoundingClientRect().top;
        if (boxPos < window.innerHeight - 100) {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }
    });
}

window.addEventListener("scroll", revealBoxes);

fadeItems.forEach(card => {
    card.style.opacity = "0";
    card.style.transform = "translateY(40px)";
    card.style.transition = "0.6s ease";
});


// Make all eduBox cards interactive: keyboard + mouse + ARIA
(function () {
    const cards = document.querySelectorAll('.eduBox');
    if (!cards || cards.length === 0) return;

    cards.forEach(card => {
        // Provide keyboard focus and ARIA role to each card
        if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
        if (!card.hasAttribute('role')) card.setAttribute('role', 'button');
        card.setAttribute('aria-pressed', 'false');

        // Add a small hint (optional) if missing
        if (!card.querySelector('.action-hint')) {
            const hint = document.createElement('span');
            hint.className = 'action-hint';
            hint.textContent = 'Click or press Enter';
            card.querySelector('h3')?.appendChild(hint);
        }

        // Toggle selected state (visual highlight)
        function toggleSelected() {
            const isSelected = card.classList.toggle('selected');
            card.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        }

        card.addEventListener('click', (e) => {
            // If user clicks form elements inside card, ignore; otherwise toggle
            toggleSelected();
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSelected();
            }
        });
    });
})();

const technologies = [
    { name: "GitHub", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
    { name: "Jira", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jira/jira-original.svg" },
    { name: "Figma", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
    { name: "HTML5", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
    { name: "Sass", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg" },
    { name: "Bootstrap", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
    { name: "JavaScript", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
    { name: "Node.js", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
    { name: "Express", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
    { name: "Vue.js", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" },
    { name: "TypeScript", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
    { name: "PHP", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" },

    { name: "MySQL", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { name: "AWS", img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },

];

document.addEventListener('DOMContentLoaded', () => {
    const orbit = document.getElementById('skillsOrbit') || document.getElementById('rotatingSkills') || document.querySelector('.skills-ring');
    if (!orbit) return;

    const wrapper = orbit.closest('.orbit-wrapper') || orbit.parentElement;
    const centerEl = (wrapper && (wrapper.querySelector('.center-photo') || document.getElementById('myPhoto'))) || null;

    const iconSize = 84; // match CSS
    const gap = 8;
    const total = technologies.length;

    function compute() {
        const rect = orbit.getBoundingClientRect();
        const w = rect.width || 420;
        const h = rect.height || 420;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const centerSize = centerEl ? Math.max(centerEl.clientWidth, centerEl.clientHeight) : 260;
        // conservative radius based on wrapper and center photo
        const baseR = Math.floor(Math.min(w, h) / 2 - centerSize / 2 - iconSize / 2 - gap);
        // ensure badges don't overlap each other: compute packing radius
        const packingR = Math.ceil((total * (iconSize + gap)) / (2 * Math.PI));
        // clamp maximum so badges stay inside wrapper
        const maxR = Math.floor(Math.min(w, h) / 2 - iconSize / 2 - gap);
        const r = Math.max(baseR, packingR, 60);
        return { r: Math.min(r, Math.max(60, maxR)), cx, cy };
    }

    // allow pinning specific badges to fixed angles (degrees clockwise from top)
    const pinnedDegrees = {
        'Laravel': 40, // top-right-ish
        'OOP': 130     // bottom-right-ish
    };

    // build badges
    orbit.innerHTML = '';
    const badges = technologies.map((tech, idx) => {
        const badge = document.createElement('div');
        badge.className = 'tech-badge';
        badge.setAttribute('data-tech', tech.name);
        badge.setAttribute('role', 'button');
        badge.setAttribute('tabindex', '0');
        badge.setAttribute('aria-label', tech.name);
        badge.title = tech.name;

        const img = document.createElement('img');
        img.src = tech.img;
        img.alt = tech.name;
        img.style.pointerEvents = 'none';
        badge.appendChild(img);

        // starting angle (start at top). If pinned, use pinned degree.
        let angle;
        if (pinnedDegrees.hasOwnProperty(tech.name)) {
            const degFromTop = pinnedDegrees[tech.name];
            angle = -Math.PI / 2 + degFromTop * Math.PI / 180;
        } else {
            angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
        }

        badge.style.position = 'absolute';
        badge.style.left = '50%';
        badge.style.top = '50%';
        badge.style.transform = 'translate(-50%,-50%)';

        orbit.appendChild(badge);
        return { badge, angle };
    });

    let { r } = compute();

    function updatePositions() {
        badges.forEach(b => {
            const deg = b.angle * 180 / Math.PI;
            b.badge.style.transform = `translate(-50%,-50%) rotate(${deg}deg) translate(${r}px) rotate(${-deg}deg)`;
        });
    }

    updatePositions();

    // animation loop
    let last = performance.now();
    const speedRadPerSec = 0.55; // radians per second — tweak to taste
    let rafId = null;

    function animate(now) {
        const dt = (now - last) / 1000;
        last = now;
        badges.forEach(b => b.angle += speedRadPerSec * dt);
        updatePositions();
        rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);

    // interactions
    badges.forEach(({ badge }) => {
        badge.addEventListener('click', () => badge.classList.toggle('selected'));
        badge.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                badge.click();
            }
        });
    });

    // recompute radius on resize
    let rt;
    window.addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(() => {
            r = compute().r;
            updatePositions();
        }, 100);
    });

    // safe photo check (do not forcibly overwrite)
    const myPhotoEl = document.getElementById('myPhoto') || document.querySelector('.center-photo');
    if (myPhotoEl && myPhotoEl.src && myPhotoEl.src.includes('YOUR_PHOTO_URL_HERE')) {
        // user still has placeholder; leave as-is or update from HTML
    }
});




