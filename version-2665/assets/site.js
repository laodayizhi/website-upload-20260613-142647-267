(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
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
    slides.forEach(function (slide, position) {
      slide.classList.toggle('is-active', position === current);
    });
    dots.forEach(function (dot, position) {
      dot.classList.toggle('is-active', position === current);
    });
  }

  var previous = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  if (previous) {
    previous.addEventListener('click', function () {
      showSlide(current - 1);
    });
  }
  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
    });
  }
  dots.forEach(function (dot, position) {
    dot.addEventListener('click', function () {
      showSlide(position);
    });
  });
  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function textOf(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-meta') || '',
      card.getAttribute('data-tags') || ''
    ].join(' ').toLowerCase();
  }

  function applySearch() {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim().toLowerCase();
    var searchInputs = document.querySelectorAll('input[name="q"]');
    searchInputs.forEach(function (input) {
      if (query && !input.value) {
        input.value = query;
      }
    });
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    if (!cards.length || !document.body.classList.contains('search-page')) {
      return;
    }
    var shown = 0;
    cards.forEach(function (card) {
      var visible = !query || textOf(card).indexOf(query) !== -1;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        shown += 1;
      }
    });
    var empty = document.querySelector('.no-results');
    if (empty) {
      empty.classList.toggle('is-visible', shown === 0);
    }
  }
  applySearch();

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var filter = button.getAttribute('data-filter') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      var cards = Array.prototype.slice.call(document.querySelectorAll('.filterable .movie-card'));
      cards.forEach(function (card) {
        var haystack = textOf(card);
        var visible = filter === 'all' || haystack.indexOf(filter.toLowerCase()) !== -1;
        card.style.display = visible ? '' : 'none';
      });
    });
  });

  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('.player-overlay');
    var prepared = false;
    var stream = video ? video.getAttribute('data-hls') : '';

    function prepare() {
      if (!video || prepared || !stream) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var player = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        player.loadSource(stream);
        player.attachMedia(video);
        shell._player = player;
      } else {
        video.src = stream;
      }
    }

    function start() {
      prepare();
      shell.classList.add('is-playing');
      var request = video.play();
      if (request && request.catch) {
        request.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0) {
          shell.classList.remove('is-playing');
        }
      });
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(setupPlayer);
})();
