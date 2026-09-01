(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 45) {
            $('.navbar').addClass('sticky-top shadow-sm');
        } else {
            $('.navbar').removeClass('sticky-top shadow-sm');
        }
    });


    // Chameleon navbar — slowly adapts to the section colour underneath
    (function chameleonNav() {
        var $nav = $('.navbar');
        if (!$nav.length) {
            return;
        }

        $nav.addClass('chameleon-nav nav-on-dark');

        var current = { r: 26, g: 20, b: 16, a: 0.55 };
        var target = { r: 26, g: 20, b: 16, a: 0.55 };
        var lightMode = false;

        function parseColor(value) {
            if (!value || value === 'transparent') {
                return null;
            }
            var match = value.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s]+([\d.]+))?\)/);
            if (!match) {
                return null;
            }
            var alpha = match[4] === undefined ? 1 : parseFloat(match[4]);
            if (alpha < 0.12) {
                return null;
            }
            return {
                r: parseInt(match[1], 10),
                g: parseInt(match[2], 10),
                b: parseInt(match[3], 10)
            };
        }

        function sampleSectionColor() {
            var navEl = $nav.get(0);
            var rect = navEl.getBoundingClientRect();
            var x = Math.max(24, Math.min(window.innerWidth - 24, window.innerWidth / 2));
            var y = Math.min(window.innerHeight - 4, Math.max(0, rect.bottom + 18));
            var node = document.elementFromPoint(x, y);
            var safety = 0;

            while (node && node !== document.documentElement && safety < 18) {
                safety += 1;
                if (navEl.contains(node) || node === navEl) {
                    node = node.parentElement;
                    continue;
                }

                var style = window.getComputedStyle(node);
                var color = parseColor(style.backgroundColor);
                if (color) {
                    return color;
                }

                var image = style.backgroundImage;
                if (image && image !== 'none') {
                    if (node.classList.contains('hero-home') || node.classList.contains('hero-header') || node.classList.contains('hero-inner')) {
                        return { r: 8, g: 6, b: 4 };
                    }
                    if (node.classList.contains('footer') || node.classList.contains('bg-dark')) {
                        return { r: 26, g: 20, b: 16 };
                    }
                    return { r: 36, g: 28, b: 22 };
                }

                node = node.parentElement;
            }

            return { r: 26, g: 20, b: 16 };
        }

        function updateTarget() {
            var sampled = sampleSectionColor();
            var lum = (0.299 * sampled.r + 0.587 * sampled.g + 0.114 * sampled.b) / 255;
            var scrolled = $(window).scrollTop() > 40;
            target.r = sampled.r;
            target.g = sampled.g;
            target.b = sampled.b;
            target.a = scrolled ? 0.9 : 0.42;
            lightMode = lum > 0.58;
        }

        function lerp(from, to, amount) {
            return from + (to - from) * amount;
        }

        function paint() {
            current.r = lerp(current.r, target.r, 0.06);
            current.g = lerp(current.g, target.g, 0.06);
            current.b = lerp(current.b, target.b, 0.06);
            current.a = lerp(current.a, target.a, 0.06);

            var bg = 'rgba(' +
                Math.round(current.r) + ', ' +
                Math.round(current.g) + ', ' +
                Math.round(current.b) + ', ' +
                current.a.toFixed(3) + ')';

            $nav.get(0).style.setProperty('--chameleon-bg', bg);
            $nav.get(0).style.setProperty('background-color', bg, 'important');

            if (lightMode) {
                $nav.addClass('nav-on-light').removeClass('nav-on-dark');
            } else {
                $nav.addClass('nav-on-dark').removeClass('nav-on-light');
            }

            requestAnimationFrame(paint);
        }

        updateTarget();
        paint();
        $(window).on('scroll resize', updateTarget);
    })();
    
    
    // Dropdown on mouse hover
    const $dropdown = $(".dropdown");
    const $dropdownToggle = $(".dropdown-toggle");
    const $dropdownMenu = $(".dropdown-menu");
    const showClass = "show";
    
    $(window).on("load resize", function() {
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
            function() {
                const $this = $(this);
                $this.addClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "true");
                $this.find($dropdownMenu).addClass(showClass);
            },
            function() {
                const $this = $(this);
                $this.removeClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "false");
                $this.find($dropdownMenu).removeClass(showClass);
            }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Modal Video
    $(document).ready(function () {
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data("src");
        });
        console.log($videoSrc);

        $('#videoModal').on('shown.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })

        $('#videoModal').on('hide.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc);
        })
    });


    // Gallery filters
    (function () {
        var gallery = document.getElementById('gallery');
        if (!gallery) {
            return;
        }

        var filters = gallery.querySelectorAll('.gallery-filter');
        var cells = gallery.querySelectorAll('.gallery-cell');

        filters.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var category = btn.getAttribute('data-filter');

                filters.forEach(function (item) {
                    item.classList.remove('active');
                });
                btn.classList.add('active');

                cells.forEach(function (cell) {
                    var card = cell.querySelector('[data-gallery-cat]');
                    var match = category === 'all' || (card && card.getAttribute('data-gallery-cat') === category);
                    cell.classList.toggle('is-hidden', !match);
                });
            });
        });
    })();
    
})(jQuery);

