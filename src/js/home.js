// Full-screen remote-friendly search, with a local film and television catalogue.
(function () {
  const search = document.getElementById("appsearch");
  const drawer = document.getElementById("drawerhandle");
  const toggle = document.getElementById("realappbarbtu");
  const panel = document.createElement("section");
  panel.id = "homekeyboard";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Search movies and TV shows");
  panel.setAttribute("aria-hidden", "true");
  panel.innerHTML = '<div class="search-shell"><header class="search-header"><button type="button" class="search-back" data-key="close" aria-label="Back to Home"><span aria-hidden="true">←</span> Back to Home</button><div class="search-query" aria-live="polite"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="13" cy="13" r="9"></circle><path d="m20 20 9 9"></path></svg><span class="search-query-text">Search for a movie or TV show...</span></div></header><div class="search-main"><div class="search-left"><div class="search-overline">SEARCH</div><div class="search-keyboard" aria-label="On-screen keyboard"></div><div class="search-suggestions"><div class="search-section-label">SUGGESTIONS</div><div class="search-suggestion-list"></div></div><button type="button" class="search-connect">Connect live search &amp; UK availability</button></div><div class="search-right"><div class="search-results-heading"><div><div class="search-overline">DISCOVER</div><h2>Movies &amp; TV</h2></div><span class="search-count"></span></div><div class="search-results" aria-live="polite"></div><div class="search-credit"></div></div></div><div class="search-detail" aria-hidden="true"></div><div class="search-setup" aria-hidden="true"><div class="search-setup-card"><button type="button" class="search-setup-back">← Back to search</button><h2>Live search</h2><p>Connect TMDB to search movies and TV shows and see where each title is available in the UK. Get your key from <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer">TMDB API settings</a>. It is saved only on this TV.</p><label for="tmdb-token">TMDB API key or Read Access Token</label><input id="tmdb-token" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Paste your key or token here"><div class="search-setup-actions"><button type="button" class="search-setup-save">Connect</button><button type="button" class="search-setup-remove">Remove token</button></div><p class="search-setup-message"></p><div class="search-setup-credits"><img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg" alt="TMDB"><span>This product uses the TMDB API but is not endorsed or certified by TMDB. UK streaming availability is supplied by JustWatch.</span></div></div></div></div>';
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

  // Card colors deliberately match the artwork perimeter so focus glow extends its edge.
  const catalogue = [
    { title:"Severance", type:"TV SERIES", year:"2022", genres:["drama","sci-fi"], bg:"#121e29", accent:"#83b8c8", art:"SEVERANCE" },
    { title:"The Bear", type:"TV SERIES", year:"2022", genres:["drama","comedy"], bg:"#192027", accent:"#e0ad70", art:"THE BEAR" },
    { title:"Dune: Part Two", type:"MOVIE", year:"2024", genres:["sci-fi","adventure"], bg:"#4b3023", accent:"#eebf7d", art:"DUNE" },
    { title:"The Last of Us", type:"TV SERIES", year:"2023", genres:["drama","sci-fi"], bg:"#202a22", accent:"#a9b691", art:"THE LAST<br>OF US" },
    { title:"Slow Horses", type:"TV SERIES", year:"2022", genres:["thriller","drama"], bg:"#29302f", accent:"#c9d5c5", art:"SLOW<br>HORSES" },
    { title:"Interstellar", type:"MOVIE", year:"2014", genres:["sci-fi","drama"], bg:"#172633", accent:"#d8e7f1", art:"INTERSTELLAR" },
    { title:"Arcane", type:"TV SERIES", year:"2021", genres:["anime","animation","fantasy"], bg:"#242139", accent:"#caa4d7", art:"ARCANE" },
    { title:"The White Lotus", type:"TV SERIES", year:"2021", genres:["drama","comedy"], bg:"#264d4b", accent:"#e8ebc4", art:"THE WHITE<br>LOTUS" },
    { title:"Oppenheimer", type:"MOVIE", year:"2023", genres:["drama","history"], bg:"#352519", accent:"#efab5c", art:"OPPENHEIMER" },
    { title:"Silo", type:"TV SERIES", year:"2023", genres:["sci-fi","drama"], bg:"#3d3730", accent:"#d9c4a2", art:"SILO" },
    { title:"The Grand Budapest Hotel", type:"MOVIE", year:"2014", genres:["comedy","drama"], bg:"#7c3f57", accent:"#f6cfdb", art:"GRAND<br>BUDAPEST" },
    { title:"Stranger Things", type:"TV SERIES", year:"2016", genres:["sci-fi","thriller"], bg:"#291b27", accent:"#ef5b59", art:"STRANGER<br>THINGS" },
    { title:"Annie", type:"MOVIE", year:"1982", genres:["musical","family"], bg:"#b73531", accent:"#ffe7a2", art:"ANNIE" },
    { title:"A Christmas Carol", type:"MOVIE", year:"2009", genres:["fantasy","family"], bg:"#1e4e49", accent:"#e7d4a9", art:"A CHRISTMAS<br>CAROL" },
    { title:"American Horror Story", type:"TV SERIES", year:"2011", genres:["horror","drama"], bg:"#251b22", accent:"#df9da7", art:"AMERICAN<br>HORROR STORY" },
    { title:"Archer", type:"TV SERIES", year:"2009", genres:["animation","comedy"], bg:"#9c2f28", accent:"#f4e0b2", art:"ARCHER" },
    { title:"Avatar: The Last Airbender", type:"TV SERIES", year:"2005", genres:["anime","animation","fantasy"], bg:"#3c5961", accent:"#f2d9a1", art:"AVATAR" },
    { title:"Attack on Titan", type:"TV SERIES", year:"2013", genres:["anime","animation"], bg:"#3f3530", accent:"#edd3a7", art:"ATTACK<br>ON TITAN" },
    { title:"Akira", type:"MOVIE", year:"1988", genres:["anime","sci-fi"], bg:"#a51d24", accent:"#f5d8bd", art:"AKIRA" },
    { title:"Blue Eye Samurai", type:"TV SERIES", year:"2023", genres:["anime","animation"], bg:"#1a425c", accent:"#a2d4e3", art:"BLUE EYE<br>SAMURAI" },
    { title:"Spirited Away", type:"MOVIE", year:"2001", genres:["anime","fantasy"], bg:"#5b414d", accent:"#f1c8d9", art:"SPIRITED<br>AWAY" },
    { title:"The Batman", type:"MOVIE", year:"2022", genres:["action","thriller"], bg:"#221a1c", accent:"#dc574c", art:"THE<br>BATMAN" },
    { title:"Breaking Bad", type:"TV SERIES", year:"2008", genres:["drama","thriller"], bg:"#244032", accent:"#b9d792", art:"BREAKING<br>BAD" },
    { title:"Better Call Saul", type:"TV SERIES", year:"2015", genres:["drama","comedy"], bg:"#72552c", accent:"#f7d686", art:"BETTER<br>CALL SAUL" },
    { title:"Black Mirror", type:"TV SERIES", year:"2011", genres:["sci-fi","thriller"], bg:"#151d25", accent:"#c8e8f6", art:"BLACK<br>MIRROR" },
    { title:"Barbie", type:"MOVIE", year:"2023", genres:["comedy","fantasy"], bg:"#dc5f9b", accent:"#fff0f6", art:"BARBIE" },
    { title:"The Dark Knight", type:"MOVIE", year:"2008", genres:["action","drama"], bg:"#1b2834", accent:"#aac5dd", art:"THE DARK<br>KNIGHT" },
    { title:"Wednesday", type:"TV SERIES", year:"2022", genres:["fantasy","comedy"], bg:"#2c2738", accent:"#c7b4de", art:"WEDNESDAY" },
    { title:"The Mandalorian", type:"TV SERIES", year:"2019", genres:["sci-fi","adventure"], bg:"#51402d", accent:"#e3c89e", art:"THE<br>MANDALORIAN" },
    { title:"Succession", type:"TV SERIES", year:"2018", genres:["drama"], bg:"#2c3340", accent:"#e0e0d9", art:"SUCCESSION" },
    { title:"Poor Things", type:"MOVIE", year:"2023", genres:["fantasy","drama"], bg:"#4a5365", accent:"#e8d9d0", art:"POOR<br>THINGS" },
    { title:"The Queen's Gambit", type:"TV SERIES", year:"2020", genres:["drama"], bg:"#593d30", accent:"#f2d1a8", art:"THE QUEEN'S<br>GAMBIT" },
    { title:"Andor", type:"TV SERIES", year:"2022", genres:["sci-fi","drama"], bg:"#39352f", accent:"#f3c67b", art:"ANDOR" },
    { title:"The Office", type:"TV SERIES", year:"2005", genres:["comedy"], bg:"#313c46", accent:"#e9ebea", art:"THE OFFICE" },
    { title:"Fallout", type:"TV SERIES", year:"2024", genres:["sci-fi","drama"], bg:"#255574", accent:"#f4d58b", art:"FALLOUT" },
    { title:"The Rings of Power", type:"TV SERIES", year:"2022", genres:["fantasy","adventure"], bg:"#514b31", accent:"#e9d69f", art:"RINGS<br>OF POWER" },
    { title:"Joker", type:"MOVIE", year:"2019", genres:["drama","thriller"], bg:"#334539", accent:"#e3c899", art:"JOKER" },
    { title:"Inception", type:"MOVIE", year:"2010", genres:["sci-fi","action"], bg:"#173955", accent:"#c2d9e9", art:"INCEPTION" }
  ];
  const suggestionTerms = ["Anime", "A Christmas Carol", "Annie", "American Horror Story", "Archer", "Arcane", "Avatar: The Last Airbender", "Attack on Titan", "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Sci-Fi", "Thriller"];
  let previousFocus = null;
  let tmdbToken = "";
  try { tmdbToken = localStorage.getItem("tvlauncher_tmdb_token") || ""; } catch (error) {}
  let remoteMatches = null;
  let remoteQuery = null;
  let remoteTimer = null;
  let remoteSequence = 0;
  let remoteError = "";
  let detailSequence = 0;
  search.readOnly = true; // The custom TV keyboard owns text entry.

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[character];
    });
  }
  function normalized(value) { return value.trim().toLocaleLowerCase(); }
  function visibleItems(query) {
    if (!query) {
      const featured = ["Severance","The Bear","The Last of Us","Slow Horses","Arcane","The White Lotus","Silo","Stranger Things","American Horror Story"];
      return catalogue.slice().sort(function (a,b) {
        const ai = featured.indexOf(a.title), bi = featured.indexOf(b.title);
        return (ai < 0 ? 100 : ai) - (bi < 0 ? 100 : bi);
      });
    }
    return catalogue.filter(function (item) {
      return item.title.toLocaleLowerCase().includes(query) ||
        item.genres.some(function (genre) { return genre.includes(query); });
    }).sort(function (a,b) {
      function rank(item) {
        const title = item.title.toLocaleLowerCase();
        if (title.startsWith(query)) return 0;
        if (title.includes(query)) return 1;
        return 2;
      }
      const order = ["American Horror Story","Archer","A Christmas Carol","Annie","Arcane","Avatar: The Last Airbender","Attack on Titan","Akira"];
      const primary = rank(a) - rank(b);
      if (primary || query !== "a") return primary;
      const ai = order.indexOf(a.title), bi = order.indexOf(b.title);
      return (ai < 0 ? 100 : ai) - (bi < 0 ? 100 : bi);
    });
  }

  // TVmaze allows direct use of its show images. Text artwork remains available offline.
  const artworkQueue = [];
  let artworkInFlight = 0;
  function applyArtwork(card,item) {
    if (!item.image || card.classList.contains("has-image")) return;
    const artwork = card.querySelector(".search-result-art");
    const img = document.createElement("img");
    img.className = "search-result-image";
    img.alt = "";
    img.decoding = "async";
    img.src = item.image;
    img.addEventListener("load", function () { card.classList.add("has-image"); });
    img.addEventListener("error", function () { img.remove(); item.image = null; });
    artwork.insertBefore(img, artwork.firstChild);
    card.style.setProperty("--poster-url", 'url("' + item.image.replace(/"/g,"%22") + '")');
  }
  function pumpArtwork() {
    while (artworkInFlight < 2 && artworkQueue.length) {
      const item = artworkQueue.shift();
      artworkInFlight++;
      fetch("https://api.tvmaze.com/singlesearch/shows?q=" + encodeURIComponent(item.title))
        .then(function (response) { return response.ok ? response.json() : null; })
        .then(function (show) {
          if (!show || !show.image || normalized(show.name) !== normalized(item.title)) return;
          item.image = show.image.medium || show.image.original;
          item.imageFull = show.image.original || item.image;
          results.querySelectorAll(".search-result").forEach(function (card) {
            if (card.dataset.title === item.title) applyArtwork(card,item);
          });
        })
        .catch(function () {})
        .then(function () {
          artworkInFlight--;
          setTimeout(pumpArtwork,250);
        });
    }
  }
  function queueArtwork(items) {
    items.slice(0,12).forEach(function (item) {
      if (item.type !== "TV SERIES" || item.image || item.artworkQueued) return;
      item.artworkQueued = true;
      artworkQueue.push(item);
    });
    pumpArtwork();
  }
  // The live catalogue is optional; a token is kept only on this device.
  function tmdbGet(path, token) {
    const credential = token || tmdbToken;
    const isApiKey = /^[a-f0-9]{32}$/i.test(credential);
    const url = "https://api.themoviedb.org/3" + path + (isApiKey ? (path.indexOf("?") === -1 ? "?" : "&") + "api_key=" + encodeURIComponent(credential) : "");
    const headers = isApiKey ? { Accept:"application/json" } : { Authorization:"Bearer " + credential, Accept:"application/json" };
    return fetch(url, { headers:headers }).then(function (response) {
      if (!response.ok) throw new Error(response.status === 401 ? "That token was not accepted by TMDB." : "TMDB is unavailable right now.");
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
    if (!title) return null;
    const imagePath = raw.backdrop_path || raw.poster_path;
    const image = imagePath ? "https://image.tmdb.org/t/p/w780" + imagePath : null;
    const full = imagePath ? "https://image.tmdb.org/t/p/original" + imagePath : null;
    return {
      title:title, type:raw.media_type === "tv" ? "TV SERIES" : "MOVIE",
      year:(raw.release_date || raw.first_air_date || "").slice(0,4) || "—",
      genres:[], bg:"#243039", accent:"#f7f8fa", art:escapeHtml(title),
      image:image, imageFull:full, tmdbId:raw.id, tmdbMedia:raw.media_type
    };
  }
  function scheduleRemoteSearch() {
    clearTimeout(remoteTimer);
    const query = normalized(search.value);
    const sequence = ++remoteSequence;
    if (!tmdbToken) { remoteMatches = null; remoteQuery = null; return; }
    remoteMatches = null;
    remoteQuery = null;
    remoteTimer = setTimeout(function () {
      tmdbGet(tmdbSearchPath(query)).then(function (data) {
        if (sequence !== remoteSequence || query !== normalized(search.value)) return;
        remoteMatches = (data.results || []).map(mapTmdb).filter(Boolean).slice(0,24);
        remoteQuery = query;
        remoteError = "";
        render();
      }).catch(function (error) {
        if (sequence !== remoteSequence) return;
        remoteError = error.message;
        remoteMatches = null;
        remoteQuery = null;
        render();
      });
    }, query ? 320 : 80);
  }
  function openSetup() {
    setup.classList.add("open");
    setup.setAttribute("aria-hidden","false");
    setupMessage.textContent = "";
    tokenInput.value = tmdbToken;
    if (typeof setfocus === "function") setfocus(tokenInput);
    tokenInput.focus();
  }
  function closeSetup() {
    if (!setup.classList.contains("open")) return;
    tokenInput.blur();
    setup.classList.remove("open");
    setup.setAttribute("aria-hidden","true");
    if (typeof setfocus === "function") setfocus(detail.classList.contains("open") ? detail.querySelector(".search-detail-connect") || detail.querySelector(".search-detail-back") : connectButton);
  }
  window.homeSearchSetupIsOpen = function () { return setup.classList.contains("open"); };
  window.closeSearchSetup = closeSetup;
  connectButton.addEventListener("click", openSetup);
  setup.querySelector(".search-setup-back").addEventListener("click", closeSetup);
  setup.querySelector(".search-setup-remove").addEventListener("click", function () {
    tmdbToken = "";
    try { localStorage.removeItem("tvlauncher_tmdb_token"); } catch (error) {}
    remoteMatches = null;
    remoteQuery = null;
    ++remoteSequence;
    setupMessage.textContent = "Live search disconnected. The built-in titles remain available.";
    tokenInput.value = "";
    render();
  });
  setup.querySelector(".search-setup-save").addEventListener("click", function () {
    const candidate = tokenInput.value.trim();
    if (!candidate) { setupMessage.textContent = "Paste your TMDB API key or Read Access Token first."; return; }
    setupMessage.textContent = "Connecting…";
    tmdbGet("/configuration",candidate).then(function () {
      tmdbToken = candidate;
      try { localStorage.setItem("tvlauncher_tmdb_token",candidate); }
      catch (error) { setupMessage.textContent = "Connected for this session; this TV could not save the token."; }
      remoteError = "";
      closeSetup();
      render();
      scheduleRemoteSearch();
    }).catch(function (error) { setupMessage.textContent = error.message; });
  });
  function render() {
    const query = normalized(search.value);
    queryText.textContent = search.value || "Search for a movie or TV show...";
    queryText.classList.toggle("placeholder", !search.value);
    document.body.classList.toggle("home-query-present", !!search.value);
    heading.textContent = query ? "Results" : "Movies & TV";
    const matches = tmdbToken && remoteQuery === query && remoteMatches ? remoteMatches : visibleItems(query);
    count.textContent = matches.length + (matches.length === 1 ? " TITLE" : " TITLES");
    results.innerHTML = "";
    if (!matches.length) {
      results.innerHTML = '<div class="search-empty">No titles found. Try a different search.</div>';
    } else {
      matches.forEach(function (item) {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "search-result";
        card.dataset.title = item.title;
        card.style.setProperty("--art-bg", item.bg);
        card.style.setProperty("--art-accent", item.accent);
        card.innerHTML = '<span class="search-result-art" aria-hidden="true"><span class="search-result-symbol"></span><strong>' + item.art + '</strong><small>' + item.type + '</small></span><span class="search-result-name">' + escapeHtml(item.title) + '</span>';
        card.setAttribute("aria-label", item.title + ", " + item.type.toLowerCase() + ", " + item.year);
        card.addEventListener("click", function () { showDetail(item); });
        results.appendChild(card);
        applyArtwork(card,item);
      });
      if (panel.classList.contains("open")) queueArtwork(matches);
    }
    const matchesTerms = query ? suggestionTerms.filter(function (term) {
      return term.toLocaleLowerCase().startsWith(query);
    }) : ["Severance", "Dune: Part Two", "The Bear", "Anime", "Comedy"];
    const titleTerms = query ? matches.map(function (item) { return item.title; }).filter(function (title) {
      return title.toLocaleLowerCase().startsWith(query);
    }) : [];
    const unique = [];
    matchesTerms.concat(titleTerms).forEach(function (term) { if (unique.indexOf(term) === -1) unique.push(term); });
    suggestions.innerHTML = "";
    unique.slice(0, 5).forEach(function (term) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "search-suggestion";
      button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"></circle><path d="m15 15 6 6"></path></svg><span>' + escapeHtml(term) + '</span><span class="search-suggestion-arrow" aria-hidden="true">↗</span>';
      button.addEventListener("click", function () {
        search.value = term;
        render();
        scheduleRemoteSearch();
        if (typeof setfocus === "function") setfocus(keyboard.querySelector(".search-key"));
      });
      suggestions.appendChild(button);
    });
    if (!unique.length) suggestions.innerHTML = '<div class="search-no-suggestions">No suggestions yet</div>';
    connectButton.textContent = tmdbToken ? (remoteError ? "Live search unavailable · Manage connection" : "Live search connected · Manage") : "Connect live search & UK availability";
    panel.querySelector(".search-credit").innerHTML = tmdbToken && remoteMatches ? 'Artwork via <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a> · UK providers by JustWatch' : 'TV artwork via <a href="https://www.tvmaze.com/" target="_blank" rel="noopener noreferrer">TVmaze</a>';
  }
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
  function providerImage(path) {
    return path && /^\/[a-zA-Z0-9_.\/-]+$/.test(path) && path.indexOf("..") === -1
      ? "https://image.tmdb.org/t/p/w92" + path : "";
  }
  function showProviders(item, data) {
    const container = detail.querySelector(".search-provider-list");
    const status = detail.querySelector(".search-provider-status");
    const link = detail.querySelector(".search-provider-link");
    const gb = data && data.results && data.results.GB;
    if (!gb) {
      status.textContent = "No UK streaming availability is currently listed for this title.";
      return;
    }
    const groups = [
      ["Stream",gb.flatrate],["Free",gb.free],["With ads",gb.ads],
      ["Rent",gb.rent],["Buy",gb.buy]
    ];
    let total = 0;
    groups.forEach(function (group) {
      if (!Array.isArray(group[1]) || !group[1].length) return;
      const section = document.createElement("section");
      section.className = "search-provider-group";
      section.innerHTML = "<h3>" + group[0] + "</h3>";
      const list = document.createElement("div");
      list.className = "search-provider-entries";
      group[1].forEach(function (provider) {
        total++;
        const entry = document.createElement("div");
        entry.className = "search-provider";
        const logo = providerImage(provider.logo_path);
        entry.innerHTML = (logo ? '<img alt="" src="' + logo + '">' : "") + "<span>" + escapeHtml(provider.provider_name || "Unknown service") + "</span>";
        list.appendChild(entry);
      });
      section.appendChild(list);
      container.appendChild(section);
    });
    status.textContent = total ? "" : "No UK streaming availability is currently listed for this title.";
    if (gb.link && gb.link.indexOf("https://www.themoviedb.org/") === 0) {
      link.href = gb.link;
      link.hidden = false;
    }
  }
  function loadProviders(item, sequence) {
    const status = detail.querySelector(".search-provider-status");
    if (!tmdbToken) {
      status.innerHTML = 'For a complete UK provider list, <button type="button" class="search-detail-connect">connect live search</button>.';
      status.querySelector("button").addEventListener("click", openSetup);
      return;
    }
    status.textContent = "Checking UK availability…";
    const lookup = item.tmdbId
      ? Promise.resolve(item)
      : tmdbGet(tmdbSearchPath(item.title)).then(function (data) {
          const candidates = (data.results || []).map(mapTmdb).filter(Boolean);
          return candidates.filter(function (result) {
            return normalized(result.title) === normalized(item.title) && result.type === item.type;
          }).sort(function (a,b) {
            return (a.year === item.year ? -1 : 0) - (b.year === item.year ? -1 : 0);
          })[0] || null;
        });
    lookup.then(function (match) {
      if (!match) throw new Error("This title was not found in the live catalogue.");
      return tmdbGet("/" + match.tmdbMedia + "/" + match.tmdbId + "/watch/providers");
    }).then(function (data) {
      if (sequence === detailSequence && detail.classList.contains("open")) showProviders(item,data);
    }).catch(function (error) {
      if (sequence === detailSequence) status.textContent = error.message || "Availability could not be loaded.";
    });
  }
  function showDetail(item) {
    const sequence = ++detailSequence;
    detail.innerHTML = '<button type="button" class="search-detail-back" aria-label="Back to results">← Back to results</button><div class="search-detail-art" style="--art-bg:' + item.bg + ';--art-accent:' + item.accent + '"><span>' + item.art + '</span></div><div class="search-detail-copy"><span class="search-overline">' + item.type + ' · ' + item.year + '</span><h2>' + escapeHtml(item.title) + '</h2><p>' + item.genres.map(escapeHtml).join(" · ") + '</p><h3 class="search-provider-title">Where to watch in the UK</h3><div class="search-provider-status"></div><div class="search-provider-list"></div><a class="search-provider-link" hidden target="_blank" rel="noopener noreferrer">See options on TMDB ↗</a><p class="search-detail-attribution">Availability data by JustWatch · TMDB</p></div>';
    if (item.image) detail.querySelector(".search-detail-art").style.backgroundImage = 'linear-gradient(180deg,transparent,rgba(0,0,0,.4)),url("' + (item.imageFull || item.image).replace(/"/g,"%22") + '")';
    detail.classList.add("open");
    detail.setAttribute("aria-hidden", "false");
    detail.querySelector(".search-detail-back").addEventListener("click", closeDetail);
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
    render();
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
    queueArtwork(visibleItems(normalized(search.value)));
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
  search.addEventListener("input", function () { render(); scheduleRemoteSearch(); });
  search.addEventListener("click", function (event) { event.preventDefault(); openHomeKeyboard(); });
  search.addEventListener("focus", function () { search.blur(); openHomeKeyboard(); });
  document.querySelectorAll("#featurecards .featuretile").forEach(function (tile,index) {
    tile.addEventListener("click", function () {
      if (typeof activateHomeCard === "function") activateHomeCard(index);
    });
  });
  drawer.addEventListener("click", function () {
    search.value = "";
    render();
    openDrawer();
  });
  window.addEventListener("keydown", function (event) {
    if (!homeKeyboardIsOpen()) return;
    if (setup.classList.contains("open")) {
      if (event.key === "Escape") { event.preventDefault(); closeSetup(); }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      if (detail.classList.contains("open")) closeDetail();
      else closeHomeKeyboard();
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