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
        var settings = VaultStore.getSettings();

        var pulseText = document.getElementById('pulseText');
        if (pulseText) {
            var house = settings.name || 'The terrace';
            pulseText.textContent = stats.seated + ' covers seated · ' + stats.pendingReservations +
                ' bookings incoming · ' + stats.eightySix.length + ' items 86\'d · ' +
                (stats.portfolioPublished || 0) + ' gallery moments live · ' +
                house + ' tracking live from the website';
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
        } else if (elEventSub) {
            elEventSub.textContent = 'No upcoming gatherings';
        }

        var firePulse = document.getElementById('firePulse');
        var fireLabel = document.getElementById('fireLabel');
        if (firePulse && data.kitchen) {
            var totalLoad = 0;
            firePulse.innerHTML = data.kitchen.map(function (k) {
                totalLoad += k.load;
                var active = k.load > 70 ? ' active' : '';
                return '<button type="button" class="fire-bar' + active + '" style="height:' + k.load + '%" data-station="' + esc(k.name) + '" title="Tap to cycle load">' +
                    '<span>' + esc(k.name) + '</span></button>';
            }).join('');
            var avg = Math.round(totalLoad / data.kitchen.length);
            if (fireLabel) fireLabel.textContent = avg + '% — ' + (avg > 70 ? 'Peak grill window' : 'Steady service');

            firePulse.querySelectorAll('[data-station]').forEach(function (bar) {
                bar.addEventListener('click', function () {
                    VaultStore.bumpKitchenLoad(bar.getAttribute('data-station'));
                });
            });
        }

        var terraceRadar = document.getElementById('terraceRadar');
        if (terraceRadar) {
            var icons = { open: 'fa-check', reserved: 'fa-clock', occupied: 'fa-user' };
            terraceRadar.innerHTML = data.seats.map(function (s) {
                return '<button type="button" class="terrace-seat ' + s.status + '" data-seat="' + s.id + '" title="Cycle: open → reserved → seated">' +
                    '<i class="fa ' + (icons[s.status] || 'fa-chair') + '"></i>' + esc(s.label) + '</button>';
            }).join('');

            terraceRadar.querySelectorAll('.terrace-seat').forEach(function (seat) {
                seat.addEventListener('click', function () {
                    VaultStore.toggleSeatStatus(seat.getAttribute('data-seat'));
                });
            });
        }

        var flavourList = document.getElementById('flavourList');
        if (flavourList) {
            var maxOrders = stats.topDishes[0] ? stats.topDishes[0].ordersTonight : 1;
            flavourList.innerHTML = stats.topDishes.map(function (d, i) {
                var pct = Math.round((d.ordersTonight / (maxOrders || 1)) * 100);
                return '<li data-86="' + d.id + '" title="' + (d.available ? 'Tap to 86 this plate on the public menu' : 'Already 86\'d — tap to restore') + '">' +
                    '<span class="flavour-rank' + (i === 0 ? ' hot' : '') + '">' + (i + 1) + '</span>' +
                    '<div class="flavour-info"><strong>' + esc(d.name) + '</strong><small>' + esc(d.category) + (d.available ? '' : ' · 86\'d') + '</small></div>' +
                    '<div class="flavour-bar-wrap"><div class="flavour-bar" style="width:' + pct + '%"></div></div>' +
                    '<span class="flavour-count">' + d.ordersTonight + '</span></li>';
            }).join('');

            flavourList.querySelectorAll('[data-86]').forEach(function (row) {
                row.addEventListener('click', function () {
                    var item = VaultStore.getMenuById(row.getAttribute('data-86'));
                    if (!item) return;
                    if (item.available && !window.confirm('86 ' + item.name + ' on the public menu?')) return;
                    VaultStore.toggleMenuAvailability(item.id);
                });
            });
        }

        var guestFlow = document.getElementById('guestFlow');
        if (guestFlow) {
            var gf = stats.guestFlow;
            guestFlow.innerHTML =
                '<a class="flow-stage" href="reservations.php"><h4>' + gf.incoming + '</h4><p>Incoming</p></a>' +
                '<div class="flow-arrow"><i class="fa fa-chevron-right"></i></div>' +
                '<div class="flow-stage"><h4>' + gf.seated + '</h4><p>Seated</p></div>' +
                '<div class="flow-arrow"><i class="fa fa-chevron-right"></i></div>' +
                '<button type="button" class="flow-stage" id="takeawayBump" title="Log a takeaway from the website">' +
                '<h4>' + gf.takeaway + '</h4><p>Takeaway</p></button>';

            var takeawayBtn = document.getElementById('takeawayBump');
            if (takeawayBtn) {
                takeawayBtn.addEventListener('click', function () {
                    VaultStore.incrementTakeaway();
                });
            }
        }

        var pendingBookings = document.getElementById('pendingBookings');
        if (pendingBookings) {
            if (!stats.pendingList.length) {
                pendingBookings.innerHTML = '<p class="pending-empty">No website bookings waiting.</p>';
            } else {
                pendingBookings.innerHTML = stats.pendingList.map(function (r) {
                    return '<div class="pending-row">' +
                        '<div><strong>' + esc(r.name) + '</strong><small>' + esc(r.type) + ' · ' + r.guests + ' guests</small></div>' +
                        '<button type="button" class="pending-confirm" data-confirm="' + r.id + '">Confirm</button></div>';
                }).join('');

                pendingBookings.querySelectorAll('[data-confirm]').forEach(function (btn) {
                    btn.addEventListener('click', function () {
                        VaultStore.updateReservationStatus(btn.getAttribute('data-confirm'), 'confirmed');
                    });
                });
            }
        }

        var inboxList = document.getElementById('inboxList');
        if (inboxList) {
            var msgs = data.messages.slice(0, 4);
            if (!msgs.length) {
                inboxList.innerHTML = '<div class="empty-state"><i class="fa fa-inbox d-block"></i>No messages yet — website contact form will appear here</div>';
            } else {
                inboxList.innerHTML = msgs.map(function (m) {
                    return '<button type="button" class="inbox-item' + (m.read ? '' : ' unread') + '" data-msg="' + m.id + '">' +
                        '<span class="inbox-dot"></span><div class="inbox-body"><strong>' + esc(m.name) + '</strong>' +
                        '<p>' + esc((m.body || m.subject || '').substring(0, 60)) + ((m.body || '').length > 60 ? '…' : '') + '</p>' +
                        '<time>' + VaultStore.timeAgo(m.createdAt) + (m.publicRef ? ' · ' + esc(m.publicRef) : '') + '</time></div>' +
                        '<span class="inbox-tag">' + esc(m.type) + '</span></button>';
                }).join('');

                inboxList.querySelectorAll('[data-msg]').forEach(function (item) {
                    item.addEventListener('click', function () {
                        VaultStore.markMessageRead(item.getAttribute('data-msg'));
                        window.location.href = 'message-inbox.php';
                    });
                });
            }
        }

        var eventList = document.getElementById('eventList');
        if (eventList) {
            var evts = stats.upcomingEvents || [];
            if (!evts.length) {
                eventList.innerHTML = '<div class="empty-state"><i class="fa fa-calendar d-block"></i>No events scheduled — add one and it appears on the website</div>';
            } else {
                eventList.innerHTML = evts.map(function (e) {
                    var d = VaultStore.formatDate(e.date);
                    return '<a class="event-row" href="events.php">' +
                        '<div class="event-date"><strong>' + d.day + '</strong><span>' + d.month + '</span></div>' +
                        '<div class="event-info"><h4>' + esc(e.title) + '</h4><p>' + esc(e.description) +
                        (e.published ? '' : ' · private') + '</p></div>' +
                        '<span class="event-guests">' + e.guests + ' guests</span></a>';
                }).join('');
            }
        }

        var mix = stats.barMix || VaultStore.getBarMix();
        var barTotal = document.getElementById('barPourTotal');
        var barRing = document.getElementById('barPourRing');
        var pourChart = document.getElementById('pourChart');
        var pourLegend = document.getElementById('pourLegend');
        if (barTotal) barTotal.textContent = stats.barPours;
        if (barRing) barRing.textContent = stats.barPours;
        if (pourChart) {
            var d1 = mix.beers * 3.6;
            var d2 = d1 + mix.cocktails * 3.6;
            var d3 = d2 + mix.soft * 3.6;
            pourChart.style.background = 'conic-gradient(var(--vault-primary) 0deg ' + d1 + 'deg, var(--vault-gold) ' + d1 + 'deg ' + d2 + 'deg, var(--vault-accent) ' + d2 + 'deg ' + d3 + 'deg, rgba(255,255,255,0.06) ' + d3 + 'deg 360deg)';
        }
        if (pourLegend) {
            pourLegend.innerHTML =
                '<div class="c-beer"><span>Beers</span><span>' + mix.beers + '%</span></div>' +
                '<div class="c-cocktail"><span>Cocktails</span><span>' + mix.cocktails + '%</span></div>' +
                '<div class="c-soft"><span>Soft &amp; Juice</span><span>' + mix.soft + '%</span></div>';
        }

        var eightySixBoard = document.getElementById('eightySixBoard');
        if (eightySixBoard) {
            if (!stats.eightySix.length) {
                eightySixBoard.innerHTML = '<span class="eighty-six-clear"><i class="fa fa-check-circle"></i> Full menu is live on the website — nothing 86\'d tonight</span>';
            } else {
                eightySixBoard.innerHTML = stats.eightySix.map(function (m) {
                    return '<button type="button" class="eighty-six-tag" data-restore="' + m.id + '" title="Restore on public menu"><i class="fa fa-times-circle"></i> ' + esc(m.name) + '</button>';
                }).join('') + '<span class="eighty-six-clear"><i class="fa fa-check-circle"></i> Tap a tag to restore it on the website</span>';

                eightySixBoard.querySelectorAll('[data-restore]').forEach(function (tag) {
                    tag.addEventListener('click', function () {
                        VaultStore.setMenuAvailability(tag.getAttribute('data-restore'), true);
                    });
                });
            }
        }
    }

    VaultShell.init({ onReady: renderDashboard });

    if (window.VaultStore && VaultStore.subscribe) {
        VaultStore.subscribe(renderDashboard);
    }
})();
