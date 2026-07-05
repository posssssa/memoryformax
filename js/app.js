(function () {
  "use strict";

  function ready() {
    document.body.classList.add("is-ready");
  }

  window.addEventListener("pageshow", function () {
    window.requestAnimationFrame(ready);
  });
})();
