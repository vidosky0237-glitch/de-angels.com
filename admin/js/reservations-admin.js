(function () {
    'use strict';

    var filter = 'all';
    var query = '';

    function esc(s) {
        var d = document.createElement('div');
        d.textContent = s == null ? '' : String(s);
        return d.innerHTML;
    }

    function showAlert(message, type) {
        var el = document.getElementById('resAlert');
        if (!el) return;
        el.textContent = message;
        el.className = 'vault-alert show ' + (type || 'success');
        el.style.display = 'block';
        setTimeout(function () {
            el.style.display = 'none';
            el.className = 'vault-alert';
        }, 3200);
    }

    function matchesFilter(r) {
        if (filter === 'all') return true;
        if (filter === 'website') return r.source === 'website';
        if (filter === 'walk-in') return r.source !== 'website';
        if (filter === 'tonight') {
            var today = new Date().toISOString().slice(0, 10);
            return String(r.datetime || '').indexOf(today) === 0;
        }
        return r.status === filter;
    }

    function matchesQuery(r) {
        if (!query) return true;
        var hay = [r.name, r.email, r.phone, r.publicRef, r.type, r.notes, r.seatId].join(' ').toLowerCase();
        return hay.indexOf(query) !== -1;
    }

    function whenLabel(r) {
        return VaultStore.formatDateTime ? VaultStore.formatDateTime(r.datetime) : (r.datetime || '—');
    }

    function sourceLabel(r) {
        return r.source === 'website' ? 'Website' : 'Walk-in';
    }

    function renderStats() {
        var stats = VaultStore.getReservationStats();
        var floor = VaultStore.getSeatAvailability();
        var map = {
            statPending: stats.pending,
            statConfirmed: stats.confirmed,
            statSeated: stats.seated,
            statWebsite: stats.website,
            statCovers: stats.covers,
            statOpenSeats: floor.all.open
        };
        Object.keys(map).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.textContent = map[id];
        });
        var floorNote = document.getElementById('resFloorNote');
        if (floorNote) {
            floorNote.textContent = floor.terrace.open + ' terrace · ' + floor.indoor.open + ' indoor · ' + floor.private.open + ' private open';
        }
    }

    function actionButtons(r) {
        var html = '';
        if (r.status === 'pending') {
            html += '<button type="button" class="manage-btn primary" data-status="confirmed" data-id="' + r.id + '">Confirm</button>';
            html += '<button type="button" class="manage-btn" data-status="seated" data-id="' + r.id + '">Seat</button>';
            html += '<button type="button" class="manage-btn" data-status="cancelled" data-id="' + r.id + '">Cancel</button>';
        } else if (r.status === 'confirmed') {
            html += '<button type="button" class="manage-btn primary" data-status="seated" data-id="' + r.id + '">Seat</button>';
            html += '<button type="button" class="manage-btn" data-status="cancelled" data-id="' + r.id + '">Cancel</button>';
        } else if (r.status === 'seated') {
            html += '<button type="button" class="manage-btn" data-status="confirmed" data-id="' + r.id + '">Unseat</button>';
        } else if (r.status === 'cancelled') {
            html += '<button type="button" class="manage-btn" data-status="pending" data-id="' + r.id + '">Restore</button>';
        }
        html += '<button type="button" class="manage-btn danger" data-delete="' + r.id + '">Delete</button>';
        return html;
    }

    function renderTable() {
        var tbody = document.getElementById('resTableBody');
        if (!tbody) return;

        var rows = VaultStore.all().reservations.filter(matchesFilter).filter(matchesQuery);

        if (!rows.length) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="color:var(--vault-muted);padding:32px">No bookings in this view. Website forms and walk-ins appear here live.</td></tr>';
            return;
        }

        tbody.innerHTML = rows.map(function (r) {
            return '<tr>' +
                '<td><strong>' + esc(r.name) + '</strong><br>' +
                '<small style="color:var(--vault-muted)">' + esc(r.publicRef || r.id) + (r.email ? ' · ' + esc(r.email) : '') + (r.phone ? '<br>' + esc(r.phone) : '') + '</small></td>' +
                '<td>' + esc(whenLabel(r)) + '</td>' +
                '<td>' + esc(r.type) + (r.seatId ? '<br><small style="color:var(--vault-gold)">Seat ' + esc(r.seatId) + '</small>' : '') + '</td>' +
                '<td>' + r.guests + '</td>' +
                '<td><span class="status-pill ' + esc(r.status) + '">' + esc(r.status) + '</span></td>' +
                '<td><span class="source-pill ' + (r.source === 'website' ? 'web' : 'walk') + '">' + sourceLabel(r) + '</span></td>' +
                '<td><small style="color:var(--vault-muted)">' + esc((r.notes || '—').substring(0, 48)) + '</small></td>' +
                '<td class="res-actions">' + actionButtons(r) + '</td>' +
                '</tr>';
        }).join('');

        tbody.querySelectorAll('[data-status]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                VaultStore.updateReservationStatus(btn.getAttribute('data-id'), btn.getAttribute('data-status'));
            });
        });

        tbody.querySelectorAll('[data-delete]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (confirm('Remove this reservation from the queue?')) {
                    VaultStore.deleteReservation(btn.getAttribute('data-delete'));
                }
            });
        });
    }

    function render() {
        if (!window.VaultStore) return;
        renderStats();
        renderTable();
        document.querySelectorAll('[data-res-filter]').forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-res-filter') === filter);
        });
    }

    var form = document.getElementById('addResForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var name = document.getElementById('rName').value.trim();
            if (!name) {
                showAlert('Guest name is required.', 'error');
                return;
            }
            var created = VaultStore.addReservation({
                name: name,
                email: document.getElementById('rEmail').value.trim(),
                phone: document.getElementById('rPhone').value.trim(),
                datetime: document.getElementById('rDatetime').value,
                guests: parseInt(document.getElementById('rGuests').value, 10) || 2,
                type: document.getElementById('rType').value,
                notes: document.getElementById('rNotes').value.trim(),
                source: 'walk-in'
            });
            form.reset();
            document.getElementById('rGuests').value = '2';
            showAlert('Walk-in booked as ' + (created && created.publicRef ? created.publicRef : 'DA') + ' — it is live on the floor.', 'success');
        });
    }

    document.querySelectorAll('[data-res-filter]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            filter = btn.getAttribute('data-res-filter') || 'all';
            render();
        });
    });

    var search = document.getElementById('resSearch');
    if (search) {
        search.addEventListener('input', function () {
            query = search.value.trim().toLowerCase();
            render();
        });
    }

    VaultShell.init({ onReady: render });
    if (window.VaultStore && VaultStore.subscribe) VaultStore.subscribe(render);
})();
