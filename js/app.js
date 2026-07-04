(function () {
  "use strict";

  var nextUrl = "posa.html";
  var transitionDuration = 500;
  var isNavigating = false;

  function ready() {
    document.body.classList.add("is-ready");
  }

  function fadeTo(url) {
    if (isNavigating) {
      return;
    }

    isNavigating = true;
    document.body.classList.add("is-leaving");

    window.setTimeout(function () {
      window.location.href = url;
    }, transitionDuration);
  }

  window.MemoryApp = {
    goNext: function () {
      fadeTo(nextUrl);
    }
  };

  window.addEventListener("pageshow", function () {
    isNavigating = false;
    document.body.classList.remove("is-leaving");
    window.requestAnimationFrame(ready);
  });

  document.addEventListener("click", function (event) {
    var target = event.target.closest("[data-continue]");
    if (target) {
      fadeTo(nextUrl);
    }
  });
})();
