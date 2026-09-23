(function () {
    'use strict';

    function esc(str) {
        var d = document.createElement('div');
        d.textContent = str == null ? '' : String(str);
        return d.innerHTML;
    }

    function hrefFor(key, value) {
        if (!value) return '';
        if (key === 'email') return 'mailto:' + value;
        if (key === 'phone') return 'tel:' + String(value).replace(/\s+/g, '');
        if (key === 'whatsapp') {
            if (/^https?:/i.test(value)) return value;
            var digits = String(value).replace(/\D/g, '');
            return digits ? 'https://wa.me/' + digits : '';
        }
        return value;
    }

    function applySettings() {
        if (!window.VaultStore) return;
        var settings = VaultStore.getSettings();

        document.querySelectorAll('[data-vault-setting]').forEach(function (el) {
            var key = el.getAttribute('data-vault-setting');
            var value = settings[key];
            if (!value) return;
            if (el.tagName === 'A' && (key === 'email' || key === 'phone' || key === 'whatsapp')) {
                var link = hrefFor(key, value);
                if (link) el.setAttribute('href', link);
                if (!el.getAttribute('data-vault-keep-label')) el.textContent = value;
            } else {
                el.textContent = value;
            }
        });

        document.querySelectorAll('[data-vault-href]').forEach(function (el) {
            var key = el.getAttribute('data-vault-href');
            var href = hrefFor(key, settings[key]);
            if (!href) return;
            el.setAttribute('href', href);
            if (/^(instagram|facebook|twitter|youtube|mapsUrl|whatsapp)$/.test(key)) {
                el.setAttribute('target', '_blank');
                el.setAttribute('rel', 'noopener');
            }
        });

        document.querySelectorAll('[data-vault-map]').forEach(function (el) {
            var src = VaultStore.getMapsEmbedUrl ? VaultStore.getMapsEmbedUrl() : '';
            if (src) el.setAttribute('src', src);
        });

        document.querySelectorAll('[data-vault-hide-empty]').forEach(function (el) {
            var key = el.getAttribute('data-vault-hide-empty');
            el.style.display = settings[key] ? '' : 'none';
        });
    }

    function renderEvents() {
        var nodes = document.querySelectorAll('[data-vault-event-list]');
        if (!nodes.length || !window.VaultStore) return;

        var events = VaultStore.getPublicEvents
            ? VaultStore.getPublicEvents(3)
            : VaultStore.getUpcomingEvents(3);

        nodes.forEach(function (wrap) {
            if (!events.length) {
                wrap.innerHTML = '<div class="col-12"><p class="text-center mb-0" style="color:var(--secondary)">Private terrace gatherings appear here when the host team publishes them from Event Horizon.</p></div>';
                return;
            }

            wrap.innerHTML = events.map(function (e) {
                var d = VaultStore.formatDate(e.date);
                return '<div class="col-lg-4 col-md-6">' +
                    '<article class="vault-event-card">' +
                    '<div class="vault-event-date"><strong>' + d.day + '</strong><span>' + d.month + '</span></div>' +
                    '<p class="vault-event-kicker">' + esc(e.type || 'Private gathering') + (e.publicRef ? ' · ' + esc(e.publicRef) : '') + '</p>' +
                    '<h4>' + esc(e.title) + '</h4>' +
                    '<p>' + esc(e.description) + '</p>' +
                    '<small>' + (e.guests ? e.guests + ' guests · ' : '') + d.full + (e.time ? ' · ' + esc(e.time) : '') + '</small>' +
                    '<div class="vault-event-actions">' +
                    '<a class="btn btn-primary btn-sm py-2 px-3" href="reservations.php?type=' + encodeURIComponent('Private gathering') + '">Book a table</a>' +
                    '<a class="btn btn-outline-primary btn-sm py-2 px-3" href="contact.php">Enquire</a>' +
                    '</div></article></div>';
            }).join('');
        });
    }

    function galleryCatFromPortfolio(category) {
        var text = (category || '').toLowerCase();
        if (/cater/.test(text)) return 'catering';
        if (/night|brand/.test(text)) return 'night';
        if (/private|party/.test(text)) return 'hosted';
        return 'terrace';
    }

    function renderPortfolio() {
        var nodes = document.querySelectorAll('[data-vault-portfolio-grid], #vaultPortfolioStrip');
        if (!nodes.length || !window.VaultStore) return;

        var items = VaultStore.getPublicPortfolio
            ? VaultStore.getPublicPortfolio(6)
            : (VaultStore.getFeaturedPortfolio ? VaultStore.getFeaturedPortfolio(3) : []);

        nodes.forEach(function (wrap) {
            if (!items.length) {
                if (wrap.id === 'vaultPortfolioStrip') {
                    wrap.innerHTML = '';
                    wrap.style.display = 'none';
                } else {
                    wrap.style.display = '';
                    wrap.innerHTML = '<div class="col-12"><p class="text-center mb-0" style="color:var(--secondary)">Hosted moments appear here when published from the Portfolio Vault.</p></div>';
                }
                return;
            }

            wrap.style.display = '';
            wrap.innerHTML = items.map(function (p) {
                var src = VaultStore.resolveAsset(p.image);
                var d = p.date ? VaultStore.formatDate(p.date) : null;
                var cat = galleryCatFromPortfolio(p.category);
                return '<div class="col-lg-4 col-md-6 gallery-cell">' +
                    '<article class="gallery-card vault-portfolio-card" data-gallery-cat="' + cat + '">' +
                    (src ? '<img src="' + esc(src) + '" alt="' + esc(p.title) + '" loading="lazy">' : '') +
                    (p.featured ? '<span class="vault-portfolio-star">Featured</span>' : '') +
                    '<div class="gallery-caption gallery-caption--always">' +
                    '<span>' + esc(p.category) + '</span>' +
                    '<h6>' + esc(p.title) + '</h6>' +
                    (d ? '<small>' + d.full + (p.guests ? ' · ' + p.guests + ' guests' : '') + '</small>' : '') +
                    '</div></article></div>';
            }).join('');
        });
    }

    function renderSeatAvailability() {
        var el = document.getElementById('vaultSeatAvailability');
        if (!el || !window.VaultStore || !VaultStore.getSeatAvailability) return;

        var floor = VaultStore.getSeatAvailability();
        el.innerHTML =
            '<div class="seat-chip"><strong>' + floor.terrace.open + '</strong><span>Terrace open</span></div>' +
            '<div class="seat-chip"><strong>' + floor.indoor.open + '</strong><span>Indoor open</span></div>' +
            '<div class="seat-chip"><strong>' + floor.private.open + '</strong><span>Private open</span></div>' +
            '<div class="seat-chip"><strong>' + floor.all.reserved + '</strong><span>Held for bookings</span></div>';
    }

    function applyAll() {
        applySettings();
        renderEvents();
        renderPortfolio();
        renderSeatAvailability();
    }

    function boot() {
        applyAll();
        if (window.VaultStore && VaultStore.subscribe) {
            VaultStore.subscribe(applyAll);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
