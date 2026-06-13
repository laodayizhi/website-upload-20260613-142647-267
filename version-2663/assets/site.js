
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function normalizeText(value) {
    return (value || '').toString().trim().toLowerCase();
}

function initMobileMenu() {
    const button = $('.mobile-menu-button');
    const nav = $('#mobileNav');
    if (!button || !nav) {
        return;
    }

    button.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('is-open');
        button.setAttribute('aria-expanded', String(isOpen));
    });
}

function initHeroCarousel() {
    const carousel = $('[data-hero-carousel]');
    if (!carousel) {
        return;
    }

    const slides = $$('.hero-slide', carousel);
    const dots = $$('.hero-dot', carousel);
    const next = $('[data-hero-next]', carousel);
    const prev = $('[data-hero-prev]', carousel);
    let current = 0;
    let timer = null;

    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(() => show(current + 1), 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            show(index);
            start();
        });
    });

    if (next) {
        next.addEventListener('click', () => {
            show(current + 1);
            start();
        });
    }

    if (prev) {
        prev.addEventListener('click', () => {
            show(current - 1);
            start();
        });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
}

function initFilters() {
    $$('[data-filter-scope]').forEach((scope) => {
        const searchInput = $('[data-filter-search]', scope);
        const yearSelect = $('[data-filter-year]', scope);
        const regionSelect = $('[data-filter-region]', scope);
        const genreSelect = $('[data-filter-genre]', scope);
        const count = $('[data-filter-count]', scope);
        const cards = $$('.searchable-card');

        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        if (query && searchInput) {
            searchInput.value = query;
        }

        function apply() {
            const queryValue = normalizeText(searchInput ? searchInput.value : '');
            const yearValue = normalizeText(yearSelect ? yearSelect.value : '');
            const regionValue = normalizeText(regionSelect ? regionSelect.value : '');
            const genreValue = normalizeText(genreSelect ? genreSelect.value : '');
            let visible = 0;

            cards.forEach((card) => {
                const haystack = normalizeText([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.keywords,
                    card.textContent
                ].join(' '));
                const matchesQuery = !queryValue || haystack.includes(queryValue);
                const matchesYear = !yearValue || normalizeText(card.dataset.year).includes(yearValue);
                const matchesRegion = !regionValue || normalizeText(card.dataset.region).includes(regionValue);
                const matchesGenre = !genreValue || normalizeText(card.dataset.genre).includes(genreValue) || haystack.includes(genreValue);
                const shouldShow = matchesQuery && matchesYear && matchesRegion && matchesGenre;
                card.classList.toggle('is-filter-hidden', !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible;
            }
        }

        [searchInput, yearSelect, regionSelect, genreSelect].forEach((control) => {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    });
}

async function initPlayer() {
    const video = $('#moviePlayer');
    if (!video) {
        return;
    }

    const source = video.dataset.hlsSrc;
    const status = $('[data-player-status]');
    const playButton = $('[data-player-start]');

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    if (!source) {
        setStatus('当前播放源暂不可用');
        return;
    }

    try {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            setStatus('原生 HLS 播放已就绪');
        } else {
            const module = await import('./player-dru42stk.js');
            const Hls = module.H;
            if (Hls && Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => setStatus('HLS 播放已就绪'));
                hls.on(Hls.Events.ERROR, (_event, data) => {
                    if (data && data.fatal) {
                        setStatus('播放遇到错误，正在尝试恢复');
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        }
                    }
                });
            } else {
                setStatus('当前浏览器不支持 HLS 播放');
            }
        }
    } catch (error) {
        setStatus('播放器初始化失败');
        console.error(error);
    }

    if (playButton) {
        playButton.addEventListener('click', async () => {
            try {
                await video.play();
                playButton.classList.add('is-hidden');
            } catch (error) {
                setStatus('请再次点击播放器开始播放');
            }
        });
    }

    video.addEventListener('play', () => {
        if (playButton) {
            playButton.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', () => {
        if (playButton && video.currentTime === 0) {
            playButton.classList.remove('is-hidden');
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initHeroCarousel();
    initFilters();
    initPlayer();
});
