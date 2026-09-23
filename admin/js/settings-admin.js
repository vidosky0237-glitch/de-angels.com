(function () {
    'use strict';

    function val(id) {
        var el = document.getElementById(id);
        return el ? (el.value || '').trim() : '';
    }

    function setVal(id, value) {
        var el = document.getElementById(id);
        if (el) el.value = value == null ? '' : value;
    }

    function setText(id, value) {
        var el = document.getElementById(id);
        if (el) el.textContent = value == null || value === '' ? '—' : value;
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
        }, 3200);
    }

    function fillForm(settings) {
        setVal('sName', settings.name);
        setVal('sTagline', settings.tagline);
        setVal('sPhone', settings.phone);
        setVal('sWhatsapp', settings.whatsapp);
        setVal('sAddress', settings.address);
        setVal('sHours', settings.hours);
        setVal('sEmail', settings.email);
        setVal('sMaps', settings.mapsUrl);
        setVal('sInstagram', settings.instagram);
        setVal('sFacebook', settings.facebook);
        setVal('sTwitter', settings.twitter);
        setVal('sYoutube', settings.youtube);
        var alertRes = document.getElementById('sAlertReservations');
        var alertMsg = document.getElementById('sAlertMessages');
        var alertEvt = document.getElementById('sAlertEvents');
        if (alertRes) alertRes.checked = !!settings.alertReservations;
        if (alertMsg) alertMsg.checked = !!settings.alertMessages;
        if (alertEvt) alertEvt.checked = !!settings.alertEvents;
    }

    function renderStats(settings) {
        var stats = VaultStore.getSettingsStats ? VaultStore.getSettingsStats() : {};
        setText('settingsKpiName', stats.name || settings.name);
        setText('settingsKpiEmail', stats.email || settings.email);
        setText('settingsKpiHours', stats.hours || settings.hours);
        setText('settingsKpiAlerts', (stats.alertsOn != null ? stats.alertsOn : 0) + ' / 3 on');

        setText('previewName', settings.name);
        setText('previewTagline', settings.tagline);
        setText('previewAddress', settings.address);
        setText('previewHours', settings.hours);
        var bits = [];
        if (settings.phone) bits.push(settings.phone);
        if (settings.email) bits.push(settings.email);
        setText('previewContact', bits.join(' · ') || 'Add a phone or email to show them on the website');
    }

    function renderSession() {
        var session = window.VaultAuth ? VaultAuth.getSession() : null;
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
    }

    function render(refill) {
        if (!window.VaultStore) return;
        var settings = VaultStore.getSettings();
        if (refill) fillForm(settings);
        renderStats(settings);
        renderSession();
    }

    var profileForm = document.getElementById('settingsProfileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var name = val('sName');
            if (!name) {
                showAlert('Enter a house name before saving.', 'error');
                return;
            }
            VaultStore.updateSettings({
                name: name,
                tagline: val('sTagline'),
                phone: val('sPhone'),
                whatsapp: val('sWhatsapp'),
                address: val('sAddress'),
                hours: val('sHours'),
                email: val('sEmail'),
                mapsUrl: val('sMaps')
            });
            showAlert('Venue profile is live on the website.', 'success');
        });
    }

    var socialForm = document.getElementById('settingsSocialForm');
    if (socialForm) {
        socialForm.addEventListener('submit', function (e) {
            e.preventDefault();
            VaultStore.updateSettings({
                instagram: val('sInstagram'),
                facebook: val('sFacebook'),
                twitter: val('sTwitter'),
                youtube: val('sYoutube')
            });
            showAlert('Social links updated on the public site.', 'success');
        });
    }

    var notifyForm = document.getElementById('settingsNotifyForm');
    if (notifyForm) {
        notifyForm.addEventListener('submit', function (e) {
            e.preventDefault();
            VaultStore.updateSettings({
                alertReservations: !!(document.getElementById('sAlertReservations') && document.getElementById('sAlertReservations').checked),
                alertMessages: !!(document.getElementById('sAlertMessages') && document.getElementById('sAlertMessages').checked),
                alertEvents: !!(document.getElementById('sAlertEvents') && document.getElementById('sAlertEvents').checked)
            });
            showAlert('Notification preferences saved.', 'success');
        });
    }

    var signOutBtn = document.getElementById('settingsSignOut');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', function () {
            if (window.VaultAuth) VaultAuth.clearSession();
            window.location.href = 'admin-login.html';
        });
    }

    var resetBtn = document.getElementById('settingsResetData');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            var includeSettings = !!(document.getElementById('sResetSettings') && document.getElementById('sResetSettings').checked);
            var msg = includeSettings
                ? 'Reset all local Command Deck data and the venue profile on this browser?'
                : 'Reset reservations, messages, menu, events and portfolio on this browser? Venue profile will be kept.';
            if (!window.confirm(msg)) return;
            if (VaultStore.resetVaultData) {
                VaultStore.resetVaultData({ includeSettings: includeSettings });
            }
            showAlert('Local vault data cleared. Reloading…', 'success');
            setTimeout(function () {
                window.location.reload();
            }, 900);
        });
    }

    VaultShell.init({
        onReady: function () {
            render(true);
        }
    });
    if (window.VaultStore && VaultStore.subscribe) {
        VaultStore.subscribe(function () { render(false); });
    }
})();
