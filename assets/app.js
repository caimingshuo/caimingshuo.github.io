/* Theme switching for the homepage.
 *
 * index.html holds the theme catalog (window.HOMEPAGE_THEMES) and picks the
 * opening theme before the page paints. This script adds the switcher, loads
 * the other themes as they are needed and animates every change.
 */
(function () {
    'use strict';

    var root = document.documentElement;
    var THEMES = window.HOMEPAGE_THEMES || [];
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var LOAD_TIMEOUT = 2500; // ms to wait for a theme's files before switching anyway

    var switching = false;
    var particleRequest = null;
    var switcher = null;
    var toggle = null;
    var grid = null;
    var options = {};

    var PARTICLE_OPTIONS = {
        particles: {
            number: { value: 56, density: { enable: true, value_area: 900 } },
            color: { value: '#10b981' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: true },
            size: { value: 4, random: true },
            line_linked: { enable: true, distance: 150, color: '#10b981', opacity: 0.4, width: 1 },
            move: { enable: true, speed: 1.5, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
        },
        interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
            modes: { grab: { distance: 180, line_linked: { opacity: 0.6 } } }
        },
        retina_detect: false /* the network sits behind frosted glass: 1x is enough */
    };

    function theme(id) {
        for (var i = 0; i < THEMES.length; i++) {
            if (THEMES[i].id === id) return THEMES[i];
        }
        return null;
    }

    function current() {
        return root.getAttribute('data-theme');
    }

    function icon(name) {
        return '<svg class="icon" aria-hidden="true"><use href="#' + name + '"/></svg>';
    }

    function wait(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    function savingData() {
        return !!(navigator.connection && navigator.connection.saveData);
    }

    /* ---- Loading a theme's files ---------------------------------------- */

    // Resolves once every file the theme needs is in (or LOAD_TIMEOUT passed).
    function loadTheme(id) {
        var spec = theme(id);
        var files = [loadSheet(id), loadFonts(spec.fonts || [])];
        if (id === 'glass' && !reduceMotion.matches) files.push(loadParticles());
        return Promise.race([Promise.all(files), wait(LOAD_TIMEOUT)]);
    }

    function loadSheet(id) {
        return new Promise(function (resolve) {
            var link = document.querySelector('link[rel="stylesheet"][data-theme="' + id + '"]');
            if (link) {
                if (link.sheet) resolve();
                else { link.addEventListener('load', resolve); link.addEventListener('error', resolve); }
                return;
            }
            link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'assets/themes/' + id + '.css';
            link.setAttribute('data-theme', id);
            link.onload = resolve;
            link.onerror = resolve;
            document.head.appendChild(link);
        });
    }

    // A key names a font file: the family, the weight when the file only covers
    // that weight, and " i" for an italic file (see HOMEPAGE_FONT_FILES).
    function loadFonts(keys) {
        if (!document.fonts || !document.fonts.load) return Promise.resolve();
        return Promise.all(keys.map(function (key) {
            var parts = key.match(/^(.+?)(?:\s(\d{3}))?(\si)?$/);
            var spec = (parts[3] ? 'italic ' : '') + (parts[2] || '400') + ' 1em "' + parts[1] + '"';
            return document.fonts.load(spec).catch(function () {});
        }));
    }

    function loadParticles() {
        if (window.particlesJS) return Promise.resolve();
        if (!particleRequest) {
            particleRequest = new Promise(function (resolve) {
                var script = document.createElement('script');
                script.src = 'assets/vendor/particles.min.js';
                script.onload = function () { particleRequest = null; resolve(); };
                script.onerror = function () { particleRequest = null; resolve(); };
                document.head.appendChild(script);
            });
        }
        return particleRequest;
    }

    /* ---- Switching ------------------------------------------------------ */

    function applyTheme(id) {
        var spec = theme(id);
        if (!spec) return;
        root.setAttribute('data-theme', id);
        updateSwitcher(id);
        syncBackdrop(id);
        syncTilt();
    }

    function switchTheme(id, origin) {
        if (!theme(id) || id === current() || switching) return;
        switching = true;
        switcher.classList.add('is-switching');
        var run = function () {
            return loadTheme(id).then(function () {
                // While the rules change from one theme to the next, nothing may animate.
                root.classList.remove('theme-settled');
                applyTheme(id);
                syncUrl(id);
            });
        };
        var settle = function () {
            switching = false;
            switcher.classList.remove('is-switching');
            // Style the new theme once while transitions are still off, then let them run.
            void document.body.offsetWidth;
            root.classList.add('theme-settled');
        };

        if (!reduceMotion.matches && document.startViewTransition) {
            // The new theme sweeps in as a circle growing from the chosen swatch.
            revealFrom(origin);
            document.startViewTransition(run).finished.then(settle, settle);
        } else if (!reduceMotion.matches) {
            // No View Transitions here: fade out, swap, fade back in.
            root.classList.add('theme-fading');
            setTimeout(function () {
                run().then(settle, settle).then(function () { root.classList.remove('theme-fading'); });
            }, 170);
        } else {
            run().then(settle, settle);
        }
    }

    // The address bar only names a theme once the visitor picks one. A random
    // opening theme keeps the link clean, so it stays random when shared.
    function syncUrl(id) {
        if (!window.history || !history.replaceState) return;
        history.replaceState(null, '', location.pathname + location.search + '#theme=' + id);
    }

    // Centre and radius of the circle the next theme sweeps in from: where the
    // visitor clicked, or the switcher button itself.
    function revealFrom(origin) {
        var box = toggle.getBoundingClientRect();
        var x = origin ? origin.x : box.left + box.width / 2;
        var y = origin ? origin.y : box.top + box.height / 2;
        var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        root.style.setProperty('--vt-x', Math.round(x) + 'px');
        root.style.setProperty('--vt-y', Math.round(y) + 'px');
        root.style.setProperty('--vt-r', Math.ceil(radius) + 'px');
    }

    /* ---- Depth: elements that follow the pointer in 3D ------------------ */

    var tilted = [];
    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    // A theme opts in from its own stylesheet, e.g.
    //   [data-theme="night"] { --tilt: '.entry, .hero'; --tilt-strength: 5; }
    // While the pointer is over one of those elements the script turns it
    // towards the pointer and updates --px and --py (pointer position in
    // percent) for a glare or a spotlight. The script eases the angle itself
    // and writes the transform inline, so a theme's own transitions cannot
    // turn the smooth return into a jump.
    function syncTilt() {
        tilted.forEach(function (el) {
            rest(el);
            el.removeEventListener('pointerenter', tiltStart);
        });
        tilted = [];
        var spec = getComputedStyle(root).getPropertyValue('--tilt').trim();
        if (!spec || spec === 'none' || reduceMotion.matches || !finePointer.matches) return;
        spec.replace(/^['"]|['"]$/g, '').split(',').forEach(function (part) {
            try {
                Array.prototype.forEach.call(document.querySelectorAll(part.trim()), function (el) {
                    el.classList.add('tilt');
                    el.x = el.tx = el.y = el.ty = 0.5;
                    el.addEventListener('pointerenter', tiltStart);
                    tilted.push(el);
                });
            } catch (e) { /* not a selector this browser knows */ }
        });
    }

    function rest(el) {
        el.inside = false;
        el.loop = 0;
        el.x = el.tx = el.y = el.ty = 0.5;
        el.classList.remove('tilt', 'is-tilting');
        el.style.transform = '';
        ['--rx', '--ry', '--px', '--py'].forEach(function (name) { el.style.removeProperty(name); });
    }

    function tiltStart(event) {
        var el = this;
        if (el.inside) return;
        var css = getComputedStyle(el);
        el.inside = true;
        // Measured before the element starts turning: it is the box to judge
        // "still over it" by, not the tilted outline.
        el.box = el.getBoundingClientRect();
        el.reach = parseFloat(css.getPropertyValue('--tilt-strength')) || 6;
        el.perspective = parseFloat(css.getPropertyValue('--tilt-perspective')) || 1000;
        aim(el, event.clientX, event.clientY);
        el.classList.add('is-tilting');
        turn(el);
    }

    // One listener for every element: the pointer is followed on the document,
    // so it is still tracked after the tilted edge has slipped away from it.
    function tiltTrack(event) {
        tilted.forEach(function (el) {
            if (!el.inside) return;
            var box = el.box;
            var x = (event.clientX - box.left) / box.width;
            var y = (event.clientY - box.top) / box.height;
            if (x < -0.04 || x > 1.04 || y < -0.04 || y > 1.04) tiltStop.call(el);
            else aim(el, event.clientX, event.clientY);
        });
    }

    function within(low, high, value) { return Math.min(high, Math.max(low, value)); }

    function aim(el, clientX, clientY) {
        var box = el.box;
        el.tx = within(0, 1, (clientX - box.left) / box.width);
        el.ty = within(0, 1, (clientY - box.top) / box.height);
        turn(el);
    }

    function tiltStop() {
        var el = this;
        el.inside = false;
        el.tx = el.ty = 0.5;
        el.classList.remove('is-tilting');
        turn(el);
    }

    function tiltStopAll() { tilted.forEach(tiltStop); }

    // Eases the angle towards its target, quick while the pointer is over the
    // element and slower on the way back, and rests as soon as it arrives.
    function turn(el) {
        if (el.loop) return;
        el.loop = requestAnimationFrame(function step() {
            var dx = el.tx - el.x, dy = el.ty - el.y;
            if (Math.abs(dx) < 0.003 && Math.abs(dy) < 0.003) {
                el.x = el.tx;
                el.y = el.ty;
                el.loop = 0;
            } else {
                var ease = el.inside ? 0.26 : 0.12;
                el.x += dx * ease;
                el.y += dy * ease;
                el.loop = requestAnimationFrame(step);
            }
            var rx = (0.5 - el.y) * el.reach * 2;
            var ry = (el.x - 0.5) * el.reach * 2;
            el.style.setProperty('--px', (el.x * 100).toFixed(1) + '%');
            el.style.setProperty('--py', (el.y * 100).toFixed(1) + '%');
            el.style.setProperty('--rx', rx.toFixed(2) + 'deg');
            el.style.setProperty('--ry', ry.toFixed(2) + 'deg');
            el.style.transform = 'perspective(' + el.perspective + 'px) rotateX(' + rx.toFixed(3) + 'deg) rotateY(' + ry.toFixed(3) + 'deg)';
        });
    }

    /* ---- Particle network behind the Glass theme ------------------------ */

    function syncBackdrop(id) {
        if (id === 'glass' && !reduceMotion.matches) startParticles();
        else stopParticles();
    }

    function startParticles() {
        if (!window.particlesJS) {
            loadParticles().then(function () { if (current() === 'glass') startParticles(); });
            return;
        }
        if (window.pJSDom && window.pJSDom.length) return;
        window.particlesJS('particles-js', PARTICLE_OPTIONS);
    }

    function stopParticles() {
        if (window.pJSDom && window.pJSDom.length) {
            try { window.pJSDom[0].pJS.fn.vendors.destroypJS(); } catch (e) { /* already gone */ }
        }
        window.pJSDom = [];
        var host = document.getElementById('particles-js');
        if (host) host.textContent = '';
    }

    /* ---- Switcher ------------------------------------------------------- */

    function buildSwitcher() {
        switcher = document.createElement('div');
        switcher.className = 'theme-switcher';

        toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'theme-switcher-toggle';
        toggle.setAttribute('aria-haspopup', 'dialog');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'theme-switcher-panel');
        toggle.innerHTML = icon('i-palette') + '<span class="theme-switcher-current"></span>';
        toggle.addEventListener('click', function () { isOpen() ? close() : open(); });
        // Let the miniatures start loading as soon as the visitor reaches for the button.
        toggle.addEventListener('pointerenter', loadShots);
        toggle.addEventListener('focus', loadShots);

        var panel = document.createElement('div');
        panel.className = 'theme-switcher-panel';
        panel.id = 'theme-switcher-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'Theme');
        panel.innerHTML =
            '<div class="theme-switcher-head">' +
                '<p class="theme-switcher-title">Theme<small></small></p>' +
                '<button type="button" class="theme-switcher-shuffle">' + icon('i-shuffle') + '<span>Surprise me</span></button>' +
            '</div>' +
            '<div class="theme-switcher-grid" role="listbox" aria-label="Themes"></div>' +
            '<p class="theme-switcher-hint">A random theme opens every visit.</p>';
        panel.querySelector('.theme-switcher-title small').textContent = THEMES.length + ' styles';
        panel.querySelector('.theme-switcher-shuffle').addEventListener('click', shuffle);

        grid = panel.querySelector('.theme-switcher-grid');
        THEMES.forEach(function (item) {
            var option = document.createElement('button');
            option.type = 'button';
            option.className = 'theme-switcher-option';
            option.setAttribute('role', 'option');
            option.setAttribute('aria-selected', 'false');
            option.dataset.themeId = item.id;
            option.title = item.name + ' — ' + item.note;
            option.innerHTML =
                '<span class="theme-switcher-swatch" aria-hidden="true"><i class="sw-line-1"></i><i class="sw-line-2"></i>' +
                    '<i class="sw-card-1"></i><i class="sw-card-2"></i>' +
                    '<img class="theme-switcher-shot" alt="" width="256" height="192" decoding="async"></span>' +
                '<span class="theme-switcher-name"></span>' +
                '<span class="theme-switcher-check" aria-hidden="true">' + icon('i-check') + '</span>';
            option.querySelector('.theme-switcher-name').textContent = item.name;
            option.addEventListener('click', function (event) {
                // Sweep in from the point that was clicked (keyboard: the option's centre).
                var box = option.getBoundingClientRect();
                var origin = event.clientX || event.clientY ? { x: event.clientX, y: event.clientY }
                    : { x: box.left + box.width / 2, y: box.top + box.height / 2 };
                close();
                switchTheme(item.id, origin);
            });
            // Fetch a theme's files as soon as the visitor points at it.
            var peek = function () { loadSheet(item.id); loadFonts(item.fonts || []); };
            option.addEventListener('pointerenter', peek);
            option.addEventListener('focus', peek);
            grid.appendChild(option);
            options[item.id] = option;
            shots[item.id] = option.querySelector('.theme-switcher-shot');
        });

        document.addEventListener('pointerdown', function (event) {
            if (isOpen() && !switcher.contains(event.target)) close();
        });
        switcher.addEventListener('keydown', onKeydown);
        reduceMotion.addEventListener('change', function () { syncBackdrop(current()); syncTilt(); });
        finePointer.addEventListener('change', syncTilt);

        switcher.appendChild(toggle);
        switcher.appendChild(panel);
        document.body.appendChild(switcher);
    }

    /* ---- Miniatures ------------------------------------------------------ */

    // Every tile of the switcher shows a small picture of its theme, a capture
    // of the top of the page made by tools/thumbs.py. They are asked for when
    // the visitor reaches for the button or opens the panel, and only as the
    // tiles scroll into view; until a picture arrives the CSS sketch stands in.
    var shots = {};

    function loadShots() {
        if (savingData()) return;
        THEMES.forEach(function (item) {
            var img = shots[item.id];
            if (!img || img.getAttribute('src')) return;
            img.addEventListener('load', function () { img.classList.add('is-ready'); });
            img.addEventListener('error', function () { img.remove(); });
            img.loading = 'lazy';
            img.src = 'images/themes/' + item.id + '.webp';
        });
    }

    function isOpen() {
        return switcher.classList.contains('is-open');
    }

    function open() {
        switcher.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        prefetchSheets();
        paintSwatches();
        loadShots();
        var selected = options[current()];
        if (selected) selected.focus();
    }

    function close() {
        switcher.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
    }

    function shuffle() {
        var others = THEMES.filter(function (item) { return item.id !== current(); });
        close();
        toggle.focus();
        switchTheme(others[Math.floor(Math.random() * others.length)].id);
    }

    function onKeydown(event) {
        if (event.key === 'Escape') {
            if (isOpen()) { close(); toggle.focus(); }
            return;
        }
        // Arrow keys walk the grid of themes; Tab works as usual.
        var steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns(), ArrowDown: columns() };
        if (!(event.key in steps) && event.key !== 'Home' && event.key !== 'End') return;

        var items = THEMES.map(function (item) { return options[item.id]; });
        var index = items.indexOf(document.activeElement);
        if (index === -1) index = Math.max(0, items.indexOf(options[current()]));
        if (event.key === 'Home') index = 0;
        else if (event.key === 'End') index = items.length - 1;
        else index += steps[event.key];
        items[Math.max(0, Math.min(items.length - 1, index))].focus();
        event.preventDefault();
    }

    function columns() {
        return getComputedStyle(grid).gridTemplateColumns.split(' ').length || 1;
    }

    function updateSwitcher(id) {
        var spec = theme(id);
        var label = switcher.querySelector('.theme-switcher-current');
        label.textContent = spec.name;
        toggle.setAttribute('aria-label', 'Theme: ' + spec.name + '. Change theme.');
        Object.keys(options).forEach(function (key) {
            options[key].setAttribute('aria-selected', String(key === id));
        });
    }

    // Colours every swatch from its theme's own tokens, as soon as that theme's
    // stylesheet is around; the others keep the neutral placeholder.
    function paintSwatches() {
        var probe = document.createElement('span');
        probe.hidden = true;
        document.body.appendChild(probe);
        THEMES.forEach(function (item) {
            var link = document.querySelector('link[rel="stylesheet"][data-theme="' + item.id + '"]');
            if (!link || !link.sheet) return;
            probe.setAttribute('data-theme', item.id);
            var style = getComputedStyle(probe);
            ['bg', 'fg', 'accent', 'accent-2', 'surface', 'border'].forEach(function (token) {
                var value = style.getPropertyValue('--' + token).trim();
                if (value) options[item.id].style.setProperty('--sw-' + token, value);
            });
        });
        probe.remove();
    }

    /* ---- Fetching the rest in the background ----------------------------- */

    // Once the page is up, quietly fetch the other stylesheets so that switching
    // is instant. Every theme has its own fonts, so those are only fetched when
    // the visitor points at a theme or picks it.
    function prefetchSheets() {
        if (savingData()) return;
        THEMES.forEach(function (item) {
            if (item.id !== current()) loadSheet(item.id).then(paintSwatches);
        });
    }

    function afterLoad() {
        // The opening theme's stylesheet can arrive after the theme was applied
        // (a slow network outruns the script): with every sheet surely in now,
        // set up the 3D tilt of the theme on show once more.
        syncTilt();
        var idle = window.requestIdleCallback || function (task) { setTimeout(task, 600); };
        idle(prefetchSheets, { timeout: 3000 });
        setTimeout(paintSwatches, 1500);
    }

    /* ---- Content that keeps itself current ------------------------------ */

    // The time of day as a quoted text, for a theme that shows a clock (the tray
    // of Retro OS). CSS alone cannot tell the time.
    function updateClock() {
        var now = new Date(), hour = now.getHours();
        root.style.setProperty('--os-clock', '"' + ((hour + 11) % 12 + 1) + ':' + ('0' + now.getMinutes()).slice(-2) + ' ' + (hour < 12 ? 'AM' : 'PM') + '"');
    }

    function ordinal(number) {
        var suffix = ['th', 'st', 'nd', 'rd'];
        var tail = number % 100;
        return number + (suffix[(tail - 20) % 10] || suffix[tail] || suffix[0]);
    }

    function updateDates() {
        var now = new Date();
        Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
            el.textContent = String(now.getFullYear());
        });
        // The year of study follows the enrolment date, so it never goes stale.
        Array.prototype.forEach.call(document.querySelectorAll('.study-year[data-since]'), function (el) {
            var since = el.getAttribute('data-since').split('-');
            var months = (now.getFullYear() - Number(since[0])) * 12 + now.getMonth() - (Number(since[1]) - 1);
            var year = Math.floor(months / 12) + 1;
            el.textContent = months < 0 || year > 6 ? '' : ordinal(year) + '-year';
        });
    }

    /* ---- Start ---------------------------------------------------------- */

    function init() {
        if (!THEMES.length) return;
        buildSwitcher();
        applyTheme(current());
        updateDates();
        updateClock();
        setInterval(updateClock, 15000);
        window.addEventListener('hashchange', function () {
            var asked = (location.hash.match(/(?:^#|&)theme=([a-z0-9-]+)/) || [])[1];
            if (asked) switchTheme(asked);
        });
        if (document.readyState === 'complete') afterLoad();
        else window.addEventListener('load', afterLoad);
        document.addEventListener('pointermove', tiltTrack);
        document.documentElement.addEventListener('pointerleave', tiltStopAll);
        window.addEventListener('scroll', tiltStopAll, { passive: true });
        window.addEventListener('blur', tiltStopAll);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
