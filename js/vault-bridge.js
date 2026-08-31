(function (window) {
    'use strict';

    function inferMessageType(subject, body) {
        var text = ((subject || '') + ' ' + (body || '')).toLowerCase();
        if (/event|birthday|party|celebration/.test(text)) return 'Event';
        if (/cater|office|delivery/.test(text)) return 'Catering';
        if (/table|reserv|terrace|book/.test(text)) return 'Table';
        if (/takeaway|take away|pickup/.test(text)) return 'Takeaway';
        return 'General';
    }

    function saveMessage(payload) {
        if (!window.VaultStore) return false;
        VaultStore.addMessage({
            name: payload.name,
            email: payload.email || '',
            phone: payload.phone || '',
            subject: payload.subject || 'Website enquiry',
            body: payload.body || '',
            type: payload.type || inferMessageType(payload.subject, payload.body)
        });
        return true;
    }

    function saveReservation(payload) {
        if (!window.VaultStore) return false;
        VaultStore.addReservation({
            name: payload.name,
            email: payload.email || '',
            phone: payload.phone || '',
            datetime: payload.datetime || '',
            guests: payload.guests || 2,
            type: payload.type || 'Indoor table',
            notes: payload.notes || ''
        });
        return true;
    }

    window.VaultBridge = {
        saveMessage: saveMessage,
        saveReservation: saveReservation
    };
})(window);
