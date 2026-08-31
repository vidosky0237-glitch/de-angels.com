(function () {
    'use strict';

    function applyMenuState() {
        document.querySelectorAll('[data-vault-id]').forEach(function (el) {
            el.classList.remove('menu-item-unavailable');
            var badge = el.querySelector('.vault-unavailable-badge');
            if (badge) badge.remove();
        });
    }

    document.addEventListener('DOMContentLoaded', applyMenuState);
    window.addEventListener('storage', function (e) {
        if (e.key === 'deangels_vault_data') applyMenuState();
    });
})();
