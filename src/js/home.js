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
  const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
  rows.forEach(function (letters) {
    const row = document.createElement("div");
    row.className = "homekeyboard-row";
    Array.from(letters).forEach(function (letter) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "homekeyboard-key";
      button.dataset.key = letter;
      button.textContent = letter;
      button.setAttribute("aria-label", letter);
      row.appendChild(button);
    });
    keyArea.appendChild(row);
  });
  const actions = document.createElement("div");
  actions.className = "homekeyboard-row homekeyboard-actions";
  [["space", "Space"], ["delete", "⌫"], ["clear", "Clear"], ["submit", "Search ↗"]].forEach(function (entry) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "homekeyboard-key homekeyboard-action homekeyboard-" + entry[0];
    button.dataset.key = entry[0];
    button.textContent = entry[1];
    button.setAttribute("aria-label", entry[0] === "delete" ? "Delete last letter" : entry[1]);
    actions.appendChild(button);
  });
  keyArea.appendChild(actions);
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
    if (typeof setfocus === "function") setfocus(panel.querySelector(".homekeyboard-key"));
  };
  window.closeHomeKeyboard = function (restore) {
    if (!homeKeyboardIsOpen()) return;
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("home-search-active");
    search.blur();
    if (restore !== false && typeof setfocus === "function") {
      setfocus(previousFocus && document.body.contains(previousFocus) ? previousFocus : document.querySelector("#featurecards .featuretile"));
    }
  };
  function pressKey(key) {
    if (key === "close") { closeHomeKeyboard(); return; }
    if (key === "submit") { openDrawer(); return; }
    if (key === "delete") search.value = search.value.slice(0, -1);
    else if (key === "clear") search.value = "";
    else search.value += key === "space" ? " " : key.toLowerCase();
    search.dispatchEvent(new Event("input", { bubbles: true }));
  }
  panel.addEventListener("click", function (event) {
    const key = event.target.closest("button[data-key]");
    if (key) pressKey(key.dataset.key);
  });
  document.querySelectorAll("#featurecards .featuretile").forEach(function (tile) {
    tile.addEventListener("click", function () {
      search.value = tile.getAttribute("data-search") || "";
      openDrawer();
    });
  });
  drawer.addEventListener("click", function () { search.value = ""; openDrawer(); });
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
    } else if (event.key === " " || (event.key.length === 1 && /^[a-z0-9]$/i.test(event.key))) {
      event.preventDefault();
      pressKey(event.key === " " ? "space" : event.key);
    }
  });
})();
