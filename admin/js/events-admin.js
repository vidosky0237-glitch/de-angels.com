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
        var el = document.getElementById('eventAlert');
        if (!el) return;
        el.textContent = message;
        el.className = 'vault-alert show ' + (type || 'success');
        el.style.display = 'block';
        setTimeout(function () {
            el.style.display = 'none';
            el.className = 'vault-alert';
        }, 3200);
    }

    function matchesFilter(e) {
        if (filter === 'all') return true;
        if (filter === 'published') return !!e.published && e.status !== 'cancelled' && e.status !== 'completed';
        if (filter === 'unpublished') return !e.published;
        if (filter === 'upcoming') {
            if (e.status === 'cancelled' || e.status === 'completed') return false;
            var d = new Date(e.date);
            if (isNaN(d.getTime())) return true;
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            return d >= today;
        }
        return e.status === filter;
    }

    function matchesQuery(e) {
        if (!query) return true;
        var hay = [e.title, e.description, e.type, e.publicRef, e.contactName, e.contactEmail].join(' ').toLowerCase();
        return hay.indexOf(query) !== -1;
    }

    function statusClass(status) {
        if (status === 'confirmed') return 'confirmed';
        if (status === 'cancelled') return 'cancelled';
        if (status === 'completed') return 'seated';
        return 'pending';
    }

    function fillForm(item) {
        document.getElementById('eTitle').value = item ? item.title : '';
        document.getElementById('eDate').value = item ? item.date : '';
        document.getElementById('eTime').value = item && item.time ? item.time : '19:00';
        document.getElementById('eGuests').value = item ? item.guests : 20;
        document.getElementById('eType').value = item ? item.type : 'Private gathering';
        document.getElementById('eContact').value = item ? item.contactName : '';
        document.getElementById('eEmail').value = item ? item.contactEmail : '';
        document.getElementById('eDesc').value = item ? item.description : '';
        document.getElementById('ePublished').checked = item ? !!item.published : true;
        document.getElementById('eventFormTitle').textContent = item ? 'Edit ' + item.title : 'Schedule New Event';
        document.getElementById('eventSubmitBtn').textContent = item ? 'Save Changes' : 'Add Event';
        document.getElementById('eventCancelEdit').hidden = !item;
    }

    function renderStats() {
        var stats = VaultStore.getEventStats();
        var map = {
            statUpcoming: stats.upcoming,
            statPublished: stats.published,
            statConfirmed: stats.confirmed,
            statGuests: stats.guests,
            statMonth: stats.thisMonth,
            statCancelled: stats.cancelled
        };
        Object.keys(map).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.textContent = map[id];
        });
    }

    function renderImport() {
        var box = document.getElementById('bookingImport');
        if (!box || !VaultStore.getBookingsWithoutEvent) return;
        var rows = VaultStore.getBookingsWithoutEvent();
        if (!rows.length) {
            box.hidden = true;
            box.innerHTML = '';
            return;
        }
        box.hidden = false;
        box.innerHTML = '<h3 style="font-family:Oswald;margin:0 0 12px;font-size:1.05rem">Private bookings not yet scheduled</h3>' +
            '<p style="color:var(--vault-muted);margin:0 0 12px;font-size:13px">Website private gatherings and catering sit in Reservations. Pull one onto Event Horizon to publish it.</p>' +
            rows.map(function (r) {
                return '<div class="pending-row" style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:8px">' +
                    '<div><strong>' + esc(r.name) + '</strong><br><small style="color:var(--vault-muted)">' +
                    esc(r.publicRef) + ' · ' + esc(r.type) + ' · ' + esc(r.guests) + ' guests</small></div>' +
                    '<button type="button" class="manage-btn primary" data-import="' + r.id + '">Schedule as event</button></div>';
            }).join('');
        box.querySelectorAll('[data-import]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var created = VaultStore.createEventFromReservation(btn.getAttribute('data-import'));
                if (created) showAlert(created.title + ' added. Publish it to show on the website.', 'success');
            });
        });
    }

    function renderList() {
        var list = document.getElementById('eventList');
        if (!list) return;

        var rows = VaultStore.all().events.filter(matchesFilter).filter(matchesQuery);

        if (!rows.length) {
            list.innerHTML = '<div class="empty-state"><i class="fa fa-calendar d-block"></i>No events in this view. Add one and it can appear on the website.</div>';
            return;
        }

        list.innerHTML = rows.map(function (e) {
            var d = VaultStore.formatDate(e.date);
            var booking = e.reservationId && VaultStore.getReservationById
                ? VaultStore.getReservationById(e.reservationId)
                : null;
            return '<article class="manage-card">' +
                '<div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">' +
                '<div class="d-flex gap-3 align-items-start">' +
                '<div class="event-date"><strong>' + d.day + '</strong><span>' + d.month + '</span></div>' +
                '<div><p class="message-ref" style="margin:0 0 4px">' + esc(e.publicRef) + (e.time ? ' · ' + esc(e.time) : '') + '</p>' +
                '<h4 style="font-family:Oswald;margin:0 0 4px">' + esc(e.title) + '</h4>' +
                '<p style="color:var(--vault-muted);margin:0 0 6px">' + esc(e.description) + '</p>' +
                '<small style="color:var(--vault-gold)">' + (e.guests ? e.guests + ' guests · ' : '') + d.full +
                (e.contactName ? ' · ' + esc(e.contactName) : '') + '</small>' +
                (booking ? '<p class="message-link" style="margin:8px 0 0">Linked booking ' + esc(booking.publicRef) + '</p>' : '') +
                '</div></div>' +
                '<div style="text-align:right">' +
                '<span class="status-pill ' + statusClass(e.status) + '">' + esc(e.status) + '</span> ' +
                '<span class="status-pill ' + (e.published ? 'live' : 'off') + '">' + (e.published ? 'On site' : 'Private') + '</span>' +
                '<div class="message-actions" style="justify-content:flex-end;margin-top:10px">' +
                '<button type="button" class="manage-btn" data-edit="' + e.id + '">Edit</button>' +
                '<button type="button" class="manage-btn" data-publish="' + e.id + '">' + (e.published ? 'Unpublish' : 'Publish') + '</button>' +
                (e.status === 'upcoming' ? '<button type="button" class="manage-btn primary" data-status="confirmed" data-id="' + e.id + '">Confirm</button>' : '') +
                (e.status === 'confirmed' || e.status === 'upcoming' ? '<button type="button" class="manage-btn" data-status="completed" data-id="' + e.id + '">Complete</button>' : '') +
                (e.status !== 'cancelled' && e.status !== 'completed' ? '<button type="button" class="manage-btn" data-status="cancelled" data-id="' + e.id + '">Cancel</button>' : '') +
                (e.reservationId ? '' : '<button type="button" class="manage-btn primary" data-book="' + e.id + '">Create booking</button>') +
                '<button type="button" class="manage-btn danger" data-delete="' + e.id + '">Remove</button>' +
                '</div></div></div></article>';
        }).join('');

        list.querySelectorAll('[data-edit]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var item = VaultStore.getEventById(btn.getAttribute('data-edit'));
                if (!item) return;
                editId = item.id;
                fillForm(item);
                document.getElementById('addEventForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
        list.querySelectorAll('[data-publish]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var item = VaultStore.getEventById(btn.getAttribute('data-publish'));
                VaultStore.toggleEventPublished(btn.getAttribute('data-publish'));
                if (item) showAlert(item.published ? 'Hidden from the public site.' : 'Now live on the website.', 'success');
            });
        });
        list.querySelectorAll('[data-status]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                VaultStore.updateEventStatus(btn.getAttribute('data-id'), btn.getAttribute('data-status'));
            });
        });
        list.querySelectorAll('[data-book]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var booking = VaultStore.createReservationFromEvent(btn.getAttribute('data-book'));
                if (booking) showAlert('Booking ' + booking.publicRef + ' added to Reservations.', 'success');
            });
        });
        list.querySelectorAll('[data-delete]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (!confirm('Remove this event from the calendar and website?')) return;
                VaultStore.deleteEvent(btn.getAttribute('data-delete'));
                showAlert('Event removed.', 'success');
            });
        });
    }

    function render() {
        if (!window.VaultStore) return;
        renderStats();
        renderImport();
        renderList();
        document.querySelectorAll('[data-event-filter]').forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-event-filter') === filter);
        });
    }

    var form = document.getElementById('addEventForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var payload = {
                title: (document.getElementById('eTitle').value || '').trim(),
                date: document.getElementById('eDate').value,
                time: document.getElementById('eTime').value,
                guests: document.getElementById('eGuests').value,
                type: document.getElementById('eType').value,
                contactName: document.getElementById('eContact').value,
                contactEmail: document.getElementById('eEmail').value,
                description: document.getElementById('eDesc').value,
                published: document.getElementById('ePublished').checked
            };
            if (!payload.title || !payload.date) {
                showAlert('Enter a title and date.', 'error');
                return;
            }
            if (editId) {
                VaultStore.updateEvent(editId, payload);
                showAlert(payload.title + ' updated on the calendar.', 'success');
                editId = '';
            } else {
                var created = VaultStore.addEvent(payload);
                if (created) showAlert(created.title + (created.published ? ' is live on the website.' : ' saved as private.'), 'success');
            }
            fillForm(null);
            form.reset();
            document.getElementById('ePublished').checked = true;
            document.getElementById('eTime').value = '19:00';
            document.getElementById('eType').value = 'Private gathering';
        });
    }

    var cancel = document.getElementById('eventCancelEdit');
    if (cancel) {
        cancel.addEventListener('click', function () {
            editId = '';
            fillForm(null);
            if (form) form.reset();
            document.getElementById('ePublished').checked = true;
            document.getElementById('eTime').value = '19:00';
        });
    }

    document.querySelectorAll('[data-event-filter]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            filter = btn.getAttribute('data-event-filter') || 'all';
            render();
        });
    });

    var search = document.getElementById('eventSearch');
    if (search) {
        search.addEventListener('input', function () {
            query = search.value.trim().toLowerCase();
            render();
        });
    }

    VaultShell.init({ onReady: render });
    if (window.VaultStore && VaultStore.subscribe) VaultStore.subscribe(render);
})();
