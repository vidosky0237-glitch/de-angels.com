(function () {
    'use strict';

    if (window.VaultAuth && VaultAuth.redirectIfAuthenticated()) {
        return;
    }

    var form = document.getElementById('vaultLoginForm');
    var toggleBtn = document.getElementById('togglePassword');
    var emailInput = document.getElementById('email');
    var passwordInput = document.getElementById('password');
    var alertBox = document.getElementById('vaultAlert');
    var submitBtn = document.getElementById('vaultSubmit');
    var rememberBox = document.getElementById('remember');

    if (emailInput && window.VaultAuth && VaultAuth.getRememberedEmail) {
        var remembered = VaultAuth.getRememberedEmail();
        if (remembered) {
            emailInput.value = remembered;
            if (rememberBox) rememberBox.checked = true;
        }
    }

    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', function () {
            var isHidden = passwordInput.type === 'password';
            passwordInput.type = isHidden ? 'text' : 'password';
            toggleBtn.innerHTML = isHidden
                ? '<i class="fa fa-eye-slash"></i>'
                : '<i class="fa fa-eye"></i>';
            toggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
        });
    }

    function showAlert(message, type) {
        if (!alertBox) return;
        alertBox.textContent = message;
        alertBox.className = 'vault-alert show ' + type;
    }

    function hideAlert() {
        if (!alertBox) return;
        alertBox.className = 'vault-alert';
        alertBox.textContent = '';
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            hideAlert();

            var email = document.getElementById('email');
            var password = document.getElementById('password');

            if (!email.value.trim() || !password.value.trim()) {
                showAlert('Please enter your email and password.', 'error');
                return;
            }

            if (submitBtn) {
                submitBtn.classList.add('loading');
            }

            setTimeout(function () {
                if (submitBtn) {
                    submitBtn.classList.remove('loading');
                }

                var ok = window.VaultAuth && VaultAuth.login(
                    email.value,
                    password.value,
                    rememberBox && rememberBox.checked
                );

                if (!ok) {
                    showAlert('Invalid email or password. Try admin@deangels.com.', 'error');
                    return;
                }

                showAlert('Vault unlocked. Redirecting…', 'success');

                setTimeout(function () {
                    window.location.href = 'dashboard.html';
                }, 600);
            }, 900);
        });
    }
})();
