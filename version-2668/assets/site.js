(function () {
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  document.querySelectorAll('[data-filter-box]').forEach(function (box) {
    var scope = box.closest('section') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card-list] article'));
    var keyword = box.querySelector('[data-filter-keyword]');
    var region = box.querySelector('[data-filter-region]');
    var type = box.querySelector('[data-filter-type]');
    var year = box.querySelector('[data-filter-year]');
    var empty = scope.querySelector('[data-filter-empty]');

    function fill(select, attr) {
      if (!select) {
        return;
      }
      var values = [];
      cards.forEach(function (card) {
        var value = card.getAttribute(attr) || '';
        if (value && values.indexOf(value) === -1) {
          values.push(value);
        }
      });
      values.sort().forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fill(region, 'data-region');
    fill(type, 'data-type');
    fill(year, 'data-year');

    function apply() {
      var q = keyword ? keyword.value.trim().toLowerCase() : '';
      var r = region ? region.value : '';
      var t = type ? type.value : '';
      var y = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        var matched = true;

        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (r && card.getAttribute('data-region') !== r) {
          matched = false;
        }
        if (t && card.getAttribute('data-type') !== t) {
          matched = false;
        }
        if (y && card.getAttribute('data-year') !== y) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [keyword, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  });

  var searchResults = document.getElementById('search-results');
  if (searchResults && window.MovieIndex) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var title = document.querySelector('[data-search-title]');
    var empty = document.getElementById('search-empty');

    function clean(value) {
      return String(value || '').replace(/[&<>"]/g, function (match) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[match];
      });
    }

    function card(item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span class="tag">' + clean(tag) + '</span>';
      }).join('');
      return '<article class="movie-card normal">' +
        '<a class="card-media" href="./' + clean(item.file) + '">' +
          '<img src="' + clean(item.cover) + '" alt="' + clean(item.title) + '" loading="lazy">' +
          '<span class="year-badge">' + clean(item.year) + '</span>' +
        '</a>' +
        '<div class="card-body">' +
          '<div class="card-meta"><span>' + clean(item.region) + '</span><span>' + clean(item.type) + '</span></div>' +
          '<h3><a href="./' + clean(item.file) + '">' + clean(item.title) + '</a></h3>' +
          '<p>' + clean(item.oneLine) + '</p>' +
          '<div class="card-tags">' + tags + '</div>' +
        '</div>' +
      '</article>';
    }

    if (query) {
      if (title) {
        title.textContent = '搜索结果：' + query;
      }
      var q = query.toLowerCase();
      var list = window.MovieIndex.filter(function (item) {
        return [item.title, item.region, item.type, item.year, item.genre, item.oneLine, (item.tags || []).join(' ')].join(' ').toLowerCase().indexOf(q) !== -1;
      });
      searchResults.innerHTML = list.slice(0, 240).map(card).join('');
      if (empty) {
        empty.classList.toggle('is-visible', list.length === 0);
      }
    }
  }
})();
