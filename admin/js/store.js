(function (window) {
    'use strict';

    var STORE_KEY = 'deangels_vault_data';
    var SETTINGS_KEY = 'deangels_vault_settings';
    var CHANGE_EVENT = 'deangels-vault-change';
    var channel = null;

    try {
        channel = new BroadcastChannel('deangels_vault');
    } catch (e) { /* older browsers */ }

    function uid() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    function makePublicRef(id, prefix) {
        var raw = String(id || uid()).replace(/[^a-z0-9]/gi, '').toUpperCase();
        if (raw.length < 4) raw = (uid() + raw).toUpperCase();
        return (prefix || 'DA-') + raw.slice(-4);
    }

    function notify() {
        try {
            window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key: STORE_KEY } }));
        } catch (e) { /* ignore */ }
        if (channel) {
            try { channel.postMessage({ t: Date.now() }); } catch (e2) { /* ignore */ }
        }
    }

    function subscribe(fn) {
        if (typeof fn !== 'function') return function () {};

        function onChange() { fn(); }
        function onStorage(e) {
            if (e.key === STORE_KEY || e.key === SETTINGS_KEY) fn();
        }

        window.addEventListener(CHANGE_EVENT, onChange);
        if (channel) {
            channel.addEventListener('message', onChange);
        } else {
            window.addEventListener('storage', onStorage);
        }

        return function () {
            window.removeEventListener(CHANGE_EVENT, onChange);
            window.removeEventListener('storage', onStorage);
            if (channel) channel.removeEventListener('message', onChange);
        };
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

    function save(data, silent) {
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
        if (!silent) notify();
    }

    function defaultSettings() {
        return {
            name: 'De Angels Bar & Grills',
            tagline: 'Premium Meals. Great Grills. Amazing Moments.',
            phone: '',
            whatsapp: '',
            address: 'Plot F16, Housing Area B, New Owerri',
            hours: 'Monday – Sunday · 10:00 AM – 5:00 AM',
            email: 'hello@deangels.com',
            mapsUrl: 'https://maps.google.com/maps?q=Plot%20F16%20Housing%20Area%20B%20New%20Owerri',
            instagram: 'https://instagram.com',
            facebook: 'https://facebook.com',
            twitter: '',
            youtube: 'https://youtube.com',
            alertReservations: true,
            alertMessages: true,
            alertEvents: true
        };
    }

    function normalizeSettings(raw) {
        var base = defaultSettings();
        if (!raw || typeof raw !== 'object') return base;
        var next = Object.assign({}, base, raw);
        ['name', 'tagline', 'phone', 'whatsapp', 'address', 'hours', 'email', 'mapsUrl', 'instagram', 'facebook', 'twitter', 'youtube'].forEach(function (key) {
            next[key] = next[key] == null ? base[key] : String(next[key]).trim();
        });
        if (!next.name) next.name = base.name;
        next.alertReservations = !!next.alertReservations;
        next.alertMessages = !!next.alertMessages;
        next.alertEvents = !!next.alertEvents;
        return next;
    }

    function getSettings() {
        try {
            var raw = localStorage.getItem(SETTINGS_KEY);
            return normalizeSettings(raw ? JSON.parse(raw) : null);
        } catch (e) {
            return defaultSettings();
        }
    }

    function updateSettings(partial) {
        var next = normalizeSettings(Object.assign({}, getSettings(), partial || {}));
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        notify();
        return next;
    }

    function saveSettings(data) {
        return updateSettings(data);
    }

    function resetSettings() {
        localStorage.removeItem(SETTINGS_KEY);
        notify();
        return getSettings();
    }

    function resetVaultData(options) {
        options = options || {};
        save(seed());
        if (options.includeSettings) resetSettings();
        return all();
    }

    function shouldAlert(kind) {
        var s = getSettings();
        if (kind === 'reservation') return !!s.alertReservations;
        if (kind === 'message') return !!s.alertMessages;
        if (kind === 'event') return !!s.alertEvents;
        return false;
    }

    function getSettingsStats() {
        var s = getSettings();
        return {
            name: s.name,
            email: s.email,
            hours: s.hours,
            phone: s.phone,
            socials: [s.instagram, s.facebook, s.twitter, s.youtube].filter(Boolean).length,
            alertsOn: [s.alertReservations, s.alertMessages, s.alertEvents].filter(Boolean).length
        };
    }

    function getMapsEmbedUrl() {
        var s = getSettings();
        var src = s.mapsUrl || '';
        if (!src && s.address) src = 'https://maps.google.com/maps?q=' + encodeURIComponent(s.address);
        if (!src) return '';
        if (/output=embed/.test(src)) return src;
        if (/google\.com\/maps/.test(src)) {
            return src + (src.indexOf('?') >= 0 ? '&' : '?') + 'output=embed';
        }
        return 'https://maps.google.com/maps?q=' + encodeURIComponent(src) + '&output=embed';
    }

    function resolveAsset(path) {
        if (!path) return '';
        var clean = String(path).replace(/^\.\.\//, '');
        var inAdmin = /\/admin(\/|$)/i.test(window.location.pathname);
        if (inAdmin && clean.indexOf('img/') === 0) return '../' + clean;
        return clean;
    }

    function seed() {
        return {
            menu: [
                { id: 'm1', category: 'Grills', name: 'De Angels Platter', price: 12000, description: 'Chicken, beef, sausage and kebabs for sharing', available: true, ordersTonight: 28, image: 'img/de-angels-platter.png', source: 'house' },
                { id: 'm2', category: 'Grills', name: 'Pepper Chicken', price: 6500, description: 'Whole quarter chicken, pepper-spiced and flame-grilled', available: true, ordersTonight: 22, image: 'img/grill-night.png', source: 'house' },
                { id: 'm3', category: 'Grills', name: 'Catfish Barbecue', price: 4500, description: 'Flame-grilled catfish with pepper spice and house barbecue glaze', available: true, ordersTonight: 19, image: 'img/barbecue-catfish.png', source: 'house' },
                { id: 'm4', category: 'Grills', name: 'Grilled Fish Special', price: 7500, description: 'Whole fish, lemon butter and herbs', available: true, ordersTonight: 0, image: 'img/barbecue-croaker-fish.png', source: 'house' },
                { id: 'm5', category: 'Grills', name: 'Peppered Asun', price: 5800, description: 'Spicy grilled goat', available: true, ordersTonight: 0, image: 'img/pepper-goat-meat.png', source: 'house' },
                { id: 'm10', category: 'Grills', name: 'Pepper Turkey', price: 8500, description: 'Spicy pepper-rubbed turkey with smoky char and house sauce', available: true, ordersTonight: 11, image: 'img/pepper-turkey.png', source: 'house' },
                { id: 'm11', category: 'Grills', name: 'Crispy Prawn', price: 5000, description: 'Golden fried prawns, lightly seasoned and served crisp', available: true, ordersTonight: 8, image: 'img/crispy-prawn.png', source: 'house' },
                { id: 'm12', category: 'Grills', name: 'Peppered Snail', price: 3800, description: 'Snails in rich pepper sauce with peppers and onions', available: true, ordersTonight: 6, image: 'img/pepper-snail.png', source: 'house' },
                { id: 'm6', category: 'Mains', name: 'Jollof Rice', price: 4800, description: 'Smoky tomato jollof, slow-cooked for deep flavour', available: true, ordersTonight: 17, image: 'img/jollof-rice.png', source: 'house' },
                { id: 'm13', category: 'Mains', name: 'Fried Rice', price: 4200, description: 'Wok-tossed rice with vegetables, egg and your choice of protein', available: true, ordersTonight: 9, image: 'img/fried-rice.png', source: 'house' },
                { id: 'm14', category: 'Mains', name: 'Native Rice', price: 4500, description: 'Ofada-style native rice served with rich, peppery native stew', available: true, ordersTonight: 7, image: 'img/native-rice.png', source: 'house' },
                { id: 'm15', category: 'Mains', name: 'White Rice & Moimoi', price: 3800, description: 'Steamed white rice paired with soft, savoury moimoi', available: true, ordersTonight: 5, image: 'img/coconut-rice-fish.png', source: 'house' },
                { id: 'm16', category: 'Mains', name: 'Ikwokrikwo', price: 5000, description: 'Traditional rice dish with palm oil, ugba and smoked fish', available: true, ordersTonight: 4, image: 'img/ikwokrikwo.png', source: 'house' },
                { id: 'm17', category: 'Mains', name: 'Goat Meat Pepper Soup', price: 5500, description: 'Spicy broth with native spices — a house favourite', available: true, ordersTonight: 12, image: 'img/goat-pepper-soup.png', source: 'house' },
                { id: 'm18', category: 'Mains', name: 'Vegetable Soup', price: 5500, description: 'Fresh leafy greens in a light broth with assorted protein', available: true, ordersTonight: 3, image: 'img/vegetable-soup.png', source: 'house' },
                { id: 'm19', category: 'Mains', name: 'Nsala Soup', price: 5500, description: 'Light white soup with catfish, utazi and native spices', available: true, ordersTonight: 2, image: 'img/nsala-soup.jpg', source: 'house' },
                { id: 'm20', category: 'Mains', name: 'Okro Soup', price: 5500, description: 'Thick okra stew with choice of protein and native seasoning', available: true, ordersTonight: 3, image: 'img/okro-fisherman-soup.png', source: 'house' },
                { id: 'm21', category: 'Mains', name: 'Bitter Leaf Soup', price: 5500, description: 'Traditional onugbu soup with assorted meat, fish and leafy greens', available: true, ordersTonight: 2, image: 'img/vegetable-soup.png', source: 'house' },
                { id: 'm22', category: 'Mains', name: 'Ogbono Soup', price: 5500, description: 'Draw soup with ground ogbono seeds — rich and silky', available: true, ordersTonight: 4, image: 'img/egusi-soup.png', source: 'house' },
                { id: 'm23', category: 'Mains', name: 'Ofe Owerre', price: 5500, description: 'Igbo-style mixed soup with palm oil, ugu and assorted protein', available: true, ordersTonight: 3, image: 'img/native-soup.png', source: 'house' },
                { id: 'm7', category: 'Fast Food', name: 'Angels Smash Burger', price: 4000, description: 'Double beef, cheddar and house sauce', available: true, ordersTonight: 14, image: 'img/menu-3.jpg', source: 'house' },
                { id: 'm24', category: 'Fast Food', name: 'Meat Pie', price: 1200, description: 'Flaky golden pastry filled with seasoned minced beef', available: true, ordersTonight: 16, image: 'img/meat-pie.png', source: 'house' },
                { id: 'm25', category: 'Fast Food', name: 'Chicken Pie', price: 1400, description: 'Buttery crust with tender shredded chicken filling', available: true, ordersTonight: 10, image: 'img/chicken-pie.png', source: 'house' },
                { id: 'm26', category: 'Fast Food', name: 'Doughnut', price: 800, description: 'Soft, sweet doughnuts — perfect with coffee or as a treat', available: true, ordersTonight: 18, image: 'img/doughnut.png', source: 'house' },
                { id: 'm27', category: 'Fast Food', name: 'Fish Pie', price: 1400, description: 'Savory pastry packed with seasoned fish filling', available: true, ordersTonight: 6, image: 'img/fish-pie.png', source: 'house' },
                { id: 'm28', category: 'Fast Food', name: 'Fish Roll', price: 1200, description: 'Crisp rolled pastry with spiced fish — a classic snack', available: true, ordersTonight: 8, image: 'img/fish-roll.png', source: 'house' },
                { id: 'm29', category: 'Fast Food', name: 'Sausage Roll', price: 1200, description: 'Golden pastry wrapped around seasoned sausage', available: true, ordersTonight: 9, image: 'img/sausage-roll.png', source: 'house' },
                { id: 'm30', category: 'Fast Food', name: 'Crispy Prawn', price: 4500, description: 'Snack portion of golden fried prawns', available: true, ordersTonight: 7, image: 'img/crispy-prawn.png', source: 'house' },
                { id: 'm38', category: 'Fast Food', name: 'Chocolate Cake', price: 2500, description: 'Rich chocolate sponge for sharing or a sweet finish', available: true, ordersTonight: 5, image: 'img/chocolate-cake.png', source: 'house' },
                { id: 'm39', category: 'Fast Food', name: 'Fruit Cake', price: 3000, description: 'Freshly baked sponge topped with seasonal figs and berries', available: true, ordersTonight: 4, image: 'img/fruit-cake.png', source: 'house' },
                { id: 'm8', category: 'Drinks', name: 'Angel Sunset Cocktail', price: 3800, description: 'House citrus and rum blend', available: true, ordersTonight: 31, image: 'img/menu-4.jpg', source: 'house' },
                { id: 'm9', category: 'Drinks', name: 'Ice-Cold Beers', price: 1500, description: 'Local and imported bottles', available: true, ordersTonight: 51, image: 'img/chilled-sodas-malt-water.png', source: 'house' },
                { id: 'm31', category: 'Drinks', name: 'Fresh Fruit Mocktail', price: 2500, description: 'Pineapple, watermelon and mint', available: true, ordersTonight: 14, image: 'img/smoothie.png', source: 'house' },
                { id: 'm32', category: 'Drinks', name: 'Smoothie', price: 2500, description: 'Blended fruit smoothie — thick, chilled and refreshing', available: true, ordersTonight: 11, image: 'img/smoothie.png', source: 'house' },
                { id: 'm33', category: 'Drinks', name: 'Fresh Cucumber Juice', price: 1800, description: 'Cool, light cucumber blend — fresh and hydrating', available: true, ordersTonight: 8, image: 'img/cucumber-juice.png', source: 'house' },
                { id: 'm34', category: 'Drinks', name: 'Pineapple Juice', price: 2000, description: 'Freshly squeezed pineapple — sweet, tangy and ice-cold', available: true, ordersTonight: 13, image: 'img/pineapple-juice.png', source: 'house' },
                { id: 'm35', category: 'Drinks', name: 'Long Island', price: 4500, description: 'Classic Long Island iced tea — bold, chilled and bar-poured', available: true, ordersTonight: 9, image: 'img/chilled-sodas-malt-water.png', source: 'house' },
                { id: 'm36', category: 'Drinks', name: 'Mixed Fruits', price: 2200, description: 'Seasonal fruit cup — strawberries, oranges and fresh berries', available: true, ordersTonight: 6, image: 'img/mixed-fruits.png', source: 'house' },
                { id: 'm37', category: 'Drinks', name: 'Fresh Juice Bar', price: 2000, description: 'Pressed fruits, mocktails and blends from the bar', available: true, ordersTonight: 10, image: 'img/pineapple-juice.png', source: 'house' }
            ],
            messages: [
                { id: 'msg1', publicRef: 'MG-AMAK', name: 'Amaka O.', email: 'amaka@email.com', phone: '', subject: 'Birthday terrace', body: 'Birthday terrace booking for 25 guests next Saturday. Can we get a private corner with small chops and mixed grill?', type: 'Event', read: false, status: 'new', starred: true, replyMethod: 'Email', source: 'website', reservationId: '', createdAt: Date.now() - 720000 },
                { id: 'msg2', publicRef: 'MG-TUND', name: 'Tunde A.', email: 'tunde@email.com', phone: '08012345678', subject: 'Outdoor seating', body: 'Can I reserve outdoor seating for 4 this Friday at 8pm?', type: 'Table', read: false, status: 'new', starred: false, replyMethod: 'WhatsApp', source: 'website', reservationId: '', createdAt: Date.now() - 3600000 },
                { id: 'msg3', publicRef: 'MG-IBRA', name: 'Ibrahim S.', email: 'ibrahim@email.com', phone: '', subject: 'Catering enquiry', body: 'Catering enquiry for office lunch — 40 people in New Owerri.', type: 'Catering', read: true, status: 'replied', starred: false, replyMethod: 'Email', source: 'website', reservationId: '', createdAt: Date.now() - 10800000 }
            ],
            reservations: [
                { id: 'r1', publicRef: 'DA-TUND', name: 'Tunde A.', email: 'tunde@email.com', phone: '08012345678', datetime: '2026-09-21T20:00', guests: 4, type: 'Outdoor terrace', notes: 'Friday evening', status: 'pending', source: 'website', seatId: 'T3', createdAt: Date.now() - 86400000 },
                { id: 'r2', publicRef: 'DA-CHIO', name: 'Chioma N.', email: 'chioma@email.com', phone: '08098765432', datetime: '2026-09-21T19:30', guests: 6, type: 'Indoor table', notes: '', status: 'confirmed', source: 'website', seatId: 'I2', createdAt: Date.now() - 172800000 },
                { id: 'r3', publicRef: 'DA-OFFC', name: 'Office Group', email: 'hr@company.com', phone: '', datetime: '2026-09-22T13:00', guests: 10, type: 'Private gathering', notes: 'Team lunch', status: 'pending', source: 'website', seatId: 'P1', createdAt: Date.now() - 43200000 }
            ],
            events: [
                { id: 'e1', publicRef: 'EV-AMAK', title: "Amaka's Birthday Terrace", date: '2026-10-03', time: '19:00', description: 'Private corner · grill & small chops menu', guests: 25, type: 'Birthday', status: 'confirmed', published: true, contactName: 'Amaka O.', contactEmail: 'amaka@email.com', contactPhone: '', source: 'admin', reservationId: '', createdAt: Date.now() - 86400000 },
                { id: 'e2', publicRef: 'EV-TEAM', title: 'Team Social — FinTech Co.', date: '2026-10-11', time: '18:30', description: 'Outdoor long table · bar package', guests: 18, type: 'Team social', status: 'upcoming', published: true, contactName: '', contactEmail: 'hr@company.com', contactPhone: '', source: 'admin', reservationId: 'r3', createdAt: Date.now() - 43200000 },
                { id: 'e3', publicRef: 'EV-BRND', title: 'Brand Activation Night', date: '2026-10-18', time: '20:00', description: 'Full terrace · live grill station', guests: 60, type: 'Brand night', status: 'upcoming', published: true, contactName: '', contactEmail: '', contactPhone: '', source: 'admin', reservationId: '', createdAt: Date.now() - 21600000 }
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
                { id: 'pf1', title: 'Birthday Terrace Takeover', category: 'Terrace Event', image: 'img/outdoor-terrace-gallery.png', description: 'Private corner setup with grill platters, small chops and cocktail service for 25 guests.', date: '2026-07-18', guests: 25, featured: true, published: true, source: 'house', eventId: 'e1', createdAt: Date.now() - 86400000 * 60 },
                { id: 'pf2', title: 'FinTech Team Social', category: 'Private Party', image: 'img/outdoor-terrace.png', description: 'Long outdoor table, bar package and live grill station for a Friday team celebration.', date: '2026-07-05', guests: 18, featured: true, published: true, source: 'house', eventId: 'e2', createdAt: Date.now() - 86400000 * 70 },
                { id: 'pf3', title: 'Office Lunch Catering', category: 'Catering', image: 'img/grill-night.png', description: 'Jollof, pepper chicken and snack boxes delivered across New Owerri for 40 staff.', date: '2026-06-22', guests: 40, featured: false, published: true, source: 'house', eventId: '', createdAt: Date.now() - 86400000 * 80 },
                { id: 'pf4', title: 'Brand Activation Night', category: 'Brand Night', image: 'img/outdoor-terrace-about.png', description: 'Full terrace branding, live DJ and grill station for a product launch evening.', date: '2026-06-10', guests: 60, featured: true, published: true, source: 'house', eventId: 'e3', createdAt: Date.now() - 86400000 * 90 },
                { id: 'pf5', title: 'Golden Hour on the Terrace', category: 'Night Life', image: 'img/menu-4.jpg', description: 'Cocktails, charcoal grills and the terrace at sunset — a regular De Angels moment.', date: '2026-05-30', guests: 0, featured: false, published: true, source: 'house', eventId: '', createdAt: Date.now() - 86400000 * 100 },
                { id: 'pf6', title: 'Engagement Dinner Setup', category: 'Private Party', image: 'img/de-angels-platter.png', description: 'Intimate table for two with candles, curated menu and terrace views.', date: '2026-05-14', guests: 2, featured: false, published: true, source: 'house', eventId: '', createdAt: Date.now() - 86400000 * 110 }
            ]
        };
    }

    function defaultPortfolio() {
        return seed().portfolio;
    }

    function ensureShape(data) {
        var base = seed();
        if (!data || typeof data !== 'object') return base;
        if (!Array.isArray(data.menu)) {
            data.menu = base.menu;
        } else {
            var have = {};
            data.menu.forEach(function (m) { have[m.id] = true; });
            base.menu.forEach(function (item) {
                if (!have[item.id]) data.menu.push(item);
            });
            data.menu.forEach(function (m) {
                if (typeof m.available !== 'boolean') m.available = true;
                if (typeof m.price !== 'number') m.price = parseInt(m.price, 10) || 0;
                if (typeof m.ordersTonight !== 'number') m.ordersTonight = parseInt(m.ordersTonight, 10) || 0;
                if (!m.category) m.category = 'Grills';
                if (!m.source) m.source = 'house';
                if (!m.image) m.image = '';
                if (m.id === 'm7' && m.category === 'Mains') m.category = 'Fast Food';
            });
        }
        if (!Array.isArray(data.messages)) data.messages = base.messages;
        data.messages.forEach(function (m) {
            if (!m.publicRef) m.publicRef = makePublicRef(m.id, 'MG-');
            if (!m.status) m.status = m.read ? 'open' : 'new';
            if (typeof m.starred !== 'boolean') m.starred = false;
            if (!m.replyMethod) m.replyMethod = 'Email';
            if (!m.source) m.source = 'website';
            if (!m.reservationId) m.reservationId = '';
        });
        if (!Array.isArray(data.reservations)) data.reservations = base.reservations;
        data.reservations.forEach(function (r) {
            if (!r.publicRef) r.publicRef = makePublicRef(r.id);
            if (!r.source) r.source = 'admin';
            if (!r.status) r.status = 'pending';
            if (!r.seatId) r.seatId = '';
        });
        if (!Array.isArray(data.events)) data.events = base.events;
        data.events.forEach(normalizeEvent);
        if (!Array.isArray(data.seats)) data.seats = base.seats;
        if (!Array.isArray(data.kitchen)) data.kitchen = base.kitchen;
        if (!Array.isArray(data.portfolio)) {
            data.portfolio = defaultPortfolio();
        } else {
            var havePf = {};
            data.portfolio.forEach(function (p) { havePf[p.id] = true; });
            defaultPortfolio().forEach(function (item) {
                if (!havePf[item.id]) data.portfolio.push(item);
            });
            data.portfolio.forEach(normalizePortfolio);
        }
        if (!data.stats) data.stats = base.stats;
        if (!data.stats.guestFlow) data.stats.guestFlow = base.stats.guestFlow;
        return data;
    }

    function init() {
        if (!load()) {
            save(seed(), true);
        }
    }

    function all() {
        init();
        var data = load();
        var snapshot = JSON.stringify(data);
        data = ensureShape(data);
        if (JSON.stringify(data) !== snapshot) save(data, true);
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
        if (isNaN(d.getTime())) {
            return { day: '—', month: '', full: dateStr || 'Date TBC' };
        }
        return {
            day: d.getDate(),
            month: months[d.getMonth()],
            full: d.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
        };
    }

    function addMessage(payload) {
        var created = null;
        update(function (data) {
            var id = uid();
            created = {
                id: id,
                publicRef: makePublicRef(id, 'MG-'),
                name: (payload.name || '').trim(),
                email: (payload.email || '').trim(),
                phone: (payload.phone || '').trim(),
                subject: payload.subject || 'Website enquiry',
                body: payload.body || '',
                type: payload.type || 'General',
                read: false,
                status: 'new',
                starred: false,
                replyMethod: payload.replyMethod || 'Email',
                source: payload.source || 'website',
                reservationId: payload.reservationId || '',
                createdAt: Date.now()
            };
            data.messages.unshift(created);
        });
        return created;
    }

    function getMessageById(id) {
        return all().messages.filter(function (m) { return m.id === id; })[0] || null;
    }

    function lookupMessage(email, ref) {
        var mail = (email || '').trim().toLowerCase();
        var code = (ref || '').trim().toLowerCase().replace(/^mg-/, '');
        if (!mail && !code) return null;
        var matches = all().messages.filter(function (m) {
            var emailOk = !mail || (m.email || '').toLowerCase() === mail;
            var refOk = !code || (m.publicRef || '').toLowerCase().replace(/^mg-/, '') === code || (m.id || '').toLowerCase() === code;
            return emailOk && refOk;
        });
        if (!matches.length && mail) {
            matches = all().messages.filter(function (m) {
                return (m.email || '').toLowerCase() === mail;
            });
        }
        matches.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
        return matches[0] || null;
    }

    function getMessageStats() {
        var list = all().messages;
        return {
            total: list.length,
            unread: list.filter(function (m) { return !m.read && m.status !== 'archived'; }).length,
            starred: list.filter(function (m) { return m.starred; }).length,
            event: list.filter(function (m) { return m.type === 'Event'; }).length,
            table: list.filter(function (m) { return m.type === 'Table' || m.type === 'Terrace'; }).length,
            catering: list.filter(function (m) { return m.type === 'Catering'; }).length,
            takeaway: list.filter(function (m) { return m.type === 'Takeaway'; }).length,
            replied: list.filter(function (m) { return m.status === 'replied'; }).length
        };
    }

    function reservationTypeFromMessage(type) {
        var text = (type || '').toLowerCase();
        if (/event/.test(text)) return 'Private gathering';
        if (/cater/.test(text)) return 'Catering enquiry';
        if (/takeaway/.test(text)) return 'Takeaway / delivery';
        if (/terrace/.test(text)) return 'Outdoor terrace';
        if (/table/.test(text)) return 'Indoor table';
        return 'Indoor table';
    }

    function guestsFromMessage(msg) {
        var match = String((msg && msg.body) || '').match(/(\d+)\s*(guest|people|pax|persons)/i);
        return match ? parseInt(match[1], 10) : 2;
    }

    function convertMessageToReservation(id, options) {
        options = options || {};
        var msg = getMessageById(id);
        if (!msg) return null;
        if (msg.reservationId) return getReservationById(msg.reservationId);
        var created = addReservation({
            name: msg.name,
            email: msg.email,
            phone: msg.phone,
            datetime: '',
            guests: guestsFromMessage(msg),
            type: reservationTypeFromMessage(msg.type),
            notes: (msg.subject ? msg.subject + ' — ' : '') + (msg.body || ''),
            source: options.source || 'inbox'
        });
        if (created) {
            update(function (data) {
                data.messages.forEach(function (m) {
                    if (m.id !== id) return;
                    m.reservationId = created.id;
                    if (options.markHandled === false) return;
                    m.read = true;
                    if (m.status === 'new') m.status = 'open';
                });
            });
        }
        return created;
    }

    function syncGuestFlow(data) {
        var pending = data.reservations.filter(function (r) { return r.status === 'pending'; }).length;
        var occupied = data.seats.filter(function (s) { return s.status === 'occupied'; }).length;
        var reserved = data.seats.filter(function (s) { return s.status === 'reserved'; }).length;
        data.stats.guestFlow.incoming = pending + reserved;
        data.stats.guestFlow.seated = occupied;
        data.stats.coversTonight = occupied + pending + reserved + data.stats.guestFlow.takeaway;
    }

    function isTakeawayType(type) {
        return /takeaway|delivery|cater/.test((type || '').toLowerCase());
    }

    function zoneForType(type) {
        var text = (type || '').toLowerCase();
        if (/terrace|outdoor/.test(text)) return 'terrace';
        if (/private/.test(text)) return 'private';
        return 'indoor';
    }

    function findOpenSeat(data, type) {
        var zone = zoneForType(type);
        return data.seats.filter(function (s) { return s.zone === zone && s.status === 'open'; })[0]
            || data.seats.filter(function (s) { return s.status === 'open'; })[0]
            || null;
    }

    function seatById(data, seatId) {
        if (!seatId) return null;
        return data.seats.filter(function (s) { return s.id === seatId; })[0] || null;
    }

    function setSeatStatus(data, seatId, status) {
        var seat = seatById(data, seatId);
        if (seat) seat.status = status;
        return seat;
    }

    function addReservation(payload) {
        var created = null;
        update(function (data) {
            var type = payload.type || 'Indoor table';
            var id = uid();
            var seat = null;
            if (!isTakeawayType(type)) {
                seat = findOpenSeat(data, type);
                if (seat) seat.status = 'reserved';
            }
            created = {
                id: id,
                publicRef: makePublicRef(id),
                name: (payload.name || '').trim(),
                email: (payload.email || '').trim(),
                phone: (payload.phone || '').trim(),
                datetime: payload.datetime || '',
                guests: payload.guests || 2,
                type: type,
                notes: payload.notes || '',
                status: payload.status || 'pending',
                createdAt: Date.now(),
                source: payload.source || 'admin',
                seatId: seat ? seat.id : ''
            };
            data.reservations.unshift(created);
            if (isTakeawayType(type)) {
                data.stats.guestFlow.takeaway += 1;
            }
            syncGuestFlow(data);
        });
        return created;
    }

    function getReservationById(id) {
        return all().reservations.filter(function (r) { return r.id === id; })[0] || null;
    }

    function findGuestReservations(query) {
        var q = (query || '').trim().toLowerCase();
        if (!q) return [];
        return all().reservations.filter(function (r) {
            var ref = (r.publicRef || '').toLowerCase();
            var email = (r.email || '').toLowerCase();
            var name = (r.name || '').toLowerCase();
            var phone = (r.phone || '').replace(/\s+/g, '');
            return ref === q || ref.replace('da-', '') === q.replace('da-', '') || email === q || name === q || phone === q.replace(/\s+/g, '');
        }).sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
    }

    function lookupReservation(email, ref) {
        var mail = (email || '').trim().toLowerCase();
        var code = (ref || '').trim().toLowerCase().replace(/^da-/, '');
        if (!mail && !code) return null;
        var matches = all().reservations.filter(function (r) {
            var emailOk = !mail || (r.email || '').toLowerCase() === mail;
            var refOk = !code || (r.publicRef || '').toLowerCase().replace(/^da-/, '') === code || (r.id || '').toLowerCase() === code;
            return emailOk && refOk;
        });
        if (!matches.length && mail) {
            matches = all().reservations.filter(function (r) {
                return (r.email || '').toLowerCase() === mail;
            });
        }
        matches.sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
        return matches[0] || null;
    }

    function updateReservationStatus(id, status) {
        return update(function (data) {
            data.reservations.forEach(function (r) {
                if (r.id !== id) return;
                r.status = status;
                if (status === 'cancelled') {
                    setSeatStatus(data, r.seatId, 'open');
                } else if (status === 'seated') {
                    if (!r.seatId) {
                        var seat = findOpenSeat(data, r.type);
                        if (seat) r.seatId = seat.id;
                    }
                    setSeatStatus(data, r.seatId, 'occupied');
                } else if (status === 'confirmed' || status === 'pending') {
                    if (!r.seatId && !isTakeawayType(r.type)) {
                        var next = findOpenSeat(data, r.type);
                        if (next) r.seatId = next.id;
                    }
                    setSeatStatus(data, r.seatId, 'reserved');
                }
            });
            syncGuestFlow(data);
        });
    }

    function deleteReservation(id) {
        return update(function (data) {
            var target = data.reservations.filter(function (r) { return r.id === id; })[0];
            if (target && target.seatId && target.status !== 'cancelled') {
                setSeatStatus(data, target.seatId, 'open');
            }
            data.reservations = data.reservations.filter(function (r) { return r.id !== id; });
            syncGuestFlow(data);
        });
    }

    function getReservationStats() {
        var data = all();
        var list = data.reservations;
        var today = new Date().toISOString().slice(0, 10);
        var tonight = list.filter(function (r) {
            var dt = String(r.datetime || '');
            return dt.indexOf(today) === 0 || dt.indexOf(today.split('-').reverse().join('/')) !== -1;
        });
        return {
            total: list.length,
            pending: list.filter(function (r) { return r.status === 'pending'; }).length,
            confirmed: list.filter(function (r) { return r.status === 'confirmed'; }).length,
            seated: list.filter(function (r) { return r.status === 'seated'; }).length,
            cancelled: list.filter(function (r) { return r.status === 'cancelled'; }).length,
            website: list.filter(function (r) { return r.source === 'website'; }).length,
            tonight: tonight.length,
            covers: list.filter(function (r) { return r.status !== 'cancelled'; }).reduce(function (sum, r) { return sum + (parseInt(r.guests, 10) || 0); }, 0)
        };
    }

    function getSeatAvailability() {
        var data = all();
        function tally(zone) {
            var seats = data.seats.filter(function (s) { return !zone || s.zone === zone; });
            return {
                total: seats.length,
                open: seats.filter(function (s) { return s.status === 'open'; }).length,
                reserved: seats.filter(function (s) { return s.status === 'reserved'; }).length,
                occupied: seats.filter(function (s) { return s.status === 'occupied'; }).length
            };
        }
        return {
            all: tally(),
            terrace: tally('terrace'),
            indoor: tally('indoor'),
            private: tally('private')
        };
    }

    function formatDateTime(value) {
        if (!value) return 'Time TBC';
        var d = new Date(value);
        if (isNaN(d.getTime())) return String(value);
        return d.toLocaleString('en-NG', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function normalizeEvent(e) {
        if (!e || typeof e !== 'object') return e;
        if (!e.publicRef) e.publicRef = makePublicRef(e.id, 'EV-');
        if (!e.type) e.type = 'Private gathering';
        if (!e.status) e.status = 'upcoming';
        if (typeof e.published !== 'boolean') e.published = true;
        if (!e.time) e.time = '';
        if (!e.source) e.source = 'admin';
        if (!e.contactName) e.contactName = '';
        if (!e.contactEmail) e.contactEmail = '';
        if (!e.contactPhone) e.contactPhone = '';
        if (!e.reservationId) e.reservationId = '';
        if (!e.createdAt) e.createdAt = Date.now();
        e.guests = parseInt(e.guests, 10) || 0;
        return e;
    }

    function sortEvents(list) {
        return list.sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
    }

    function isUpcomingEvent(e) {
        if (!e || e.status === 'cancelled' || e.status === 'completed') return false;
        var d = new Date(e.date);
        if (isNaN(d.getTime())) return true;
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        return d >= today;
    }

    function addEvent(payload) {
        var created = null;
        if (!payload || !(payload.title || '').trim()) return null;
        update(function (data) {
            var id = uid();
            created = normalizeEvent({
                id: id,
                publicRef: makePublicRef(id, 'EV-'),
                title: (payload.title || '').trim(),
                date: payload.date || '',
                time: payload.time || '',
                description: payload.description || '',
                guests: parseInt(payload.guests, 10) || 0,
                type: payload.type || 'Private gathering',
                status: payload.status || 'upcoming',
                published: payload.published !== false,
                contactName: payload.contactName || '',
                contactEmail: payload.contactEmail || '',
                contactPhone: payload.contactPhone || '',
                source: payload.source || 'admin',
                reservationId: payload.reservationId || '',
                createdAt: Date.now()
            });
            data.events.push(created);
            sortEvents(data.events);
        });
        return created;
    }

    function getEventById(id) {
        return all().events.filter(function (e) { return e.id === id; })[0] || null;
    }

    function updateEvent(id, fields) {
        return update(function (data) {
            data.events.forEach(function (e) {
                if (e.id !== id) return;
                Object.keys(fields || {}).forEach(function (k) { e[k] = fields[k]; });
                normalizeEvent(e);
            });
            sortEvents(data.events);
        });
    }

    function updateEventStatus(id, status) {
        return update(function (data) {
            data.events.forEach(function (e) {
                if (e.id !== id) return;
                e.status = status;
                if (status === 'cancelled' || status === 'completed') e.published = false;
            });
        });
    }

    function toggleEventPublished(id) {
        return update(function (data) {
            data.events.forEach(function (e) {
                if (e.id === id) e.published = !e.published;
            });
        });
    }

    function getUpcomingEvents(limit, options) {
        options = options || {};
        var cap = limit || 4;
        var list = all().events.filter(function (e) {
            if (options.publicOnly && !e.published) return false;
            return isUpcomingEvent(e);
        });
        sortEvents(list);
        return list.slice(0, cap);
    }

    function getPublicEvents(limit) {
        return getUpcomingEvents(limit || 3, { publicOnly: true });
    }

    function getEventStats() {
        var list = all().events;
        var upcoming = list.filter(isUpcomingEvent);
        var month = new Date().toISOString().slice(0, 7);
        return {
            total: list.length,
            upcoming: upcoming.length,
            published: list.filter(function (e) { return e.published && isUpcomingEvent(e); }).length,
            confirmed: list.filter(function (e) { return e.status === 'confirmed'; }).length,
            completed: list.filter(function (e) { return e.status === 'completed'; }).length,
            cancelled: list.filter(function (e) { return e.status === 'cancelled'; }).length,
            guests: upcoming.reduce(function (sum, e) { return sum + (parseInt(e.guests, 10) || 0); }, 0),
            thisMonth: list.filter(function (e) { return String(e.date || '').indexOf(month) === 0; }).length
        };
    }

    function getBookingsWithoutEvent() {
        var used = {};
        all().events.forEach(function (e) {
            if (e.reservationId) used[e.reservationId] = true;
        });
        return all().reservations.filter(function (r) {
            if (used[r.id] || r.status === 'cancelled') return false;
            return /private|event|cater|gathering/i.test(r.type || '');
        });
    }

    function createEventFromReservation(id) {
        var booking = getReservationById(id);
        if (!booking) return null;
        var existing = all().events.filter(function (e) { return e.reservationId === id; })[0];
        if (existing) return existing;
        var date = String(booking.datetime || '').slice(0, 10);
        var time = String(booking.datetime || '').length > 11 ? String(booking.datetime).slice(11, 16) : '';
        return addEvent({
            title: booking.name + (booking.type ? ' — ' + booking.type : ''),
            date: date,
            time: time,
            description: booking.notes || booking.type || '',
            guests: booking.guests,
            type: /cater/i.test(booking.type || '') ? 'Catering' : (/brand/i.test(booking.type || '') ? 'Brand night' : 'Private gathering'),
            status: booking.status === 'confirmed' ? 'confirmed' : 'upcoming',
            published: false,
            contactName: booking.name,
            contactEmail: booking.email,
            contactPhone: booking.phone,
            source: 'booking',
            reservationId: booking.id
        });
    }

    function createReservationFromEvent(id) {
        var event = getEventById(id);
        if (!event) return null;
        if (event.reservationId) return getReservationById(event.reservationId);
        var datetime = event.date ? (event.date + (event.time ? 'T' + event.time : '')) : '';
        var created = addReservation({
            name: event.contactName || event.title,
            email: event.contactEmail || '',
            phone: event.contactPhone || '',
            datetime: datetime,
            guests: event.guests || 10,
            type: 'Private gathering',
            notes: (event.publicRef ? event.publicRef + ' — ' : '') + (event.description || event.title),
            source: 'admin',
            status: event.status === 'confirmed' ? 'confirmed' : 'pending'
        });
        if (created) {
            update(function (data) {
                data.events.forEach(function (e) {
                    if (e.id === id) e.reservationId = created.id;
                });
            });
        }
        return created;
    }

    function markMessageRead(id) {
        return update(function (data) {
            data.messages.forEach(function (m) {
                if (m.id !== id) return;
                m.read = true;
                if (m.status === 'new') m.status = 'open';
            });
        });
    }

    function markMessageUnread(id) {
        return update(function (data) {
            data.messages.forEach(function (m) {
                if (m.id !== id) return;
                m.read = false;
                if (m.status === 'open') m.status = 'new';
            });
        });
    }

    function markAllMessagesRead() {
        return update(function (data) {
            data.messages.forEach(function (m) {
                if (m.status === 'archived') return;
                m.read = true;
                if (m.status === 'new') m.status = 'open';
            });
        });
    }

    function toggleMessageStar(id) {
        return update(function (data) {
            data.messages.forEach(function (m) {
                if (m.id === id) m.starred = !m.starred;
            });
        });
    }

    function updateMessageStatus(id, status) {
        return update(function (data) {
            data.messages.forEach(function (m) {
                if (m.id !== id) return;
                m.status = status;
                if (status === 'replied' || status === 'archived' || status === 'open') m.read = true;
                if (status === 'new') m.read = false;
            });
        });
    }

    function deleteMessage(id) {
        return update(function (data) {
            data.messages = data.messages.filter(function (m) { return m.id !== id; });
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

    function defaultMenuImage(category) {
        if (category === 'Mains') return 'img/jollof-rice.png';
        if (category === 'Fast Food') return 'img/menu-3.jpg';
        if (category === 'Drinks') return 'img/menu-4.jpg';
        return 'img/grill-night.png';
    }

    function addMenuItem(payload) {
        var created = null;
        if (!payload || !(payload.name || '').trim()) return null;
        update(function (data) {
            var category = payload.category || 'Grills';
            created = {
                id: 'm' + uid(),
                category: category,
                name: (payload.name || '').trim(),
                price: parseInt(payload.price, 10) || 0,
                description: payload.description || '',
                available: payload.available !== false,
                ordersTonight: parseInt(payload.ordersTonight, 10) || 0,
                image: payload.image || defaultMenuImage(category),
                source: payload.source || 'vault'
            };
            data.menu.unshift(created);
        });
        return created;
    }

    function deleteMenuItem(id) {
        var item = getMenuById(id);
        if (!item || item.source === 'house') return false;
        update(function (data) {
            data.menu = data.menu.filter(function (m) { return m.id !== id; });
        });
        return true;
    }

    function bumpMenuOrders(id, amount) {
        var n = amount || 1;
        return update(function (data) {
            data.menu.forEach(function (m) {
                if (m.id !== id) return;
                m.ordersTonight = (parseInt(m.ordersTonight, 10) || 0) + n;
                if (m.category === 'Drinks') data.stats.barPours += n;
            });
        });
    }

    function getMenuStats() {
        var list = all().menu;
        return {
            total: list.length,
            live: list.filter(function (m) { return m.available; }).length,
            eightySix: list.filter(function (m) { return !m.available; }).length,
            grills: list.filter(function (m) { return m.category === 'Grills'; }).length,
            mains: list.filter(function (m) { return m.category === 'Mains'; }).length,
            fastFood: list.filter(function (m) { return m.category === 'Fast Food'; }).length,
            drinks: list.filter(function (m) { return m.category === 'Drinks'; }).length,
            ordersTonight: list.reduce(function (sum, m) { return sum + (parseInt(m.ordersTonight, 10) || 0); }, 0)
        };
    }

    function deleteEvent(id) {
        return update(function (data) {
            data.events = data.events.filter(function (e) { return e.id !== id; });
        });
    }

    function normalizePortfolio(p) {
        if (!p || typeof p !== 'object') return p;
        if (typeof p.featured !== 'boolean') p.featured = false;
        if (typeof p.published !== 'boolean') p.published = true;
        if (!p.category) p.category = 'Terrace Event';
        if (!p.image) p.image = '';
        if (!p.source) p.source = 'house';
        if (!p.eventId) p.eventId = '';
        if (!p.createdAt) p.createdAt = Date.now();
        p.guests = parseInt(p.guests, 10) || 0;
        return p;
    }

    function defaultPortfolioImage(category) {
        var text = (category || '').toLowerCase();
        if (/cater/.test(text)) return 'img/grill-night.png';
        if (/night|brand/.test(text)) return 'img/menu-4.jpg';
        if (/private/.test(text)) return 'img/de-angels-platter.png';
        return 'img/outdoor-terrace-gallery.png';
    }

    function addPortfolioItem(payload) {
        var created = null;
        if (!payload || !(payload.title || '').trim()) return null;
        update(function (data) {
            if (!Array.isArray(data.portfolio)) data.portfolio = [];
            var category = payload.category || 'Terrace Event';
            created = normalizePortfolio({
                id: uid(),
                title: (payload.title || '').trim(),
                category: category,
                image: payload.image || defaultPortfolioImage(category),
                description: payload.description || '',
                date: payload.date || '',
                guests: parseInt(payload.guests, 10) || 0,
                featured: !!payload.featured,
                published: payload.published !== false,
                source: payload.source || 'vault',
                eventId: payload.eventId || '',
                createdAt: Date.now()
            });
            data.portfolio.unshift(created);
        });
        return created;
    }

    function getPortfolioById(id) {
        return (all().portfolio || []).filter(function (p) { return p.id === id; })[0] || null;
    }

    function updatePortfolioItem(id, fields) {
        return update(function (data) {
            (data.portfolio || []).forEach(function (p) {
                if (p.id !== id) return;
                Object.keys(fields || {}).forEach(function (k) { p[k] = fields[k]; });
                normalizePortfolio(p);
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

    function togglePortfolioPublished(id) {
        return update(function (data) {
            (data.portfolio || []).forEach(function (p) {
                if (p.id === id) p.published = !p.published;
            });
        });
    }

    function getPortfolioStats() {
        var list = all().portfolio || [];
        var cats = {};
        list.forEach(function (p) { if (p.category) cats[p.category] = true; });
        return {
            total: list.length,
            featured: list.filter(function (p) { return p.featured; }).length,
            published: list.filter(function (p) { return p.published !== false; }).length,
            categories: Object.keys(cats).length
        };
    }

    function getPublicPortfolio(limit) {
        var items = (all().portfolio || []).filter(function (p) { return p.published !== false; });
        items.sort(function (a, b) {
            if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
            return (b.createdAt || 0) - (a.createdAt || 0);
        });
        return limit ? items.slice(0, limit) : items;
    }

    function getEventsWithoutPortfolio() {
        var used = {};
        (all().portfolio || []).forEach(function (p) {
            if (p.eventId) used[p.eventId] = true;
        });
        return all().events.filter(function (e) {
            if (used[e.id] || e.status === 'cancelled') return false;
            return true;
        });
    }

    function createPortfolioFromEvent(id) {
        var event = getEventById(id);
        if (!event) return null;
        var existing = (all().portfolio || []).filter(function (p) { return p.eventId === id; })[0];
        if (existing) return existing;
        var type = event.type || 'Private gathering';
        var category = /cater/i.test(type) ? 'Catering'
            : /brand/i.test(type) ? 'Brand Night'
            : /birthday/i.test(type) ? 'Terrace Event'
            : /night/i.test(type) ? 'Night Life'
            : 'Private Party';
        return addPortfolioItem({
            title: event.title,
            category: category,
            description: event.description || '',
            date: event.date || '',
            guests: event.guests || 0,
            featured: !!event.published,
            published: true,
            source: 'event',
            eventId: event.id,
            image: defaultPortfolioImage(category)
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

    function getMenuById(id) {
        return all().menu.filter(function (m) { return m.id === id; })[0] || null;
    }

    function setMenuAvailability(id, available) {
        return update(function (data) {
            data.menu.forEach(function (m) {
                if (m.id === id) m.available = !!available;
            });
        });
    }

    function bumpKitchenLoad(name) {
        var steps = [32, 48, 64, 78, 92];
        return update(function (data) {
            data.kitchen.forEach(function (k) {
                if (k.name !== name) return;
                var idx = 0;
                for (var i = 0; i < steps.length; i++) {
                    if (k.load <= steps[i]) { idx = i; break; }
                    idx = i;
                }
                k.load = steps[(idx + 1) % steps.length];
            });
        });
    }

    function incrementTakeaway() {
        return update(function (data) {
            data.stats.guestFlow.takeaway += 1;
            data.stats.barPours += 1;
            syncGuestFlow(data);
        });
    }

    function incrementBarPours(amount) {
        var n = amount || 1;
        return update(function (data) {
            data.stats.barPours += n;
        });
    }

    function getFeaturedPortfolio(limit) {
        var items = (all().portfolio || []).filter(function (p) { return p.featured && p.published !== false; });
        return items.slice(0, limit || 3);
    }

    function getBarMix() {
        var data = all();
        var beers = 0;
        var cocktails = 0;
        var soft = 0;
        data.menu.forEach(function (m) {
            if (m.category !== 'Drinks') return;
            if (/beer/i.test(m.name)) beers += m.ordersTonight || 0;
            else if (/cocktail|sunset|island|wine/i.test(m.name)) cocktails += m.ordersTonight || 0;
            else soft += m.ordersTonight || 0;
        });
        var total = beers + cocktails + soft;
        if (!total) {
            return { beers: 36, cocktails: 28, soft: 22, total: data.stats.barPours };
        }
        return {
            beers: Math.round((beers / total) * 100),
            cocktails: Math.round((cocktails / total) * 100),
            soft: Math.round((soft / total) * 100),
            total: data.stats.barPours
        };
    }

    function getDashboardStats() {
        var data = all();
        var unread = data.messages.filter(function (m) { return !m.read; }).length;
        var pendingList = data.reservations.filter(function (r) { return r.status === 'pending'; });
        var seated = data.seats.filter(function (s) { return s.status === 'occupied'; }).length;
        var upcoming = getUpcomingEvents(4);
        var eightySix = data.menu.filter(function (m) { return !m.available; });

        return {
            coversTonight: data.stats.coversTonight,
            unreadMessages: unread,
            totalMessages: data.messages.length,
            eventCount: upcoming.length,
            portfolioPublished: getPortfolioStats().published,
            pendingReservations: pendingList.length,
            pendingList: pendingList.slice(0, 4),
            seated: seated,
            nextEvent: upcoming[0] || null,
            upcomingEvents: upcoming,
            eightySix: eightySix,
            topDishes: data.menu.slice().sort(function (a, b) { return b.ordersTonight - a.ordersTonight; }).slice(0, 4),
            guestFlow: data.stats.guestFlow,
            barPours: data.stats.barPours,
            barMix: getBarMix(),
            kitchen: data.kitchen
        };
    }

    init();

    window.VaultStore = {
        STORE_KEY: STORE_KEY,
        SETTINGS_KEY: SETTINGS_KEY,
        CHANGE_EVENT: CHANGE_EVENT,
        all: all,
        save: save,
        subscribe: subscribe,
        getSettings: getSettings,
        saveSettings: saveSettings,
        updateSettings: updateSettings,
        resetSettings: resetSettings,
        resetVaultData: resetVaultData,
        shouldAlert: shouldAlert,
        getSettingsStats: getSettingsStats,
        getMapsEmbedUrl: getMapsEmbedUrl,
        resolveAsset: resolveAsset,
        getMenuById: getMenuById,
        addMenuItem: addMenuItem,
        deleteMenuItem: deleteMenuItem,
        bumpMenuOrders: bumpMenuOrders,
        getMenuStats: getMenuStats,
        setMenuAvailability: setMenuAvailability,
        bumpKitchenLoad: bumpKitchenLoad,
        incrementTakeaway: incrementTakeaway,
        incrementBarPours: incrementBarPours,
        getUpcomingEvents: getUpcomingEvents,
        getFeaturedPortfolio: getFeaturedPortfolio,
        getBarMix: getBarMix,
        addMessage: addMessage,
        getMessageById: getMessageById,
        lookupMessage: lookupMessage,
        getMessageStats: getMessageStats,
        convertMessageToReservation: convertMessageToReservation,
        markMessageUnread: markMessageUnread,
        markAllMessagesRead: markAllMessagesRead,
        toggleMessageStar: toggleMessageStar,
        updateMessageStatus: updateMessageStatus,
        addReservation: addReservation,
        getReservationById: getReservationById,
        findGuestReservations: findGuestReservations,
        lookupReservation: lookupReservation,
        getReservationStats: getReservationStats,
        getSeatAvailability: getSeatAvailability,
        formatDateTime: formatDateTime,
        addEvent: addEvent,
        getEventById: getEventById,
        updateEvent: updateEvent,
        updateEventStatus: updateEventStatus,
        toggleEventPublished: toggleEventPublished,
        getEventStats: getEventStats,
        getPublicEvents: getPublicEvents,
        getBookingsWithoutEvent: getBookingsWithoutEvent,
        createEventFromReservation: createEventFromReservation,
        createReservationFromEvent: createReservationFromEvent,
        markMessageRead: markMessageRead,
        deleteMessage: deleteMessage,
        updateReservationStatus: updateReservationStatus,
        deleteReservation: deleteReservation,
        toggleMenuAvailability: toggleMenuAvailability,
        updateMenuItem: updateMenuItem,
        deleteEvent: deleteEvent,
        addPortfolioItem: addPortfolioItem,
        getPortfolioById: getPortfolioById,
        updatePortfolioItem: updatePortfolioItem,
        deletePortfolioItem: deletePortfolioItem,
        togglePortfolioFeatured: togglePortfolioFeatured,
        togglePortfolioPublished: togglePortfolioPublished,
        getPortfolioStats: getPortfolioStats,
        getPublicPortfolio: getPublicPortfolio,
        getEventsWithoutPortfolio: getEventsWithoutPortfolio,
        createPortfolioFromEvent: createPortfolioFromEvent,
        toggleSeatStatus: toggleSeatStatus,
        getDashboardStats: getDashboardStats,
        timeAgo: timeAgo,
        formatDate: formatDate
    };
})(window);
