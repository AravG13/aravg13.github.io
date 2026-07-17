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
const NOW_PLAYING_URL = "https://embed.music.apple.com/in/album/ladies-and-gentlemen-we-are-floating-in-space/1502476612?i=1502476617";
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
// Nebula field — a handful of large, softly blurred, additively-
// blended color blobs plus two elongated "distant galaxy" smudges,
// sitting behind the starfield. Positions/colors are hand-tuned
// (not randomized) so the composition looks intentional rather than
// noisy. Mounted once, outside <main>, persists across router swaps.
// ============================================================

var NEBULA_BLOBS = [
  { top:"-8%",  left:"58%", w:640, h:520, color:"rgba(111,163,224,0.30)" },  // starlight blue, upper right
  { top:"8%",   left:"2%",  w:520, h:460, color:"rgba(224,85,158,0.20)" },   // magenta, upper left
  { top:"28%",  left:"70%", w:460, h:420, color:"rgba(255,158,92,0.18)" },   // cliffs-orange, mid right
  { top:"58%",  left:"-6%", w:560, h:480, color:"rgba(139,107,255,0.20)" }, // deep purple, lower left
  { top:"72%",  left:"55%", w:600, h:520, color:"rgba(87,201,160,0.16)" },  // teal, lower right
  { top:"42%",  left:"32%", w:380, h:340, color:"rgba(255,211,122,0.10)" } // warm gold, center accent
];

var NEBULA_GALAXIES = [
  { top:"14%", left:"82%", w:180, h:60, rotate:-22, color:"rgba(224,85,158,0.28)" },
  { top:"82%", left:"12%", w:150, h:50, rotate:18,  color:"rgba(111,163,224,0.24)" }
];

function mountNebulaField(){
  var field = document.createElement("div");
  field.className = "nebula-field";
  field.setAttribute("aria-hidden", "true");

  NEBULA_BLOBS.forEach(function(b){
    var el = document.createElement("div");
    el.className = "nebula-blob";
    el.style.top = b.top;
    el.style.left = b.left;
    el.style.width = b.w + "px";
    el.style.height = b.h + "px";
    el.style.background = "radial-gradient(circle, " + b.color + ", transparent 70%)";
    field.appendChild(el);
  });

  NEBULA_GALAXIES.forEach(function(g){
    var el = document.createElement("div");
    el.className = "nebula-galaxy";
    el.style.top = g.top;
    el.style.left = g.left;
    el.style.width = g.w + "px";
    el.style.height = g.h + "px";
    el.style.transform = "rotate(" + g.rotate + "deg)";
    el.style.background = "radial-gradient(ellipse, " + g.color + ", transparent 75%)";
    field.appendChild(el);
  });

  document.body.prepend(field);
}

// ============================================================
// Starfield — generates layers of randomly-scattered "stars"
// using the classic box-shadow trick (one 1px dot, many shadow
// copies at random positions), plus a handful of larger "hero"
// stars with a soft glow bloom. Mounted once, outside <main>, so it
// persists across the router's page swaps like the HUD does.
// ============================================================

function generateStarShadows(count, opacity){
  var shadows = [];
  for(var i = 0; i < count; i++){
    var x = (Math.random() * 100).toFixed(2);
    var y = (Math.random() * 100).toFixed(2);
    shadows.push(x + "vw " + y + "vh 0 rgba(255,255,255," + opacity + ")");
  }
  return shadows.join(",");
}

function mountStarfield(){
  var field = document.createElement("div");
  field.className = "starfield";
  field.setAttribute("aria-hidden", "true");

  var layer1 = document.createElement("div");
  layer1.className = "star-layer star-layer-1";
  layer1.style.boxShadow = generateStarShadows(180, 0.9);

  var layer2 = document.createElement("div");
  layer2.className = "star-layer star-layer-2";
  layer2.style.boxShadow = generateStarShadows(110, 0.5);

  field.appendChild(layer1);
  field.appendChild(layer2);

  var heroCount = 9;
  for(var i = 0; i < heroCount; i++){
    var hero = document.createElement("div");
    hero.className = "star-hero";
    var size = 2 + Math.random() * 1.5;
    hero.style.width = size + "px";
    hero.style.height = size + "px";
    hero.style.top = (Math.random() * 100).toFixed(2) + "vh";
    hero.style.left = (Math.random() * 100).toFixed(2) + "vw";
    hero.style.boxShadow = "0 0 " + (size * 3) + "px " + (size * 1.2) + "px rgba(255,255,255,0.55)";
    hero.style.animationDelay = (Math.random() * 4).toFixed(2) + "s";
    field.appendChild(hero);
  }

  document.body.prepend(field);
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

  // Mark the current page's nav link as active. Accepts an explicit
  // URL (used by the router, before history.pushState has run) or
  // falls back to window.location for a normal page load.
  function markActiveNav(url){
    var path = new URL(url || window.location.href, window.location.href).pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(function(a){
      a.classList.remove("active");
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

  function swapContent(html, url){
    var doc = new DOMParser().parseFromString(html, "text/html");
    var newMain = doc.querySelector("main");
    var curMain = document.querySelector("main");
    if(!newMain || !curMain) return false;
    curMain.innerHTML = newMain.innerHTML;
    document.title = doc.title || document.title;
    window.scrollTo(0, 0);
    markActiveNav(url);
    return true;
  }

  function loadPage(url, push){
    fetch(url).then(function(res){
      if(!res.ok) throw new Error("bad response");
      return res.text();
    }).then(function(html){
      if(!swapContent(html, url)){ window.location.href = url; return; }
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
    mountNebulaField();
    mountStarfield();
    mountHud();
    markActiveNav();
    mountNowPlaying();
    initRouter();
    initMediaFilters();
  });
})();