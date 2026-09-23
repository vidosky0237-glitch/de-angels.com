<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Events | De Angels Admin</title>
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
<body class="vault-body vault-dash" data-page="events">
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
                        <p class="vault-greeting-kicker">Hospitality</p>
                        <h1>Event Horizon</h1>
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
                    <h2>Scheduled Events</h2>
                    <a href="dashboard.php" class="deck-card-link"><i class="fa fa-arrow-left"></i> Back to deck</a>
                </div>

                <div id="eventAlert" class="vault-alert" role="status" style="display:none"></div>

                <section class="res-kpi-strip" aria-label="Events snapshot">
                    <button type="button" class="res-kpi" data-event-filter="upcoming"><span>Upcoming</span><strong id="statUpcoming">—</strong></button>
                    <button type="button" class="res-kpi" data-event-filter="published"><span>On website</span><strong id="statPublished">—</strong></button>
                    <button type="button" class="res-kpi" data-event-filter="confirmed"><span>Confirmed</span><strong id="statConfirmed">—</strong></button>
                    <article class="res-kpi"><span>Guests booked</span><strong id="statGuests">—</strong></article>
                    <article class="res-kpi"><span>This month</span><strong id="statMonth">—</strong></article>
                    <button type="button" class="res-kpi" data-event-filter="cancelled"><span>Cancelled</span><strong id="statCancelled">—</strong></button>
                </section>

                <div class="manage-card mb-4">
                    <h3 id="eventFormTitle" style="font-family:Oswald;margin:0 0 16px;font-size:1.05rem">Schedule New Event</h3>
                    <p style="color:var(--vault-muted);margin:0 0 16px;font-size:13px">Published events appear on the homepage, services page and reservations. Unpublish to keep a booking private.</p>
                    <form id="addEventForm">
                        <div class="manage-form-grid">
                            <div class="manage-field"><label for="eTitle">Event Title</label><input type="text" id="eTitle" required placeholder="Birthday terrace party"></div>
                            <div class="manage-field"><label for="eDate">Date</label><input type="date" id="eDate" required></div>
                            <div class="manage-field"><label for="eTime">Start time</label><input type="time" id="eTime" value="19:00"></div>
                            <div class="manage-field"><label for="eGuests">Guest Count</label><input type="number" id="eGuests" min="1" value="20"></div>
                            <div class="manage-field"><label for="eType">Type</label>
                                <select id="eType">
                                    <option>Private gathering</option>
                                    <option>Birthday</option>
                                    <option>Team social</option>
                                    <option>Brand night</option>
                                    <option>Catering</option>
                                    <option>Public night</option>
                                </select>
                            </div>
                            <div class="manage-field"><label for="eContact">Host name</label><input type="text" id="eContact" placeholder="Guest or organiser"></div>
                            <div class="manage-field"><label for="eEmail">Host email</label><input type="email" id="eEmail"></div>
                            <div class="manage-field full"><label for="eDesc">Description</label><textarea id="eDesc" rows="2" placeholder="Menu, seating, bar package…"></textarea></div>
                            <div class="manage-field full">
                                <label class="res-search" style="display:flex;align-items:center;gap:8px;color:var(--vault-text)">
                                    <input type="checkbox" id="ePublished" checked style="width:auto">
                                    Show on the public website
                                </label>
                            </div>
                            <div class="manage-field full">
                                <button type="submit" class="vault-btn" id="eventSubmitBtn" style="width:auto;padding:12px 28px;max-width:100%">Add Event</button>
                                <button type="button" class="manage-btn" id="eventCancelEdit" hidden style="margin-left:8px">Cancel edit</button>
                            </div>
                        </div>
                    </form>
                </div>

                <div id="bookingImport" class="manage-card mb-4" hidden></div>

                <div class="manage-card">
                    <div class="res-table-tools">
                        <div class="res-filters">
                            <button type="button" class="res-filter active" data-event-filter="all">All</button>
                            <button type="button" class="res-filter" data-event-filter="upcoming">Upcoming</button>
                            <button type="button" class="res-filter" data-event-filter="published">On website</button>
                            <button type="button" class="res-filter" data-event-filter="unpublished">Private</button>
                            <button type="button" class="res-filter" data-event-filter="confirmed">Confirmed</button>
                            <button type="button" class="res-filter" data-event-filter="completed">Completed</button>
                            <button type="button" class="res-filter" data-event-filter="cancelled">Cancelled</button>
                        </div>
                        <label class="res-search">
                            <input type="search" id="eventSearch" placeholder="Search title, host, ref…" aria-label="Search events">
                        </label>
                    </div>
                    <div id="eventList"></div>
                </div>
            </main>
        </div>
    </div>
    <nav class="vault-mobile-dock" aria-label="Quick navigation">
        <a href="dashboard.php" class="dock-item" data-nav="dashboard"><i class="fa fa-th-large"></i><span>Deck</span></a>
        <a href="reservations.php" class="dock-item" data-nav="reservations"><i class="fa fa-calendar-check"></i><span>Bookings</span></a>
        <a href="message-inbox.php" class="dock-item" data-nav="message-inbox"><i class="fa fa-envelope"></i><span>Inbox</span></a>
        <a href="menu-vault.php" class="dock-item" data-nav="menu-vault"><i class="fa fa-utensils"></i><span>Menu</span></a>
        <button type="button" class="dock-item" id="dockMenuBtn" aria-label="More options"><i class="fa fa-ellipsis-h"></i><span>More</span></button>
    </nav>
    <script src="js/auth.js"></script>
    <script src="js/store.js"></script>
    <script src="js/shell.js"></script>
    <script src="js/events-admin.js"></script>
</body>
</html>
