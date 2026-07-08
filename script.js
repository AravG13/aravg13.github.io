// ============================================================
// NOW PLAYING — edit this one line to change the embedded track.
// Paste a normal share link from either service, e.g.:
//   Spotify:     https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp
//   Apple Music: https://music.apple.com/us/album/xxx/1234567890?i=1234567891
// Leave as "" to hide the widget entirely.
// ============================================================
const NOW_PLAYING_URL = "https://music.apple.com/in/song/rylee-i/1882613332";

function buildEmbedSrc(url){
  if(!url) return null;
  try{
    if(url.indexOf("open.spotify.com") !== -1){
      return url.replace("open.spotify.com/", "open.spotify.com/embed/") + (url.indexOf("?") !== -1 ? "&" : "?") + "theme=0";
    }
    if(url.indexOf("music.apple.com") !== -1){
      return url.replace("music.apple.com", "embed.music.apple.com");
    }
  }catch(e){ /* fall through */ }
  return null;
}

function mountNowPlaying(){
  var wrap = document.getElementById("np-frame-wrap");
  if(!wrap) return;
  var src = buildEmbedSrc(NOW_PLAYING_URL);
  var panel = wrap.closest(".now-playing");
  if(!src){
    if(panel) panel.style.display = "none";
    return;
  }
  var isApple = NOW_PLAYING_URL.indexOf("music.apple.com") !== -1;
  var iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.width = "100%";
  iframe.height = isApple ? "150" : "152";
  iframe.frameBorder = "0";
  iframe.allow = "autoplay; encrypted-media; fullscreen; clipboard-write";
  iframe.loading = "lazy";
  iframe.title = "Now playing";
  wrap.appendChild(iframe);
}

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
    mountNowPlaying();
  });
})();