(function (global) {
  var SLIDES = [
    { id: '001-title-card', duration: 3.732, audio: '001-title-card.mp3' },
    { id: '002-spinning-news', duration: 9.093, audio: '002-spinning-news.mp3' },
    { id: '003-the-problem', duration: 13.945, audio: '03-plethora-of-csps-people.mp3' },
    { id: '004-teams', duration: 7.507, audio: '00-many-teams.mp3' },
    { id: '005-the-problem-trust', duration: 4.974, audio: '004-trust-question.mp3' },
    { id: '006-build-is-changing', duration: 4.442, audio: '005-way-we-build.mp3' },
    { id: '007-how-we-build', duration: 11.376, audio: '006-teams-higher-level.mp3' },
    { id: '008-ai', duration: 4.112, audio: '02-ai.mp3' },
    { id: '009-trusted-components', duration: 8.915, audio: '03-teams-want-secure.mp3' },
    { id: '010-intro-ccc', duration: 3.896, audio: '00-title-card.mp3' },
    { id: '011-ccc-architecture', duration: 21.402, audio: '01-ccc-description  .mp3' },
    { id: '012-ccc-pipeline', duration: 10.681, audio: '5.mp3' },
    { id: '013-how-can-you-use-ccc', duration: 4.76, audio: '6.mp3' },
    { id: '014-use-the-definitions', duration: 4.187, audio: '7.1.mp3' },
    { id: '015-definitions-breakdown', duration: 15.01, audio: '7.2.mp3' },
    { id: '016-use-the-ecosystem', duration: 3.821, audio: '8.mp3' },
    { id: '017-ecosystem-description', duration: 13.158, audio: '8.2.mp3' },
    { id: '018-use-the-validators', duration: 8.688, audio: '9.mp3' },
    { id: '019-gemara', duration: 5.215, audio: '10.2.mp3' },
    { id: '020-gemara-architecture', duration: 4.005, audio: '10-3.mp3' },
    { id: '021-ditch-spreadsheets', duration: 7.09, audio: '10-5.mp3' },
    { id: '022-ccc-finos-org', duration: 6.641, audio: '11.mp3' }
  ];

  var advanceTimeout = null;

  function slideUrl(id) {
    return '../' + id + '/index.html';
  }

  function getCurrentSlideId() {
    var parts = location.pathname.split('/');
    var i;

    for (i = parts.length - 1; i >= 0; i -= 1) {
      if (/^\d{3}-/.test(parts[i])) {
        return parts[i];
      }
    }

    return null;
  }

  function getCurrentIndex() {
    var id = getCurrentSlideId();
    var i;

    for (i = 0; i < SLIDES.length; i += 1) {
      if (SLIDES[i].id === id) {
        return i;
      }
    }

    return -1;
  }

  function shouldAutoplay() {
    return new URLSearchParams(location.search).has('autoplay');
  }

  function clearAdvance() {
    if (advanceTimeout) {
      clearTimeout(advanceTimeout);
      advanceTimeout = null;
    }
  }

  function goToNext() {
    var idx = getCurrentIndex();

    if (idx >= 0 && idx < SLIDES.length - 1) {
      location.href = slideUrl(SLIDES[idx + 1].id) + '?autoplay';
    }
  }

  function scheduleAdvance(audio, duration) {
    clearAdvance();

    if (audio) {
      audio.removeEventListener('ended', goToNext);
      audio.addEventListener('ended', goToNext, { once: true });
      return;
    }

    if (!duration) {
      var idx = getCurrentIndex();
      if (idx >= 0) {
        duration = SLIDES[idx].duration;
      }
    }

    if (duration) {
      advanceTimeout = setTimeout(goToNext, duration * 1000);
    }
  }

  function prefetchNext() {
    var idx = getCurrentIndex();

    if (idx < 0 || idx >= SLIDES.length - 1) {
      return;
    }

    var next = SLIDES[idx + 1];
    var href = slideUrl(next.id);
    var link = document.createElement('link');

    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);

    fetch(href, { cache: 'force-cache' }).catch(function () {});

    if (next.audio) {
      var audioLink = document.createElement('link');
      audioLink.rel = 'preload';
      audioLink.as = 'audio';
      audioLink.href = '../' + next.id + '/' + encodeURI(next.audio);
      document.head.appendChild(audioLink);
    }
  }

  function register(options) {
    options = options || {};
    var playFn = options.play;
    var audio = options.audio || document.querySelector('audio');
    var duration = options.duration;
    var started = false;

    function run() {
      if (started) {
        return;
      }

      started = true;
      window.removeEventListener('click', onStart);
      window.removeEventListener('keydown', onKey);

      if (playFn) {
        playFn();
      }

      scheduleAdvance(audio, duration);
    }

    function onStart() {
      run();
    }

    function onKey(event) {
      if (event.repeat) {
        return;
      }

      run();
    }

    prefetchNext();

    if (shouldAutoplay()) {
      var startWhenReady = function () {
        setTimeout(run, 100);
      };

      if (document.readyState === 'complete') {
        startWhenReady();
      } else {
        window.addEventListener('load', startWhenReady, { once: true });
      }
    } else {
      window.addEventListener('click', onStart);
      window.addEventListener('keydown', onKey);
    }
  }

  global.Presentation = {
    register: register,
    goToNext: goToNext,
    SLIDES: SLIDES
  };
})(window);
