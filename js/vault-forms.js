(function () {
    'use strict';

    function esc(str) {
        var d = document.createElement('div');
        d.textContent = str == null ? '' : String(str);
        return d.innerHTML;
    }

    function mapInquiryType(val) {
        if (!val) return 'General';
        if (/event|private/i.test(val)) return 'Event';
        if (/cater/i.test(val)) return 'Catering';
        if (/outdoor|terrace/i.test(val)) return 'Terrace';
        if (/table|reserv/i.test(val)) return 'Table';
        if (/takeaway|delivery/i.test(val)) return 'Takeaway';
        return 'General';
    }

    function showFormNotice(form, message, ok) {
        var box = form.parentNode.querySelector('.booking-success') || document.getElementById('bookingSuccess');
        if (box) {
            box.hidden = false;
            box.className = 'booking-success' + (ok ? '' : ' error');
            box.innerHTML = message;
            box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return;
        }
        alert(message.replace(/<[^>]+>/g, ' '));
    }

    function wireContactForm(form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!window.VaultBridge) return;

            var name = ((form.querySelector('#name') || {}).value || '').trim();
            var email = ((form.querySelector('#email') || {}).value || '').trim();
            var message = ((form.querySelector('#message') || {}).value || '').trim();

            if (!name || !email || !message) {
                showFormNotice(form, 'Please enter your name, email and message.', false);
                return;
            }

            var inquiryEl = form.querySelector('#inquiry');
            var subjectEl = form.querySelector('#subject');
            var methodEl = form.querySelector('#contact-method');
            var inquiry = inquiryEl ? inquiryEl.value : '';
            var subject = subjectEl && subjectEl.value.trim()
                ? subjectEl.value.trim()
                : (inquiry || 'Website enquiry');

            var created = VaultBridge.saveMessage({
                name: name,
                email: email,
                phone: (form.querySelector('#phone') || {}).value || '',
                subject: subject,
                body: message,
                inquiry: inquiry,
                type: mapInquiryType(inquiry),
                replyMethod: methodEl ? methodEl.value : 'Email'
            });

            if (created) {
                var extra = created.booking
                    ? ' A booking <em>' + esc(created.booking.publicRef) + '</em> was also added to the reservations queue.'
                    : '';
                showFormNotice(form,
                    '<strong>Message received.</strong> Your reference is <em>' + esc(created.publicRef) + '</em>. Status: new.' + extra + ' Use this code to check your enquiry.',
                    true);
                form.reset();
            } else {
                showFormNotice(form, 'We could not save your message right now. Please try again or call us directly.', false);
            }
        });
    }

    function wireBookingForm(form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!window.VaultBridge) return;

            var name = ((form.querySelector('#name') || {}).value || '').trim();
            var email = ((form.querySelector('#email') || {}).value || '').trim();
            if (!name) {
                showFormNotice(form, 'Please enter your name to confirm a reservation.', false);
                return;
            }

            var guestsEl = form.querySelector('#select1');
            var guests = guestsEl ? parseInt(guestsEl.value, 10) || 2 : 2;
            var type = (form.querySelector('#select2') || {}).value || 'Indoor table';

            var created = VaultBridge.saveReservation({
                name: name,
                email: email,
                phone: (form.querySelector('#phone') || {}).value || '',
                datetime: (form.querySelector('#datetime') || {}).value || '',
                guests: guests,
                type: type,
                notes: (form.querySelector('#message') || {}).value || ''
            });

            if (created) {
                var ref = esc(created.publicRef || created.id);
                showFormNotice(form,
                    '<strong>Booking received.</strong> Your reference is <em>' + ref + '</em>. Status: pending. Keep this code to check your reservation — the host team will confirm it on the Command Deck.',
                    true);
                form.reset();
                if (guestsEl) guestsEl.selectedIndex = 0;
            } else {
                showFormNotice(form, 'We could not save your reservation right now. Please try again or call us directly.', false);
            }
        });
    }

    function wireTypeCards() {
        var select = document.querySelector('[data-vault-booking] #select2');
        if (!select) return;

        document.querySelectorAll('[data-vault-book-type]').forEach(function (card) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', function () {
                var type = card.getAttribute('data-vault-book-type');
                var options = Array.prototype.slice.call(select.options);
                var match = options.filter(function (opt) { return opt.value === type || opt.text === type; })[0];
                if (match) select.value = match.value;
                document.querySelectorAll('[data-vault-book-type]').forEach(function (el) {
                    el.classList.toggle('is-selected', el === card);
                });
                var form = document.querySelector('[data-vault-booking]');
                if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    }

    function wireLookup() {
        var form = document.getElementById('vaultLookupForm');
        var result = document.getElementById('vaultLookupResult');
        if (!form || !result) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!window.VaultBridge) return;

            var email = (document.getElementById('lookupEmail') || {}).value || '';
            var ref = (document.getElementById('lookupRef') || {}).value || '';
            var booking = VaultBridge.lookupReservation(email, ref);

            if (!booking) {
                result.hidden = false;
                result.className = 'booking-lookup-result empty';
                result.innerHTML = '<p class="mb-0">No booking found for those details. Check the reference from your confirmation, or send a message and the host team will help.</p>';
                return;
            }

            var when = window.VaultStore && VaultStore.formatDateTime
                ? VaultStore.formatDateTime(booking.datetime)
                : (booking.datetime || 'Time TBC');

            result.hidden = false;
            result.className = 'booking-lookup-result status-' + booking.status;
            result.innerHTML =
                '<p class="lookup-kicker">Reservation ' + esc(booking.publicRef || booking.id) + '</p>' +
                '<h4 class="mb-2">' + esc(booking.name) + '</h4>' +
                '<p class="mb-1"><strong>Status:</strong> ' + esc(booking.status) + '</p>' +
                '<p class="mb-1"><strong>When:</strong> ' + esc(when) + '</p>' +
                '<p class="mb-1"><strong>Visit:</strong> ' + esc(booking.type || 'Table') + ' · ' + esc(booking.guests) + ' guests' + (booking.seatId ? ' · seat ' + esc(booking.seatId) : '') + '</p>' +
                (booking.notes ? '<p class="mb-0"><strong>Notes:</strong> ' + esc(booking.notes) + '</p>' : '');
        });
    }

    function wireMessageLookup() {
        var form = document.getElementById('vaultMessageLookupForm');
        var result = document.getElementById('vaultMessageLookupResult');
        if (!form || !result) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!window.VaultBridge || !VaultBridge.lookupMessage) return;

            var email = (document.getElementById('msgLookupEmail') || {}).value || '';
            var ref = (document.getElementById('msgLookupRef') || {}).value || '';
            var msg = VaultBridge.lookupMessage(email, ref);

            if (!msg) {
                result.hidden = false;
                result.className = 'booking-lookup-result empty';
                result.innerHTML = '<p class="mb-0">No message found. Check the MG- reference from your confirmation, or send another note and the host team will help.</p>';
                return;
            }

            var statusClass = msg.status === 'replied'
                ? 'confirmed'
                : (msg.status === 'archived' ? 'cancelled' : 'pending');

            result.hidden = false;
            result.className = 'booking-lookup-result status-' + statusClass;
            result.innerHTML =
                '<p class="lookup-kicker">Message ' + esc(msg.publicRef || msg.id) + '</p>' +
                '<h4 class="mb-2">' + esc(msg.subject) + '</h4>' +
                '<p class="mb-1"><strong>Status:</strong> ' + esc(msg.status) + (msg.read ? '' : ' · unread') + '</p>' +
                '<p class="mb-1"><strong>From:</strong> ' + esc(msg.name) + (msg.email ? ' · ' + esc(msg.email) : '') + '</p>' +
                '<p class="mb-1"><strong>Type:</strong> ' + esc(msg.type) + ' · prefers ' + esc(msg.replyMethod || 'Email') + '</p>' +
                '<p class="mb-0">' + esc(msg.body) + '</p>';
        });
    }

    function applyBookingQuery() {
        var select = document.querySelector('[data-vault-booking] #select2');
        if (!select) return;
        var params = new URLSearchParams(window.location.search);
        var type = params.get('type');
        if (!type) return;
        var options = Array.prototype.slice.call(select.options);
        var match = options.filter(function (opt) { return opt.value === type || opt.text === type; })[0];
        if (match) {
            select.value = match.value;
            document.querySelectorAll('[data-vault-book-type]').forEach(function (el) {
                el.classList.toggle('is-selected', el.getAttribute('data-vault-book-type') === match.value);
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var contactForm = document.getElementById('contactForm');
        var bookingForms = document.querySelectorAll('[data-vault-booking]');

        if (contactForm) wireContactForm(contactForm);
        bookingForms.forEach(wireBookingForm);
        wireTypeCards();
        applyBookingQuery();
        wireLookup();
        wireMessageLookup();
    });
})();
