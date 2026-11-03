/* ==========================================================
   MOVE & CO. — main.js
   Motion : reveals, nav, compteurs, carrousel, parallax
   ========================================================== */
(function () {
    'use strict';

    var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Reveal au scroll ---------- */
    function initReveal() {
        var els = document.querySelectorAll('.rv');
        if (!els.length) return;

        if (reduit || !('IntersectionObserver' in window)) {
            els.forEach(function (el) { el.classList.add('vu'); });
            return;
        }

        var obs = new IntersectionObserver(function (entrees) {
            entrees.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add('vu');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

        els.forEach(function (el) { obs.observe(el); });
    }

    /* ---------- Nav : état scroll + barre de progression ---------- */
    function initNav() {
        var nav = document.querySelector('.navigation');
        var barre = document.querySelector('.scroll-progress');
        var boutonHaut = document.querySelector('.haut-page');
        var ticking = false;

        function maj() {
            var y = window.scrollY || document.documentElement.scrollTop;
            if (nav) nav.classList.toggle('scrolled', y > 40);

            if (barre) {
                var h = document.documentElement.scrollHeight - window.innerHeight;
                var p = h > 0 ? Math.min(y / h, 1) : 0;
                barre.style.transform = 'scaleX(' + p + ')';
            }

            if (boutonHaut) boutonHaut.classList.toggle('visible', y > 700);
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) { window.requestAnimationFrame(maj); ticking = true; }
        }, { passive: true });

        maj();
    }

    /* ---------- Compteurs animés ---------- */
    function initCompteurs() {
        var els = document.querySelectorAll('[data-cible]');
        if (!els.length) return;

        function animer(el) {
            var cible = parseFloat(el.getAttribute('data-cible'));
            var suffixe = el.getAttribute('data-suffixe') || '';
            if (reduit) { el.textContent = cible.toLocaleString('fr-FR') + suffixe; return; }

            var debut = null;
            var duree = 1700;

            function pas(ts) {
                if (!debut) debut = ts;
                var t = Math.min((ts - debut) / duree, 1);
                var e = 1 - Math.pow(1 - t, 4);
                var val = Math.round(cible * e);
                el.textContent = val.toLocaleString('fr-FR') + suffixe;
                if (t < 1) requestAnimationFrame(pas);
            }
            requestAnimationFrame(pas);
        }

        if (!('IntersectionObserver' in window)) {
            els.forEach(animer);
            return;
        }

        var obs = new IntersectionObserver(function (entrees) {
            entrees.forEach(function (e) {
                if (e.isIntersecting) { animer(e.target); obs.unobserve(e.target); }
            });
        }, { threshold: 0.25, rootMargin: '0px 0px -5% 0px' });

        els.forEach(function (el) { obs.observe(el); });
    }

    /* ---------- Carrousel ---------- */
    function initCarrousel() {
        var c = document.querySelector('.carrousel');
        if (!c) return;

        var points = c.querySelectorAll('.carrousel-point');
        var total = points.length;
        var index = 1;
        var timer = null;
        var pause = false;

        function aller(i) {
            index = ((i - 1) % total + total) % total + 1;
            c.className = 'carrousel rv vu piste-' + index;
            points.forEach(function (p, n) {
                p.classList.toggle('actif', n === index - 1);
                p.setAttribute('aria-selected', n === index - 1 ? 'true' : 'false');
            });
        }

        points.forEach(function (p, n) {
            p.addEventListener('click', function () { aller(n + 1); relancer(); });
        });

        function relancer() {
            if (timer) clearInterval(timer);
            if (reduit) return;
            timer = setInterval(function () {
                if (!pause && !document.hidden) aller(index + 1);
            }, 5000);
        }

        c.addEventListener('mouseenter', function () { pause = true; });
        c.addEventListener('mouseleave', function () { pause = false; });

        aller(1);
        relancer();
    }

    /* ---------- Parallax léger (hero + CTA) ---------- */
    function initParallax() {
        if (reduit) return;
        var couches = document.querySelectorAll('[data-parallax]');
        if (!couches.length) return;

        var ticking = false;

        function maj() {
            var vh = window.innerHeight;
            couches.forEach(function (el) {
                var r = el.getBoundingClientRect();
                if (r.bottom < -200 || r.top > vh + 200) return;
                var facteur = parseFloat(el.getAttribute('data-parallax')) || 0.15;
                var decalage = (r.top + r.height / 2 - vh / 2) * facteur;
                el.style.transform = 'translate3d(0,' + decalage.toFixed(1) + 'px,0) scale(1.12)';
            });
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) { requestAnimationFrame(maj); ticking = true; }
        }, { passive: true });

        maj();
    }

    /* ---------- Menu mobile : fermeture au clic ---------- */
    function initMenu() {
        var d = document.querySelector('.menu-mobile');
        if (!d) return;
        d.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () { d.removeAttribute('open'); });
        });
        document.addEventListener('click', function (e) {
            if (d.open && !d.contains(e.target)) d.removeAttribute('open');
        });
    }

    /* ---------- Retour en haut ---------- */
    function initHaut() {
        var b = document.querySelector('.haut-page');
        if (!b) return;
        b.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduit ? 'auto' : 'smooth' });
        });
    }

    /* ---------- Split du titre hero en mots ---------- */
    function initSplit() {
        document.querySelectorAll('[data-split]').forEach(function (el) {
            if (el.dataset.done) return;
            var mots = el.textContent.trim().split(/\s+/);
            el.innerHTML = mots.map(function (m, i) {
                return '<span class="mot"><span style="--d:' + (0.25 + i * 0.075).toFixed(3) + 's">' + m + '</span></span>';
            }).join(' ');
            el.dataset.done = '1';
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initSplit();
        initReveal();
        initNav();
        initCompteurs();
        initCarrousel();
        initParallax();
        initMenu();
        initHaut();
    });
})();
