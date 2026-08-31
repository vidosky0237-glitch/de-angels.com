(function () {
    'use strict';

    function esc(s) {
        var d = document.createElement('div');
        d.textContent = s == null ? '' : String(s);
        return d.innerHTML;
    }

    function render() {
        var data = VaultStore.all();
        var tbody = document.getElementById('menuTableBody');
        if (!tbody) return;

        tbody.innerHTML = data.menu.map(function (m) {
            return '<tr>' +
                '<td><strong>' + esc(m.name) + '</strong><br><small style="color:var(--vault-muted)">' + esc(m.description) + '</small></td>' +
                '<td>' + esc(m.category) + '</td>' +
                '<td>₦' + Number(m.price).toLocaleString() + '</td>' +
                '<td>' + m.ordersTonight + '</td>' +
                '<td><span class="status-pill ' + (m.available ? 'live' : 'off') + '">' + (m.available ? 'Live' : '86\'d') + '</span></td>' +
                '<td><button class="manage-btn" data-toggle="' + m.id + '">' + (m.available ? '86 Item' : 'Restore') + '</button></td>' +
                '</tr>';
        }).join('');

        tbody.querySelectorAll('[data-toggle]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                VaultStore.toggleMenuAvailability(btn.getAttribute('data-toggle'));
                render();
            });
        });
    }

    VaultShell.init({ onReady: render });
})();
