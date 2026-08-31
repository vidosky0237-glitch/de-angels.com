(function () {
    'use strict';

    function esc(s) {
        var d = document.createElement('div');
        d.textContent = s == null ? '' : String(s);
        return d.innerHTML;
    }

    var selectedId = null;

    function renderList() {
        var data = VaultStore.all();
        var list = document.getElementById('messageList');
        if (!list) return;

        if (!data.messages.length) {
            list.innerHTML = '<div class="empty-state"><i class="fa fa-inbox d-block"></i>No messages yet. Submissions from the contact form appear here.</div>';
            return;
        }

        list.innerHTML = data.messages.map(function (m) {
            return '<div class="manage-card message-card' + (m.read ? '' : ' unread') + '" data-id="' + m.id + '" style="cursor:pointer;border-left:3px solid ' + (m.read ? 'transparent' : 'var(--vault-primary)') + '">' +
                '<div class="d-flex justify-content-between align-items-start gap-3">' +
                '<div><strong>' + esc(m.name) + '</strong> <span class="status-pill pending">' + esc(m.type) + '</span>' +
                '<p class="mb-1 mt-2" style="color:var(--vault-muted)">' + esc(m.subject) + '</p>' +
                '<small style="color:rgba(246,243,238,0.35)">' + VaultStore.timeAgo(m.createdAt) + ' · ' + esc(m.email) + '</small></div>' +
                '<button class="manage-btn danger" data-delete="' + m.id + '"><i class="fa fa-trash"></i></button></div></div>';
        }).join('');

        list.querySelectorAll('.message-card').forEach(function (card) {
            card.addEventListener('click', function (e) {
                if (e.target.closest('[data-delete]')) return;
                selectedId = card.getAttribute('data-id');
                VaultStore.markMessageRead(selectedId);
                showDetail(selectedId);
                renderList();
            });
        });

        list.querySelectorAll('[data-delete]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                if (confirm('Delete this message?')) {
                    VaultStore.deleteMessage(btn.getAttribute('data-delete'));
                    if (selectedId === btn.getAttribute('data-delete')) {
                        selectedId = null;
                        document.getElementById('messageDetail').innerHTML = '';
                    }
                    renderList();
                }
            });
        });
    }

    function showDetail(id) {
        var detail = document.getElementById('messageDetail');
        var msg = VaultStore.all().messages.find(function (m) { return m.id === id; });
        if (!detail || !msg) return;

        detail.innerHTML = '<div class="message-detail">' +
            '<h4>' + esc(msg.subject) + '</h4>' +
            '<p><strong>' + esc(msg.name) + '</strong> · ' + esc(msg.email) + (msg.phone ? ' · ' + esc(msg.phone) : '') + '</p>' +
            '<p>' + esc(msg.body) + '</p>' +
            '<span class="status-pill pending">' + esc(msg.type) + '</span> ' +
            '<small style="color:var(--vault-muted);margin-left:8px">' + VaultStore.timeAgo(msg.createdAt) + '</small></div>';
    }

    VaultShell.init({ onReady: renderList });
})();
