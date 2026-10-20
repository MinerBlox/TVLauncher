// Home artwork controls and remote-friendly on-screen keyboard.
(function () {
  const search = document.getElementById("appsearch");
  const toggle = document.getElementById("realappbarbtu");
  const drawer = document.getElementById("drawerhandle");
  const panel = document.createElement("section");
  panel.id = "homekeyboard";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Search keyboard");
  panel.setAttribute("aria-hidden", "true");
  panel.innerHTML = '<div class="homekeyboard-header"><div><span class="homekeyboard-eyebrow">SEARCH</span><h2>What are you looking for?</h2></div><button type="button" class="homekeyboard-close" data-key="close" aria-label="Close keyboard">×</button></div><div class="homekeyboard-keys"></div><div class="homekeyboard-hint">Use the arrow keys to navigate · OK to select · Back to close</div>';
  document.body.appendChild(panel);
  const keyArea = panel.querySelector(".homekeyboard-keys");
  const layouts = [
    { name: "numbers", keys: Array.from("1234567890").map(function (key) { return [key,key]; }) },
    { name: "letters", keys: Array.from("QWERTYUIOPASD").map(function (key) { return [key,key]; }) },
    { name: "letters", keys: Array.from("FGHJKLZXCVBNM").map(function (key) { return [key,key]; }) },
    { name: "actions", keys: [["clear","Clear"],["shift","⇧"],["space","Space"],["delete","⌫"],["submit",""]] }
  ];
  layouts.forEach(function (layout) {
    const row = document.createElement("div");
    row.className = "homekeyboard-row homekeyboard-" + layout.name + "-row";
    layout.keys.forEach(function (entry) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "homekeyboard-key homekeyboard-" + (/^[A-Z]$/.test(entry[0]) ? "letter" : entry[0]);
      button.dataset.key = entry[0];
      if (entry[0] === "submit") {
        button.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 16h21m-8-8 8 8-8 8"/></svg>';
      } else button.textContent = entry[1];
      button.setAttribute("aria-label", {
        shift: "Shift. Press twice for caps lock", delete: "Delete last character",
        space: "Space", clear: "Clear search", submit: "Search"
      }[entry[0]] || entry[1]);
      row.appendChild(button);
    });
    keyArea.appendChild(row);
  });
  let shiftMode = 0; // 0 normal, 1 next letter, 2 caps lock
  let lastShiftPress = 0;
  const shiftButton = panel.querySelector('[data-key="shift"]');
  function updateShift() {
    panel.classList.toggle("shifted", shiftMode === 1);
    panel.classList.toggle("capslocked", shiftMode === 2);
    shiftButton.setAttribute("aria-pressed", shiftMode !== 0 ? "true" : "false");
    shiftButton.setAttribute("aria-label", shiftMode === 2 ? "Caps lock on. Press to turn off" : "Shift. Press twice for caps lock");
  }
  let previousFocus = null;
  search.readOnly = true; // Keep the TV's native keyboard from covering the custom one.

  function filterApps() {
    const query = search.value.trim().toLocaleLowerCase();
    document.querySelectorAll("#appluncher .appitem").forEach(function (tile) {
      const name = tile.querySelector(".appname");
      tile.style.display = !query || (name && name.textContent.toLocaleLowerCase().includes(query)) ? "" : "none";
    });
  }
  function openDrawer() {
    closeHomeKeyboard(false);
    toggle.checked = true;
    toggle.dispatchEvent(new Event("change", { bubbles: true }));
    filterApps();
    if (typeof settle === "function") settle();
  }
  window.homeKeyboardIsOpen = function () { return panel.classList.contains("open"); };
  window.openHomeKeyboard = function () {
    if (homeKeyboardIsOpen()) return;
    previousFocus = typeof dpadfocus !== "undefined" ? dpadfocus : null;
    search.blur();
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("home-search-active");
    if (typeof keyboardmode !== "undefined") keyboardmode = true;
    if (typeof setfocus === "function") setfocus(panel.querySelector(".homekeyboard-letter"));
  };
  window.closeHomeKeyboard = function (restore) {
    if (!homeKeyboardIsOpen()) return;
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    shiftMode = 0;
    updateShift();
    document.body.classList.remove("home-search-active");
    search.blur();
    if (restore !== false && typeof setfocus === "function") {
      setfocus(previousFocus && document.body.contains(previousFocus) ? previousFocus : document.querySelector("#featurecards .featuretile"));
    }
  };
  function pressKey(key) {
    if (key === "close") { closeHomeKeyboard(); return; }
    if (key === "submit") { openDrawer(); return; }
    if (key === "shift") {
      const now = Date.now();
      shiftMode = shiftMode === 2 ? 0 : shiftMode === 1 ? (now - lastShiftPress < 900 ? 2 : 0) : 1;
      lastShiftPress = now;
      updateShift();
      return;
    }
    if (key === "delete") search.value = search.value.slice(0, -1);
    else if (key === "clear") search.value = "";
    else if (key === "space") search.value += " ";
    else {
      const letter = /^[a-z]$/i.test(key);
      search.value += letter && shiftMode ? key.toUpperCase() : (letter ? key.toLowerCase() : key);
      if (letter && shiftMode === 1) { shiftMode = 0; updateShift(); }
    }
    search.dispatchEvent(new Event("input", { bubbles: true }));
  }
  search.addEventListener("input", function () { document.body.classList.toggle("home-query-present", !!search.value); });
  panel.addEventListener("click", function (event) {
    const key = event.target.closest("button[data-key]");
    if (key) pressKey(key.dataset.key);
  });
  document.querySelectorAll("#featurecards .featuretile").forEach(function (tile) {
    tile.addEventListener("click", function () {
      search.value = tile.getAttribute("data-search") || "";
      document.body.classList.toggle("home-query-present", !!search.value);
      openDrawer();
    });
  });
  drawer.addEventListener("click", function () { search.value = ""; document.body.classList.remove("home-query-present"); openDrawer(); });
  search.addEventListener("click", function (event) { event.preventDefault(); openHomeKeyboard(); });
  search.addEventListener("focus", function () { search.blur(); openHomeKeyboard(); });
  window.addEventListener("keydown", function (event) {
    if (!homeKeyboardIsOpen()) return;
    if (event.key === "Escape" || event.keyCode === 461) {
      event.preventDefault();
      closeHomeKeyboard();
    } else if (event.key === "Backspace") {
      event.preventDefault();
      pressKey("delete");
    } else if (event.key === " " || (event.key.length === 1 && /^[a-z0-9?!.,\x27-]$/i.test(event.key))) {
      event.preventDefault();
      pressKey(event.key === " " ? "space" : event.key);
    }
  });
})();
