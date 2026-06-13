(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = Number(dot.getAttribute('data-slide') || '0');
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilters() {
    var input = document.querySelector('.card-filter-input');
    var typeSelect = document.querySelector('.type-filter');
    var yearSelect = document.querySelector('.year-filter');
    var regionSelect = document.querySelector('.region-filter');
    var query = normalize(input && input.value);
    var type = normalize(typeSelect && typeSelect.value);
    var year = normalize(yearSelect && yearSelect.value);
    var region = normalize(regionSelect && regionSelect.value);
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-scope .movie-card'));

    cards.forEach(function (card) {
      var searchable = normalize(card.getAttribute('data-search'));
      var cardType = normalize(card.getAttribute('data-type'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var matched = true;

      if (query && searchable.indexOf(query) === -1) {
        matched = false;
      }
      if (type && cardType !== type) {
        matched = false;
      }
      if (year && cardYear !== year) {
        matched = false;
      }
      if (region && cardRegion !== region) {
        matched = false;
      }

      card.hidden = !matched;
    });
  }

  var filterControls = Array.prototype.slice.call(document.querySelectorAll('.card-filter-input, .type-filter, .year-filter, .region-filter'));
  filterControls.forEach(function (control) {
    control.addEventListener('input', applyFilters);
    control.addEventListener('change', applyFilters);
  });

  var searchInput = document.getElementById('site-search-input') || document.querySelector('.card-filter-input');
  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery) {
      searchInput.value = initialQuery;
      applyFilters();
    }
  }
})();
