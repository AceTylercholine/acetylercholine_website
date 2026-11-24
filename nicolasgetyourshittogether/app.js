// Shared behaviour for every theme of the Nicolas page.
// Themes only need to provide elements with the ids used below; optional ones are skipped if missing.
(() => {
  "use strict";

  const DEADLINE = new Date("2027-03-31T00:00:00");
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Everything is saved in this browser only (per device).
  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem("ngyst." + key);
        return v === null ? fallback : JSON.parse(v);
      } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem("ngyst." + key, JSON.stringify(value)); } catch { /* private mode etc. */ }
    },
  };

  // ---------- helpers ----------
  const pad = (n, len = 2) => String(n).padStart(len, "0");

  function fmtDuration(totalSeconds) {
    const s = Math.floor(totalSeconds);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (h) return `${h}h ${m}m`;
    if (m) return `${m}m ${sec}s`;
    return `${sec}s`;
  }

  function ago(ts) {
    const s = (Date.now() - ts) / 1000;
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) { const h = Math.floor(s / 3600); return `${h} hour${h === 1 ? "" : "s"} ago`; }
    const d = Math.floor(s / 86400);
    return `${d} day${d === 1 ? "" : "s"} ago`;
  }

  const daysLeft = () => Math.max(0, Math.ceil((DEADLINE - Date.now()) / 86400000));

  // How many of a given weekday (0 = Sun … 6 = Sat) are left before the deadline.
  function weekdaysLeft(dow) {
    let n = 0;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    while (d < DEADLINE) {
      if (d.getDay() === dow) n++;
      d.setDate(d.getDate() + 1);
    }
    return n;
  }

  const pick = (arr, avoid) => {
    let item;
    do { item = arr[Math.floor(Math.random() * arr.length)]; } while (arr.length > 1 && item === avoid);
    return item;
  };

  // ---------- toast ----------
  const toastEl = $("toast");
  let toastTimer;
  function toast(msg, ms = 3800) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), ms);
  }

  // ---------- confetti ----------
  function confetti() {
    if (reduceMotion) return;
    const raw = getComputedStyle(document.body).getPropertyValue("--confetti").trim() || "#ff2a2a,#ffd60a,#ffffff";
    const colors = raw.split(",").map((c) => c.trim());
    const host = document.querySelector("dialog[open]") || document.body;
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999";
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    host.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const parts = Array.from({ length: 160 }, () => ({
      x: innerWidth / 2, y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 14 - 4,
      size: 5 + Math.random() * 7, rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    const start = performance.now();
    (function frame(now) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (const p of parts) {
        p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (now - start < 2800) requestAnimationFrame(frame); else canvas.remove();
    })(start);
  }

  // ---------- guilt lines ----------
  // NEW_LINES show most of the time. OLD_LINES (the original page's lines) only show
  // OLD_LINE_CHANCE of the time. To retire an old line completely, comment it out.
  const NEW_LINES = [
    "Kira will make tacos for your defense, if it's a good defense.",
    "Your plants are auto-watered. You can't even use that as an excuse.",
    "Use your stress well. Harness it, wield it, don't cower from it.",
    "If you play a sport, you'll probably just get injured. Get back to work.",
    "Those who can, do. Those who can't, coach. Except you. You can. So do.",
    "Even if you use AI, you at least have to give it prompts. C'mon, that's so easy.",
    "Working from home means WORKING From Home.",
    "Hans just refreshed his inbox. Again.",
    "Your methods section is just the word 'Methods.'",
    "\"I work better under pressure.\" The pressure has arrived.",
    "Your 'Thesis' folder is 80% subfolders and 20% dread.",
    "Reorganising your desktop is not a chapter.",
    "Your defense slides are currently a blank white void.",
    "Ctrl+S is not the same as progress.",
    "Remember when you said \"I'll start Monday\"? Which Monday?",
    "Your abstract is more abstract than intended.",
    "Even your figures have figured out you're avoiding them.",
    "\"Just a quick render\" of the 3D model. Sure.",
    "Mumford & Sons wouldn't procrastinate. They'd write.",
    "Every tab you open is a citation you didn't add.",
    "Ben finished his. Just saying.",
    "Hans is drafting an email. Subject line: \"Quick check-in 🙂\".",
    "Your thesis has fewer words than this website.",
    "Writing badly is still writing. Go write badly.",
  ];
  const OLD_LINES = [
    "Hans is waiting.",
    "Are your figures formatted yet?",
    "That introduction won't write itself.",
    "Every second you waste is a second closer to a defense disaster.",
    "Shouldn't you be running stats on that dataset?",
    "Your reference manager is a mess and you know it.",
    "Another coffee won't write the discussion section.",
    "Changing the line spacing to 1.15 doesn't count as writing.",
    "Your bibliography has fewer entries than your Netflix watch history.",
    "That flashing text cursor is actively judging you.",
    "Renaming the file to 'Thesis_FINAL_v4.docx' doesn't make it done.",
    "Is 'Chapter 1' still just a title on a blank page?",
    "You know Word has a word count feature, right? It says zero.",
    "Your committee is already practicing their disappointed sighs.",
    "Do you really want to explain this gap in progress at the next lab meeting?",
    "Future Nicolas is currently weeping.",
    "Every YouTube video you watch delays your graduation by a week.",
    "The job market is waiting, Nicolas. And it is unforgiving.",
    "The next 3D model you're working on feels like progress, but it's not.",
    "Do you want me to tell Ben you asked for help?",
    "Stop listening to Mumford & Sons and start reading Lee Miller papers.",
  ];
  const OLD_LINE_CHANCE = 0.15;

  const guiltEl = $("guilt");
  const guiltLog = $("guilt-log");
  let lastLine = "";
  let typeTimer;

  function nextGuilt() {
    const pool = OLD_LINES.length && Math.random() < OLD_LINE_CHANCE ? OLD_LINES : NEW_LINES;
    const line = pick(pool, lastLine);
    lastLine = line;

    if (guiltEl) {
      clearInterval(typeTimer);
      let i = 0;
      guiltEl.textContent = "";
      guiltEl.classList.add("typing");
      typeTimer = setInterval(() => {
        i++;
        guiltEl.textContent = line.slice(0, i);
        if (i >= line.length) { clearInterval(typeTimer); guiltEl.classList.remove("typing"); }
      }, reduceMotion ? 0 : 30);
    }

    if (guiltLog) {
      const li = document.createElement("li");
      li.dataset.t = Date.now();
      const msg = document.createElement("span");
      msg.className = "log-msg";
      msg.textContent = line;
      const time = document.createElement("span");
      time.className = "log-time";
      time.textContent = "just now";
      li.append(msg, time);
      guiltLog.prepend(li);
      while (guiltLog.children.length > 5) guiltLog.lastElementChild.remove();
    }
  }
  nextGuilt();
  setInterval(nextGuilt, 7000);

  if (guiltLog) {
    setInterval(() => {
      for (const li of guiltLog.children) {
        const s = Math.floor((Date.now() - Number(li.dataset.t)) / 1000);
        li.querySelector(".log-time").textContent = s < 5 ? "just now" : `${s}s ago`;
      }
    }, 1000);
  }

  // ---------- countdown ----------
  const cd = { d: $("cd-days"), h: $("cd-hours"), m: $("cd-mins"), s: $("cd-secs"), ms: $("cd-ms") };
  function tick() {
    const diff = Math.max(0, DEADLINE - Date.now());
    if (diff === 0) document.body.classList.add("deadline-passed");
    if (cd.d) cd.d.textContent = pad(Math.floor(diff / 86400000), 3);
    if (cd.h) cd.h.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    if (cd.m) cd.m.textContent = pad(Math.floor((diff % 3600000) / 60000));
    if (cd.s) cd.s.textContent = pad(Math.floor((diff % 60000) / 1000));
    if (cd.ms) cd.ms.textContent = pad(diff % 1000, 3);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // ---------- progress (editable) ----------
  // Default steps; once edited in the progress dialog, the saved list is used instead.
  const DEFAULT_MILESTONES = [
    { at: 10, label: "Intro" },
    { at: 25, label: "Lit review" },
    { at: 40, label: "Methods" },
    { at: 60, label: "Results" },
    { at: 80, label: "Discussion" },
    { at: 100, label: "Submit" },
  ];
  const getMilestones = () =>
    store.get("milestones", DEFAULT_MILESTONES).slice().sort((a, b) => a.at - b.at);
  const getProgress = () => store.get("progress", { value: 1.4, updated: null });
  const fmtPct = (v) => String(Math.round(v * 10) / 10);

  const msList = $("milestones");
  function renderMilestones() {
    if (!msList) return;
    msList.replaceChildren();
    for (const m of getMilestones()) {
      const li = document.createElement("li");
      li.style.left = m.at + "%";
      li.dataset.at = m.at;
      if (m.at >= 92) li.classList.add("end");
      if (m.at <= 6) li.classList.add("start");
      const label = document.createElement("span");
      label.textContent = m.label;
      li.appendChild(label);
      msList.appendChild(li);
    }
  }
  renderMilestones();

  function renderProgress() {
    const { value, updated } = getProgress();
    if ($("progress-fill")) $("progress-fill").style.width = value + "%";
    if ($("progress-marker")) $("progress-marker").style.left = value + "%";
    document.querySelectorAll(".progress-pct").forEach((el) => (el.textContent = fmtPct(value) + "%"));
    if (msList) for (const li of msList.children) li.classList.toggle("reached", value >= Number(li.dataset.at));
    const upd = $("progress-updated");
    if (upd) {
      if (!updated) upd.textContent = "Never updated. Hmm.";
      else {
        const stale = (Date.now() - updated) / 86400000 > 7;
        upd.textContent = `Updated ${ago(updated)}${stale ? ". Suspicious." : ""}`;
        upd.classList.toggle("stale", stale);
      }
    }
    const vel = $("stat-velocity");
    if (vel) {
      const d = daysLeft();
      vel.textContent = d ? ((100 - value) / d).toFixed(2) + "%/day" : "—";
    }
  }
  renderProgress();
  setInterval(renderProgress, 60000);

  const progressDlg = $("progress-dialog");
  const progressInput = $("progress-input");
  const progressRange = $("progress-range");
  // Optional step editor inside the progress dialog (#steps-editor + #step-add).
  // Up/down moves a step's name; the % column stays sorted, so steps keep their order on the bar.
  const stepsEditor = $("steps-editor");

  function stepRow(m) {
    const row = document.createElement("li");
    row.className = "step-row";
    const btn = (text, cls, label) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "step-btn " + cls;
      b.textContent = text;
      b.setAttribute("aria-label", label);
      return b;
    };
    const up = btn("▲", "step-up", "Move up");
    const down = btn("▼", "step-down", "Move down");
    const name = document.createElement("input");
    name.type = "text";
    name.className = "step-name";
    name.value = m.label;
    name.maxLength = 40;
    name.setAttribute("aria-label", "Step name");
    const at = document.createElement("input");
    at.type = "number";
    at.className = "step-at";
    at.min = 0; at.max = 100; at.step = 1;
    at.inputMode = "numeric";
    at.value = m.at;
    at.setAttribute("aria-label", "Done at %");
    const pctSign = document.createElement("span");
    pctSign.className = "step-pct";
    pctSign.textContent = "%";
    const del = btn("✕", "step-del", "Remove step");
    row.append(up, down, name, at, pctSign, del);
    return row;
  }

  function fillStepsEditor() {
    if (!stepsEditor) return;
    stepsEditor.replaceChildren(...getMilestones().map(stepRow));
  }

  if (stepsEditor) {
    stepsEditor.addEventListener("click", (e) => {
      const b = e.target.closest(".step-btn");
      if (!b) return;
      const row = b.closest(".step-row");
      const rows = [...stepsEditor.children];
      const i = rows.indexOf(row);
      if (b.classList.contains("step-del")) {
        row.remove();
        return;
      }
      const j = b.classList.contains("step-up") ? i - 1 : i + 1;
      if (j < 0 || j >= rows.length) return;
      const a = row.querySelector(".step-name"), c = rows[j].querySelector(".step-name");
      [a.value, c.value] = [c.value, a.value];
      c.focus();
    });
    $("step-add")?.addEventListener("click", () => {
      // New step goes just before the highest one (usually "Submit" at 100%).
      const ats = [...stepsEditor.querySelectorAll(".step-at")].map((x) => Number(x.value)).sort((a, b) => a - b);
      const top = ats.length ? ats[ats.length - 1] : 0;
      const below = ats.length > 1 ? ats[ats.length - 2] : 0;
      const at = top < 100 ? Math.min(100, top + 5) : Math.round((below + top) / 2);
      const row = stepRow({ label: "", at });
      stepsEditor.appendChild(row);
      row.querySelector(".step-name").focus();
    });
    $("steps-reset")?.addEventListener("click", () => {
      stepsEditor.replaceChildren(...DEFAULT_MILESTONES.map(stepRow));
    });
  }

  function readStepsEditor() {
    return [...stepsEditor.children]
      .map((row) => ({
        label: row.querySelector(".step-name").value.trim(),
        at: Math.min(100, Math.max(0, Number(row.querySelector(".step-at").value) || 0)),
      }))
      .filter((m) => m.label)
      .sort((a, b) => a.at - b.at);
  }

  if (progressDlg && progressInput) {
    const openProgress = () => {
      const v = getProgress().value;
      progressInput.value = v;
      if (progressRange) progressRange.value = v;
      fillStepsEditor();
      progressDlg.showModal();
      progressInput.select();
    };
    document.querySelectorAll("[data-open-progress]").forEach((b) => b.addEventListener("click", openProgress));
    if (progressRange) {
      progressRange.addEventListener("input", () => (progressInput.value = progressRange.value));
      progressInput.addEventListener("input", () => (progressRange.value = progressInput.value));
    }
    $("progress-cancel")?.addEventListener("click", () => progressDlg.close());
    $("progress-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const old = getProgress().value;
      const v = Math.min(100, Math.max(0, Number(progressInput.value)));
      if (Number.isNaN(v)) return;
      const oldSteps = JSON.stringify(getMilestones());
      if (stepsEditor) {
        store.set("milestones", readStepsEditor());
        renderMilestones();
      }
      const stepsChanged = JSON.stringify(getMilestones()) !== oldSteps;
      store.set("progress", { value: v, updated: Date.now() });
      progressDlg.close();
      renderProgress();
      if (stepsChanged && v === old) { toast("Steps updated. Planning is not writing, but fine."); return; }
      const crossed = getMilestones().filter((m) => old < m.at && v >= m.at).pop();
      if (v === 100) { toast("100%?! Kira, start the taco shopping list."); confetti(); }
      else if (crossed) { toast(`${crossed.label} done. Look at you go.`); confetti(); }
      else if (v > old) { toast(`+${fmtPct(v - old)}%. Progress! Keep it coming.`); confetti(); }
      else if (v < old) toast("Going backwards. Bold strategy.");
      else toast("Same number as before. Updating the bar isn't the same as progress.");
    });
  }

  // ---------- stats: attempts + time wasted ----------
  let attempts = store.get("attempts", 0);
  let wastedTotal = store.get("wasted", 0);
  let wastedSession = 0;
  let focusActive = false;

  function renderStats() {
    if ($("stat-attempts")) $("stat-attempts").textContent = attempts;
    if ($("stat-session")) $("stat-session").textContent = fmtDuration(wastedSession);
    if ($("stat-total")) $("stat-total").textContent = fmtDuration(wastedTotal);
    if ($("stat-focus")) $("stat-focus").textContent = store.get("focusSessions", 0);
  }
  renderStats();

  setInterval(() => {
    if (document.hidden || focusActive) return;
    wastedSession++;
    wastedTotal++;
    if (wastedSession % 5 === 0) store.set("wasted", wastedTotal);
    renderStats();
  }, 1000);
  addEventListener("pagehide", () => store.set("wasted", wastedTotal));

  // ---------- hold to procrastinate ----------
  // The bar fills fast at first, then slower and slower (it can never reach 100%).
  // Each line appears once the button has been held for that many seconds.
  const HOLD_LINES = [
    [1.5, "Hmm. Okay."],
    [3, "Hans felt a disturbance."],
    [5, "Still holding? Bold."],
    [7, "This bar is the most progress you've made all week."],
    [9.5, "Kira is reconsidering the tacos."],
    [12, "Future Nicolas has started a strongly worded letter."],
    [15, "You could've written a sentence by now. Maybe two."],
    [19, "Notice how it's slowing down? So is your timeline."],
    [24, "Your thumb is getting more exercise than your keyboard."],
    [30, "It's never going to fill. Neither will your thesis, unless you write it."],
    [38, "Okay, this is just sad now."],
    [47, "Let go. Open Word. It's right there."],
    [55, "Fine. I'll let go for you."],
  ];
  const HOLD_MAX_SECONDS = 60;
  const fillAt = (t) => 1 - Math.exp(-t / 8);

  const holdBtn = $("hold-btn");
  const holdFill = $("hold-fill");
  const holdLabel = $("hold-label");
  const holdFeed = $("hold-feed");

  if (holdBtn) {
    const idleLabel = holdLabel.textContent;
    let holding = false, holdStart = 0, raf = 0, nextLine = 0, feedGen = 0, lastPct = "0";

    const pctText = (f, t) => {
      const dec = t < 10 ? 0 : t < 20 ? 1 : t < 35 ? 2 : 3;
      const k = 10 ** dec;
      return (Math.floor(f * 100 * k) / k).toFixed(dec);
    };

    const clearFeed = () => { if (holdFeed) holdFeed.replaceChildren(); };

    function pushFeed(text) {
      if (!holdFeed) return;
      const el = document.createElement("div");
      el.className = "hold-line";
      el.textContent = text;
      holdFeed.appendChild(el);
      while (holdFeed.children.length > 4) holdFeed.firstElementChild.remove();
      navigator.vibrate?.(25);
    }

    function frame() {
      const t = (performance.now() - holdStart) / 1000;
      const f = fillAt(t);
      lastPct = pctText(f, t);
      holdFill.style.width = f * 100 + "%";
      holdLabel.textContent = `Procrastinating… ${lastPct}%`;
      while (nextLine < HOLD_LINES.length && t >= HOLD_LINES[nextLine][0]) {
        pushFeed(HOLD_LINES[nextLine][1]);
        nextLine++;
        document.body.dataset.guilt = Math.min(5, Math.floor(nextLine / 2.6));
      }
      if (t >= HOLD_MAX_SECONDS) return endHold(true);
      raf = requestAnimationFrame(frame);
    }

    function startHold() {
      if (holding) return;
      holding = true;
      feedGen++;
      clearFeed();
      nextLine = 0;
      holdStart = performance.now();
      holdBtn.classList.add("holding");
      raf = requestAnimationFrame(frame);
    }

    function endHold(auto = false) {
      if (!holding) return;
      holding = false;
      cancelAnimationFrame(raf);
      const t = (performance.now() - holdStart) / 1000;
      holdBtn.classList.remove("holding");
      holdFill.style.width = "0%";
      holdLabel.textContent = idleLabel;
      document.body.dataset.guilt = "0";

      if (t < 0.4) {
        toast("Press and HOLD. Commit to something for once.");
      } else {
        attempts++;
        store.set("attempts", attempts);
        renderStats();
        toast(auto
          ? "A full minute holding a button. That's ~20 words you didn't write."
          : `Procrastination failed at ${lastPct}%. Attempt #${attempts} logged.`);
      }
      const gen = feedGen;
      setTimeout(() => { if (gen === feedGen && !holding) clearFeed(); }, 2500);
    }

    holdBtn.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      try { holdBtn.setPointerCapture(e.pointerId); } catch { /* not capturable; still works */ }
      startHold();
    });
    for (const ev of ["pointerup", "pointercancel", "lostpointercapture"]) holdBtn.addEventListener(ev, () => endHold());
    holdBtn.addEventListener("contextmenu", (e) => e.preventDefault());
    holdBtn.addEventListener("keydown", (e) => {
      if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); startHold(); }
    });
    holdBtn.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") endHold(); });
    holdBtn.addEventListener("blur", () => endHold());
  }

  // ---------- excuse generator ----------
  const EXCUSES = [
    ["I need to read one more paper first.", "That's what you said ten papers ago."],
    ["I work better under pressure.", "The pressure is here. Where's the work?"],
    ["I'm waiting for feedback from Hans.", "Write the next chapter while you wait."],
    ["My data isn't final yet.", "Your introduction doesn't care about your data."],
    ["I'll start Monday.", () => `There are only ${weekdaysLeft(1)} Mondays left.`],
    ["I'm not in the right headspace.", "The headspace shows up after the first paragraph, not before."],
    ["I need to fix the 3D model first.", "The model is fine. The thesis is not."],
    ["I'm too tired.", "Write tired. Edit rested."],
    ["I need a perfect outline first.", "A bad draft beats a perfect outline."],
    ["I'll do it after lunch.", "It's after lunch somewhere. Go."],
    ["My plants need watering.", "Your plants are auto-watered. Nice try."],
    ["I should go play some sport.", "You'll probably just get injured. Get back to work."],
    ["AI could just write it for me.", "Even AI needs prompts. Typing prompts beats typing nothing."],
    ["I need to clean my desk first.", "A clean desk is how procrastination dresses up as productivity."],
    ["It's a work-from-home day.", "Working from home means WORKING From Home."],
  ];
  const excuseBtn = $("excuse-btn");
  const excuseBox = $("excuse-box");
  if (excuseBtn && excuseBox) {
    let last, verdictTimer;
    let count = store.get("excuses", 0);
    excuseBtn.addEventListener("click", () => {
      const ex = pick(EXCUSES, last);
      last = ex;
      count++;
      store.set("excuses", count);
      clearTimeout(verdictTimer);
      excuseBox.classList.remove("denied");
      excuseBox.classList.add("show");
      $("excuse-text").textContent = `“${ex[0]}”`;
      $("excuse-rebuttal").textContent = "";
      if ($("excuse-id")) $("excuse-id").textContent = "EXC-" + pad(count, 4);
      verdictTimer = setTimeout(() => {
        $("excuse-rebuttal").textContent = typeof ex[1] === "function" ? ex[1]() : ex[1];
        void excuseBox.offsetWidth; // restart the stamp animation
        excuseBox.classList.add("denied");
      }, 900);
    });
  }

  // ---------- write button → focus session ----------
  const FOCUS_MINUTES = 25;
  const focusDlg = $("focus-dialog");
  const writeBtn = $("write-btn");
  let focusEnd = 0, focusTimer = 0;
  const originalTitle = document.title;

  function updateFocus() {
    const left = Math.max(0, focusEnd - Date.now());
    const text = `${pad(Math.floor(left / 60000))}:${pad(Math.floor((left % 60000) / 1000))}`;
    $("focus-timer").textContent = text;
    if (document.hidden) document.title = `⏱ ${text} · writing`;
    if (left === 0) finishFocus();
  }

  function finishFocus() {
    clearInterval(focusTimer);
    focusActive = false;
    store.set("focusSessions", store.get("focusSessions", 0) + 1);
    renderStats();
    document.title = originalTitle;
    $("focus-msg").textContent = `${FOCUS_MINUTES} minutes done. Now update your progress bar. Honestly.`;
    focusDlg.classList.add("done");
    confetti();
  }

  if (writeBtn && focusDlg) {
    writeBtn.addEventListener("click", () => {
      focusEnd = Date.now() + FOCUS_MINUTES * 60000;
      focusActive = true;
      focusDlg.classList.remove("done");
      $("focus-msg").textContent = "Good choice. Go open Word. I'll keep the clock running.";
      focusDlg.showModal();
      confetti();
      updateFocus();
      clearInterval(focusTimer);
      focusTimer = setInterval(updateFocus, 250);
    });
    $("focus-quit")?.addEventListener("click", () => focusDlg.close());
    $("focus-update")?.addEventListener("click", () => {
      focusDlg.close();
      $("progress-edit")?.click();
    });
    focusDlg.addEventListener("close", () => {
      if (focusActive) toast("Quitting already? Interesting choice.");
      clearInterval(focusTimer);
      focusActive = false;
      document.title = originalTitle;
    });
  }

  // ---------- tab-away guilt ----------
  const AWAY_TITLES = ["Nicolas. Word. Now.", "👀 I saw that.", "Hans is waiting…", "(1) new disappointment", "Wrong tab, Nicolas."];
  const emojiIcon = (e) =>
    "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${e}</text></svg>`);
  let favicon = document.querySelector("link[rel~='icon']");
  if (!favicon) {
    favicon = document.createElement("link");
    favicon.rel = "icon";
    document.head.appendChild(favicon);
  }
  favicon.href = emojiIcon("⏳");

  let awayStart = 0, awayTimer = 0;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      awayStart = Date.now();
      if (focusActive) return;
      let i = 0;
      document.title = AWAY_TITLES[0];
      favicon.href = emojiIcon("🚨");
      awayTimer = setInterval(() => { i = (i + 1) % AWAY_TITLES.length; document.title = AWAY_TITLES[i]; }, 3000);
    } else {
      clearInterval(awayTimer);
      favicon.href = emojiIcon("⏳");
      if (focusActive) return;
      document.title = originalTitle;
      const away = (Date.now() - awayStart) / 1000;
      if (away > 5) toast(`You were gone for ${fmtDuration(away)}. Hopefully writing.`);
    }
  });

  // ---------- reframed deadline ----------
  const reframeEl = $("reframe");
  if (reframeEl) {
    const reframes = () => {
      const d = daysLeft();
      const perDay = d ? (100 - getProgress().value) / d : 0;
      return [
        `That's only ${weekdaysLeft(6)} weekends.`,
        `${weekdaysLeft(1)} Mondays left to "start fresh".`,
        `${perDay.toFixed(2)}% per day. Every day. Starting today.`,
        `${Math.floor(d / 7)} weeks. Fewer than it sounds.`,
        `About ${(d * 16).toLocaleString()} waking hours. Some are already gone.`,
        `One page a day from today gets you ${d} pages. Just saying.`,
      ];
    };
    let i = 0;
    const show = () => {
      const list = reframes();
      reframeEl.classList.remove("in");
      void reframeEl.offsetWidth;
      reframeEl.textContent = list[i % list.length];
      reframeEl.classList.add("in");
      i++;
    };
    show();
    setInterval(show, 6000);
  }
})();
