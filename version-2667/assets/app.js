(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length > 1) {
      var active = 0;
      var show = function (index) {
        active = index % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === active);
        });
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });
      setInterval(function () {
        show(active + 1);
      }, 5200);
      show(0);
    }

    var filterPanel = document.querySelector("[data-filter-panel]");
    if (filterPanel) {
      var queryInput = filterPanel.querySelector("[data-filter-query]");
      var yearSelect = filterPanel.querySelector("[data-filter-year]");
      var categorySelect = filterPanel.querySelector("[data-filter-category]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      var noResult = document.querySelector("[data-no-result]");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";
      if (queryInput && initialQuery) {
        queryInput.value = initialQuery;
      }

      var applyFilter = function () {
        var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var category = categorySelect ? categorySelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-text") || "",
            card.getAttribute("data-year") || ""
          ].join(" ").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var cardCategory = card.getAttribute("data-category") || "";
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchYear = !year || cardYear === year;
          var matchCategory = !category || cardCategory === category;
          var showCard = matchQuery && matchYear && matchCategory;
          card.style.display = showCard ? "" : "none";
          if (showCard) {
            visible += 1;
          }
        });

        if (noResult) {
          noResult.style.display = visible ? "none" : "block";
        }
      };

      [queryInput, yearSelect, categorySelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });

      applyFilter();
    }
  });

  window.setupMoviePlayer = function (source, videoId, buttonId) {
    ready(function () {
      var video = document.getElementById(videoId);
      var button = document.getElementById(buttonId);
      if (!video || !source) {
        return;
      }

      var attached = false;
      var attach = function () {
        if (attached) {
          return;
        }
        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      };

      var start = function () {
        attach();
        if (button) {
          button.classList.add("hidden");
        }
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      };

      attach();

      if (button) {
        button.addEventListener("click", start);
      }

      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("hidden");
        }
      });

      video.addEventListener("pause", function () {
        if (button && video.currentTime === 0) {
          button.classList.remove("hidden");
        }
      });
    });
  };
})();
