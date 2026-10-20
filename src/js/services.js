// A curated second screen. Cards launch matching apps already installed on this TV.
(function () {
  const catalog = [
    { name: "Netflix", mark: "NETFLIX", brand: "netflix", aliases: ["netflix"] },
    { name: "Disney+", mark: "Disney+", brand: "disney", aliases: ["disneyplus", "disney+"] },
    { name: "Prime Video", mark: "prime video", brand: "prime", aliases: ["primevideo", "amazonprime"] },
    { name: "YouTube", mark: "▶ YouTube", brand: "youtube", aliases: ["youtube"] },
    { name: "BBC iPlayer", mark: "BBC iPLAYER", brand: "iplayer", aliases: ["bbciplayer", "iplayer"] },
    { name: "ITVX", mark: "itvX", brand: "itvx", aliases: ["itvx", "itvhub"] },
    { name: "Channel 4", mark: "CHANNEL 4", brand: "channel4", aliases: ["channel4", "all4"] },
    { name: "Hulu", mark: "hulu", brand: "hulu", aliases: ["hulu"] },
    { name: "Paramount+", mark: "Paramount+", brand: "paramount", aliases: ["paramountplus", "paramount+"] },
    { name: "NOW", mark: "NOW", brand: "now", aliases: ["nowtv", "now"] },
    { name: "Plex", mark: "plex", brand: "plex", aliases: ["plex"] },
    { name: "Spotify", mark: "◉ Spotify", brand: "spotify", aliases: ["spotify"] },
    { name: "Twitch", mark: "twitch", brand: "twitch", aliases: ["twitch"] },
    { name: "Pluto TV", mark: "pluto tv", brand: "pluto", aliases: ["plutotv"] },
    { name: "Crunchyroll", mark: "crunchyroll", brand: "crunchyroll", aliases: ["crunchyroll"] },
    { name: "Rakuten TV", mark: "Rakuten TV", brand: "rakuten", aliases: ["rakutentv", "rakuten"] },
    { name: "Discovery+", mark: "discovery+", brand: "discovery", aliases: ["discoveryplus", "discovery+"] },
    { name: "DAZN", mark: "DAZN", brand: "dazn", aliases: ["dazn"] },
    { name: "MUBI", mark: "MUBI", brand: "mubi", aliases: ["mubi"] },
    { name: "Hayu", mark: "hayu", brand: "hayu", aliases: ["hayu"] }
  ];
  const layer = document.createElement("section");
  layer.id = "servicegrid";
  layer.setAttribute("aria-label", "Streaming apps");
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = '<div class="servicegrid-inner"><header class="servicegrid-header"><div><span class="servicegrid-eyebrow">YOUR ENTERTAINMENT</span><h2>Explore apps</h2><p>Choose a service to watch on this TV.</p></div><button class="servicegrid-back" type="button" aria-label="Return to home">⌃ <span>Home</span></button></header><div class="servicegrid-list"></div><div class="servicegrid-footer"><span>↑ Home</span><span>Use the remote to explore · OK to launch</span></div></div><div class="servicegrid-toast" role="status" aria-live="polite"></div>';
  document.body.appendChild(layer);
  const list = layer.querySelector(".servicegrid-list");
  const toast = layer.querySelector(".servicegrid-toast");
  let previousFocus = null;
  let toastTimer = null;
  function normalized(text) { return String(text || "").toLocaleLowerCase().replace(/[^a-z0-9+]/g, ""); }
  function findInstalled(service) {
    if (typeof applist === "undefined" || !Array.isArray(applist)) return null;
    return applist.find(function (app) {
      const title = normalized(app.title);
      const display = normalized(typeof appdisplayname === "function" ? appdisplayname(app) : app.title);
      return service.aliases.some(function (alias) {
        const target = normalized(alias);
        return target.length < 5 ? (title === target || display === target) :
          title.indexOf(target) !== -1 || display.indexOf(target) !== -1;
      });
    }) || null;
  }
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("visible"); }, 3000);
  }
  catalog.forEach(function (service, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "service-card";
    button.dataset.brand = service.brand;
    button.dataset.index = index;
    button.setAttribute("aria-label", service.name);
    const artwork = document.createElement("span");
    artwork.className = "service-artwork";
    const mark = document.createElement("span");
    mark.className = "service-mark";
    mark.textContent = service.mark;
    artwork.appendChild(mark);
    const label = document.createElement("span");
    label.className = "service-label";
    label.textContent = service.name;
    button.appendChild(artwork);
    button.appendChild(label);
    button.addEventListener("click", function () {
      const installed = findInstalled(service);
      if (!installed) { showToast(service.name + " is not installed on this TV"); return; }
      if (typeof recordrecent === "function") recordrecent(installed.id);
      if (typeof launchapp === "function") launchapp(installed.id);
    });
    list.appendChild(button);
  });
  function refreshInstalled() {
    catalog.forEach(function (service, index) {
      const button = list.children[index];
      const available = !!findInstalled(service);
      button.classList.toggle("installed", available);
      button.setAttribute("aria-label", service.name + (available ? ", installed" : ", not installed"));
    });
  }
  window.serviceGridIsOpen = function () { return layer.classList.contains("open"); };
  window.serviceGridAtTopRow = function () {
    const focused = typeof dpadfocus !== "undefined" ? dpadfocus : null;
    return !focused || !list.contains(focused) || Number(focused.dataset.index) < 5;
  };
  window.openServiceGrid = function () {
    if (serviceGridIsOpen()) return;
    previousFocus = typeof dpadfocus !== "undefined" ? dpadfocus : null;
    refreshInstalled();
    layer.classList.add("open");
    layer.setAttribute("aria-hidden", "false");
    document.body.classList.add("services-open");
    if (typeof keyboardmode !== "undefined") keyboardmode = true;
    if (typeof setfocus === "function") setfocus(list.firstElementChild);
  };
  window.closeServiceGrid = function () {
    if (!serviceGridIsOpen()) return;
    layer.classList.remove("open");
    layer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("services-open");
    toast.classList.remove("visible");
    if (typeof setfocus === "function") {
      setfocus(previousFocus && document.body.contains(previousFocus) ? previousFocus : document.querySelector("#featurecards .featuretile"));
    }
  };
  layer.querySelector(".servicegrid-back").addEventListener("click", closeServiceGrid);
})();
