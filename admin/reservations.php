<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Reservations | De Angels Admin</title>
    <meta content="width=device-width, initial-scale=1.0, viewport-fit=cover" name="viewport">
    <meta name="robots" content="noindex, nofollow">
    <meta name="theme-color" content="#0a0807">
    <link href="../img/logo.png" rel="icon">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Oswald:wght@500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css" rel="stylesheet">
    <link href="css/vault.css" rel="stylesheet">
    <link href="css/dashboard.css" rel="stylesheet">
    <link href="css/manage.css" rel="stylesheet">
</head>
<body class="vault-body vault-dash" data-page="reservations">
    <div class="vault-bg" aria-hidden="true"></div>
    <div class="vault-grid" aria-hidden="true"></div>
    <div class="vault-overlay" id="vaultOverlay" aria-hidden="true"></div>
    <div class="vault-layout">
        <aside class="vault-sidebar" id="vaultSidebar" aria-label="Admin navigation">
            <div class="vault-sidebar-head">
                <div class="vault-brand-row">
                    <img src="../img/logo.png" alt="De Angels Bar &amp; Grills">
                    <button type="button" class="vault-sidebar-close" id="sidebarClose" aria-label="Close menu"><i class="fa fa-times"></i></button>
                </div>
                <span class="vault-sidebar-tag"><i class="fa fa-shield-alt"></i> Command Deck</span>
            </div>
            <nav class="vault-nav">
                <span class="vault-nav-label">Operations</span>
                <a href="dashboard.php" data-nav="dashboard"><i class="fa fa-th-large"></i><span>Overview</span></a>
                <a href="reservations.php" data-nav="reservations"><i class="fa fa-calendar-check"></i><span>Reservations</span></a>
                <a href="message-inbox.php" data-nav="message-inbox"><i class="fa fa-envelope"></i><span>Message Inbox</span></a>
                <span class="vault-nav-label">Hospitality</span>
                <a href="menu-vault.php" data-nav="menu-vault"><i class="fa fa-utensils"></i><span>Menu Vault</span></a>
                <a href="events.php" data-nav="events"><i class="fa fa-glass-cheers"></i><span>Events</span></a>
                <a href="portfolio.php" data-nav="portfolio"><i class="fa fa-images"></i><span>Portfolio</span></a>
                <span class="vault-nav-label">System</span>
                <a href="admin-settings.php" data-nav="admin-settings"><i class="fa fa-cog"></i><span>Admin Settings</span></a>
                <a href="admin-dashboard.php"><i class="fa fa-th-large"></i><span>Admin Dashboard</span></a>
                <a href="../index.php" target="_blank" rel="noopener"><i class="fa fa-globe"></i><span>View Website</span></a>
            </nav>
            <div class="vault-sidebar-foot">
                <button type="button" class="vault-logout" id="vaultLogout"><i class="fa fa-sign-out-alt"></i> Sign Out</button>
            </div>
        </aside>
        <div class="vault-main">
            <header class="vault-topbar">
                <div class="vault-topbar-start">
                    <button class="vault-menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false"><i class="fa fa-bars"></i></button>
                    <div class="vault-greeting">
                        <p class="vault-greeting-kicker">Operations</p>
                        <h1>Reservations</h1>
                    </div>
                </div>
                <div class="vault-topbar-actions">
                    <span class="vault-live-dot" aria-hidden="true"></span>
                    <span class="vault-shift-pill" id="shiftPill">Grill Night</span>
                    <span class="vault-live-clock" id="liveClock" aria-live="polite"></span>
                    <div class="vault-avatar" id="userAvatar">D</div>
                </div>
            </header>
            <main class="vault-content">
                <div class="manage-toolbar">
                    <h2>Booking Queue</h2>
                    <a href="dashboard.php" class="deck-card-link"><i class="fa fa-arrow-left"></i> Back to deck</a>
                </div>

                <div id="resAlert" class="vault-alert" role="status" style="display:none"></div>

                <section class="res-kpi-strip" aria-label="Reservation snapshot">
                    <button type="button" class="res-kpi" data-res-filter="pending"><span>Pending</span><strong id="statPending">—</strong></button>
                    <button type="button" class="res-kpi" data-res-filter="confirmed"><span>Confirmed</span><strong id="statConfirmed">—</strong></button>
                    <button type="button" class="res-kpi" data-res-filter="seated"><span>Seated</span><strong id="statSeated">—</strong></button>
                    <button type="button" class="res-kpi" data-res-filter="website"><span>From Website</span><strong id="statWebsite">—</strong></button>
                    <article class="res-kpi"><span>Active covers</span><strong id="statCovers">—</strong></article>
                    <article class="res-kpi"><span>Open seats</span><strong id="statOpenSeats">—</strong><small id="resFloorNote">Floor live</small></article>
                </section>

                <div class="manage-card mb-4">
                    <h3 style="font-family:Oswald;margin:0 0 16px;font-size:1.05rem">Add Walk-In Reservation</h3>
                    <p style="color:var(--vault-muted);margin:0 0 16px;font-size:13px">Walk-ins and website bookings share this queue. Confirming a table holds a seat on the terrace radar and shows as confirmed when the guest looks up their reference.</p>
                    <form id="addResForm">
                        <div class="manage-form-grid">
                            <div class="manage-field"><label for="rName">Guest Name</label><input type="text" id="rName" required></div>
                            <div class="manage-field"><label for="rEmail">Email</label><input type="email" id="rEmail"></div>
                            <div class="manage-field"><label for="rPhone">Phone</label><input type="tel" id="rPhone"></div>
                            <div class="manage-field"><label for="rDatetime">Date &amp; Time</label><input type="datetime-local" id="rDatetime"></div>
                            <div class="manage-field"><label for="rGuests">Guests</label><input type="number" id="rGuests" min="1" value="2"></div>
                            <div class="manage-field"><label for="rType">Type</label>
                                <select id="rType">
                                    <option>Indoor table</option>
                                    <option>Outdoor terrace</option>
                                    <option>Private gathering</option>
                                    <option>Catering enquiry</option>
                                    <option>Takeaway / delivery</option>
                                </select>
                            </div>
                            <div class="manage-field full"><label for="rNotes">Notes</label><textarea id="rNotes" rows="2"></textarea></div>
                            <div class="manage-field full"><button type="submit" class="vault-btn" style="width:auto;padding:12px 28px;max-width:100%">Add Reservation</button></div>
                        </div>
                    </form>
                </div>

                <div class="manage-card">
                    <div class="res-table-tools">
                        <div class="res-filters">
                            <button type="button" class="res-filter active" data-res-filter="all">All</button>
                            <button type="button" class="res-filter" data-res-filter="pending">Pending</button>
                            <button type="button" class="res-filter" data-res-filter="confirmed">Confirmed</button>
                            <button type="button" class="res-filter" data-res-filter="seated">Seated</button>
                            <button type="button" class="res-filter" data-res-filter="cancelled">Cancelled</button>
                            <button type="button" class="res-filter" data-res-filter="website">Website</button>
                            <button type="button" class="res-filter" data-res-filter="walk-in">Walk-in</button>
                        </div>
                        <label class="res-search">
                            <input type="search" id="resSearch" placeholder="Search name, email, ref, phone…" aria-label="Search bookings">
                        </label>
                    </div>
                    <div class="manage-table-wrap">
                        <table class="manage-table">
                            <thead><tr><th>Guest / Ref</th><th>When</th><th>Type / Seat</th><th>Guests</th><th>Status</th><th>Source</th><th>Notes</th><th>Actions</th></tr></thead>
                            <tbody id="resTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    </div>
    <nav class="vault-mobile-dock" aria-label="Quick navigation">
        <a href="dashboard.php" class="dock-item" data-nav="dashboard"><i class="fa fa-th-large"></i><span>Deck</span></a>
        <a href="reservations.php" class="dock-item active" data-nav="reservations"><i class="fa fa-calendar-check"></i><span>Bookings</span></a>
        <a href="message-inbox.php" class="dock-item" data-nav="message-inbox"><i class="fa fa-envelope"></i><span>Inbox</span></a>
        <a href="menu-vault.php" class="dock-item" data-nav="menu-vault"><i class="fa fa-utensils"></i><span>Menu</span></a>
        <button type="button" class="dock-item" id="dockMenuBtn" aria-label="More options"><i class="fa fa-ellipsis-h"></i><span>More</span></button>
    </nav>
    <script src="js/auth.js"></script>
    <script src="js/store.js"></script>
    <script src="js/shell.js"></script>
    <script src="js/reservations-admin.js"></script>
</body>
</html>
