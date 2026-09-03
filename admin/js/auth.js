(function (window) {
    'use strict';

    var SESSION_KEY = 'deangels_vault_session';

    function getSession() {
        try {
            var raw = sessionStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function setSession(email, remember) {
        var session = {
            email: email,
            name: email.split('@')[0].replace(/[._]/g, ' '),
            loggedInAt: new Date().toISOString()
        };

        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

        if (remember) {
            localStorage.setItem(SESSION_KEY + '_remember', email);
        }
    }

    function clearSession() {
        sessionStorage.removeItem(SESSION_KEY);
    }

    function isAuthenticated() {
        return !!getSession();
    }

    function requireAuth() {
        if (!isAuthenticated()) {
            window.location.href = 'admin-login.html';
            return false;
        }
        return true;
    }

    function redirectIfAuthenticated() {
        if (isAuthenticated()) {
            window.location.href = 'dashboard.html';
            return true;
        }
        return false;
    }

    window.VaultAuth = {
        getSession: getSession,
        setSession: setSession,
        clearSession: clearSession,
        isAuthenticated: isAuthenticated,
        requireAuth: requireAuth,
        redirectIfAuthenticated: redirectIfAuthenticated
    };
})(window);
