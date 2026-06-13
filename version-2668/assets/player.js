(function () {
  function start(shell) {
    var video = shell.querySelector('video');
    var source = shell.getAttribute('data-stream');

    if (!video || !source) {
      return;
    }

    if (shell.getAttribute('data-ready') !== '1') {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        shell.hls = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
      shell.setAttribute('data-ready', '1');
    }

    shell.classList.add('is-playing');
    var play = video.play();
    if (play && typeof play.catch === 'function') {
      play.catch(function () {});
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var button = shell.querySelector('[data-player-button]');
    var video = shell.querySelector('video');

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        start(shell);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (shell.getAttribute('data-ready') !== '1') {
          start(shell);
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
  });
})();
