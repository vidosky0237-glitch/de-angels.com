(function () {
    'use strict';

    var selectedId = null;
    var filter = 'all';
    var query = '';

    function esc(s) {
        var d = document.createElement('div');
        d.textContent = s == null ? '' : String(s);
        return d.innerHTML;
    }

    function showAlert(message, type) {
        var el = document.getElementById('inboxAlert');
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
        if (filter === 'unread') return !m.read && m.status !== 'archived';
        if (filter === 'starred') return !!m.starred;
        if (filter === 'archived') return m.status === 'archived';
        if (filter === 'replied') return m.status === 'replied';
        if (filter === 'table') return m.type === 'Table' || m.type === 'Terrace';
        return (m.type || '').toLowerCase() === filter;
    }

    function matchesQuery(m) {
        if (!query) return true;
        var hay = [m.name, m.email, m.phone, m.subject, m.body, m.publicRef, m.type].join(' ').toLowerCase();
        return hay.indexOf(query) !== -1;
    }

    function renderStats() {
        var stats = VaultStore.getMessageStats();
        var map = {
            statUnread: stats.unread,
            statTotal: stats.total,
            statStarred: stats.starred,
            statEvent: stats.event,
            statTable: stats.table,
            statCatering: stats.catering,
            statTakeaway: stats.takeaway
        };
        Object.keys(map).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.textContent = map[id];
        });
    }

    function renderList() {
        var list = document.getElementById('messageList');
        if (!list) return;

        var rows = VaultStore.all().messages.filter(matchesFilter).filter(matchesQuery);

        if (!rows.length) {
            list.innerHTML = '<div class="empty-state"><i class="fa fa-inbox d-block"></i>No messages in this view. Contact form submissions appear here live.</div>';
            return;
        }

        list.innerHTML = rows.map(function (m) {
            var active = m.id === selectedId ? ' is-active' : '';
            return '<article class="manage-card message-card' + (m.read ? '' : ' unread') + active + '" data-id="' + m.id + '">' +
                '<div class="message-card-top">' +
                '<div><strong>' + esc(m.name) + '</strong> ' +
                (m.starred ? '<i class="fa fa-star message-star"></i> ' : '') +
                '<span class="status-pill ' + (m.status === 'replied' ? 'confirmed' : m.status === 'archived' ? 'cancelled' : 'pending') + '">' + esc(m.type) + '</span></div>' +
                '<small>' + esc(m.publicRef || '') + '</small></div>' +
                '<p>' + esc(m.subject) + '</p>' +
                '<small class="message-meta">' + VaultStore.timeAgo(m.createdAt) + ' · ' + esc(m.email || 'No email') + (m.read ? '' : ' · unread') + '</small>' +
                '</article>';
        }).join('');

        list.querySelectorAll('.message-card').forEach(function (card) {
            card.addEventListener('click', function () {
                selectedId = card.getAttribute('data-id');
                var msg = VaultStore.getMessageById(selectedId);
                if (msg && !msg.read) VaultStore.markMessageRead(selectedId);
                else render();
            });
        });
    }

    function showDetail(id) {
        var detail = document.getElementById('messageDetail');
        if (!detail) return;

        var msg = id ? VaultStore.getMessageById(id) : null;
        if (!msg) {
            detail.innerHTML = '<div class="empty-state"><i class="fa fa-envelope-open d-block"></i>Select a message to read</div>';
            return;
        }

        var mailto = msg.email
            ? 'mailto:' + encodeURIComponent(msg.email) + '?subject=' + encodeURIComponent('Re: ' + (msg.subject || 'De Angels'))
            : '';
        var booking = msg.reservationId && VaultStore.getReservationById
            ? VaultStore.getReservationById(msg.reservationId)
            : null;
        var bookingLine = booking
            ? '<p class="message-link">Linked booking <strong>' + esc(booking.publicRef) + '</strong> · ' + esc(booking.status) + ' — <a href="reservations.php">open Reservations</a></p>'
            : '';

        detail.innerHTML = '<div class="message-detail">' +
            '<div class="message-detail-head">' +
            '<p class="message-ref">' + esc(msg.publicRef) + ' · ' + esc(msg.status) + (msg.starred ? ' · starred' : '') + '</p>' +
            '<h4>' + esc(msg.subject) + '</h4>' +
            '<p><strong>' + esc(msg.name) + '</strong><br>' +
            esc(msg.email || 'No email') + (msg.phone ? '<br>' + esc(msg.phone) : '') + '</p>' +
            '</div>' +
            '<p class="message-body">' + esc(msg.body) + '</p>' +
            '<p class="message-meta-line"><span class="status-pill pending">' + esc(msg.type) + '</span> ' +
            '<small>Prefers ' + esc(msg.replyMethod || 'Email') + ' · ' + VaultStore.timeAgo(msg.createdAt) + '</small></p>' +
            bookingLine +
            '<div class="message-actions">' +
            (mailto ? '<a class="manage-btn primary" href="' + mailto + '">Reply</a>' : '') +
            '<button type="button" class="manage-btn" data-star="' + msg.id + '">' + (msg.starred ? 'Unstar' : 'Star') + '</button>' +
            (msg.read ? '<button type="button" class="manage-btn" data-unread="' + msg.id + '">Mark unread</button>' : '') +
            '<button type="button" class="manage-btn" data-status="replied" data-id="' + msg.id + '">Mark replied</button>' +
            (msg.status === 'archived'
                ? '<button type="button" class="manage-btn" data-status="open" data-id="' + msg.id + '">Unarchive</button>'
                : '<button type="button" class="manage-btn" data-status="archived" data-id="' + msg.id + '">Archive</button>') +
            (msg.reservationId ? '' : '<button type="button" class="manage-btn primary" data-convert="' + msg.id + '">Create booking</button>') +
            '<button type="button" class="manage-btn danger" data-delete="' + msg.id + '">Delete</button>' +
            '</div></div>';

        detail.querySelectorAll('[data-star]').forEach(function (btn) {
            btn.addEventListener('click', function () { VaultStore.toggleMessageStar(btn.getAttribute('data-star')); });
        });
        detail.querySelectorAll('[data-unread]').forEach(function (btn) {
            btn.addEventListener('click', function () { VaultStore.markMessageUnread(btn.getAttribute('data-unread')); });
        });
        detail.querySelectorAll('[data-status]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                VaultStore.updateMessageStatus(btn.getAttribute('data-id'), btn.getAttribute('data-status'));
            });
        });
        detail.querySelectorAll('[data-convert]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var booking = VaultStore.convertMessageToReservation(btn.getAttribute('data-convert'));
                if (booking) showAlert('Booking ' + booking.publicRef + ' added to Reservations.', 'success');
            });
        });
        detail.querySelectorAll('[data-delete]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (!confirm('Delete this message?')) return;
                var gone = btn.getAttribute('data-delete');
                VaultStore.deleteMessage(gone);
                if (selectedId === gone) selectedId = null;
            });
        });
    }

    function render() {
        if (!window.VaultStore) return;
        renderStats();
        renderList();
        showDetail(selectedId);
        document.querySelectorAll('[data-msg-filter]').forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-msg-filter') === filter);
        });
    }

    document.querySelectorAll('[data-msg-filter]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            filter = btn.getAttribute('data-msg-filter') || 'all';
            render();
        });
    });

    var search = document.getElementById('inboxSearch');
    if (search) {
        search.addEventListener('input', function () {
            query = search.value.trim().toLowerCase();
            render();
        });
    }

    var markAll = document.getElementById('inboxMarkAll');
    if (markAll) {
        markAll.addEventListener('click', function () {
            VaultStore.markAllMessagesRead();
            showAlert('All open messages marked read.', 'success');
        });
    }

    VaultShell.init({ onReady: render });
    if (window.VaultStore && VaultStore.subscribe) VaultStore.subscribe(render);
})();
