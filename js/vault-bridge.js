(function (window) {
    'use strict';

    function inferMessageType(subject, body, inquiry) {
        var text = ((inquiry || '') + ' ' + (subject || '') + ' ' + (body || '')).toLowerCase();
        if (/event|birthday|party|celebration|private/.test(text)) return 'Event';
        if (/cater|office/.test(text)) return 'Catering';
        if (/outdoor|terrace/.test(text)) return 'Terrace';
        if (/table|reserv|book/.test(text)) return 'Table';
        if (/takeaway|take away|pickup|delivery/.test(text)) return 'Takeaway';
        return 'General';
    }

    function saveMessage(payload) {
        if (!window.VaultStore || !payload || !payload.name) return null;
        var type = payload.type || inferMessageType(payload.subject, payload.body, payload.inquiry);
        var created = VaultStore.addMessage({
            name: payload.name,
            email: payload.email || '',
            phone: payload.phone || '',
            subject: payload.subject || 'Website enquiry',
            body: payload.body || '',
            type: type,
            replyMethod: payload.replyMethod || 'Email',
            source: 'website'
        });
        if (!created) return null;

        if (/event|cater|takeaway|terrace|table/i.test(type) && VaultStore.convertMessageToReservation) {
            created.booking = VaultStore.convertMessageToReservation(created.id, { markHandled: false, source: 'website' });
        }
        return created;
    }

    function saveReservation(payload) {
        if (!window.VaultStore || !payload || !payload.name) return null;
        return VaultStore.addReservation({
            name: payload.name,
            email: payload.email || '',
            phone: payload.phone || '',
            datetime: payload.datetime || '',
            guests: payload.guests || 2,
            type: payload.type || 'Indoor table',
            notes: payload.notes || '',
            source: 'website'
        }) || null;
    }

    window.VaultBridge = {
        saveMessage: saveMessage,
        saveReservation: saveReservation,
        inferMessageType: inferMessageType,
        getSettings: function () { return window.VaultStore ? VaultStore.getSettings() : null; },
        updateSettings: function (partial) { return window.VaultStore ? VaultStore.updateSettings(partial) : null; },
        getMapsEmbedUrl: function () { return window.VaultStore ? VaultStore.getMapsEmbedUrl() : ''; },
        getUpcomingEvents: function (limit) { return window.VaultStore ? VaultStore.getUpcomingEvents(limit) : []; },
        getPublicEvents: function (limit) { return window.VaultStore ? VaultStore.getPublicEvents(limit) : []; },
        getFeaturedPortfolio: function (limit) { return window.VaultStore ? VaultStore.getFeaturedPortfolio(limit) : []; },
        getPublicPortfolio: function (limit) { return window.VaultStore ? VaultStore.getPublicPortfolio(limit) : []; },
        getMenuById: function (id) { return window.VaultStore ? VaultStore.getMenuById(id) : null; },
        getMenu: function () { return window.VaultStore ? VaultStore.all().menu : []; },
        lookupReservation: function (email, ref) { return window.VaultStore ? VaultStore.lookupReservation(email, ref) : null; },
        lookupMessage: function (email, ref) { return window.VaultStore ? VaultStore.lookupMessage(email, ref) : null; },
        getSeatAvailability: function () { return window.VaultStore ? VaultStore.getSeatAvailability() : null; }
    };
})(window);
