// ============================================================
// NOW PLAYING — edit this one line to change the embedded track.
// Paste a share link from either service, e.g.:
//   Spotify:     https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp
//   Apple Music: https://music.apple.com/us/album/xxx/1234567890?i=1234567891
// NOTE on Apple Music: plain "/song/name/id" permalinks often fail to
// embed (blank box, no error). Get the reliable link by opening the
// track inside its ALBUM view, then track's ••• menu -> Share ->
// "Copy Embed Code", and paste the src="..." URL from that snippet
// here instead. Pasting an already-"embed.music.apple.com" URL is
// also fine — it's detected and used as-is below.
// Leave as "" to hide the widget entirely.
// ============================================================
const NOW_PLAYING_URL = "https://embed.music.apple.com/in/song/rylee-i/1882613332";
function buildEmbedSrc(url){
  if(!url) return null;
  try{
    if(url.indexOf("embed.music.apple.com") !== -1 || url.indexOf("open.spotify.com/embed") !== -1){
      return url; // already an embed src, use as-is
    }
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
  var src = buildEmbedSrc(NOW_PLAYING_URL);
  if(!src) return; // nothing to show, skip entirely

  var panel = document.createElement("div");
  panel.className = "now-playing-hud";

  var label = document.createElement("button");
  label.className = "np-label";
  label.type = "button";
  label.innerHTML = '<span class="signal-dot">♪</span> NOW PLAYING <span class="np-toggle">▾</span>';

  var frameWrap = document.createElement("div");
  frameWrap.className = "np-frame-wrap";

  var isApple = NOW_PLAYING_URL.indexOf("music.apple.com") !== -1;
  var iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.width = "100%";
  iframe.height = isApple ? "150" : "152";
  iframe.frameBorder = "0";
  iframe.allow = "autoplay; encrypted-media; fullscreen; clipboard-write";
  iframe.loading = "lazy";
  iframe.title = "Now playing";
  frameWrap.appendChild(iframe);

  label.addEventListener("click", function(){
    panel.classList.toggle("collapsed");
  });

  panel.appendChild(label);
  panel.appendChild(frameWrap);
  document.body.appendChild(panel);
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

  // ============================================================
  // Lightweight client-side router.
  // Intercepts internal nav clicks and swaps only <main>'s content
  // via fetch, instead of doing a full page reload. This is what
  // keeps the now-playing iframe alive when navigating between
  // pages (header/footer/HUD/widget live outside <main>, so they're
  // never touched). Falls back to a real navigation if fetch fails
  // for any reason (offline, opened via file://, etc).
  // ============================================================

  function isInternalNavLink(a){
    if(!a) return false;
    if(a.target === "_blank") return false;
    if(a.hasAttribute("download")) return false;
    var href = a.getAttribute("href");
    if(!href || href.indexOf("#") === 0) return false;
    if(/^(mailto:|tel:|javascript:)/i.test(href)) return false;
    var resolved;
    try{ resolved = new URL(href, window.location.href); }catch(e){ return false; }
    if(resolved.hostname !== window.location.hostname) return false;
    if(resolved.pathname === window.location.pathname && resolved.hash) return false;
    return /\.html?$/i.test(resolved.pathname);
  }

  function swapContent(html){
    var doc = new DOMParser().parseFromString(html, "text/html");
    var newMain = doc.querySelector("main");
    var curMain = document.querySelector("main");
    if(!newMain || !curMain) return false;
    curMain.innerHTML = newMain.innerHTML;
    document.title = doc.title || document.title;
    window.scrollTo(0, 0);
    document.querySelectorAll(".nav-links a.active").forEach(function(a){ a.classList.remove("active"); });
    markActiveNav();
    return true;
  }

  function loadPage(url, push){
    fetch(url).then(function(res){
      if(!res.ok) throw new Error("bad response");
      return res.text();
    }).then(function(html){
      if(!swapContent(html)){ window.location.href = url; return; }
      if(push) history.pushState({}, "", url);
    }).catch(function(){
      window.location.href = url; // graceful fallback: real navigation
    });
  }

  function initRouter(){
    document.addEventListener("click", function(e){
      if(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest("a");
      if(!isInternalNavLink(a)) return;
      e.preventDefault();
      loadPage(new URL(a.getAttribute("href"), window.location.href).href, true);
    });

    window.addEventListener("popstate", function(){
      loadPage(window.location.href, false);
    });
  }

  function initMediaFilters(){
    document.addEventListener("click", function(e){
      var btn = e.target.closest(".media-filter");
      if(!btn) return;
      var scope = btn.closest(".media-toolbar") || document;
      scope.querySelectorAll(".media-filter").forEach(function(b){ b.classList.remove("active"); });
      btn.classList.add("active");
      var filter = btn.getAttribute("data-filter");
      document.querySelectorAll(".media-card").forEach(function(card){
        var match = filter === "all" || card.getAttribute("data-type") === filter;
        card.classList.toggle("is-hidden", !match);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    mountHud();
    markActiveNav();
    mountNowPlaying();
    initRouter();
    initMediaFilters();
  });
})();