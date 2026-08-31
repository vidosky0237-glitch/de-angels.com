(function () {
    'use strict';

    function esc(s) {
        var d = document.createElement('div');
        d.textContent = s == null ? '' : String(s);
        return d.innerHTML;
    }

    function render() {
        var data = VaultStore.all();
        var tbody = document.getElementById('resTableBody');
        if (!tbody) return;

        if (!data.reservations.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="color:var(--vault-muted);padding:32px">No reservations yet. Bookings from the website form appear here.</td></tr>';
            return;
        }

        tbody.innerHTML = data.reservations.map(function (r) {
            return '<tr>' +
                '<td><strong>' + esc(r.name) + '</strong><br><small style="color:var(--vault-muted)">' + esc(r.email) + '</small></td>' +
                '<td>' + esc(r.datetime || '—') + '</td>' +
                '<td>' + esc(r.type) + '</td>' +
                '<td>' + r.guests + '</td>' +
                '<td><span class="status-pill ' + r.status + '">' + r.status + '</span></td>' +
                '<td><small style="color:var(--vault-muted)">' + esc((r.notes || '').substring(0, 40)) + '</small></td>' +
                '<td>' +
                (r.status === 'pending' ? '<button class="manage-btn primary" data-confirm="' + r.id + '">Confirm</button>' : '') +
                '<button class="manage-btn danger" data-delete="' + r.id + '">Delete</button></td>' +
                '</tr>';
        }).join('');

        tbody.querySelectorAll('[data-confirm]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                VaultStore.updateReservationStatus(btn.getAttribute('data-confirm'), 'confirmed');
                render();
            });
        });

        tbody.querySelectorAll('[data-delete]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (confirm('Remove this reservation?')) {
                    VaultStore.deleteReservation(btn.getAttribute('data-delete'));
                    render();
                }
            });
        });
    }

    var form = document.getElementById('addResForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            VaultStore.addReservation({
                name: document.getElementById('rName').value,
                email: document.getElementById('rEmail').value,
                phone: document.getElementById('rPhone').value,
                datetime: document.getElementById('rDatetime').value,
                guests: parseInt(document.getElementById('rGuests').value, 10) || 2,
                type: document.getElementById('rType').value,
                notes: document.getElementById('rNotes').value
            });
            form.reset();
            render();
        });
    }

    VaultShell.init({ onReady: render });
})();
