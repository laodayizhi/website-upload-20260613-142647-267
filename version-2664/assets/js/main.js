(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-button]');
        var mobilePanel = document.querySelector('[data-mobile-panel]');
        if (menuButton && mobilePanel) {
            menuButton.addEventListener('click', function () {
                mobilePanel.classList.toggle('is-open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === activeIndex);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === activeIndex);
            });
        }

        function startHero() {
            if (timer) {
                clearInterval(timer);
            }
            if (slides.length > 1) {
                timer = setInterval(function () {
                    showSlide(activeIndex + 1);
                }, 5200);
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
                startHero();
            });
        });
        showSlide(0);
        startHero();

        var queryParams = new URLSearchParams(window.location.search);
        var q = queryParams.get('q') || '';
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
        searchInputs.forEach(function (input) {
            if (q && !input.value) {
                input.value = q;
            }
        });

        var filterInput = document.querySelector('[data-card-filter]');
        var yearSelect = document.querySelector('[data-year-filter]');
        var typeSelect = document.querySelector('[data-type-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var emptyState = document.querySelector('[data-empty-state]');

        function normalize(value) {
            return (value || '').toString().toLowerCase().trim();
        }

        function filterCards() {
            if (!cards.length) {
                return;
            }
            var keyword = normalize(filterInput ? filterInput.value : q);
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var okYear = !year || card.getAttribute('data-year') === year;
                var okType = !type || card.getAttribute('data-type') === type;
                var ok = okKeyword && okYear && okType;
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        if (filterInput) {
            filterInput.addEventListener('input', filterCards);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', filterCards);
        }
        if (typeSelect) {
            typeSelect.addEventListener('change', filterCards);
        }
        if (cards.length && (q || filterInput || yearSelect || typeSelect)) {
            filterCards();
        }
    });
})();
