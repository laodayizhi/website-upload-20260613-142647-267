(function () {
  function bindHls(video, src) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return;
    }

    video.src = src;
  }

  window.initMoviePlayer = function (src) {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('player-overlay');
    var started = false;

    if (!video || !src) {
      return;
    }

    function start() {
      if (started) {
        if (video.paused) {
          video.play().catch(function () {});
        }
        return;
      }

      started = true;
      bindHls(video, src);
      video.setAttribute('controls', 'controls');

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', start);
  };
})();
