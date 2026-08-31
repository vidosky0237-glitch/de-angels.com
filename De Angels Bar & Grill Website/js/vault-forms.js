(function () {
    'use strict';

    function mapInquiryType(val) {
        if (!val) return 'General';
        if (/event|private/i.test(val)) return 'Event';
        if (/cater/i.test(val)) return 'Catering';
        if (/table|terrace|reserv/i.test(val)) return 'Table';
        if (/takeaway|delivery/i.test(val)) return 'Takeaway';
        return 'General';
    }

    function wireContactForm(form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!window.VaultBridge) return;

            var inquiryEl = form.querySelector('#inquiry');
            var subjectEl = form.querySelector('#subject');
            var subject = subjectEl && subjectEl.value.trim()
                ? subjectEl.value.trim()
                : (inquiryEl ? inquiryEl.value : 'Website enquiry');

            var saved = VaultBridge.saveMessage({
                name: form.querySelector('#name').value.trim(),
                email: form.querySelector('#email').value.trim(),
                phone: (form.querySelector('#phone') || {}).value || '',
                subject: subject,
                body: form.querySelector('#message').value.trim(),
                type: mapInquiryType(inquiryEl ? inquiryEl.value : '')
            });

            if (saved) {
                alert('Thank you! Your message has been received. We will reply soon.');
                form.reset();
            } else {
                alert('We could not save your message right now. Please try again or call us directly.');
            }
        });
    }

    function wireBookingForm(form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!window.VaultBridge) return;

            var guestsEl = form.querySelector('#select1');
            var guests = guestsEl ? parseInt(guestsEl.value, 10) || 2 : 2;

            var saved = VaultBridge.saveReservation({
                name: form.querySelector('#name').value.trim(),
                email: form.querySelector('#email').value.trim(),
                phone: (form.querySelector('#phone') || {}).value || '',
                datetime: (form.querySelector('#datetime') || {}).value || '',
                guests: guests,
                type: (form.querySelector('#select2') || {}).value || 'Indoor table',
                notes: (form.querySelector('#message') || {}).value || ''
            });

            if (saved) {
                alert('Reservation received! We will confirm your booking shortly.');
                form.reset();
            } else {
                alert('We could not save your reservation right now. Please try again or call us directly.');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var contactForm = document.getElementById('contactForm');
        var bookingForms = document.querySelectorAll('[data-vault-booking]');

        if (contactForm) wireContactForm(contactForm);
        bookingForms.forEach(wireBookingForm);
    });
})();
