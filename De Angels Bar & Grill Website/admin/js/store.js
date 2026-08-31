(function (window) {
    'use strict';

    var STORE_KEY = 'deangels_vault_data';

    function uid() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    function load() {
        try {
            var raw = localStorage.getItem(STORE_KEY);
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (e) { /* ignore */ }
        return null;
    }

    function save(data) {
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
    }

    function seed() {
        return {
            menu: [
                { id: 'm1', category: 'Grills', name: 'De Angels Platter', price: 12000, description: 'Chicken, beef, sausage and kebabs for sharing', available: true, ordersTonight: 28 },
                { id: 'm2', category: 'Grills', name: 'Pepper Chicken', price: 6500, description: 'Whole quarter chicken, pepper-spiced and flame-grilled', available: true, ordersTonight: 22 },
                { id: 'm3', category: 'Grills', name: 'Catfish Barbecue', price: 4500, description: 'Flame-grilled catfish with pepper spice and house barbecue glaze', available: true, ordersTonight: 19 },
                { id: 'm4', category: 'Grills', name: 'Grilled Fish Special', price: 7500, description: 'Whole fish, lemon butter and herbs', available: true, ordersTonight: 0 },
                { id: 'm5', category: 'Grills', name: 'Peppered Asun', price: 5800, description: 'Spicy grilled goat', available: true, ordersTonight: 0 },
                { id: 'm6', category: 'Mains', name: 'Jollof Rice', price: 4800, description: 'Smoky tomato jollof, slow-cooked for deep flavour', available: true, ordersTonight: 17 },
                { id: 'm7', category: 'Mains', name: 'Angels Smash Burger', price: 4000, description: 'Double beef, cheddar and house sauce', available: true, ordersTonight: 14 },
                { id: 'm8', category: 'Drinks', name: 'Angel Sunset Cocktail', price: 3800, description: 'House citrus and rum blend', available: true, ordersTonight: 31 },
                { id: 'm9', category: 'Drinks', name: 'Ice-Cold Beers', price: 1500, description: 'Local and imported bottles', available: true, ordersTonight: 51 }
            ],
            messages: [
                { id: 'msg1', name: 'Amaka O.', email: 'amaka@email.com', phone: '', subject: 'Birthday terrace', body: 'Birthday terrace booking for 25 guests next Saturday. Can we get a private corner with small chops and mixed grill?', type: 'Event', read: false, createdAt: Date.now() - 720000 },
                { id: 'msg2', name: 'Tunde A.', email: 'tunde@email.com', phone: '08012345678', subject: 'Outdoor seating', body: 'Can I reserve outdoor seating for 4 this Friday at 8pm?', type: 'Table', read: false, createdAt: Date.now() - 3600000 },
                { id: 'msg3', name: 'Ibrahim S.', email: 'ibrahim@email.com', phone: '', subject: 'Catering enquiry', body: 'Catering enquiry for office lunch — 40 people in New Owerri.', type: 'Catering', read: true, createdAt: Date.now() - 10800000 }
            ],
            reservations: [
                { id: 'r1', name: 'Tunde A.', email: 'tunde@email.com', phone: '08012345678', datetime: '2026-08-22 20:00', guests: 4, type: 'Outdoor terrace', notes: 'Friday evening', status: 'pending', createdAt: Date.now() - 86400000 },
                { id: 'r2', name: 'Chioma N.', email: 'chioma@email.com', phone: '08098765432', datetime: '2026-08-23 19:30', guests: 6, type: 'Indoor table', notes: '', status: 'confirmed', createdAt: Date.now() - 172800000 },
                { id: 'r3', name: 'Office Group', email: 'hr@company.com', phone: '', datetime: '2026-08-24 13:00', guests: 10, type: 'Private gathering', notes: 'Team lunch', status: 'pending', createdAt: Date.now() - 43200000 }
            ],
            events: [
                { id: 'e1', title: "Amaka's Birthday Terrace", date: '2026-08-22', description: 'Private corner · grill & small chops menu', guests: 25 },
                { id: 'e2', title: 'Team Social — FinTech Co.', date: '2026-08-24', description: 'Outdoor long table · bar package', guests: 18 },
                { id: 'e3', title: 'Brand Activation Night', date: '2026-08-30', description: 'Full terrace · live grill station', guests: 60 }
            ],
            seats: [
                { id: 'T1', label: 'T1', zone: 'terrace', status: 'occupied' },
                { id: 'T2', label: 'T2', zone: 'terrace', status: 'occupied' },
                { id: 'T3', label: 'T3', zone: 'terrace', status: 'reserved' },
                { id: 'T4', label: 'T4', zone: 'terrace', status: 'open' },
                { id: 'T5', label: 'T5', zone: 'terrace', status: 'occupied' },
                { id: 'T6', label: 'T6', zone: 'terrace', status: 'open' },
                { id: 'T7', label: 'T7', zone: 'terrace', status: 'reserved' },
                { id: 'T8', label: 'T8', zone: 'terrace', status: 'occupied' },
                { id: 'I1', label: 'I1', zone: 'indoor', status: 'open' },
                { id: 'I2', label: 'I2', zone: 'indoor', status: 'occupied' },
                { id: 'I3', label: 'I3', zone: 'indoor', status: 'open' },
                { id: 'P1', label: 'P1', zone: 'private', status: 'reserved' }
            ],
            stats: {
                coversTonight: 47,
                barPours: 142,
                guestFlow: { incoming: 6, seated: 18, takeaway: 9 }
            },
            kitchen: [
                { name: 'Grill 1', load: 45 },
                { name: 'Grill 2', load: 72 },
                { name: 'Skewer Pit', load: 88 },
                { name: 'Fry', load: 65 },
                { name: 'Pass', load: 92 },
                { name: 'Rice', load: 58 },
                { name: 'Bar', load: 78 }
            ],
            portfolio: [
                { id: 'pf1', title: 'Birthday Terrace Takeover', category: 'Terrace Event', image: 'https://images.unsplash.com/photo-1530103862674-9f859bf35a8c?auto=format&fit=crop&w=800&q=80', description: 'Private corner setup with grill platters, small chops and cocktail service for 25 guests.', date: '2026-07-18', guests: 25, featured: true },
                { id: 'pf2', title: 'FinTech Team Social', category: 'Private Party', image: 'https://images.unsplash.com/photo-1519671482749-fd09fef7c882?auto=format&fit=crop&w=800&q=80', description: 'Long outdoor table, bar package and live grill station for a Friday team celebration.', date: '2026-07-05', guests: 18, featured: true },
                { id: 'pf3', title: 'Office Lunch Catering', category: 'Catering', image: 'https://images.unsplash.com/photo-1555931665-5a90aa7d6c3e?auto=format&fit=crop&w=800&q=80', description: 'Jollof, pepper chicken and snack boxes delivered across New Owerri for 40 staff.', date: '2026-06-22', guests: 40, featured: false },
                { id: 'pf4', title: 'Brand Activation Night', category: 'Brand Night', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80', description: 'Full terrace branding, live DJ and grill station for a product launch evening.', date: '2026-06-10', guests: 60, featured: true },
                { id: 'pf5', title: 'Golden Hour on the Terrace', category: 'Night Life', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80', description: 'Cocktails, charcoal grills and the terrace at sunset — a regular De Angels moment.', date: '2026-05-30', guests: 0, featured: false },
                { id: 'pf6', title: 'Engagement Dinner Setup', category: 'Private Party', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80', description: 'Intimate table for two with candles, curated menu and terrace views.', date: '2026-05-14', guests: 2, featured: false }
            ]
        };
    }

    function defaultPortfolio() {
        return seed().portfolio;
    }

    function init() {
        if (!load()) {
            save(seed());
        }
    }

    function all() {
        init();
        var data = load();
        if (data && !Array.isArray(data.portfolio)) {
            data.portfolio = defaultPortfolio();
            save(data);
        }
        return data;
    }

    function update(mutator) {
        var data = all();
        mutator(data);
        save(data);
        return data;
    }

    function timeAgo(ts) {
        var diff = Date.now() - ts;
        var mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return mins + ' min ago';
        var hrs = Math.floor(mins / 60);
        if (hrs < 24) return hrs + ' hr ago';
        return Math.floor(hrs / 24) + ' days ago';
    }

    function formatDate(dateStr) {
        var d = new Date(dateStr);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return {
            day: d.getDate(),
            month: months[d.getMonth()],
            full: d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
        };
    }

    function addMessage(payload) {
        return update(function (data) {
            data.messages.unshift({
                id: uid(),
                name: payload.name,
                email: payload.email || '',
                phone: payload.phone || '',
                subject: payload.subject || 'General enquiry',
                body: payload.body || '',
                type: payload.type || 'General',
                read: false,
                createdAt: Date.now()
            });
        });
    }

    function syncGuestFlow(data) {
        var pending = data.reservations.filter(function (r) { return r.status === 'pending'; }).length;
        var occupied = data.seats.filter(function (s) { return s.status === 'occupied'; }).length;
        var reserved = data.seats.filter(function (s) { return s.status === 'reserved'; }).length;
        data.stats.guestFlow.incoming = pending + reserved;
        data.stats.guestFlow.seated = occupied;
        data.stats.coversTonight = occupied + pending + reserved + data.stats.guestFlow.takeaway;
    }

    function addReservation(payload) {
        return update(function (data) {
            data.reservations.unshift({
                id: uid(),
                name: payload.name,
                email: payload.email || '',
                phone: payload.phone || '',
                datetime: payload.datetime || '',
                guests: payload.guests || 2,
                type: payload.type || 'Indoor table',
                notes: payload.notes || '',
                status: 'pending',
                createdAt: Date.now()
            });
            syncGuestFlow(data);
        });
    }

    function addEvent(payload) {
        return update(function (data) {
            data.events.push({
                id: uid(),
                title: payload.title,
                date: payload.date,
                description: payload.description || '',
                guests: payload.guests || 0
            });
            data.events.sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
        });
    }

    function markMessageRead(id) {
        return update(function (data) {
            data.messages.forEach(function (m) {
                if (m.id === id) m.read = true;
            });
        });
    }

    function deleteMessage(id) {
        return update(function (data) {
            data.messages = data.messages.filter(function (m) { return m.id !== id; });
        });
    }

    function updateReservationStatus(id, status) {
        return update(function (data) {
            data.reservations.forEach(function (r) {
                if (r.id === id) r.status = status;
            });
            syncGuestFlow(data);
        });
    }

    function deleteReservation(id) {
        return update(function (data) {
            data.reservations = data.reservations.filter(function (r) { return r.id !== id; });
            syncGuestFlow(data);
        });
    }

    function toggleMenuAvailability(id) {
        return update(function (data) {
            data.menu.forEach(function (m) {
                if (m.id === id) m.available = !m.available;
            });
        });
    }

    function updateMenuItem(id, fields) {
        return update(function (data) {
            data.menu.forEach(function (m) {
                if (m.id === id) {
                    Object.keys(fields).forEach(function (k) { m[k] = fields[k]; });
                }
            });
        });
    }

    function deleteEvent(id) {
        return update(function (data) {
            data.events = data.events.filter(function (e) { return e.id !== id; });
        });
    }

    function addPortfolioItem(payload) {
        return update(function (data) {
            if (!Array.isArray(data.portfolio)) data.portfolio = [];
            data.portfolio.unshift({
                id: uid(),
                title: payload.title,
                category: payload.category || 'Terrace Event',
                image: payload.image || '',
                description: payload.description || '',
                date: payload.date || '',
                guests: payload.guests || 0,
                featured: !!payload.featured
            });
        });
    }

    function deletePortfolioItem(id) {
        return update(function (data) {
            data.portfolio = (data.portfolio || []).filter(function (p) { return p.id !== id; });
        });
    }

    function togglePortfolioFeatured(id) {
        return update(function (data) {
            (data.portfolio || []).forEach(function (p) {
                if (p.id === id) p.featured = !p.featured;
            });
        });
    }

    function toggleSeatStatus(id) {
        var cycle = ['open', 'reserved', 'occupied'];
        return update(function (data) {
            data.seats.forEach(function (s) {
                if (s.id === id) {
                    var idx = cycle.indexOf(s.status);
                    s.status = cycle[(idx + 1) % cycle.length];
                }
            });
            syncGuestFlow(data);
        });
    }

    function getDashboardStats() {
        var data = all();
        var unread = data.messages.filter(function (m) { return !m.read; }).length;
        var pendingRes = data.reservations.filter(function (r) { return r.status === 'pending'; }).length;
        var seated = data.seats.filter(function (s) { return s.status === 'occupied'; }).length;
        var nextEvent = data.events[0] || null;
        var eightySix = data.menu.filter(function (m) { return !m.available; });

        return {
            coversTonight: data.stats.coversTonight,
            unreadMessages: unread,
            totalMessages: data.messages.length,
            eventCount: data.events.length,
            pendingReservations: pendingRes,
            seated: seated,
            nextEvent: nextEvent,
            eightySix: eightySix,
            topDishes: data.menu.slice().sort(function (a, b) { return b.ordersTonight - a.ordersTonight; }).slice(0, 4),
            guestFlow: data.stats.guestFlow,
            barPours: data.stats.barPours,
            kitchen: data.kitchen
        };
    }

    init();

    window.VaultStore = {
        all: all,
        save: save,
        addMessage: addMessage,
        addReservation: addReservation,
        addEvent: addEvent,
        markMessageRead: markMessageRead,
        deleteMessage: deleteMessage,
        updateReservationStatus: updateReservationStatus,
        deleteReservation: deleteReservation,
        toggleMenuAvailability: toggleMenuAvailability,
        updateMenuItem: updateMenuItem,
        deleteEvent: deleteEvent,
        addPortfolioItem: addPortfolioItem,
        deletePortfolioItem: deletePortfolioItem,
        togglePortfolioFeatured: togglePortfolioFeatured,
        toggleSeatStatus: toggleSeatStatus,
        getDashboardStats: getDashboardStats,
        timeAgo: timeAgo,
        formatDate: formatDate
    };
})(window);
