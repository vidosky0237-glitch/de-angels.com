(function () {
    'use strict';

    var activeFilter = 'All';
    var query = '';
    var editId = '';

    function esc(s) {
        var d = document.createElement('div');
        d.textContent = s == null ? '' : String(s);
        return d.innerHTML;
    }

    function showAlert(message, type) {
        var el = document.getElementById('portfolioAlert');
        if (!el) return;
        el.textContent = message;
        el.className = 'vault-alert show ' + (type || 'success');
        el.style.display = 'block';
        setTimeout(function () {
            el.style.display = 'none';
            el.className = 'vault-alert';
        }, 3200);
    }

    function getCategories(items) {
        var cats = ['All'];
        items.forEach(function (item) {
            if (item.category && cats.indexOf(item.category) === -1) cats.push(item.category);
        });
        return cats;
    }

    function matchesFilter(p) {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'featured') return !!p.featured;
        if (activeFilter === 'published') return !!p.published;
        if (activeFilter === 'unpublished') return !p.published;
        return p.category === activeFilter;
    }

    function matchesQuery(p) {
        if (!query) return true;
        var hay = [p.title, p.category, p.description].join(' ').toLowerCase();
        return hay.indexOf(query) !== -1;
    }

    function fillForm(item) {
        document.getElementById('pTitle').value = item ? item.title : '';
        document.getElementById('pCategory').value = item ? item.category : 'Terrace Event';
        document.getElementById('pImage').value = item ? (item.image || '') : '';
        document.getElementById('pDate').value = item ? (item.date || '') : '';
        document.getElementById('pGuests').value = item ? item.guests : 0;
        document.getElementById('pDesc').value = item ? (item.description || '') : '';
        document.getElementById('pPublished').checked = item ? item.published !== false : true;
        document.getElementById('pFeatured').checked = item ? !!item.featured : false;
        document.getElementById('portfolioFormTitle').textContent = item ? 'Edit ' + item.title : 'Add Showcase Moment';
        document.getElementById('portfolioSubmitBtn').textContent = item ? 'Save Changes' : 'Add to Portfolio';
        document.getElementById('portfolioCancelEdit').hidden = !item;
    }

    function renderStats(items) {
        var stats = VaultStore.getPortfolioStats ? VaultStore.getPortfolioStats() : {
            total: items.length,
            featured: items.filter(function (p) { return p.featured; }).length,
            published: items.filter(function (p) { return p.published; }).length,
            categories: getCategories(items).length - 1
        };
        var map = {
            portfolioTotal: stats.total,
            portfolioFeatured: stats.featured,
            portfolioPublished: stats.published,
            portfolioCategories: stats.categories
        };
        Object.keys(map).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.textContent = map[id];
        });
        document.querySelectorAll('[data-pf-filter]').forEach(function (btn) {
            var key = btn.getAttribute('data-pf-filter');
            var on = key === activeFilter || (key === 'all' && activeFilter === 'All');
            btn.classList.toggle('active', on);
        });
    }

    function renderFilters(items) {
        var wrap = document.getElementById('portfolioFilters');
        if (!wrap) return;
        var cats = getCategories(items).concat(['featured', 'published', 'unpublished']);
        wrap.innerHTML = cats.map(function (cat) {
            var label = cat === 'featured' ? 'Featured' : cat === 'published' ? 'On website' : cat === 'unpublished' ? 'Private' : cat;
            return '<button type="button" class="portfolio-filter' + (cat === activeFilter ? ' active' : '') + '" data-filter="' + esc(cat) + '">' + esc(label) + '</button>';
        }).join('');
        wrap.querySelectorAll('.portfolio-filter').forEach(function (btn) {
            btn.addEventListener('click', function () {
                activeFilter = btn.getAttribute('data-filter');
                render();
            });
        });
    }

    function renderImport() {
        var box = document.getElementById('eventImport');
        if (!box || !VaultStore.getEventsWithoutPortfolio) return;
        var rows = VaultStore.getEventsWithoutPortfolio();
        if (!rows.length) {
            box.hidden = true;
            box.innerHTML = '';
            return;
        }
        box.hidden = false;
        box.innerHTML = '<h3 style="font-family:Oswald;margin:0 0 12px;font-size:1.05rem">Events not yet in the gallery</h3>' +
            '<p style="color:var(--vault-muted);margin:0 0 12px;font-size:13px">Pull a gathering from Event Horizon into the public showcase.</p>' +
            rows.map(function (e) {
                return '<div class="pending-row" style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:8px">' +
                    '<div><strong>' + esc(e.title) + '</strong><br><small style="color:var(--vault-muted)">' +
                    esc(e.publicRef || '') + ' · ' + esc(e.type || '') + (e.guests ? ' · ' + e.guests + ' guests' : '') + '</small></div>' +
                    '<button type="button" class="manage-btn primary" data-import="' + e.id + '">Add to gallery</button></div>';
            }).join('');
        box.querySelectorAll('[data-import]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var created = VaultStore.createPortfolioFromEvent(btn.getAttribute('data-import'));
                if (created) showAlert(created.title + ' is now in the portfolio. Feature it to pin it on the homepage.', 'success');
            });
        });
    }

    function renderGrid(items) {
        var grid = document.getElementById('portfolioGrid');
        if (!grid) return;

        var filtered = items.filter(matchesFilter).filter(matchesQuery);
        if (!filtered.length) {
            grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><i class="fa fa-images d-block"></i>No showcase items in this view. Add one and publish it to the website.</div>';
            return;
        }

        grid.innerHTML = filtered.map(function (p) {
            var d = p.date ? VaultStore.formatDate(p.date) : null;
            var src = p.image ? VaultStore.resolveAsset(p.image) : '';
            var thumb = src
                ? '<img src="' + esc(src) + '" alt="' + esc(p.title) + '" loading="lazy">'
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
                '<span>' + (p.published ? 'On website' : 'Private') + '</span>' +
                '</div>' +
                '<div class="portfolio-actions">' +
                '<button type="button" class="manage-btn" data-edit="' + p.id + '">Edit</button>' +
                '<button type="button" class="manage-btn' + (p.featured ? ' featured-on' : '') + '" data-featured="' + p.id + '">' +
                (p.featured ? 'Unfeature' : 'Feature') + '</button>' +
                '<button type="button" class="manage-btn" data-publish="' + p.id + '">' + (p.published ? 'Unpublish' : 'Publish') + '</button>' +
                '<button type="button" class="manage-btn danger" data-delete="' + p.id + '">Remove</button>' +
                '</div></div></article>';
        }).join('');

        grid.querySelectorAll('[data-edit]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var item = VaultStore.getPortfolioById(btn.getAttribute('data-edit'));
                if (!item) return;
                editId = item.id;
                fillForm(item);
                document.getElementById('addPortfolioForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
        grid.querySelectorAll('[data-featured]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var item = VaultStore.getPortfolioById(btn.getAttribute('data-featured'));
                VaultStore.togglePortfolioFeatured(btn.getAttribute('data-featured'));
                if (item) showAlert(item.featured ? 'Removed from featured.' : 'Pinned to the top of the public gallery.', 'success');
            });
        });
        grid.querySelectorAll('[data-publish]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var item = VaultStore.getPortfolioById(btn.getAttribute('data-publish'));
                VaultStore.togglePortfolioPublished(btn.getAttribute('data-publish'));
                if (item) showAlert(item.published ? 'Hidden from the website.' : 'Now live in the public gallery.', 'success');
            });
        });
        grid.querySelectorAll('[data-delete]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (!confirm('Remove this showcase item from the portfolio and website?')) return;
                VaultStore.deletePortfolioItem(btn.getAttribute('data-delete'));
                showAlert('Moment removed.', 'success');
            });
        });
    }

    function render() {
        if (!window.VaultStore) return;
        var items = VaultStore.all().portfolio || [];
        renderStats(items);
        renderFilters(items);
        renderImport();
        renderGrid(items);
    }

    var form = document.getElementById('addPortfolioForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var payload = {
                title: (document.getElementById('pTitle').value || '').trim(),
                category: document.getElementById('pCategory').value,
                image: (document.getElementById('pImage').value || '').trim(),
                description: (document.getElementById('pDesc').value || '').trim(),
                date: document.getElementById('pDate').value,
                guests: parseInt(document.getElementById('pGuests').value, 10) || 0,
                featured: document.getElementById('pFeatured').checked,
                published: document.getElementById('pPublished').checked
            };
            if (!payload.title) {
                showAlert('Enter a title before saving.', 'error');
                return;
            }
            if (editId) {
                VaultStore.updatePortfolioItem(editId, payload);
                showAlert(payload.title + ' updated.', 'success');
                editId = '';
            } else {
                var created = VaultStore.addPortfolioItem(payload);
                if (created) showAlert(created.title + (created.published ? ' is live on the website.' : ' saved as private.'), 'success');
            }
            fillForm(null);
            form.reset();
            document.getElementById('pPublished').checked = true;
            document.getElementById('pCategory').value = 'Terrace Event';
        });
    }

    var cancel = document.getElementById('portfolioCancelEdit');
    if (cancel) {
        cancel.addEventListener('click', function () {
            editId = '';
            fillForm(null);
            if (form) form.reset();
            document.getElementById('pPublished').checked = true;
        });
    }

    document.querySelectorAll('[data-pf-filter]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            activeFilter = btn.getAttribute('data-pf-filter') || 'All';
            if (activeFilter === 'all') activeFilter = 'All';
            render();
        });
    });

    var search = document.getElementById('portfolioSearch');
    if (search) {
        search.addEventListener('input', function () {
            query = search.value.trim().toLowerCase();
            render();
        });
    }

    VaultShell.init({ onReady: render });
    if (window.VaultStore && VaultStore.subscribe) VaultStore.subscribe(render);
})();
