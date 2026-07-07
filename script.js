// ============================================================
// Telemetry HUD — small fixed status widget, purely decorative.
// Shows local time and cycles through a few status lines.
// Respects prefers-reduced-motion (no animated dot pulse if set,
// handled in CSS; here we just avoid rapid text thrash).
// ============================================================

(function(){
  var messages = [
    "AWAITING INPUT",
    "COMPILING NOTES",
    "SYS: NOMINAL"
  ];
  var i = 0;

  function pad(n){ return n < 10 ? "0" + n : n; }

  function mountHud(){
    var hud = document.createElement("div");
    hud.className = "hud";
    hud.setAttribute("aria-hidden", "true");
    hud.innerHTML =
      '<span class="dot"></span>' +
      '<span class="hud-status">' + messages[0] + '</span>' +
      '<span class="sep">·</span>' +
      '<span class="hud-clock">00:00:00</span>';
    document.body.appendChild(hud);

    function tick(){
      var d = new Date();
      hud.querySelector(".hud-clock").textContent =
        pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
    }
    tick();
    setInterval(tick, 1000);

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(!reduce){
      setInterval(function(){
        i = (i + 1) % messages.length;
        hud.querySelector(".hud-status").textContent = messages[i];
      }, 6000);
    }
  }

  // Mark the current page's nav link as active.
  function markActiveNav(){
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(function(a){
      var href = a.getAttribute("href");
      if(href === path || (path === "" && href === "index.html")){
        a.classList.add("active");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    mountHud();
    markActiveNav();
  });
})();
