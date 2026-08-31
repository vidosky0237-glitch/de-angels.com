(function () {
    'use strict';

    function esc(str) {
        var d = document.createElement('div');
        d.textContent = str == null ? '' : String(str);
        return d.innerHTML;
    }

    function renderDashboard() {
        if (!window.VaultStore) return;

        var data = VaultStore.all();
        var stats = VaultStore.getDashboardStats();

        var pulseText = document.getElementById('pulseText');
        if (pulseText) {
            pulseText.textContent = stats.seated + ' covers seated · ' + stats.pendingReservations + ' reservations incoming · kitchen running hot · bar pours tracking live';
        }

        var elCovers = document.getElementById('statCovers');
        var elMessages = document.getElementById('statMessages');
        var elEvents = document.getElementById('statEvents');
        var elMsgSub = document.getElementById('statMsgSub');
        var elEventSub = document.getElementById('statEventSub');

        if (elCovers) elCovers.textContent = stats.coversTonight;
        if (elMessages) elMessages.textContent = stats.unreadMessages;
        if (elEvents) elEvents.textContent = stats.eventCount;
        if (elMsgSub) elMsgSub.textContent = stats.unreadMessages + ' unread of ' + stats.totalMessages;
        if (elEventSub && stats.nextEvent) {
            var nd = VaultStore.formatDate(stats.nextEvent.date);
            elEventSub.textContent = 'Next: ' + nd.month + ' ' + nd.day + ' · ' + stats.nextEvent.guests + ' guests';
        }

        var firePulse = document.getElementById('firePulse');
        var fireLabel = document.getElementById('fireLabel');
        if (firePulse && data.kitchen) {
            var totalLoad = 0;
            firePulse.innerHTML = data.kitchen.map(function (k) {
                totalLoad += k.load;
                var active = k.load > 70 ? ' active' : '';
                return '<div class="fire-bar' + active + '" style="height:' + k.load + '%"><span>' + esc(k.name) + '</span></div>';
            }).join('');
            var avg = Math.round(totalLoad / data.kitchen.length);
            if (fireLabel) fireLabel.textContent = avg + '% — ' + (avg > 70 ? 'Peak grill window' : 'Steady service');
        }

        var terraceRadar = document.getElementById('terraceRadar');
        if (terraceRadar) {
            var icons = { open: 'fa-check', reserved: 'fa-clock', occupied: 'fa-user' };
            terraceRadar.innerHTML = data.seats.map(function (s) {
                return '<div class="terrace-seat ' + s.status + '" data-seat="' + s.id + '" title="Click to cycle status">' +
                    '<i class="fa ' + (icons[s.status] || 'fa-chair') + '"></i>' + esc(s.label) + '</div>';
            }).join('');

            terraceRadar.querySelectorAll('.terrace-seat').forEach(function (seat) {
                seat.style.cursor = 'pointer';
                seat.addEventListener('click', function () {
                    VaultStore.toggleSeatStatus(seat.getAttribute('data-seat'));
                    renderDashboard();
                });
            });
        }

        var flavourList = document.getElementById('flavourList');
        if (flavourList) {
            var maxOrders = stats.topDishes[0] ? stats.topDishes[0].ordersTonight : 1;
            flavourList.innerHTML = stats.topDishes.map(function (d, i) {
                var pct = Math.round((d.ordersTonight / maxOrders) * 100);
                return '<li><span class="flavour-rank' + (i === 0 ? ' hot' : '') + '">' + (i + 1) + '</span>' +
                    '<div class="flavour-info"><strong>' + esc(d.name) + '</strong><small>' + esc(d.category) + '</small></div>' +
                    '<div class="flavour-bar-wrap"><div class="flavour-bar" style="width:' + pct + '%"></div></div>' +
                    '<span class="flavour-count">' + d.ordersTonight + '</span></li>';
            }).join('');
        }

        var guestFlow = document.getElementById('guestFlow');
        if (guestFlow) {
            var gf = stats.guestFlow;
            guestFlow.innerHTML =
                '<div class="flow-stage"><h4>' + gf.incoming + '</h4><p>Incoming</p></div>' +
                '<div class="flow-arrow"><i class="fa fa-chevron-right"></i></div>' +
                '<div class="flow-stage"><h4>' + gf.seated + '</h4><p>Seated</p></div>' +
                '<div class="flow-arrow"><i class="fa fa-chevron-right"></i></div>' +
                '<div class="flow-stage"><h4>' + gf.takeaway + '</h4><p>Takeaway</p></div>';
        }

        var inboxList = document.getElementById('inboxList');
        if (inboxList) {
            var msgs = data.messages.slice(0, 4);
            if (!msgs.length) {
                inboxList.innerHTML = '<div class="empty-state"><i class="fa fa-inbox d-block"></i>No messages yet</div>';
            } else {
                inboxList.innerHTML = msgs.map(function (m) {
                    return '<a href="messages.html" class="inbox-item' + (m.read ? '' : ' unread') + '" style="text-decoration:none;color:inherit;display:flex;">' +
                        '<span class="inbox-dot"></span><div class="inbox-body"><strong>' + esc(m.name) + '</strong>' +
                        '<p>' + esc(m.body.substring(0, 60)) + (m.body.length > 60 ? '…' : '') + '</p>' +
                        '<time>' + VaultStore.timeAgo(m.createdAt) + '</time></div>' +
                        '<span class="inbox-tag">' + esc(m.type) + '</span></a>';
                }).join('');
            }
        }

        var eventList = document.getElementById('eventList');
        if (eventList) {
            var evts = data.events.slice(0, 4);
            if (!evts.length) {
                eventList.innerHTML = '<div class="empty-state"><i class="fa fa-calendar d-block"></i>No events scheduled</div>';
            } else {
                eventList.innerHTML = evts.map(function (e) {
                    var d = VaultStore.formatDate(e.date);
                    return '<div class="event-row"><div class="event-date"><strong>' + d.day + '</strong><span>' + d.month + '</span></div>' +
                        '<div class="event-info"><h4>' + esc(e.title) + '</h4><p>' + esc(e.description) + '</p></div>' +
                        '<span class="event-guests">' + e.guests + ' guests</span></div>';
                }).join('');
            }
        }

        var barTotal = document.getElementById('barPourTotal');
        var barRing = document.getElementById('barPourRing');
        if (barTotal) barTotal.textContent = stats.barPours;
        if (barRing) barRing.textContent = stats.barPours;

        var eightySixBoard = document.getElementById('eightySixBoard');
        if (eightySixBoard) {
            if (!stats.eightySix.length) {
                eightySixBoard.innerHTML = '<span class="eighty-six-clear"><i class="fa fa-check-circle"></i> Full menu is live — nothing 86\'d tonight</span>';
            } else {
                eightySixBoard.innerHTML = stats.eightySix.map(function (m) {
                    return '<span class="eighty-six-tag"><i class="fa fa-times-circle"></i> ' + esc(m.name) + '</span>';
                }).join('') + '<span class="eighty-six-clear"><i class="fa fa-check-circle"></i> Toggle items in Menu Vault</span>';
            }
        }
    }

    VaultShell.init({ onReady: renderDashboard });

    window.addEventListener('storage', function (e) {
        if (e.key === 'deangels_vault_data') renderDashboard();
    });
})();
