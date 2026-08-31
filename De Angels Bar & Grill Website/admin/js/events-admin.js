(function () {
    'use strict';

    function esc(s) {
        var d = document.createElement('div');
        d.textContent = s == null ? '' : String(s);
        return d.innerHTML;
    }

    function render() {
        var data = VaultStore.all();
        var list = document.getElementById('eventList');
        if (!list) return;

        if (!data.events.length) {
            list.innerHTML = '<div class="empty-state"><i class="fa fa-calendar d-block"></i>No events scheduled. Add one below.</div>';
            return;
        }

        list.innerHTML = data.events.map(function (e) {
            var d = VaultStore.formatDate(e.date);
            return '<div class="manage-card"><div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">' +
                '<div class="d-flex gap-3 align-items-start">' +
                '<div class="event-date"><strong>' + d.day + '</strong><span>' + d.month + '</span></div>' +
                '<div><h4 style="font-family:Oswald;margin:0 0 4px">' + esc(e.title) + '</h4>' +
                '<p style="color:var(--vault-muted);margin:0 0 4px">' + esc(e.description) + '</p>' +
                '<small style="color:var(--vault-gold)">' + e.guests + ' guests · ' + d.full + '</small></div></div>' +
                '<button class="manage-btn danger" data-delete="' + e.id + '"><i class="fa fa-trash"></i> Remove</button></div></div>';
        }).join('');

        list.querySelectorAll('[data-delete]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (confirm('Remove this event?')) {
                    VaultStore.deleteEvent(btn.getAttribute('data-delete'));
                    render();
                }
            });
        });
    }

    var form = document.getElementById('addEventForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            VaultStore.addEvent({
                title: document.getElementById('eTitle').value,
                date: document.getElementById('eDate').value,
                description: document.getElementById('eDesc').value,
                guests: parseInt(document.getElementById('eGuests').value, 10) || 0
            });
            form.reset();
            render();
        });
    }

    VaultShell.init({ onReady: render });
})();
