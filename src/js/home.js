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
  panel.innerHTML = '<div class="search-shell"><header class="search-header"><button type="button" class="search-back" data-key="close" aria-label="Back to Home"><span aria-hidden="true">←</span> Back to Home</button><div class="search-query" aria-live="polite"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="13" cy="13" r="9"></circle><path d="m20 20 9 9"></path></svg><span class="search-query-text">Search for a movie or TV show...</span><span class="search-caret"></span></div></header><div class="search-main"><div class="search-left"><div class="search-overline">SEARCH</div><div class="search-keyboard" aria-label="On-screen keyboard"></div><div class="search-suggestions"><div class="search-section-label">SUGGESTIONS</div><div class="search-suggestion-list"></div></div></div><div class="search-right"><div class="search-results-heading"><div><div class="search-overline">DISCOVER</div><h2>Movies &amp; TV</h2></div><span class="search-count"></span></div><div class="search-results" aria-live="polite"></div></div></div><div class="search-detail" aria-hidden="true"></div></div>';
  document.body.appendChild(panel);

  const keyboard = panel.querySelector(".search-keyboard");
  const suggestions = panel.querySelector(".search-suggestion-list");
  const results = panel.querySelector(".search-results");
  const queryText = panel.querySelector(".search-query-text");
  const count = panel.querySelector(".search-count");
  const heading = panel.querySelector(".search-results-heading h2");
  const detail = panel.querySelector(".search-detail");
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
      key.textContent = value === "space" ? "Space" : value === "delete" ? "⌫  Delete" : value;
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
  search.readOnly = true; // The custom TV keyboard owns text entry.

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[character];
    });
  }
  function normalized(value) { return value.trim().toLocaleLowerCase(); }
  function visibleItems(query) {
    if (!query) return catalogue;
    return catalogue.filter(function (item) {
      return item.title.toLocaleLowerCase().includes(query) ||
        item.genres.some(function (genre) { return genre.includes(query); });
    });
  }
  function render() {
    const query = normalized(search.value);
    queryText.textContent = search.value || "Search for a movie or TV show...";
    queryText.classList.toggle("placeholder", !search.value);
    document.body.classList.toggle("home-query-present", !!search.value);
    heading.textContent = query ? "Results" : "Movies & TV";
    const matches = visibleItems(query);
    count.textContent = matches.length + (matches.length === 1 ? " TITLE" : " TITLES");
    results.innerHTML = "";
    if (!matches.length) {
      results.innerHTML = '<div class="search-empty">No titles found. Try a different search.</div>';
    } else {
      matches.forEach(function (item) {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "search-result";
        card.style.setProperty("--art-bg", item.bg);
        card.style.setProperty("--art-accent", item.accent);
        card.innerHTML = '<span class="search-result-art" aria-hidden="true"><span class="search-result-symbol"></span><strong>' + item.art + '</strong><small>' + item.type + '</small></span><span class="search-result-name">' + escapeHtml(item.title) + '</span>';
        card.setAttribute("aria-label", item.title + ", " + item.type.toLowerCase() + ", " + item.year);
        card.addEventListener("click", function () { showDetail(item); });
        results.appendChild(card);
      });
    }
    const matchesTerms = query ? suggestionTerms.filter(function (term) {
      return term.toLocaleLowerCase().startsWith(query);
    }) : ["Severance", "Dune: Part Two", "The Bear", "Anime", "Comedy"];
    const titleTerms = query ? catalogue.map(function (item) { return item.title; }).filter(function (title) {
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
        if (typeof setfocus === "function") setfocus(keyboard.querySelector(".search-key"));
      });
      suggestions.appendChild(button);
    });
    if (!unique.length) suggestions.innerHTML = '<div class="search-no-suggestions">No suggestions yet</div>';
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
  function showDetail(item) {
    detail.innerHTML = '<button type="button" class="search-detail-back" aria-label="Back to results">← Back to results</button><div class="search-detail-art" style="--art-bg:' + item.bg + ';--art-accent:' + item.accent + '"><span>' + item.art + '</span></div><div class="search-detail-copy"><span class="search-overline">' + item.type + ' · ' + item.year + '</span><h2>' + escapeHtml(item.title) + '</h2><p>' + item.genres.map(escapeHtml).join(" · ") + '</p><button type="button" class="search-detail-search">Browse apps <span aria-hidden="true">↗</span></button></div>';
    detail.classList.add("open");
    detail.setAttribute("aria-hidden", "false");
    detail.querySelector(".search-detail-back").addEventListener("click", closeDetail);
    detail.querySelector(".search-detail-search").addEventListener("click", function () {
      search.value = "";
      render();
      openDrawer();
    });
    if (typeof setfocus === "function") setfocus(detail.querySelector(".search-detail-back"));
  }
  function closeDetail() {
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
    if (typeof setfocus === "function") setfocus(keyboard.querySelector(".search-key:nth-child(3)"));
  };
  window.closeHomeKeyboard = function (restore) {
    if (!homeKeyboardIsOpen()) return;
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
  search.addEventListener("input", render);
  search.addEventListener("click", function (event) { event.preventDefault(); openHomeKeyboard(); });
  search.addEventListener("focus", function () { search.blur(); openHomeKeyboard(); });
  document.querySelectorAll("#featurecards .featuretile").forEach(function (tile) {
    tile.addEventListener("click", function () {
      search.value = tile.getAttribute("data-search") || "";
      render();
      openDrawer();
    });
  });
  drawer.addEventListener("click", function () {
    search.value = "";
    render();
    openDrawer();
  });
  window.addEventListener("keydown", function (event) {
    if (!homeKeyboardIsOpen()) return;
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