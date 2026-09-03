(function (window) {
    'use strict';

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getShift() {
        var hour = new Date().getHours();
        if (hour >= 10 && hour < 15) return { label: 'Midday Service', progress: 18 };
        if (hour >= 15 && hour < 18) return { label: 'Golden Hour', progress: 35 };
        if (hour >= 18 && hour < 23) return { label: 'Grill Night', progress: 62 };
        if (hour >= 23 || hour < 3) return { label: 'Late Hours', progress: 85 };
        return { label: 'Closing Shift', progress: 95 };
    }

    function closeSidebar(sidebar, overlay, toggle) {
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
        document.body.classList.remove('sidebar-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }

    function openSidebar(sidebar, overlay, toggle) {
        if (sidebar) sidebar.classList.add('open');
        if (overlay) overlay.classList.add('show');
        document.body.classList.add('sidebar-open');
        if (toggle) toggle.setAttribute('aria-expanded', 'true');
    }

    function initShell(options) {
        options = options || {};

        if (window.VaultAuth && !VaultAuth.requireAuth()) {
            return null;
        }

        var session = VaultAuth ? VaultAuth.getSession() : null;
        var sidebar = document.getElementById('vaultSidebar');
        var overlay = document.getElementById('vaultOverlay');
        var menuToggle = document.getElementById('menuToggle');
        var sidebarClose = document.getElementById('sidebarClose');
        var dockMenuBtn = document.getElementById('dockMenuBtn');
        var logoutBtn = document.getElementById('vaultLogout');
        var clockEl = document.getElementById('liveClock');
        var shiftEl = document.getElementById('shiftPill');
        var greetingEl = document.getElementById('greetingName');
        var avatarEl = document.getElementById('userAvatar');
        var shiftProgress = document.getElementById('shiftProgress');
        var page = document.body.getAttribute('data-page');

        if (session && greetingEl) {
            var name = capitalize(session.name || 'Manager');
            greetingEl.textContent = name;
            if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
        }

        if (page) {
            document.querySelectorAll('.vault-nav a[data-nav], .dock-item[data-nav]').forEach(function (link) {
                link.classList.toggle('active', link.getAttribute('data-nav') === page);
            });
        }

        function updateClock() {
            var now = new Date();
            var shift = getShift();
            if (clockEl) {
                clockEl.textContent = now.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
            if (shiftEl) shiftEl.textContent = shift.label;
            if (shiftProgress) shiftProgress.style.width = shift.progress + '%';
            document.querySelectorAll('.shift-node').forEach(function (node) {
                node.classList.toggle('active', node.getAttribute('data-shift') === shift.label);
            });
        }

        updateClock();
        setInterval(updateClock, 1000);

        if (menuToggle && sidebar && overlay) {
            menuToggle.addEventListener('click', function () {
                if (sidebar.classList.contains('open')) {
                    closeSidebar(sidebar, overlay, menuToggle);
                } else {
                    openSidebar(sidebar, overlay, menuToggle);
                }
            });
        }

        if (sidebarClose) {
            sidebarClose.addEventListener('click', function () {
                closeSidebar(sidebar, overlay, menuToggle);
            });
        }

        if (dockMenuBtn && sidebar && overlay) {
            dockMenuBtn.addEventListener('click', function () {
                openSidebar(sidebar, overlay, menuToggle);
            });
        }

        if (overlay) {
            overlay.addEventListener('click', function () {
                closeSidebar(sidebar, overlay, menuToggle);
            });
        }

        document.querySelectorAll('.vault-nav a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.innerWidth < 992) {
                    closeSidebar(sidebar, overlay, menuToggle);
                }
            });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeSidebar(sidebar, overlay, menuToggle);
            }
        });

        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                VaultAuth.clearSession();
                window.location.href = 'admin-login.html';
            });
        }

        if (typeof options.onReady === 'function') {
            options.onReady();
        }

        return { session: session };
    }

    window.VaultShell = { init: initShell, getShift: getShift };
})(window);
