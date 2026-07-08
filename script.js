// ============================================================
// NOW PLAYING — edit this one line to change the embedded track.
// Paste a normal share link from either service, e.g.:
//   Spotify:     https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp
//   Apple Music: https://music.apple.com/us/album/xxx/1234567890?i=1234567891
// Leave as "" to hide the widget entirely.
// ============================================================
// ============================================================
// NOW PLAYING
//
// Usage:
//
// Spotify:
// const NOW_PLAYING = "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp";
//
// Apple Music:
// const NOW_PLAYING = `<iframe
// allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
// frameborder="0"
// height="175"
// style="width:100%;max-width:660px;overflow:hidden;border-radius:10px;"
// sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
// src="https://embed.music.apple.com/in/song/rylee-i/1882613332">
// </iframe>`;
//
// Empty string hides the player.
// ============================================================

const NOW_PLAYING = "<iframe allow=\"autoplay *; encrypted-media *; fullscreen *; clipboard-write\" frameborder=\"0\" height=\"175\" style=\"width:100%;max-width:660px;overflow:hidden;border-radius:10px;\" sandbox=\"allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation\" src=\"https://embed.music.apple.com/in/song/rylee-i/1882613332\"></iframe>";

function mountNowPlaying() {
    const wrap = document.getElementById("np-frame-wrap");
    if (!wrap) return;

    const panel = wrap.closest(".now-playing");

    if (!NOW_PLAYING || NOW_PLAYING.trim() === "") {
        if (panel) panel.style.display = "none";
        return;
    }

    const input = NOW_PLAYING.trim();

    // --------------------------------------------------------
    // Apple Music embed iframe
    // --------------------------------------------------------
    if (input.startsWith("<iframe")) {
        wrap.innerHTML = input;
        return;
    }

    // --------------------------------------------------------
    // Spotify share URL
    // --------------------------------------------------------
    if (input.includes("open.spotify.com")) {
        const src =
            input.replace(
                "https://open.spotify.com/",
                "https://open.spotify.com/embed/"
            ) +
            (input.includes("?") ? "&" : "?") +
            "theme=0";

        const iframe = document.createElement("iframe");

        iframe.src = src;
        iframe.width = "100%";
        iframe.height = "152";
        iframe.frameBorder = "0";
        iframe.loading = "lazy";
        iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen";
        iframe.title = "Now Playing";

        wrap.appendChild(iframe);
        return;
    }

    // --------------------------------------------------------
    // Unsupported input
    // --------------------------------------------------------
    console.warn("NOW_PLAYING is neither a Spotify URL nor an Apple Music iframe.");

    if (panel) panel.style.display = "none";
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