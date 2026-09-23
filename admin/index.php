<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Admin | De Angels Bar &amp; Grills</title>
    <meta name="robots" content="noindex, nofollow">
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <link href="../img/logo.png" rel="icon">
    <script src="js/auth.js"></script>
    <script>
        (function () {
            if (window.VaultAuth && VaultAuth.isAuthenticated()) {
                window.location.replace('dashboard.php');
            } else {
                window.location.replace('admin-login.php');
            }
        })();
    </script>
</head>
<body>
    <p>Redirecting to Admin… <a href="admin-login.php">Continue</a></p>
</body>
</html>
