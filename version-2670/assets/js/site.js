(function () {
  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  const filterRoots = Array.from(document.querySelectorAll('[data-filter-root]'));

  filterRoots.forEach(function (root) {
    const searchInput = root.querySelector('[data-search-input]');
    const yearSelect = root.querySelector('[data-filter-year]');
    const typeSelect = root.querySelector('[data-filter-type]');
    const regionSelect = root.querySelector('[data-filter-region]');
    const cards = Array.from(root.querySelectorAll('[data-movie-card]'));

    if (!cards.length) {
      return;
    }

    if (searchInput) {
      const params = new URLSearchParams(window.location.search);
      const query = params.get('q');

      if (query) {
        searchInput.value = query;
      }
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      const query = normalize(searchInput ? searchInput.value : '');
      const year = normalize(yearSelect ? yearSelect.value : '');
      const type = normalize(typeSelect ? typeSelect.value : '');
      const region = normalize(regionSelect ? regionSelect.value : '');

      cards.forEach(function (card) {
        const text = normalize(card.getAttribute('data-search'));
        const cardYear = normalize(card.getAttribute('data-year'));
        const cardType = normalize(card.getAttribute('data-type'));
        const cardRegion = normalize(card.getAttribute('data-region'));
        const matched = (!query || text.includes(query)) &&
          (!year || cardYear === year) &&
          (!type || cardType === type) &&
          (!region || cardRegion === region);

        card.hidden = !matched;
      });
    }

    [searchInput, yearSelect, typeSelect, regionSelect].forEach(function (field) {
      if (field) {
        field.addEventListener('input', applyFilters);
        field.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  });

  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    const video = player.querySelector('video');
    const startButton = player.querySelector('.player-start');
    const stream = player.getAttribute('data-stream');
    let loaded = false;
    let hls = null;

    if (!video || !stream) {
      return;
    }

    function beginPlayback() {
      if (loaded) {
        video.play().catch(function () {});
        return;
      }

      loaded = true;

      if (startButton) {
        startButton.classList.add('is-hidden');
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
        video.load();
      } else {
        video.src = stream;
        video.play().catch(function () {});
      }
    }

    if (startButton) {
      startButton.addEventListener('click', beginPlayback);
    }

    video.addEventListener('click', function () {
      if (!loaded) {
        beginPlayback();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
