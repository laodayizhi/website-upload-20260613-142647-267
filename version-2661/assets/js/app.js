(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function openMenu() {
        var menuButton = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".main-nav");
        if (!menuButton || !nav) {
            return;
        }
        menuButton.addEventListener("click", function () {
            var opened = nav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function heroSlider() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var previous = document.querySelector("[data-hero='prev']");
        var next = document.querySelector("[data-hero='next']");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });
        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        show(0);
        restart();
    }

    function filterCards() {
        var input = document.querySelector(".js-filter-input");
        var typeSelect = document.querySelector(".js-type-select");
        var yearSelect = document.querySelector(".js-year-select");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        if (!cards.length) {
            return;
        }

        var queryParams = new URLSearchParams(window.location.search);
        var initialQuery = queryParams.get("q");
        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function apply() {
            var query = normalize(input ? input.value : "");
            var typeValue = normalize(typeSelect ? typeSelect.value : "");
            var yearValue = normalize(yearSelect ? yearSelect.value : "");
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-text"));
                var typeText = normalize(card.getAttribute("data-type"));
                var yearText = normalize(card.getAttribute("data-year"));
                var visible = true;
                if (query && text.indexOf(query) === -1) {
                    visible = false;
                }
                if (typeValue && typeText.indexOf(typeValue) === -1) {
                    visible = false;
                }
                if (yearValue && yearText !== yearValue) {
                    visible = false;
                }
                card.classList.toggle("hide-card", !visible);
            });
        }

        [input, typeSelect, yearSelect].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });
        apply();
    }

    ready(function () {
        openMenu();
        heroSlider();
        filterCards();
    });
})();

function initMoviePlayer(videoId, coverId, buttonId, playlistUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var button = document.getElementById(buttonId);
    var hlsInstance = null;
    var loaded = false;

    if (!video || !playlistUrl) {
        return;
    }

    function load() {
        if (loaded) {
            return Promise.resolve();
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = playlistUrl;
            return Promise.resolve();
        }
        if (typeof Hls !== "undefined" && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(playlistUrl);
            hlsInstance.attachMedia(video);
            return new Promise(function (resolve) {
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
            });
        }
        video.src = playlistUrl;
        return Promise.resolve();
    }

    function start() {
        load().then(function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        });
    }

    if (cover) {
        cover.addEventListener("click", start);
    }
    if (button) {
        button.addEventListener("click", function (event) {
            event.stopPropagation();
            start();
        });
    }
    video.addEventListener("click", function () {
        if (!loaded) {
            start();
        }
    });
}
