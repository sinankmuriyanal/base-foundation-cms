// Loads the original site template scripts in order, after React has hydrated the page.
(function () {
  var scripts = ["/legacy/js/jquery-2.2.4.min.js", "/legacy/js/libs.min.js", "/legacy/js/common.min.js"];
  function next(i) {
    if (i >= scripts.length) return;
    var s = document.createElement("script");
    s.src = scripts[i];
    s.onload = function () {
      next(i + 1);
    };
    document.body.appendChild(s);
  }
  next(0);
})();
