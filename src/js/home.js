// Full-screen remote-friendly search powered by TMDB, with on-demand Watchmode availability.
(function () {
  // Optional build-time configuration. Leave these blank in a public repository;
  // the same keys can be entered in the on-device setup screen instead.
  const CONFIG = {
    TMDB_API_KEY: "",
    WATCHMODE_API_KEY: "",
    REGION: "GB",
    WATCHMODE_RESERVE_CREDITS: 100
  };
  const WATCHMODE_CACHE_MS = 7 * 24 * 60 * 60 * 1000;
  const TMDB_DETAIL_CACHE_MS = 30 * 24 * 60 * 60 * 1000;
  const search = document.getElementById("appsearch");
  const drawer = document.getElementById("drawerhandle");
  const toggle = document.getElementById("realappbarbtu");
  const panel = document.createElement("section");
  panel.id = "homekeyboard";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Search movies and TV shows");
  panel.setAttribute("aria-hidden", "true");
  panel.innerHTML = '<div class="search-shell"><header class="search-header"><button type="button" class="search-back" data-key="close" aria-label="Back to Home"><span aria-hidden="true">←</span> Back to Home</button><div class="search-query" aria-live="polite"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="13" cy="13" r="9"></circle><path d="m20 20 9 9"></path></svg><span class="search-query-text">Search for a movie or TV show...</span></div></header><div class="search-main"><div class="search-left"><div class="search-overline">SEARCH</div><div class="search-keyboard" aria-label="On-screen keyboard"></div><div class="search-suggestions"><div class="search-section-label">SUGGESTIONS</div><div class="search-suggestion-list"></div></div><button type="button" class="search-connect">Connect live search &amp; UK availability</button></div><div class="search-right"><div class="search-results-heading"><div><div class="search-overline">DISCOVER</div><h2>Movies &amp; TV</h2></div><span class="search-count"></span></div><div class="search-results" aria-live="polite"></div><div class="search-credit"></div></div></div><div class="search-detail" aria-hidden="true"></div><div class="search-setup" aria-hidden="true"><div class="search-setup-card"><button type="button" class="search-setup-back">← Back to search</button><h2>Live search</h2><p>TMDB supplies live titles and artwork. Watchmode supplies UK streaming services and prices only when you open a title. Keys entered here stay on this device. You can also set them at the top of home.js. Get keys from TMDB and Watchmode account settings.</p><label for="tmdb-token">TMDB API key or Read Access Token</label><input id="tmdb-token" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="TMDB key or token"><label for="watchmode-token">Watchmode API key</label><input id="watchmode-token" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Watchmode API key"><div class="search-setup-actions"><button type="button" class="search-setup-save">Save keys</button><button type="button" class="search-setup-remove">Clear keys</button></div><p class="search-setup-message"></p><div class="search-setup-credits"><img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg" alt="TMDB"><span>This product uses the TMDB API but is not endorsed or certified by TMDB. Availability data by Watchmode.</span></div></div></div></div>';
  document.body.appendChild(panel);

  const keyboard = panel.querySelector(".search-keyboard");
  const suggestions = panel.querySelector(".search-suggestion-list");
  const results = panel.querySelector(".search-results");
  const queryText = panel.querySelector(".search-query-text");
  const count = panel.querySelector(".search-count");
  const heading = panel.querySelector(".search-results-heading h2");
  const detail = panel.querySelector(".search-detail");
  const setup = panel.querySelector(".search-setup");
  const connectButton = panel.querySelector(".search-connect");
  const tokenInput = setup.querySelector("#tmdb-token");
  const watchmodeInput = setup.querySelector("#watchmode-token");
  const setupMessage = setup.querySelector(".search-setup-message");
  const rows = [
    ["space", "delete"],
    Array.from("ABCDEF"),
    Array.from("GHIJKL"),
    Array.from("MNOPQR"),
    Array.from("STUVWX"),
    ["Y", "Z", "1", "2", "3", "4"],
    ["5", "6", "7", "8", "9", "0"]
  ];
  rows.forEach(function (row, rowIndex) {
    row.forEach(function (value) {
      const key = document.createElement("button");
      key.type = "button";
      key.className = "search-key" + (rowIndex === 0 ? " search-key-wide" : "");
      key.dataset.key = value;
      key.innerHTML = value === "space" ? '<svg class="search-space-symbol" viewBox="0 0 100 40" aria-hidden="true"><path d="M8 5 5 34 H95 L92 5"></path></svg>' : value === "delete" ? '<span class="search-delete-symbol" aria-hidden="true">⌫</span>' : value;
      key.setAttribute("aria-label", value === "delete" ? "Delete last character" : value === "space" ? "Space" : value);
      keyboard.appendChild(key);
    });
  });

  let previousFocus = null;
  function readCredential(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) { return fallback; }
  }
  let tmdbToken = readCredential("tvlauncher_tmdb_token", CONFIG.TMDB_API_KEY);
  let watchmodeToken = readCredential("tvlauncher_watchmode_token", CONFIG.WATCHMODE_API_KEY);
  let currentItems = [];
  let loadedQuery = null;
  let searchPending = false;
  let searchError = "";
  let searchTimer = null;
  let searchSequence = 0;
  let detailSequence = 0;
  let detailsInFlight = 0;
  const detailsQueue = [];
  const searchCache = Object.create(null);
  const availabilityInFlight = Object.create(null);
  let watchmodeQueue = Promise.resolve();
  search.readOnly = true; // The custom TV keyboard owns text entry.

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[character];
    });
  }
  function normalized(value) { return value.trim().toLocaleLowerCase(); }
  function readCacheEntry(key, maxAge) {
    try {
      const entry = JSON.parse(localStorage.getItem(key) || "null");
      if (entry && typeof entry.savedAt === "number" && Date.now() - entry.savedAt >= 0 &&
          Date.now() - entry.savedAt < maxAge) return entry;
    } catch (error) {}
    return null;
  }
  function readCache(key, maxAge) {
    const entry = readCacheEntry(key,maxAge);
    return entry ? entry.data : null;
  }
  function writeCache(key, data) {
    try { localStorage.setItem(key, JSON.stringify({savedAt:Date.now(),data:data})); }
    catch (error) {} // Search and availability still work when storage is full.
  }
  function tmdbGet(path, token) {
    const credential = token || tmdbToken;
    const isApiKey = /^[a-f0-9]{32}$/i.test(credential);
    const url = "https://api.themoviedb.org/3" + path +
      (isApiKey ? (path.indexOf("?") === -1 ? "?" : "&") + "api_key=" + encodeURIComponent(credential) : "");
    const headers = isApiKey ? {Accept:"application/json"} :
      {Authorization:"Bearer " + credential,Accept:"application/json"};
    return fetch(url,{headers:headers}).then(function (response) {
      if (!response.ok) throw new Error(response.status === 401 ? "TMDB rejected this key." : "TMDB is unavailable right now.");
      return response.json();
    });
  }
  function tmdbSearchPath(query) {
    return query ? "/search/multi?language=en-GB&include_adult=false&page=1&query=" + encodeURIComponent(query)
      : "/trending/all/week?language=en-GB";
  }
  function mapTmdb(raw) {
    if (!raw || (raw.media_type !== "tv" && raw.media_type !== "movie")) return null;
    const title = raw.title || raw.name;
    if (!title || !Number.isFinite(Number(raw.id))) return null;
    const poster = raw.poster_path ? "https://image.tmdb.org/t/p/w500" + raw.poster_path : "";
    const backdrop = raw.backdrop_path ? "https://image.tmdb.org/t/p/w780" + raw.backdrop_path : "";
    return {
      title:title,
      type:raw.media_type === "tv" ? "TV SERIES" : "MOVIE",
      year:(raw.release_date || raw.first_air_date || "").slice(0,4) || "—",
      genres:[],
      bg:"#25323b",
      accent:"#f7f8fa",
      art:escapeHtml(title),
      image:poster || backdrop,
      imageFull:raw.poster_path ? "https://image.tmdb.org/t/p/original" + raw.poster_path : backdrop,
      poster:poster,
      tmdbId:Number(raw.id),
      tmdbMedia:raw.media_type,
      seasons:null,
      episodes:null
    };
  }
  function itemMeta(item) {
    const prefix = escapeHtml(item.year);
    if (item.tmdbMedia === "movie") return prefix + " · Movie";
    if (Number.isFinite(item.seasons) && Number.isFinite(item.episodes)) {
      return prefix + " · " + item.seasons + (item.seasons === 1 ? " season" : " seasons") +
        " · " + item.episodes + (item.episodes === 1 ? " episode" : " episodes");
    }
    return prefix + " · TV series";
  }
  function applyArtwork(card,item) {
    if (!item.image) return;
    const art = card.querySelector(".search-result-art");
    const img = document.createElement("img");
    img.className = "search-result-image";
    img.alt = "";
    img.decoding = "async";
    img.addEventListener("load",function () { card.classList.add("has-image"); });
    img.addEventListener("error",function () { img.remove(); });
    img.src = item.image;
    art.insertBefore(img,art.firstChild);
    card.style.setProperty("--poster-url",'url("' + item.image.replace(/"/g,"%22") + '")');
  }
  function updateCardMeta(item) {
    const card = results.querySelector('.search-result[data-tmdb-id="' + item.tmdbId + '"][data-media="' + item.tmdbMedia + '"]');
    if (!card) return;
    const meta = card.querySelector(".search-result-meta");
    if (meta) meta.innerHTML = itemMeta(item);
    card.setAttribute("aria-label",item.title + ", " + itemMeta(item).replace(/<[^>]*>/g,""));
  }
  function pumpDetails() {
    while (detailsInFlight < 3 && detailsQueue.length) {
      const task = detailsQueue.shift();
      if (task.sequence !== searchSequence) continue;
      detailsInFlight++;
      tmdbGet("/tv/" + task.item.tmdbId + "?language=en-GB").then(function (data) {
        const counts = {seasons:Number(data.number_of_seasons) || 0,episodes:Number(data.number_of_episodes) || 0};
        writeCache("tvlauncher_tmdb_counts_v1:tv:" + task.item.tmdbId,counts);
        task.item.seasons = counts.seasons;
        task.item.episodes = counts.episodes;
        if (task.sequence === searchSequence) updateCardMeta(task.item);
      }).catch(function () {
        // A missing detail must not hide the search result.
      }).then(function () {
        detailsInFlight--;
        pumpDetails();
      });
    }
  }
  function hydrateTVCounts(items,sequence) {
    items.forEach(function (item) {
      if (item.tmdbMedia !== "tv") return;
      const cached = readCache("tvlauncher_tmdb_counts_v1:tv:" + item.tmdbId,TMDB_DETAIL_CACHE_MS);
      if (cached) {
        item.seasons = cached.seasons;
        item.episodes = cached.episodes;
        updateCardMeta(item);
      } else {
        detailsQueue.push({item:item,sequence:sequence});
      }
    });
    pumpDetails();
  }
  function render() {
    const query = normalized(search.value);
    queryText.textContent = search.value || "Search for a movie or TV show...";
    queryText.classList.toggle("placeholder",!search.value);
    document.body.classList.toggle("home-query-present",!!search.value);
    heading.textContent = query ? "Results" : "Movies & TV";
    results.innerHTML = "";
    const items = loadedQuery === query ? currentItems : [];
    count.textContent = tmdbToken && !searchPending && !searchError ? items.length + (items.length === 1 ? " TITLE" : " TITLES") : "";
    if (!tmdbToken) {
      results.innerHTML = '<div class="search-empty">Add a TMDB key in Live search settings to browse movies and TV shows.</div>';
    } else if (searchPending || loadedQuery !== query) {
      results.innerHTML = '<div class="search-empty">Finding titles…</div>';
    } else if (searchError) {
      results.innerHTML = '<div class="search-empty">' + escapeHtml(searchError) + '</div>';
    } else if (!items.length) {
      results.innerHTML = '<div class="search-empty">No matching movies or TV shows found.</div>';
    } else {
      items.forEach(function (item) {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "search-result";
        card.dataset.tmdbId = item.tmdbId;
        card.dataset.media = item.tmdbMedia;
        card.style.setProperty("--art-bg",item.bg);
        card.style.setProperty("--art-accent",item.accent);
        card.innerHTML = '<span class="search-result-art" aria-hidden="true"><strong>' + item.art +
          '</strong></span><span class="search-result-meta">' + itemMeta(item) +
          '</span><span class="search-result-name">' + escapeHtml(item.title) + '</span>';
        card.setAttribute("aria-label",item.title + ", " + itemMeta(item));
        card.addEventListener("click",function () { showDetail(item); });
        results.appendChild(card);
        applyArtwork(card,item);
      });
    }
    suggestions.innerHTML = "";
    const unique = [];
    items.forEach(function (item) {
      if (unique.indexOf(item.title) === -1) unique.push(item.title);
    });
    unique.slice(0,5).forEach(function (title) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "search-suggestion";
      button.textContent = title;
      button.addEventListener("click",function () {
        search.value = title;
        scheduleRemoteSearch();
        if (typeof setfocus === "function") setfocus(keyboard.querySelector(".search-key"));
      });
      suggestions.appendChild(button);
    });
    if (!unique.length) suggestions.innerHTML = '<div class="search-no-suggestions">Suggestions will appear with search results.</div>';
    connectButton.textContent = tmdbToken
      ? (watchmodeToken ? "Live search and UK availability · Manage" : "Live search connected · Add Watchmode key")
      : "Connect live search & UK availability";
    panel.querySelector(".search-credit").innerHTML =
      '<a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a> artwork and metadata · UK availability by Watchmode';
  }
  function scheduleRemoteSearch() {
    clearTimeout(searchTimer);
    const query = normalized(search.value);
    const sequence = ++searchSequence;
    currentItems = [];
    loadedQuery = null;
    results.scrollTop = 0;
    searchError = "";
    searchPending = !!tmdbToken;
    render();
    if (!tmdbToken) return;
    const cached = searchCache[query];
    if (cached && Date.now() - cached.savedAt < 10 * 60 * 1000) {
      currentItems = cached.items;
      loadedQuery = query;
      searchPending = false;
      render();
      hydrateTVCounts(currentItems,sequence);
      return;
    }
    searchTimer = setTimeout(function () {
      tmdbGet(tmdbSearchPath(query)).then(function (data) {
        if (sequence !== searchSequence || query !== normalized(search.value)) return;
        currentItems = (data.results || []).map(mapTmdb).filter(Boolean).slice(0,18);
        loadedQuery = query;
        searchPending = false;
        searchCache[query] = {savedAt:Date.now(),items:currentItems};
        render();
        hydrateTVCounts(currentItems,sequence);
      }).catch(function (error) {
        if (sequence !== searchSequence) return;
        searchPending = false;
        loadedQuery = query;
        searchError = error.message || "Search is unavailable right now.";
        render();
      });
    },query ? 400 : 90);
  }
  function openSetup() {
    setup.classList.add("open");
    setup.setAttribute("aria-hidden","false");
    setupMessage.textContent = "";
    tokenInput.value = tmdbToken;
    watchmodeInput.value = watchmodeToken;
    if (typeof setfocus === "function") setfocus(tokenInput);
    tokenInput.focus();
  }
  function closeSetup() {
    if (!setup.classList.contains("open")) return;
    tokenInput.blur();
    watchmodeInput.blur();
    setup.classList.remove("open");
    setup.setAttribute("aria-hidden","true");
    if (typeof setfocus === "function") setfocus(detail.classList.contains("open")
      ? detail.querySelector(".search-detail-back") : connectButton);
  }
  window.homeSearchSetupIsOpen = function () { return setup.classList.contains("open"); };
  window.closeSearchSetup = closeSetup;
  connectButton.addEventListener("click",openSetup);
  setup.querySelector(".search-setup-back").addEventListener("click",closeSetup);
  setup.querySelector(".search-setup-remove").addEventListener("click",function () {
    tmdbToken = "";
    watchmodeToken = "";
    try {
      localStorage.setItem("tvlauncher_tmdb_token","");
      localStorage.setItem("tvlauncher_watchmode_token","");
    } catch (error) {}
    setupMessage.textContent = "Keys cleared on this device.";
    tokenInput.value = "";
    watchmodeInput.value = "";
    scheduleRemoteSearch();
  });
  setup.querySelector(".search-setup-save").addEventListener("click",function () {
    const tmdbCandidate = tokenInput.value.trim();
    const watchmodeCandidate = watchmodeInput.value.trim();
    if (!tmdbCandidate) { setupMessage.textContent = "Enter a TMDB key or read token first."; return; }
    setupMessage.textContent = "Checking TMDB key…";
    tmdbGet("/configuration",tmdbCandidate).then(function () {
      tmdbToken = tmdbCandidate;
      watchmodeToken = watchmodeCandidate;
      try {
        localStorage.setItem("tvlauncher_tmdb_token",tmdbCandidate);
        localStorage.setItem("tvlauncher_watchmode_token",watchmodeCandidate);
      } catch (error) {
        setupMessage.textContent = "Keys work for this session, but this device could not save them.";
      }
      closeSetup();
      scheduleRemoteSearch();
    }).catch(function (error) { setupMessage.textContent = error.message || "Could not connect to TMDB."; });
  });
  function filterApps() {
    const query = normalized(search.value);
    document.querySelectorAll("#appluncher .appitem").forEach(function (tile) {
      const name = tile.querySelector(".appname");
      tile.style.display = !query || (name && normalized(name.textContent).includes(query)) ? "" : "none";
    });
  }
  function openDrawer() {
    closeHomeKeyboard(false);
    toggle.checked = true;
    toggle.dispatchEvent(new Event("change", { bubbles:true }));
    filterApps();
    if (typeof settle === "function") settle();
  }
  const availabilityMemory = Object.create(null);
  function watchmodeGet(path) {
    return fetch("https://api.watchmode.com/v1" + path,{
      headers:{"X-API-Key":watchmodeToken,Accept:"application/json"}
    }).then(function (response) {
      if (response.status === 404 && path.indexOf("/sources/") !== -1) return [];
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) throw new Error(data.statusMessage ||
          (response.status === 401 ? "Watchmode rejected this key." :
           response.status === 429 ? "Watchmode's rate or monthly limit has been reached." :
           "Watchmode is unavailable right now."));
        return data;
      });
    });
  }
  function availabilityKey(item) {
    return "tvlauncher_watchmode_sources_v1:" + CONFIG.REGION + ":" + item.tmdbMedia + ":" + item.tmdbId;
  }
  function getAvailability(item,sequence) {
    const key = availabilityKey(item);
    const memory = availabilityMemory[key];
    if (memory && Date.now() - memory.savedAt < WATCHMODE_CACHE_MS) return Promise.resolve(memory.data);
    const cached = readCacheEntry(key,WATCHMODE_CACHE_MS);
    if (cached) {
      availabilityMemory[key] = cached;
      return Promise.resolve(cached.data);
    }
    if (availabilityInFlight[key]) return availabilityInFlight[key];
    // /status costs zero credits and checks the account-wide allowance before the
    // two-credit TMDB-ID source lookup. No Watchmode request occurs during search.
    const request = watchmodeQueue.then(function () {
      if (sequence !== detailSequence) throw new Error("Selection changed.");
      return watchmodeGet("/status/");
    }).then(function (status) {
      if (sequence !== detailSequence) throw new Error("Selection changed.");
      const quota = Number(status.quota);
      const used = Number(status.quotaUsed);
      if (!Number.isFinite(quota) || !Number.isFinite(used)) throw new Error("Watchmode quota status is unavailable; no source lookup was made.");
      const reserve = Math.min(CONFIG.WATCHMODE_RESERVE_CREDITS,Math.floor(quota * .04));
      if (used + 2 > quota - reserve) {
        throw new Error("Watchmode credit reserve reached. Cached results remain available.");
      }
      return watchmodeGet("/title/" + item.tmdbMedia + "-" + item.tmdbId +
        "/sources/?regions=" + encodeURIComponent(CONFIG.REGION));
    }).then(function (data) {
      if (!Array.isArray(data)) throw new Error("Watchmode returned an unexpected source list.");
      const sources = data.filter(function (source) { return source.region === CONFIG.REGION; });
      availabilityMemory[key] = {savedAt:Date.now(),data:sources};
      writeCache(key,sources);
      return sources;
    });
    watchmodeQueue = request.catch(function () {});
    availabilityInFlight[key] = request.then(function (data) {
      delete availabilityInFlight[key];
      return data;
    },function (error) {
      delete availabilityInFlight[key];
      throw error;
    });
    return availabilityInFlight[key];
  }
  function priceLabel(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) return "";
    try { return new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(value); }
    catch (error) { return "£" + value.toFixed(2); }
  }
  function showProviders(sources) {
    const container = detail.querySelector(".search-provider-list");
    const status = detail.querySelector(".search-provider-status");
    container.innerHTML = "";
    if (!sources.length) {
      status.textContent = "No UK streaming, rental or purchase options are currently listed for this title.";
      return;
    }
    const groups = [
      ["Subscription","sub"],
      ["Free","free"],
      ["Rent","rent"],
      ["Buy","buy"],
      ["TV channel","tve"]
    ];
    groups.forEach(function (group) {
      const matches = sources.filter(function (source) { return source.type === group[1]; });
      if (!matches.length) return;
      const section = document.createElement("section");
      section.className = "search-provider-group";
      section.innerHTML = "<h3>" + group[0] + "</h3>";
      const list = document.createElement("div");
      list.className = "search-provider-entries";
      matches.sort(function (a,b) { return String(a.name).localeCompare(String(b.name)); }).forEach(function (source) {
        const url = typeof source.web_url === "string" && /^https?:\/\//i.test(source.web_url) ? source.web_url : "";
        const entry = document.createElement(url ? "a" : "div");
        entry.className = "search-provider";
        if (url) {
          entry.href = url;
          entry.target = "_blank";
          entry.rel = "noopener noreferrer";
        }
        const name = document.createElement("strong");
        name.textContent = source.name || "Unknown service";
        entry.appendChild(name);
        const facts = [];
        if (source.format) facts.push(String(source.format).toUpperCase());
        if ((group[1] === "rent" || group[1] === "buy") && priceLabel(source.price)) facts.push(priceLabel(source.price));
        if (Number.isFinite(Number(source.seasons)) && Number(source.seasons) > 0) {
          facts.push(source.seasons + (Number(source.seasons) === 1 ? " season" : " seasons"));
        }
        if (facts.length) {
          const info = document.createElement("span");
          info.className = "search-provider-facts";
          info.textContent = facts.join(" · ");
          entry.appendChild(info);
        }
        list.appendChild(entry);
      });
      section.appendChild(list);
      container.appendChild(section);
    });
    status.textContent = "";
  }
  function loadProviders(item,sequence) {
    const status = detail.querySelector(".search-provider-status");
    if (!watchmodeToken) {
      status.innerHTML = 'Add a Watchmode API key to see live UK sources and prices. <button type="button" class="search-detail-connect">Configure keys</button>';
      status.querySelector("button").addEventListener("click",openSetup);
      return;
    }
    status.textContent = "Checking UK availability…";
    getAvailability(item,sequence).then(function (sources) {
      if (sequence === detailSequence && detail.classList.contains("open")) showProviders(sources);
    }).catch(function (error) {
      if (sequence === detailSequence) status.textContent = error.message || "Availability could not be loaded.";
    });
  }
  function showDetail(item) {
    const sequence = ++detailSequence;
    detail.innerHTML = '<button type="button" class="search-detail-back" aria-label="Back to results">← Back to results</button>' +
      '<div class="search-detail-art" style="--art-bg:' + item.bg + ';--art-accent:' + item.accent +
      '"><span>' + item.art + '</span></div><div class="search-detail-copy"><span class="search-overline">' +
      escapeHtml(item.type) + ' · ' + escapeHtml(item.year) + '</span><h2>' + escapeHtml(item.title) +
      '</h2><p class="search-detail-metadata">' + itemMeta(item) +
      '</p><h3 class="search-provider-title">Where to watch in the UK</h3><div class="search-provider-status"></div>' +
      '<div class="search-provider-list"></div><p class="search-detail-attribution">Availability by Watchmode · Prices and services may change.</p></div>';
    if (item.imageFull) detail.querySelector(".search-detail-art").style.backgroundImage =
      'linear-gradient(180deg,transparent,rgba(0,0,0,.4)),url("' + item.imageFull.replace(/"/g,"%22") + '")';
    detail.classList.add("open");
    detail.setAttribute("aria-hidden","false");
    detail.querySelector(".search-detail-back").addEventListener("click",closeDetail);
    if (item.tmdbMedia === "tv" && item.seasons === null) {
      tmdbGet("/tv/" + item.tmdbId + "?language=en-GB").then(function (data) {
        item.seasons = Number(data.number_of_seasons) || 0;
        item.episodes = Number(data.number_of_episodes) || 0;
        writeCache("tvlauncher_tmdb_counts_v1:tv:" + item.tmdbId,
          {seasons:item.seasons,episodes:item.episodes});
        updateCardMeta(item);
        if (sequence === detailSequence) detail.querySelector(".search-detail-metadata").innerHTML = itemMeta(item);
      }).catch(function () {});
    }
    loadProviders(item,sequence);
    if (typeof setfocus === "function") setfocus(detail.querySelector(".search-detail-back"));
  }
  function closeDetail() {
    ++detailSequence;
    detail.classList.remove("open");
    detail.setAttribute("aria-hidden", "true");
    if (typeof setfocus === "function") setfocus(results.querySelector(".search-result") || keyboard.querySelector(".search-key"));
  }
  window.closeSearchDetail = closeDetail;
  function pressKey(key) {
    if (key === "close") { if (detail.classList.contains("open")) closeDetail(); else closeHomeKeyboard(); return; }
    if (key === "delete") search.value = search.value.slice(0, -1);
    else if (key === "space") search.value += " ";
    else search.value += key.toLowerCase();
    scheduleRemoteSearch();
  }
  window.homeKeyboardIsOpen = function () { return panel.classList.contains("open"); };
  window.openHomeKeyboard = function () {
    if (homeKeyboardIsOpen()) return;
    previousFocus = typeof dpadfocus !== "undefined" ? dpadfocus : null;
    search.blur();
    render();
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("home-search-active");
    if (typeof keyboardmode !== "undefined") keyboardmode = true;
    scheduleRemoteSearch();
    if (typeof setfocus === "function") setfocus(keyboard.querySelector(".search-key:nth-child(3)"));
  };
  window.closeHomeKeyboard = function (restore) {
    if (!homeKeyboardIsOpen()) return;
    closeSetup();
    closeDetail();
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("home-search-active");
    search.blur();
    if (restore !== false && typeof setfocus === "function") {
      setfocus(previousFocus && document.body.contains(previousFocus) ? previousFocus : document.querySelector("#featurecards .featuretile"));
    }
  };
  panel.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-key]");
    if (button) pressKey(button.dataset.key);
  });
  search.addEventListener("input", scheduleRemoteSearch);
  search.addEventListener("click", function (event) { event.preventDefault(); openHomeKeyboard(); });
  search.addEventListener("focus", function () { search.blur(); openHomeKeyboard(); });
  document.querySelectorAll("#featurecards .featuretile").forEach(function (tile,index) {
    tile.addEventListener("click", function () {
      if (typeof activateHomeCard === "function") activateHomeCard(index);
    });
  });
  drawer.addEventListener("click", function () {
    search.value = "";
    openDrawer();
  });
  window.addEventListener("keydown", function (event) {
    if (!homeKeyboardIsOpen()) return;
    if (setup.classList.contains("open")) {
      if (event.key === "Escape") { event.preventDefault(); closeSetup(); }
      return;
    }
    if (detail.classList.contains("open")) {
      if (event.key === "Escape") { event.preventDefault(); closeDetail(); }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeHomeKeyboard();
    } else if (event.key === "Backspace") {
      event.preventDefault();
      pressKey("delete");
    } else if (event.key === " ") {
      event.preventDefault();
      pressKey("space");
    } else if (event.key && event.key.length === 1 && /^[a-z0-9]$/i.test(event.key)) {
      event.preventDefault();
      pressKey(event.key);
    }
  });
  render();
})();