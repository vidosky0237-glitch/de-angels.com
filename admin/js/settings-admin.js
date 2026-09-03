(function () {
    'use strict';

    VaultShell.init();

    var SETTINGS_KEY = 'deangels_vault_settings';

    function defaults() {
        return {
            name: 'De Angels Bar & Grills',
            phone: '',
            address: 'Plot F16, Housing Area B, New Owerri',
            hours: 'Monday – Sunday · 10:00 AM – 5:00 AM',
            email: 'hello@deangels.com',
            alertReservations: true,
            alertMessages: true,
            alertEvents: true
        };
    }

    function loadSettings() {
        try {
            var raw = localStorage.getItem(SETTINGS_KEY);
            return raw ? Object.assign(defaults(), JSON.parse(raw)) : defaults();
        } catch (e) {
            return defaults();
        }
    }

    function saveSettings(data) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
    }

    function showAlert(message, type) {
        var el = document.getElementById('settingsAlert');
        if (!el) return;
        el.textContent = message;
        el.className = 'vault-alert show ' + (type || 'success');
        el.style.display = 'block';
        setTimeout(function () {
            el.style.display = 'none';
            el.className = 'vault-alert';
        }, 2800);
    }

    var settings = loadSettings();

    var nameEl = document.getElementById('sName');
    var phoneEl = document.getElementById('sPhone');
    var addressEl = document.getElementById('sAddress');
    var hoursEl = document.getElementById('sHours');
    var emailEl = document.getElementById('sEmail');
    var alertRes = document.getElementById('sAlertReservations');
    var alertMsg = document.getElementById('sAlertMessages');
    var alertEvt = document.getElementById('sAlertEvents');

    if (nameEl) nameEl.value = settings.name || '';
    if (phoneEl) phoneEl.value = settings.phone || '';
    if (addressEl) addressEl.value = settings.address || '';
    if (hoursEl) hoursEl.value = settings.hours || '';
    if (emailEl) emailEl.value = settings.email || '';
    if (alertRes) alertRes.checked = !!settings.alertReservations;
    if (alertMsg) alertMsg.checked = !!settings.alertMessages;
    if (alertEvt) alertEvt.checked = !!settings.alertEvents;

    var session = VaultAuth && VaultAuth.getSession();
    var sessionEmail = document.getElementById('settingsSessionEmail');
    var sessionAt = document.getElementById('settingsSessionAt');
    if (session && sessionEmail) sessionEmail.textContent = session.email || 'Staff';
    if (session && sessionAt && session.loggedInAt) {
        try {
            sessionAt.textContent = new Date(session.loggedInAt).toLocaleString();
        } catch (e) {
            sessionAt.textContent = session.loggedInAt;
        }
    }

    var profileForm = document.getElementById('settingsProfileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function (e) {
            e.preventDefault();
            settings.name = nameEl.value.trim();
            settings.phone = phoneEl.value.trim();
            settings.address = addressEl.value.trim();
            settings.hours = hoursEl.value.trim();
            settings.email = emailEl.value.trim();
            saveSettings(settings);
            showAlert('Venue profile saved.', 'success');
        });
    }

    var notifyForm = document.getElementById('settingsNotifyForm');
    if (notifyForm) {
        notifyForm.addEventListener('submit', function (e) {
            e.preventDefault();
            settings.alertReservations = !!(alertRes && alertRes.checked);
            settings.alertMessages = !!(alertMsg && alertMsg.checked);
            settings.alertEvents = !!(alertEvt && alertEvt.checked);
            saveSettings(settings);
            showAlert('Notification preferences saved.', 'success');
        });
    }

    var signOutBtn = document.getElementById('settingsSignOut');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', function () {
            if (VaultAuth) VaultAuth.clearSession();
            window.location.href = 'admin-login.html';
        });
    }

    var resetBtn = document.getElementById('settingsResetData');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            if (!window.confirm('Reset all local Command Deck data on this browser?')) return;
            try {
                Object.keys(localStorage).forEach(function (key) {
                    if (key.indexOf('deangels_') === 0) localStorage.removeItem(key);
                });
            } catch (e) {}
            showAlert('Local vault data cleared. Reloading…', 'success');
            setTimeout(function () {
                window.location.reload();
            }, 900);
        });
    }
})();
