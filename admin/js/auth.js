(function (window) {
    'use strict';

    var SESSION_KEY = 'deangels_vault_session';
    var ADMIN_EMAIL = 'admin@deangels.com';
    var ADMIN_PASSWORD = 'DeAngels#2026';

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
        } else {
            localStorage.removeItem(SESSION_KEY + '_remember');
        }
    }

    function login(email, password, remember) {
        var enteredEmail = (email || '').trim().toLowerCase();
        var enteredPassword = password || '';

        if (enteredEmail !== ADMIN_EMAIL || enteredPassword !== ADMIN_PASSWORD) {
            return false;
        }

        setSession(enteredEmail, remember);
        return true;
    }

    function getRememberedEmail() {
        try {
            return localStorage.getItem(SESSION_KEY + '_remember') || '';
        } catch (e) {
            return '';
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
            window.location.href = 'admin-login.php';
            return false;
        }
        return true;
    }

    function redirectIfAuthenticated() {
        if (isAuthenticated()) {
            window.location.href = 'dashboard.php';
            return true;
        }
        return false;
    }

    window.VaultAuth = {
        getSession: getSession,
        setSession: setSession,
        login: login,
        getRememberedEmail: getRememberedEmail,
        clearSession: clearSession,
        isAuthenticated: isAuthenticated,
        requireAuth: requireAuth,
        redirectIfAuthenticated: redirectIfAuthenticated
    };
})(window);
