(function () {
    'use strict';

    var activeFilter = 'All';

    function esc(s) {
        var d = document.createElement('div');
        d.textContent = s == null ? '' : String(s);
        return d.innerHTML;
    }

    function getCategories(items) {
        var cats = ['All'];
        items.forEach(function (item) {
            if (item.category && cats.indexOf(item.category) === -1) {
                cats.push(item.category);
            }
        });
        return cats;
    }

    function renderStats(items) {
        var totalEl = document.getElementById('portfolioTotal');
        var featuredEl = document.getElementById('portfolioFeatured');
        var catsEl = document.getElementById('portfolioCategories');

        if (totalEl) totalEl.textContent = items.length;
        if (featuredEl) featuredEl.textContent = items.filter(function (p) { return p.featured; }).length;
        if (catsEl) catsEl.textContent = getCategories(items).length - 1;
    }

    function renderFilters(items) {
        var wrap = document.getElementById('portfolioFilters');
        if (!wrap) return;

        var cats = getCategories(items);
        wrap.innerHTML = cats.map(function (cat) {
            return '<button type="button" class="portfolio-filter' + (cat === activeFilter ? ' active' : '') + '" data-filter="' + esc(cat) + '">' + esc(cat) + '</button>';
        }).join('');

        wrap.querySelectorAll('.portfolio-filter').forEach(function (btn) {
            btn.addEventListener('click', function () {
                activeFilter = btn.getAttribute('data-filter');
                render();
            });
        });
    }

    function renderGrid(items) {
        var grid = document.getElementById('portfolioGrid');
        if (!grid) return;

        var filtered = activeFilter === 'All'
            ? items
            : items.filter(function (p) { return p.category === activeFilter; });

        if (!filtered.length) {
            grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><i class="fa fa-images d-block"></i>No showcase items in this category yet.</div>';
            return;
        }

        grid.innerHTML = filtered.map(function (p) {
            var d = p.date ? VaultStore.formatDate(p.date) : null;
            var thumb = p.image
                ? '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy">'
                : '<div class="portfolio-thumb-placeholder"><i class="fa fa-image"></i></div>';

            return '<article class="portfolio-card' + (p.featured ? ' featured' : '') + '">' +
                '<div class="portfolio-thumb">' + thumb +
                (p.featured ? '<span class="portfolio-featured-badge"><i class="fa fa-star"></i> Featured</span>' : '') +
                '<span class="portfolio-category-badge">' + esc(p.category) + '</span></div>' +
                '<div class="portfolio-body">' +
                '<h4>' + esc(p.title) + '</h4>' +
                '<p>' + esc(p.description) + '</p>' +
                '<div class="portfolio-meta">' +
                (d ? '<span><i class="fa fa-calendar-alt"></i>' + d.full + '</span>' : '') +
                (p.guests ? '<span><i class="fa fa-users"></i>' + p.guests + ' guests</span>' : '') +
                '</div>' +
                '<div class="portfolio-actions">' +
                '<button type="button" class="manage-btn' + (p.featured ? ' featured-on' : '') + '" data-featured="' + p.id + '">' +
                '<i class="fa fa-star"></i> ' + (p.featured ? 'Unfeature' : 'Feature') + '</button>' +
                '<button type="button" class="manage-btn danger" data-delete="' + p.id + '"><i class="fa fa-trash"></i> Remove</button>' +
                '</div></div></article>';
        }).join('');

        grid.querySelectorAll('[data-featured]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                VaultStore.togglePortfolioFeatured(btn.getAttribute('data-featured'));
                render();
            });
        });

        grid.querySelectorAll('[data-delete]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (confirm('Remove this showcase item from the portfolio?')) {
                    VaultStore.deletePortfolioItem(btn.getAttribute('data-delete'));
                    render();
                }
            });
        });
    }

    function render() {
        var items = VaultStore.all().portfolio || [];
        renderStats(items);
        renderFilters(items);
        renderGrid(items);
    }

    var form = document.getElementById('addPortfolioForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            VaultStore.addPortfolioItem({
                title: document.getElementById('pTitle').value.trim(),
                category: document.getElementById('pCategory').value,
                image: document.getElementById('pImage').value.trim(),
                description: document.getElementById('pDesc').value.trim(),
                date: document.getElementById('pDate').value,
                guests: parseInt(document.getElementById('pGuests').value, 10) || 0,
                featured: document.getElementById('pFeatured').checked
            });
            form.reset();
            activeFilter = 'All';
            render();
        });
    }

    VaultShell.init({ onReady: render });
})();
