// Grow the dots in the reference image one by one, using their measured pixel centers.
(function () {
  const home = document.getElementById("homehero");
  if (!home) return;
  const canvas = document.createElement("canvas");
  canvas.id = "home-dot-pulse";
  canvas.setAttribute("aria-hidden", "true");
  home.insertBefore(canvas, home.firstChild);
  const context = canvas.getContext("2d");
  if (!context) return;
  const referenceWidth = 1672;
  const referenceHeight = 941;
  const columns = [40.5,86,131.5,177.5,222.5,268.5,314,359.5,404.5,450.5,495.5,540.5,585.5,630.5,676.5,721.5,766.5,810.5,854.5,899,943.5,988.5,1034,1079.5,1125,1170,1215.5,1260.5,1306,1351.5,1397,1442.5,1488.5,1533.5,1579.5,1624.5,1670.5];
  const rows = [29.5,74.5,119.5,165,210.5,256,301,346.5,391.5,437,482.5,528,573.5,618,662.5,707.5,752,796.5,840.5,885.5,930.5];
  const dots = [];
  let width = 0;
  let height = 0;
  function resize() {
    const box = home.getBoundingClientRect();
    width = Math.round(box.width);
    height = Math.round(box.height);
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
  }
  function obscured(x, y) {
    // These areas contain lettering, the search pill, arrow and dock baked into the reference.
    return (x > 360 && x < 1310 && y > 326 && y < 490) ||
      (x > 120 && x < 1550 && y > 643) ||
      (x > 785 && x < 885 && y > 53 && y < 97);
  }
  function locateDot(pixels, guessX, guessY) {
    let sumX = 0, sumY = 0, weightSum = 0;
    for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) {
      const x = Math.round(guessX + dx), y = Math.round(guessY + dy);
      if (x < 0 || x >= referenceWidth || y < 0 || y >= referenceHeight) continue;
      const at = (y * referenceWidth + x) * 4;
      const r = pixels[at], g = pixels[at + 1], b = pixels[at + 2];
      const average = (r + g + b) / 3;
      if (average < 175 || average > 240 || Math.max(r,g,b)-Math.min(r,g,b) > 13) continue;
      const weight = 244 - average;
      sumX += x * weight;
      sumY += y * weight;
      weightSum += weight;
    }
    return weightSum > 120 ? { x: sumX / weightSum, y: sumY / weightSum } : null;
  }
  const image = new Image();
  image.onload = function () {
    const source = document.createElement("canvas");
    source.width = referenceWidth;
    source.height = referenceHeight;
    const sourceContext = source.getContext("2d", { willReadFrequently: true });
    sourceContext.drawImage(image, 0, 0, referenceWidth, referenceHeight);
    const pixels = sourceContext.getImageData(0, 0, referenceWidth, referenceHeight).data;
    columns.forEach(function (x, col) {
      rows.forEach(function (y, row) {
        if (obscured(x,y)) return;
        const found = locateDot(pixels, x, y);
        if (found) dots.push({ x: found.x, y: found.y, delay: 2200 + col * 76 + (row % 4) * 45 });
      });
    });
  };
  image.src = "access/home-reference.png";
  resize();
  window.addEventListener("resize", resize);
  const started = performance.now();
  function paint(now) {
    context.clearRect(0, 0, width, height);
    if (dots.length && !document.hidden) {
      const time = (now - started) % 9000;
      const xScale = width / referenceWidth;
      const yScale = height / referenceHeight;
      const sizeScale = Math.min(xScale, yScale);
      dots.forEach(function (dot) {
        const age = time - dot.delay;
        if (age <= 0 || age >= 850) return;
        const pulse = Math.sin(Math.PI * age / 850);
        const radius = (1.9 + 4.1 * pulse) * sizeScale;
        context.beginPath();
        context.arc(dot.x * xScale, dot.y * yScale, radius, 0, 2 * Math.PI);
        context.fillStyle = "rgba(133,143,160," + (0.26 + 0.53 * pulse).toFixed(3) + ")";
        context.fill();
      });
    }
    requestAnimationFrame(paint);
  }
  if (!window.matchMedia || !window.matchMedia("(prefers-reduced-motion: reduce)").matches) requestAnimationFrame(paint);
})();
