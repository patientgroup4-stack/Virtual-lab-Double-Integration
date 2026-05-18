const STORAGE_KEYS = {
  user: "dilab.currentUser",
  events: "dilab.events",
  students: "dilab.students"
};

const ACTIVE_WINDOW_MS = 5 * 60 * 1000;
const INF_CUTOFF = 20;
const DEVELOPER_PASSCODE = "admin123";
let currentTestIndex = 0;
let currentPracticeFilter = "all";

const practiceQuestions = [
  {
    type: "limits",
    question: "Evaluate integral from x=0 to 2 and y=0 to 1 of (x + y) dy dx.",
    answer: 3,
    exactText: "3",
    explanation: "Step 1: The inner integral is with respect to y. Integrating (x + y) dy gives xy + (y^2)/2. Evaluating from y=0 to y=1 gives x + 1/2. Step 2: The outer integral is with respect to x. Integrating (x + 1/2) dx gives (x^2)/2 + x/2. Evaluating from x=0 to x=2 gives 2 + 1 = 3."
  },
  {
    type: "limits",
    question: "Evaluate integral from y=0 to 1 and x=0 to 2 of xy dx dy.",
    answer: 1,
    exactText: "1",
    explanation: "Step 1: The inner integral is with respect to x. Integrating xy dx gives (x^2*y)/2. Evaluating from x=0 to x=2 gives 2y. Step 2: The outer integral is with respect to y. Integrating 2y dy gives y^2. Evaluating from y=0 to y=1 gives 1."
  },
  {
    type: "bounded",
    question: "Find area bounded by y=x and y=x^2 from x=0 to x=1.",
    answer: 1 / 6,
    exactText: "1/6",
    explanation: "Step 1: Identify the boundaries. On [0, 1], y=x is above y=x^2. Step 2: Set up the area integral: integral from x=0 to 1 of (Top - Bottom) dx. Step 3: Integrate (x - x^2) dx to get (x^2)/2 - (x^3)/3. Evaluating from 0 to 1 gives 1/2 - 1/3 = 1/6."
  },
  {
    type: "bounded",
    question: "Find area bounded by y=4-x^2 and y=0 from x=-2 to x=2.",
    answer: 32 / 3,
    exactText: "32/3",
    explanation: "Step 1: The top curve is y=4-x^2, and the bottom is y=0. Step 2: Integrate (4 - x^2) dx from x=-2 to x=2. Step 3: The antiderivative is 4x - (x^3)/3. Evaluated at 2, we get 16/3. By symmetry over the y-axis, we double this to get 32/3."
  },
  {
    type: "bounded",
    question: "Without limits, find area between y=x and y=x^2.",
    answer: 1 / 6,
    exactText: "1/6",
    explanation: "Step 1: Find intersections by setting x = x^2, which gives x=0 and x=1. Step 2: Between 0 and 1, y=x is the top curve. Step 3: Integrate (x - x^2) dx from 0 to 1, resulting in (x^2)/2 - (x^3)/3 = 1/2 - 1/3 = 1/6."
  },
  {
    type: "bounded",
    question: "Without limits, evaluate double integral of f(x,y)=x over the region between y=x and y=x^2.",
    answer: 1 / 12,
    exactText: "1/12",
    explanation: "Step 1: Intersections are x=0 and x=1. Step 2: Set up double integral ∫(x=0 to 1) ∫(y=x^2 to x) x dy dx. Step 3: Inner integral with respect to y is xy, evaluated from y=x^2 to x gives x^2 - x^3. Step 4: Integrate (x^2 - x^3) dx from 0 to 1 to get 1/3 - 1/4 = 1/12."
  },
  {
    type: "limits",
    question: "Find the area of rectangle R: 0 <= x <= 3, 0 <= y <= 4 using double integration.",
    answer: 12,
    exactText: "12",
    explanation: "Step 1: Area is the double integral of the constant function 1. Step 2: Set up the integral from x=0 to 3 and y=0 to 4 of 1 dy dx. Step 3: Inner integral gives y, evaluated to 4. Step 4: Outer integral of 4 dx from 0 to 3 is 12."
  },
  {
    type: "infinity",
    question: "How should positive infinity be entered in the solver limit box?",
    textAnswer: ["inf", "+inf", "infinity", "+infinity"],
    explanation: "Use 'inf', '+inf', 'infinity', or '+infinity'. The solver treats it as an improper integral approximation by using a sufficiently large number limit."
  },
  {
    type: "infinity",
    question: "Evaluate integral from x=0 to infinity and y=0 to 1 of exp(-x) dy dx.",
    answer: 1,
    exactText: "1",
    explanation: "Step 1: Inner integral of exp(-x) with respect to y gives y*exp(-x), evaluated from 0 to 1 gives exp(-x). Step 2: Outer integral of exp(-x) dx is -exp(-x). Evaluated from 0 to infinity, -exp(-infinity) - (-exp(0)) = 0 + 1 = 1."
  }
];

const tests = [
  {
    title: "Test 1: Theory and Limits",
    questions: [
      {
        prompt: "When f(x,y)=1, the double integral gives",
        options: ["Area of the region", "Only slope", "Only perimeter", "Only derivative"],
        answer: 0
      },
      {
        prompt: "In an iterated integral, which integral is solved first?",
        options: ["The inner integral", "The outer integral", "Neither", "Only the x integral"],
        answer: 0
      },
      {
        prompt: "Which input is valid for positive infinity in the solver?",
        options: ["inf", "big", "forever", "limitless"],
        answer: 0
      },
      {
        prompt: "For 0 <= x <= 2 and 0 <= y <= 3, area is",
        options: ["5", "6", "2", "3"],
        answer: 1
      }
    ]
  },
  {
    title: "Test 2: Area Bounded",
    questions: [
      {
        prompt: "For area bounded by curves, the integrand is usually",
        options: ["1", "x+y", "0", "xy"],
        answer: 0
      },
      {
        prompt: "Area between y=x and y=x^2 from 0 to 1 is",
        options: ["1/6", "1/2", "1", "2"],
        answer: 0
      },
      {
        prompt: "If limits are not given in an area-bounded question, first find",
        options: ["Intersection points", "Only the final answer", "A random limit", "The derivative only"],
        answer: 0
      },
      {
        prompt: "Vertical strip area between top and bottom curves is",
        options: ["Integral of top - bottom", "Integral of bottom - top always", "Product of slopes", "Only x upper limit"],
        answer: 0
      }
    ]
  },
  {
    title: "Test 3: Computation",
    questions: [
      {
        prompt: "Integral from 0 to 1, 0 to 1 of xy dA is",
        options: ["1/4", "1/2", "1", "4"],
        answer: 0
      },
      {
        prompt: "Integral from x=0 to 2 and y=0 to 3 of x dy dx is",
        options: ["3", "6", "9", "12"],
        answer: 1
      },
      {
        prompt: "Area under y=4-x^2 above y=0 from -2 to 2 is",
        options: ["32/3", "16/3", "8", "4"],
        answer: 0
      },
      {
        prompt: "Improper integral means at least one limit is",
        options: ["infinite or has a discontinuity issue", "always zero", "not written", "a whole number"],
        answer: 0
      }
    ]
  }
];

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getCurrentUser() {
  return readJson(STORAGE_KEYS.user, null);
}

function setCurrentUser(user) {
  writeJson(STORAGE_KEYS.user, user);
}

function updateSolverGate() {
  const user = getCurrentUser();
  const loggedIn = Boolean(user && user.name && user.name !== "Guest learner");
  document.getElementById("solverLockedMessage").classList.toggle("hidden", loggedIn);
  document.getElementById("solverWorkspace").classList.toggle("hidden", !loggedIn);
  document.getElementById("studentForm").classList.toggle("hidden", loggedIn);
  
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.classList.toggle("hidden", !loggedIn);
  
  document.getElementById("currentUserLabel").textContent = loggedIn
    ? `${user.name}${user.id ? ` (${user.id})` : ""}`
    : "Please login to use solver";
}

function registerStudent(user) {
  if (!user) return;
  const students = readJson(STORAGE_KEYS.students, {});
  const key = user.id || user.name;
  students[key] = {
    name: user.name,
    id: user.id,
    firstSeen: students[key]?.firstSeen || new Date().toISOString(),
    lastSeen: new Date().toISOString()
  };
  writeJson(STORAGE_KEYS.students, students);
}

function logEvent(type, detail = {}) {
  const user = getCurrentUser();
  if (!user) return;
  registerStudent(user);
  const events = readJson(STORAGE_KEYS.events, []);
  events.push({
    type,
    detail,
    name: user.name,
    id: user.id,
    time: new Date().toISOString()
  });
  writeJson(STORAGE_KEYS.events, events.slice(-1200));
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-page").forEach((page) => page.classList.toggle("active", page.id === tabName));
  document.querySelectorAll(".tab-link").forEach((button) => button.classList.toggle("active", button.dataset.tab === tabName));
  document.getElementById("tabNav").classList.remove("open");
  document.getElementById("navToggle").setAttribute("aria-expanded", "false");
  window.location.hash = tabName;
  logEvent("navigation", { tab: tabName });
  if (tabName === "monitor") updateDeveloperAccessUi();
}

function isDeveloperUnlocked() {
  return sessionStorage.getItem("dilab.developerUnlocked") === "true";
}

function updateDeveloperAccessUi() {
  const unlocked = isDeveloperUnlocked();
  document.querySelectorAll(".developer-only").forEach((item) => item.classList.toggle("hidden", !unlocked));
  document.getElementById("developerLoginForm").classList.toggle("hidden", unlocked);
  document.getElementById("monitorDashboard").classList.toggle("hidden", !unlocked);
  if (unlocked) renderMonitor();
}

function compileExpression(raw) {
  const allowedTokens = String(raw).toLowerCase().match(/[a-z]+/g) || [];
  const allowedNames = new Set(["x", "y", "sin", "cos", "tan", "sqrt", "log", "exp", "abs", "pi", "e"]);
  const invalidToken = allowedTokens.find((token) => !allowedNames.has(token));
  if (invalidToken) throw new Error(`Unsupported symbol or function: ${invalidToken}`);

  const normalized = raw
    .trim()
    .toLowerCase()
    .replace(/\^/g, "**")
    .replace(/\bpi\b/g, "Math.PI")
    .replace(/\be\b/g, "Math.E")
    .replace(/\bsin\b/g, "Math.sin")
    .replace(/\bcos\b/g, "Math.cos")
    .replace(/\btan\b/g, "Math.tan")
    .replace(/\bsqrt\b/g, "Math.sqrt")
    .replace(/\blog\b/g, "Math.log")
    .replace(/\bexp\b/g, "Math.exp")
    .replace(/\babs\b/g, "Math.abs");

  if (!normalized || !/^[0-9xy+\-*/().,\sA-ZMathPIE]+$/i.test(normalized)) {
    throw new Error("Use only supported math symbols and functions.");
  }

  return new Function("x", "y", `"use strict"; return (${normalized});`);
}

function parseLimit(value) {
  const clean = String(value).trim().toLowerCase();
  if (["inf", "+inf", "infinity", "+infinity"].includes(clean)) return { value: Infinity, improper: true };
  if (["-inf", "-infinity"].includes(clean)) return { value: -Infinity, improper: true };
  const numeric = Number(clean);
  if (!Number.isFinite(numeric)) throw new Error(`Invalid limit: ${value}`);
  return { value: numeric, improper: false };
}

function finiteLimit(limit) {
  if (limit.value === Infinity) return INF_CUTOFF;
  if (limit.value === -Infinity) return -INF_CUTOFF;
  return limit.value;
}

function formatLimit(limit) {
  if (limit.value === Infinity) return "infinity";
  if (limit.value === -Infinity) return "-infinity";
  return formatNumber(limit.value);
}

function integrate2D(fn, x0, x1, y0, y1) {
  const nx = 180;
  const ny = 180;
  const dx = (x1 - x0) / nx;
  const dy = (y1 - y0) / ny;
  let total = 0;

  for (let i = 0; i < nx; i += 1) {
    const x = x0 + (i + 0.5) * dx;
    for (let j = 0; j < ny; j += 1) {
      const y = y0 + (j + 0.5) * dy;
      const value = fn(x, y);
      if (!Number.isFinite(value)) throw new Error("Function produced a non-finite value inside the region.");
      total += value * dx * dy;
    }
  }

  return total;
}

function integrate1D(fn, a, b) {
  const n = 1400;
  const dx = (b - a) / n;
  let total = 0;

  for (let i = 0; i < n; i += 1) {
    const x = a + (i + 0.5) * dx;
    const value = fn(x);
    if (!Number.isFinite(value)) throw new Error("Curve produced a non-finite value in the selected interval.");
    total += value * dx;
  }

  return total;
}

function integrateBoundedRegion(fn, lowerFn, upperFn, x0, x1) {
  const nx = 220;
  const ny = 120;
  const dx = (x1 - x0) / nx;
  let total = 0;

  for (let i = 0; i < nx; i += 1) {
    const x = x0 + (i + 0.5) * dx;
    const low = lowerFn(x);
    const up = upperFn(x);
    const dy = (up - low) / ny;
    for (let j = 0; j < ny; j += 1) {
      const y = low + (j + 0.5) * dy;
      const value = fn(x, y);
      if (!Number.isFinite(value)) throw new Error("Function produced a non-finite value inside the bounded region.");
      total += value * dx * dy;
    }
  }

  return total;
}

function findIntersections(topFn, bottomFn) {
  const roots = [];
  const min = -10;
  const max = 10;
  const step = 0.05;
  let prevX = min;
  let prevY = topFn(prevX) - bottomFn(prevX);

  for (let x = min + step; x <= max; x += step) {
    const y = topFn(x) - bottomFn(x);
    if (Math.abs(y) < 0.01) roots.push(x);
    if (prevY * y < 0) {
      let left = prevX;
      let right = x;
      for (let k = 0; k < 40; k += 1) {
        const mid = (left + right) / 2;
        const midY = topFn(mid) - bottomFn(mid);
        if ((topFn(left) - bottomFn(left)) * midY <= 0) right = mid;
        else left = mid;
      }
      roots.push((left + right) / 2);
    }
    prevX = x;
    prevY = y;
  }

  return [...new Set(roots.map((root) => Number(root.toFixed(3))))].sort((a, b) => a - b);
}

function formatNumber(value) {
  if (Math.abs(value) < 1e-10) return "0";
  return Number(value.toFixed(6)).toString();
}

function solveIntegral(event) {
  event.preventDefault();
  const mode = document.getElementById("solverMode").value;
  if (mode.startsWith("bounded")) solveBoundedArea();
  else solveRectangularIntegral();
}

function solveRectangularIntegral() {
  const result = document.getElementById("solverResult");
  document.getElementById("graphPanel").classList.add("hidden");

  try {
    const expression = document.getElementById("functionInput").value.trim();
    const xLower = parseLimit(document.getElementById("xLower").value);
    const xUpper = parseLimit(document.getElementById("xUpper").value);
    const yLower = parseLimit(document.getElementById("yLower").value);
    const yUpper = parseLimit(document.getElementById("yUpper").value);
    const order = document.getElementById("orderInput").value;
    const improper = xLower.improper || xUpper.improper || yLower.improper || yUpper.improper;
    const x0 = finiteLimit(xLower);
    const x1 = finiteLimit(xUpper);
    const y0 = finiteLimit(yLower);
    const y1 = finiteLimit(yUpper);

    if (x0 === x1 || y0 === y1) throw new Error("Upper and lower limits must create a non-zero region.");

    const fn = compileExpression(expression);
    const value = integrate2D(fn, x0, x1, y0, y1);
    const area = Math.abs((x1 - x0) * (y1 - y0));
    const orderText = order === "dxdy" ? "dx dy" : "dy dx";

    result.innerHTML = `
      <p><strong>Integral:</strong> x from ${formatLimit(xLower)} to ${formatLimit(xUpper)}, y from ${formatLimit(yLower)} to ${formatLimit(yUpper)} of (${escapeHtml(expression)}) ${orderText}</p>
      <p><strong>Approximate value:</strong> ${formatNumber(value)}</p>
      <p><strong>Region area:</strong> ${formatNumber(area)} square units ${improper ? "(using finite cutoff for graph/numeric approximation)" : ""}</p>
      <p><strong>Infinity note:</strong> Type <code>inf</code> or <code>-inf</code>. This lab approximates infinity with +/-${INF_CUTOFF}; final improper integral answers should still be checked analytically.</p>
    `;
    logEvent("solver", { mode: "rect", expression, value: formatNumber(value), improper });
    renderMonitor();
  } catch (error) {
    result.innerHTML = `<p class="feedback wrong">${escapeHtml(error.message)}</p>`;
  }
}

function solveBoundedArea() {
  const result = document.getElementById("solverResult");
  document.getElementById("graphPanel").classList.remove("hidden");

  try {
    const integrandRaw = document.getElementById("boundedFunctionInput").value.trim() || "1";
    const upperRaw = document.getElementById("upperCurve").value.trim();
    const lowerRaw = document.getElementById("lowerCurve").value.trim();
    const solverMode = document.getElementById("solverMode").value;
    const limitType = solverMode === "bounded-auto" ? "auto" : "given";
    const integrand = compileExpression(integrandRaw);
    const firstFnCompiled = compileExpression(upperRaw);
    const secondFnCompiled = compileExpression(lowerRaw);
    const firstFn = (x) => firstFnCompiled(x, 0);
    const secondFn = (x) => secondFnCompiled(x, 0);
    let x0;
    let x1;
    let intersectionText = "";

    if (limitType === "auto") {
      const roots = findIntersections(firstFn, secondFn);
      if (roots.length < 2) throw new Error("Could not find two intersections in the range -10 to 10. Enter limits manually.");
      x0 = roots[0];
      x1 = roots[roots.length - 1];
      intersectionText = `<p><strong>Detected intersections:</strong> x = ${roots.map(formatNumber).join(", ")}</p>`;
    } else {
      const lower = parseLimit(document.getElementById("boundedXLower").value);
      const upper = parseLimit(document.getElementById("boundedXUpper").value);
      if (lower.improper || upper.improper) throw new Error("Area bounded graph needs finite x limits. Use rectangular solver for infinity examples.");
      x0 = lower.value;
      x1 = upper.value;
    }

    if (x0 === x1) throw new Error("x limits must be different.");
    const sampleX = (x0 + x1) / 2;
    const firstAtSample = firstFn(sampleX);
    const secondAtSample = secondFn(sampleX);
    const firstIsTop = firstAtSample >= secondAtSample;
    const upperFn = firstIsTop ? firstFn : secondFn;
    const lowerFn = firstIsTop ? secondFn : firstFn;
    const topRaw = firstIsTop ? upperRaw : lowerRaw;
    const bottomRaw = firstIsTop ? lowerRaw : upperRaw;
    const signedArea = integrate1D((x) => upperFn(x) - lowerFn(x), x0, x1);
    const area = Math.abs(signedArea);
    const value = integrateBoundedRegion(integrand, lowerFn, upperFn, x0, x1);
    const isAreaOnly = integrandRaw.replace(/\s/g, "") === "1";
    const topAtSample = upperFn(sampleX);
    const bottomAtSample = lowerFn(sampleX);

    result.innerHTML = `
      <p><strong>Step 1 - Graphs entered:</strong> graph 1 y = ${escapeHtml(upperRaw)}, graph 2 y = ${escapeHtml(lowerRaw)}.</p>
      <p><strong>Step 2 - Limits:</strong> ${limitType === "auto" ? "No limits were entered, so the solver found the intersection points of the two graphs." : "Given x limits were used."}</p>
      ${intersectionText}
      <p><strong>Step 3 - Top and bottom curves:</strong> on this interval, top curve is y=${escapeHtml(topRaw)} and bottom curve is y=${escapeHtml(bottomRaw)}.</p>
      <p><strong>Step 4 - Region:</strong> x goes from ${formatNumber(x0)} to ${formatNumber(x1)}. For each x, y goes from ${escapeHtml(bottomRaw)} to ${escapeHtml(topRaw)}.</p>
      <p><strong>Step 5 - Check top and bottom:</strong> at x=${formatNumber(sampleX)}, top y=${formatNumber(topAtSample)} and bottom y=${formatNumber(bottomAtSample)}.</p>
      <p><strong>Step 6 - Double integral setup:</strong> integral from x=${formatNumber(x0)} to ${formatNumber(x1)}, y=${escapeHtml(bottomRaw)} to y=${escapeHtml(topRaw)}, of (${escapeHtml(integrandRaw)}) dy dx.</p>
      <p><strong>${isAreaOnly ? "Area" : "Double integral value"}:</strong> ${formatNumber(isAreaOnly ? area : value)} ${isAreaOnly ? "square units" : ""}</p>
      <p><strong>Area of bounded region:</strong> ${formatNumber(area)} square units.</p>
      <p><strong>Numerical method:</strong> The region is divided into small vertical strips. Inside each strip, the solver samples points between the lower and upper curve and adds f(x,y) dA.</p>
    `;
    drawBoundedGraph(upperFn, lowerFn, x0, x1, topRaw, bottomRaw);
    logEvent("solver", { mode: "bounded", integrand: integrandRaw, top: topRaw, bottom: bottomRaw, x0, x1, area: formatNumber(area), value: formatNumber(value) });
    renderMonitor();
  } catch (error) {
    result.innerHTML = `<p class="feedback wrong">${escapeHtml(error.message)}</p>`;
  }
}

function drawAxes(ctx, canvas, bounds) {
  const { minX, maxX, minY, maxY } = bounds;
  const px = (x) => ((x - minX) / (maxX - minX)) * canvas.width;
  const py = (y) => canvas.height - ((y - minY) / (maxY - minY)) * canvas.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#d8e2e0";
  ctx.lineWidth = 1;

  for (let i = Math.ceil(minX); i <= Math.floor(maxX); i += 1) {
    ctx.beginPath();
    ctx.moveTo(px(i), 0);
    ctx.lineTo(px(i), canvas.height);
    ctx.stroke();
  }

  for (let i = Math.ceil(minY); i <= Math.floor(maxY); i += 1) {
    ctx.beginPath();
    ctx.moveTo(0, py(i));
    ctx.lineTo(canvas.width, py(i));
    ctx.stroke();
  }

  ctx.strokeStyle = "#18212a";
  ctx.lineWidth = 2;
  if (minY <= 0 && maxY >= 0) {
    ctx.beginPath();
    ctx.moveTo(0, py(0));
    ctx.lineTo(canvas.width, py(0));
    ctx.stroke();
  }
  if (minX <= 0 && maxX >= 0) {
    ctx.beginPath();
    ctx.moveTo(px(0), 0);
    ctx.lineTo(px(0), canvas.height);
    ctx.stroke();
  }

  return { px, py };
}

function drawRectRegion(x0, x1, y0, y1) {
  const canvas = document.getElementById("graphCanvas");
  const ctx = canvas.getContext("2d");
  const minX = Math.min(x0, x1) - 1;
  const maxX = Math.max(x0, x1) + 1;
  const minY = Math.min(y0, y1) - 1;
  const maxY = Math.max(y0, y1) + 1;
  const { px, py } = drawAxes(ctx, canvas, { minX, maxX, minY, maxY });

  ctx.fillStyle = "rgba(15, 118, 110, 0.22)";
  ctx.strokeStyle = "#0f766e";
  ctx.lineWidth = 3;
  const left = px(Math.min(x0, x1));
  const top = py(Math.max(y0, y1));
  const width = Math.abs(px(x1) - px(x0));
  const height = Math.abs(py(y1) - py(y0));
  ctx.fillRect(left, top, width, height);
  ctx.strokeRect(left, top, width, height);
  ctx.fillStyle = "#18212a";
  ctx.font = "700 18px Inter, Arial";
  ctx.fillText("Rectangular region R", 22, 32);
}

function drawBoundedGraph(upperFn, lowerFn, x0, x1, upperLabel, lowerLabel) {
  const canvas = document.getElementById("graphCanvas");
  const ctx = canvas.getContext("2d");
  const samples = [];
  const minX = Math.min(x0, x1) - 1;
  const maxX = Math.max(x0, x1) + 1;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let i = 0; i <= 240; i += 1) {
    const x = minX + ((maxX - minX) * i) / 240;
    const up = upperFn(x);
    const low = lowerFn(x);
    if (Number.isFinite(up) && Number.isFinite(low)) {
      samples.push({ x, up, low });
      minY = Math.min(minY, up, low);
      maxY = Math.max(maxY, up, low);
    }
  }

  if (!Number.isFinite(minY) || !Number.isFinite(maxY)) {
    drawRectRegion(x0, x1, 0, 1);
    return;
  }

  const padding = Math.max(1, (maxY - minY) * 0.18);
  const { px, py } = drawAxes(ctx, canvas, { minX, maxX, minY: minY - padding, maxY: maxY + padding });
  const region = samples.filter((point) => point.x >= Math.min(x0, x1) && point.x <= Math.max(x0, x1));

  if (region.length > 1) {
    ctx.beginPath();
    region.forEach((point, index) => {
      const x = px(point.x);
      const y = py(point.up);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    [...region].reverse().forEach((point) => ctx.lineTo(px(point.x), py(point.low)));
    ctx.closePath();
    ctx.fillStyle = "rgba(198, 79, 25, 0.22)";
    ctx.fill();
  }

  drawCurve(ctx, samples, "up", px, py, "#2457c5");
  drawCurve(ctx, samples, "low", px, py, "#b91c1c");
  ctx.fillStyle = "#18212a";
  ctx.font = "700 16px Inter, Arial";
  ctx.fillText(`Top: y = ${upperLabel}`, 18, 28);
  ctx.fillText(`Bottom: y = ${lowerLabel}`, 18, 52);
}

function drawCurve(ctx, samples, key, px, py, color) {
  ctx.beginPath();
  samples.forEach((point, index) => {
    const x = px(point.x);
    const y = py(point[key]);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
}

function equivalentAnswer(input, item) {
  const clean = input.trim().toLowerCase();
  if (!clean) return false;
  if (item.textAnswer) return item.textAnswer.includes(clean.replace(/\s/g, ""));
  if (item.exactText && clean.replace(/\s/g, "") === item.exactText.replace(/\s/g, "")) return true;
  try {
    const numeric = compileExpression(clean)(0, 0);
    return Math.abs(numeric - item.answer) < 0.015;
  } catch {
    const numeric = Number(clean);
    return Number.isFinite(numeric) && Math.abs(numeric - item.answer) < 0.015;
  }
}

function renderPractice() {
  const list = document.getElementById("practiceList");
  const items = practiceQuestions.filter((item) => currentPracticeFilter === "all" || item.type === currentPracticeFilter);
  list.innerHTML = items.map((item, index) => `
    <article class="question-card">
      <span class="tag">${labelForType(item.type)}</span>
      <h3>Question ${index + 1}</h3>
      <p>${escapeHtml(item.question)}</p>
      <div class="answer-row">
        <input type="text" data-practice-input="${index}" placeholder="Your answer">
        <button class="button primary" type="button" data-practice-check="${index}">Check</button>
      </div>
      <div class="feedback" id="practiceFeedback${index}"></div>
    </article>
  `).join("");
}

function labelForType(type) {
  if (type === "limits") return "With limits";
  if (type === "bounded") return "Area bounded";
  return "Infinity";
}

function handlePracticeClick(event) {
  const button = event.target.closest("[data-practice-check]");
  if (!button) return;
  const items = practiceQuestions.filter((item) => currentPracticeFilter === "all" || item.type === currentPracticeFilter);
  const index = Number(button.dataset.practiceCheck);
  const item = items[index];
  const input = document.querySelector(`[data-practice-input="${index}"]`).value;
  const correct = equivalentAnswer(input, item);
  const feedback = document.getElementById(`practiceFeedback${index}`);
  feedback.className = `feedback ${correct ? "correct" : "wrong"}`;
  feedback.textContent = correct ? `Correct. ${item.explanation}` : `Try again. Hint: ${item.explanation}`;
  logEvent("practice", { type: item.type, question: item.question, correct });
  renderMonitor();
}

function renderTest() {
  const form = document.getElementById("testForm");
  const test = tests[currentTestIndex];
  form.innerHTML = `
    <h3>${test.title}</h3>
    ${test.questions.map((question, qIndex) => `
      <fieldset class="test-question">
        <legend>${qIndex + 1}. ${escapeHtml(question.prompt)}</legend>
        ${question.options.map((option, optionIndex) => `
          <label class="option">
            <input type="radio" name="q${qIndex}" value="${optionIndex}">
            <span>${escapeHtml(option)}</span>
          </label>
        `).join("")}
      </fieldset>
    `).join("")}
    <button class="button primary" type="submit">Submit Test</button>
    <div id="testResult" class="feedback"></div>
  `;
}

function submitTest(event) {
  event.preventDefault();
  const test = tests[currentTestIndex];
  let score = 0;
  test.questions.forEach((question, index) => {
    const selected = document.querySelector(`input[name="q${index}"]:checked`);
    if (selected && Number(selected.value) === question.answer) score += 1;
  });
  const result = document.getElementById("testResult");
  result.className = score === test.questions.length ? "feedback correct" : "feedback wrong";
  result.textContent = `Score: ${score}/${test.questions.length}. ${score === test.questions.length ? "Excellent." : "Review theory and try again."}`;
  logEvent("test", { test: test.title, score, total: test.questions.length });
  renderMonitor();
}

function renderMonitor() {
  if (!isDeveloperUnlocked()) return;

  const events = readJson(STORAGE_KEYS.events, []);
  const students = readJson(STORAGE_KEYS.students, {});
  const now = Date.now();
  const stats = {};

  Object.values(students).forEach((student) => {
    const key = student.id || student.name;
    stats[key] = { ...student, lastActivity: student.lastSeen, solver: 0, practice: 0, tests: 0 };
  });

  events.forEach((event) => {
    const key = event.id || event.name;
    if (!stats[key]) stats[key] = { name: event.name, id: event.id, lastActivity: event.time, solver: 0, practice: 0, tests: 0, isLoggedOut: false };
    stats[key].lastActivity = event.time;
    if (event.type === "logout") stats[key].isLoggedOut = true;
    if (event.type === "login") stats[key].isLoggedOut = false;
    if (event.type === "solver") stats[key].solver += 1;
    if (event.type === "practice") stats[key].practice += 1;
    if (event.type === "test") stats[key].tests += 1;
  });

  const rows = Object.values(stats).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
  const active = rows.filter((row) => !row.isLoggedOut && (now - new Date(row.lastActivity).getTime() <= ACTIVE_WINDOW_MS)).length;
  document.getElementById("activeCount").textContent = active;
  document.getElementById("studentCount").textContent = rows.length;
  document.getElementById("eventCount").textContent = events.length;
  document.getElementById("monitorRows").innerHTML = rows.length ? rows.map((row) => {
    const isActive = !row.isLoggedOut && (now - new Date(row.lastActivity).getTime() <= ACTIVE_WINDOW_MS);
    return `
      <tr>
        <td>${escapeHtml(row.name || "Guest learner")}</td>
        <td>${escapeHtml(row.id || "guest")}</td>
        <td><span class="status ${isActive ? "active" : "inactive"}">${isActive ? "Active" : "Inactive"}</span></td>
        <td>${new Date(row.lastActivity).toLocaleString()}</td>
        <td>${row.solver}</td>
        <td>${row.practice}</td>
        <td>${row.tests}</td>
      </tr>
    `;
  }).join("") : `<tr><td colspan="7">No activity recorded yet.</td></tr>`;
}

function exportCsv() {
  const events = readJson(STORAGE_KEYS.events, []);
  const header = ["time", "name", "id", "type", "detail"];
  const rows = events.map((event) => [event.time, event.name, event.id, event.type, JSON.stringify(event.detail)]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, "\"\"")}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "double-integration-lab-activity.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[char]);
}

function drawSurface() {
  const canvas = document.getElementById("surfaceCanvas");
  const ctx = canvas.getContext("2d");
  let frame = 0;

  function project(x, y, z) {
    const scale = canvas.width / 15;
    return {
      x: canvas.width / 2 + (x - y) * scale,
      y: canvas.height / 2 + (x + y) * scale * 0.38 - z * 32
    };
  }

  function loop() {
    frame += 0.016;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#101820");
    gradient.addColorStop(1, "#21313a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let gy = -4; gy <= 4; gy += 1) {
      ctx.beginPath();
      for (let gx = -4; gx <= 4; gx += 0.18) {
        const z = Math.sin(gx + frame) + Math.cos(gy - frame) + 2.2;
        const point = project(gx, gy, z);
        if (gx === -4) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.strokeStyle = "rgba(91, 211, 183, 0.45)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    for (let gx = -4; gx <= 4; gx += 1) {
      ctx.beginPath();
      for (let gy = -4; gy <= 4; gy += 0.18) {
        const z = Math.sin(gx + frame) + Math.cos(gy - frame) + 2.2;
        const point = project(gx, gy, z);
        if (gy === -4) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.strokeStyle = "rgba(96, 165, 250, 0.42)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 22px Inter, Arial";
    ctx.fillText("Double integral = accumulated value over region R", 24, 42);
    requestAnimationFrame(loop);
  }

  loop();
}

function bindEvents() {
  document.getElementById("navToggle").addEventListener("click", () => {
    const nav = document.getElementById("tabNav");
    const open = nav.classList.toggle("open");
    document.getElementById("navToggle").setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll("[data-tab]").forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      switchTab(item.dataset.tab);
    });
  });

  document.querySelectorAll("[data-tab-link]").forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      switchTab(item.dataset.tabLink);
    });
  });

  document.getElementById("studentForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("studentName").value.trim();
    if (!name) {
      document.getElementById("studentName").focus();
      return;
    }
    const id = document.getElementById("studentId").value.trim() || name.toLowerCase().replace(/\s+/g, "-");
    const user = { name, id };
    setCurrentUser(user);
    registerStudent(user);
    logEvent("login", {});
    updateSolverGate();
    renderMonitor();
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    logEvent("logout", {});
    setCurrentUser(null);
    document.getElementById("studentName").value = "";
    document.getElementById("studentId").value = "";
    updateSolverGate();
    renderMonitor();
  });

  document.getElementById("solverMode").addEventListener("change", () => {
    const mode = document.getElementById("solverMode").value;
    document.getElementById("rectInputs").classList.toggle("hidden", mode !== "rect");
    document.getElementById("boundedInputs").classList.toggle("hidden", !mode.startsWith("bounded"));
    const auto = mode === "bounded-auto";
    document.getElementById("boundedLimitFields").classList.toggle("hidden", auto);
    document.getElementById("autoLimitNote").classList.toggle("hidden", !auto);
    document.getElementById("solverResult").textContent = auto
      ? "Enter f(x,y) and two boundary graphs. The solver will find limits automatically."
      : "Enter the question data and press Solve.";
    drawDefaultGraph();
  });

  document.getElementById("solverForm").addEventListener("submit", solveIntegral);
  document.getElementById("practiceList").addEventListener("click", handlePracticeClick);
  document.querySelectorAll("[data-practice-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      currentPracticeFilter = button.dataset.practiceFilter;
      document.querySelectorAll("[data-practice-filter]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderPractice();
    });
  });

  document.querySelectorAll(".test-tab").forEach((button) => {
    button.addEventListener("click", () => {
      currentTestIndex = Number(button.dataset.test);
      document.querySelectorAll(".test-tab").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderTest();
      logEvent("navigation", { test: currentTestIndex + 1 });
    });
  });

  document.getElementById("testForm").addEventListener("submit", submitTest);
  document.getElementById("developerLoginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const passcode = document.getElementById("developerPasscode").value;
    const feedback = document.getElementById("developerLoginFeedback");
    if (passcode === DEVELOPER_PASSCODE) {
      sessionStorage.setItem("dilab.developerUnlocked", "true");
      document.getElementById("developerPasscode").value = "";
      feedback.textContent = "";
      updateDeveloperAccessUi();
      logEvent("developer_unlock", {});
    } else {
      feedback.className = "feedback wrong";
      feedback.textContent = "Incorrect passcode.";
    }
  });
  document.getElementById("refreshMonitor").addEventListener("click", renderMonitor);
  document.getElementById("exportCsv").addEventListener("click", exportCsv);
  document.getElementById("lockMonitor").addEventListener("click", () => {
    sessionStorage.removeItem("dilab.developerUnlocked");
    updateDeveloperAccessUi();
    switchTab("home");
  });
  document.getElementById("clearLogs").addEventListener("click", () => {
    if (confirm("Clear all local activity logs?")) {
      localStorage.removeItem(STORAGE_KEYS.events);
      localStorage.removeItem(STORAGE_KEYS.students);
      registerStudent(getCurrentUser());
      renderMonitor();
    }
  });
}

function drawDefaultGraph() {
  const mode = document.getElementById("solverMode")?.value || "rect";
  const graphPanel = document.getElementById("graphPanel");
  if (!graphPanel) return;
  graphPanel.classList.toggle("hidden", mode === "rect");
  if (mode !== "rect") drawRectRegion(0, 2, 0, 3);
}

function init() {
  const user = getCurrentUser();
  if (user) {
    setCurrentUser(user);
    registerStudent(user);
  }
  updateSolverGate();
  bindEvents();
  renderPractice();
  renderTest();
  drawSurface();
  drawDefaultGraph();
  updateDeveloperAccessUi();
  logEvent("visit", { page: "home" });
  const initial = window.location.hash.replace("#", "");
  if (["home", "theory", "solver", "practice", "test", "monitor"].includes(initial)) switchTab(initial);
  setInterval(() => logEvent("heartbeat", { visible: document.visibilityState === "visible" }), 60000);
}

document.addEventListener("DOMContentLoaded", init);
