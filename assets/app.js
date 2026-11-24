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
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#10b981' },
            shape: { type: 'circle' },
            opacity: { value: 0.5, random: false },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: '#10b981', opacity: 0.4, width: 1 },
            move: { enable: true, speed: 2, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
        },
        interactivity: {
            detect_on: 'canvas',
            events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
            modes: { grab: { distance: 180, line_linked: { opacity: 0.6 } } }
        },
        retina_detect: true
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
        var files = [loadSheet(id), loadFonts(spec.fonts || []), loadAvatar(spec.avatar)];
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

    function loadAvatar(file) {
        if (!file || file === 'none') return Promise.resolve();
        return new Promise(function (resolve) {
            var shown = document.querySelector('.avatar');
            if (!shown || shown.getAttribute('src') === file) return resolve();
            var probe = new Image();
            probe.onload = function () { shown.src = file; resolve(); };
            probe.onerror = resolve;
            probe.src = file;
        });
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
        root.classList.toggle('vt-blocks', spec.morph !== false);
        updateSwitcher(id);
        syncBackdrop(id);
    }

    function switchTheme(id) {
        if (!theme(id) || id === current() || switching) return;
        switching = true;
        switcher.classList.add('is-switching');
        var settle = function () {
            switching = false;
            switcher.classList.remove('is-switching');
        };
        var run = function () {
            return loadTheme(id).then(function () {
                applyTheme(id);
                syncUrl(id);
            });
        };

        if (!reduceMotion.matches && document.startViewTransition) {
            // Old and new layout cross-fade while every block glides into place.
            document.startViewTransition(run).finished.then(settle, settle);
        } else if (!reduceMotion.matches) {
            root.classList.add('theme-fading');
            setTimeout(function () {
                run().then(function () {
                    void document.body.offsetWidth; // flush, so the fade-in starts from transparent
                    root.classList.remove('theme-fading');
                    settle();
                });
            }, 170);
        } else {
            run().then(settle);
        }
    }

    // The address bar only names a theme once the visitor picks one. A random
    // opening theme keeps the link clean, so it stays random when shared.
    function syncUrl(id) {
        if (!window.history || !history.replaceState) return;
        history.replaceState(null, '', location.pathname + location.search + '#theme=' + id);
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
            option.title = item.name + ' — ' + item.note;
            option.innerHTML =
                '<span class="theme-switcher-swatch" aria-hidden="true"><i class="sw-avatar"></i><i class="sw-line-1"></i>' +
                    '<i class="sw-line-2"></i><i class="sw-card-1"></i><i class="sw-card-2"></i></span>' +
                '<span class="theme-switcher-name"></span>' +
                '<span class="theme-switcher-check" aria-hidden="true">' + icon('i-check') + '</span>';
            option.querySelector('.theme-switcher-name').textContent = item.name;
            option.addEventListener('click', function () { close(); switchTheme(item.id); });
            // Fetch a theme's files as soon as the visitor points at it.
            var peek = function () { loadSheet(item.id); loadFonts(item.fonts || []); };
            option.addEventListener('pointerenter', peek);
            option.addEventListener('focus', peek);
            grid.appendChild(option);
            options[item.id] = option;
        });

        document.addEventListener('pointerdown', function (event) {
            if (isOpen() && !switcher.contains(event.target)) close();
        });
        switcher.addEventListener('keydown', onKeydown);
        reduceMotion.addEventListener('change', function () { syncBackdrop(current()); });

        switcher.appendChild(toggle);
        switcher.appendChild(panel);
        document.body.appendChild(switcher);
    }

    function isOpen() {
        return switcher.classList.contains('is-open');
    }

    function open() {
        switcher.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        prefetchSheets();
        paintSwatches();
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
        var idle = window.requestIdleCallback || function (task) { setTimeout(task, 600); };
        idle(prefetchSheets, { timeout: 3000 });
        setTimeout(paintSwatches, 1500);
    }

    /* ---- Content that keeps itself current ------------------------------ */

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
            el.textContent = months < 0 || year > 6 ? '' : ordinal(year);
        });
    }

    /* ---- Start ---------------------------------------------------------- */

    function init() {
        if (!THEMES.length) return;
        buildSwitcher();
        applyTheme(current());
        updateDates();
        window.addEventListener('hashchange', function () {
            var asked = (location.hash.match(/(?:^#|&)theme=([a-z0-9-]+)/) || [])[1];
            if (asked) switchTheme(asked);
        });
        if (document.readyState === 'complete') afterLoad();
        else window.addEventListener('load', afterLoad);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
