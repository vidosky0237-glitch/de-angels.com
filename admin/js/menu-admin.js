(function () {
    'use strict';

    var filter = 'all';
    var query = '';
    var editId = '';

    function esc(s) {
        var d = document.createElement('div');
        d.textContent = s == null ? '' : String(s);
        return d.innerHTML;
    }

    function showAlert(message, type) {
        var el = document.getElementById('menuAlert');
        if (!el) return;
        el.textContent = message;
        el.className = 'vault-alert show ' + (type || 'success');
        el.style.display = 'block';
        setTimeout(function () {
            el.style.display = 'none';
            el.className = 'vault-alert';
        }, 3200);
    }

    function matchesFilter(m) {
        if (filter === 'all') return true;
        if (filter === 'live') return !!m.available;
        if (filter === '86') return !m.available;
        return (m.category || '') === filter;
    }

    function matchesQuery(m) {
        if (!query) return true;
        var hay = [m.name, m.category, m.description, m.id].join(' ').toLowerCase();
        return hay.indexOf(query) !== -1;
    }

    function renderStats() {
        var stats = VaultStore.getMenuStats();
        var map = {
            statLive: stats.live,
            statEightySix: stats.eightySix,
            statGrills: stats.grills,
            statMains: stats.mains,
            statFastFood: stats.fastFood,
            statDrinks: stats.drinks,
            statOrders: stats.ordersTonight
        };
        Object.keys(map).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.textContent = map[id];
        });
    }

    function fillForm(item) {
        document.getElementById('mName').value = item ? item.name : '';
        document.getElementById('mPrice').value = item ? item.price : '';
        document.getElementById('mCategory').value = item ? item.category : 'Grills';
        document.getElementById('mDesc').value = item ? item.description : '';
        document.getElementById('mImage').value = item ? (item.image || '') : '';
        document.getElementById('menuFormTitle').textContent = item ? 'Edit ' + item.name : 'Add Menu Item';
        document.getElementById('menuSubmitBtn').textContent = item ? 'Save Changes' : 'Add To Menu';
        document.getElementById('menuCancelEdit').hidden = !item;
    }

    function renderList() {
        var tbody = document.getElementById('menuTableBody');
        if (!tbody) return;

        var rows = VaultStore.all().menu.filter(matchesFilter).filter(matchesQuery);

        if (!rows.length) {
            tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="fa fa-utensils d-block"></i>No dishes in this view. Add one and it appears on the public menu.</div></td></tr>';
            return;
        }

        tbody.innerHTML = rows.map(function (m) {
            var canDelete = m.source !== 'house';
            return '<tr>' +
                '<td><strong>' + esc(m.name) + '</strong><br><small style="color:var(--vault-muted)">' + esc(m.description) + '</small></td>' +
                '<td>' + esc(m.category) + '</td>' +
                '<td>₦' + Number(m.price).toLocaleString() + '</td>' +
                '<td>' + (m.ordersTonight || 0) + '</td>' +
                '<td><span class="status-pill ' + (m.available ? 'live' : 'off') + '">' + (m.available ? 'Live' : "86'd") + '</span></td>' +
                '<td class="res-actions">' +
                '<button type="button" class="manage-btn" data-toggle="' + m.id + '">' + (m.available ? '86 Item' : 'Restore') + '</button>' +
                '<button type="button" class="manage-btn" data-edit="' + m.id + '">Edit</button>' +
                '<button type="button" class="manage-btn" data-bump="' + m.id + '">+ Order</button>' +
                (canDelete ? '<button type="button" class="manage-btn danger" data-delete="' + m.id + '">Delete</button>' : '') +
                '</td></tr>';
        }).join('');

        tbody.querySelectorAll('[data-toggle]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var item = VaultStore.getMenuById(btn.getAttribute('data-toggle'));
                if (!item) return;
                VaultStore.toggleMenuAvailability(item.id);
                showAlert((item.available ? "86'd " : 'Restored ') + item.name + ' on the public menu.', 'success');
            });
        });
        tbody.querySelectorAll('[data-edit]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var item = VaultStore.getMenuById(btn.getAttribute('data-edit'));
                if (!item) return;
                editId = item.id;
                fillForm(item);
                document.getElementById('addMenuForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
        tbody.querySelectorAll('[data-bump]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                VaultStore.bumpMenuOrders(btn.getAttribute('data-bump'), 1);
            });
        });
        tbody.querySelectorAll('[data-delete]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (!confirm('Remove this dish from the vault and public menu?')) return;
                var ok = VaultStore.deleteMenuItem(btn.getAttribute('data-delete'));
                if (ok) showAlert('Dish removed from the public menu.', 'success');
                else showAlert('House dishes stay on the line — 86 them instead.', 'error');
            });
        });
    }

    function render() {
        if (!window.VaultStore) return;
        renderStats();
        renderList();
        document.querySelectorAll('[data-menu-filter]').forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-menu-filter') === filter);
        });
    }

    var form = document.getElementById('addMenuForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var payload = {
                name: (document.getElementById('mName').value || '').trim(),
                price: document.getElementById('mPrice').value,
                category: document.getElementById('mCategory').value,
                description: document.getElementById('mDesc').value,
                image: (document.getElementById('mImage').value || '').trim()
            };
            if (!payload.name) {
                showAlert('Enter a dish name before saving.', 'error');
                return;
            }

            if (editId) {
                VaultStore.updateMenuItem(editId, payload);
                showAlert(payload.name + ' updated on the public menu.', 'success');
                editId = '';
            } else {
                var created = VaultStore.addMenuItem(payload);
                if (created) showAlert(created.name + ' is now live on the website.', 'success');
            }
            fillForm(null);
            form.reset();
            document.getElementById('mCategory').value = 'Grills';
        });
    }

    var cancel = document.getElementById('menuCancelEdit');
    if (cancel) {
        cancel.addEventListener('click', function () {
            editId = '';
            fillForm(null);
            if (form) form.reset();
            document.getElementById('mCategory').value = 'Grills';
        });
    }

    document.querySelectorAll('[data-menu-filter]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            filter = btn.getAttribute('data-menu-filter') || 'all';
            render();
        });
    });

    var search = document.getElementById('menuSearch');
    if (search) {
        search.addEventListener('input', function () {
            query = search.value.trim().toLowerCase();
            render();
        });
    }

    VaultShell.init({ onReady: render });
    if (window.VaultStore && VaultStore.subscribe) VaultStore.subscribe(render);
})();
