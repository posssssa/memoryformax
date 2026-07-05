(function () {
  "use strict";

  var audio = document.getElementById("memoryAudio");
  var player = document.querySelector("[data-player]");
  var playButton = document.querySelector("[data-play-toggle]");
  var timeline = document.querySelector("[data-timeline]");
  var currentTimeEl = document.querySelector("[data-current-time]");
  var durationEl = document.querySelector("[data-duration]");
  var frameId = 0;
  var isSeeking = false;
  var pendingSeekValue = 0;

  if (!audio || !player || !playButton || !timeline || !currentTimeEl || !durationEl) {
    return;
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }

    var minutes = Math.floor(seconds / 60);
    var remaining = Math.floor(seconds % 60);
    return minutes + ":" + String(remaining).padStart(2, "0");
  }

  function setProgress(value) {
    var clamped = Math.max(0, Math.min(1000, value || 0));
    timeline.value = String(Math.round(clamped));
    timeline.style.setProperty("--progress", clamped / 10 + "%");
  }

  function updateTimes() {
    var duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    var current = isSeeking ? pendingSeekValue : audio.currentTime;
    var progress = duration > 0 ? current / duration * 1000 : 0;

    setProgress(progress);
    currentTimeEl.textContent = formatTime(current);
    durationEl.textContent = formatTime(duration);
  }

  function tick() {
    updateTimes();

    if (!audio.paused && !audio.ended) {
      frameId = window.requestAnimationFrame(tick);
    }
  }

  function startTicking() {
    window.cancelAnimationFrame(frameId);
    frameId = window.requestAnimationFrame(tick);
  }

  function setLoading(isLoading) {
    player.classList.toggle("is-loading-track", isLoading);
    playButton.disabled = isLoading && audio.readyState < 2;
  }

  function setPlaying(isPlaying) {
    player.classList.toggle("is-playing", isPlaying);
    playButton.setAttribute("aria-label", isPlaying ? "Пауза" : "Воспроизвести");
  }

  function play() {
    var playback = audio.play();

    if (playback && typeof playback.catch === "function") {
      playback.catch(function () {
        setLoading(false);
        setPlaying(false);
      });
    }
  }

  playButton.addEventListener("click", function () {
    if (audio.paused || audio.ended) {
      setLoading(audio.readyState < 2);
      play();
    } else {
      audio.pause();
    }
  });

  timeline.addEventListener("input", function () {
    var duration = Number.isFinite(audio.duration) ? audio.duration : 0;

    if (duration <= 0) {
      setProgress(0);
      return;
    }

    isSeeking = true;
    pendingSeekValue = Number(timeline.value) / 1000 * duration;
    currentTimeEl.textContent = formatTime(pendingSeekValue);
    setProgress(Number(timeline.value));
  });

  timeline.addEventListener("change", function () {
    var duration = Number.isFinite(audio.duration) ? audio.duration : 0;

    if (duration > 0) {
      audio.currentTime = pendingSeekValue;
    }

    isSeeking = false;
    updateTimes();

    if (!audio.paused) {
      startTicking();
    }
  });

  audio.addEventListener("loadedmetadata", function () {
    timeline.disabled = false;
    playButton.disabled = false;
    setLoading(false);
    updateTimes();
  });

  audio.addEventListener("canplay", function () {
    setLoading(false);
  });

  audio.addEventListener("waiting", function () {
    if (!audio.paused) {
      setLoading(true);
    }
  });

  audio.addEventListener("playing", function () {
    setLoading(false);
    setPlaying(true);
    startTicking();
  });

  audio.addEventListener("pause", function () {
    setPlaying(false);
    updateTimes();
    window.cancelAnimationFrame(frameId);
  });

  audio.addEventListener("ended", function () {
    setPlaying(false);
    updateTimes();
  });

  audio.addEventListener("error", function () {
    setLoading(false);
    setPlaying(false);
    playButton.disabled = true;
    timeline.disabled = true;
  });

  timeline.disabled = true;
  updateTimes();
})();
