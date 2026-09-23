(function () {
    'use strict';

    function esc(str) {
        var d = document.createElement('div');
        d.textContent = str == null ? '' : String(str);
        return d.innerHTML;
    }

    function escAttr(str) {
        return esc(str).replace(/"/g, '&quot;');
    }

    function defaultImage(category) {
        if (category === 'Mains') return 'img/jollof-rice.png';
        if (category === 'Fast Food') return 'img/menu-3.jpg';
        if (category === 'Drinks') return 'img/menu-4.jpg';
        return 'img/grill-night.png';
    }

    function extraCard(item) {
        var img = item.image || defaultImage(item.category);
        return '<div class="col-lg-6" data-vault-extra="' + escAttr(item.id) + '">' +
            '<div class="d-flex align-items-center menu-item-card" data-vault-id="' + escAttr(item.id) + '">' +
            '<img class="flex-shrink-0 menu-thumb" src="' + escAttr(img) + '" alt="' + escAttr(item.name) + '">' +
            '<div class="w-100 d-flex flex-column text-start ps-4">' +
            '<h5 class="d-flex justify-content-between border-bottom pb-2"><span>' + esc(item.name) + '</span><span class="text-primary">₦' + Number(item.price).toLocaleString() + '</span></h5>' +
            '<small class="fst-italic">' + esc(item.description || '') + '</small>' +
            '</div></div></div>';
    }

    function injectExtras(menu) {
        document.querySelectorAll('[data-vault-extra]').forEach(function (el) { el.remove(); });
        var present = {};
        document.querySelectorAll('[data-vault-id]').forEach(function (el) {
            present[el.getAttribute('data-vault-id')] = true;
        });
        menu.forEach(function (item) {
            if (present[item.id]) return;
            var grid = document.querySelector('[data-vault-menu-grid="' + item.category + '"]');
            if (!grid) return;
            grid.insertAdjacentHTML('beforeend', extraCard(item));
        });
    }

    function applyMenuState() {
        if (!window.VaultStore) return;

        var data = VaultStore.all();
        injectExtras(data.menu);

        var byId = {};
        data.menu.forEach(function (item) {
            byId[item.id] = item;
        });

        document.querySelectorAll('[data-vault-id]').forEach(function (el) {
            var item = byId[el.getAttribute('data-vault-id')];
            var badge = el.querySelector('.vault-unavailable-badge');
            if (badge) badge.remove();
            el.classList.remove('menu-item-unavailable');

            if (!item) return;

            var priceEl = el.querySelector('.dish-price, h5 .text-primary, .text-primary');
            if (priceEl && item.price) {
                priceEl.textContent = '₦' + Number(item.price).toLocaleString();
            }

            var nameEl = el.querySelector('h5 span:first-child, h2, .drink-overlay h5');
            if (nameEl && item.name && nameEl.className.indexOf('text-primary') === -1) {
                nameEl.textContent = item.name;
            }

            var descEl = el.querySelector('small.fst-italic, .drink-overlay small, p.text-white-50');
            if (descEl && item.description) descEl.textContent = item.description;

            if (!item.available) {
                el.classList.add('menu-item-unavailable');
                if (!el.classList.contains('spotlight-panel') && !el.classList.contains('drink-card')) {
                    var mark = document.createElement('span');
                    mark.className = 'vault-unavailable-badge';
                    mark.textContent = "86'd";
                    el.appendChild(mark);
                }
            }
        });

        var notice = document.getElementById('vaultMenuNotice');
        if (notice) {
            var off = data.menu.filter(function (m) { return !m.available; });
            if (!off.length) {
                notice.hidden = true;
                notice.innerHTML = '';
            } else {
                notice.hidden = false;
                notice.innerHTML = '<strong>86\'d tonight:</strong> ' + off.map(function (m) { return esc(m.name); }).join(', ');
            }
        }
    }

    function boot() {
        applyMenuState();
        if (window.VaultStore && VaultStore.subscribe) {
            VaultStore.subscribe(applyMenuState);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
