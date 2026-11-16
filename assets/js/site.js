/* Mohsen Foroughifar — site behavior. No dependencies. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  /* ---- mobile nav ---- */
  var toggle = $(".nav-toggle");
  var links = $(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---- humor toggle: treatment (jokes) vs control (no jokes) ---- */
  function paintHumor() {
    var on = !root.classList.contains("control");
    $$(".humor-toggle").forEach(function (b) {
      b.setAttribute("aria-pressed", on ? "true" : "false");
      var label = $(".ht-label", b);
      if (label) label.textContent = on ? "jokes on" : "jokes off";
      var prefix = $(".ht-prefix", b);
      if (prefix) prefix.textContent = on ? "treatment:" : "control:";
      b.title = on
        ? "You are in the treatment group (jokes). Click to switch to control."
        : "You are in the control group (no jokes). Click to switch to treatment.";
    });
  }
  $$(".humor-toggle").forEach(function (b) {
    b.addEventListener("click", function () {
      root.classList.toggle("control");
      store("mf-humor", root.classList.contains("control") ? "0" : "1");
      paintHumor();
    });
  });
  paintHumor();

  /* ---- hero rotating question ---- */
  var rot = $(".rotator");
  if (rot && !reduceMotion) {
    var phrases = (rot.getAttribute("data-phrases") || "").split("|").filter(Boolean);
    var i = 0;
    if (phrases.length > 1) {
      setInterval(function () {
        rot.classList.add("out");
        setTimeout(function () {
          i = (i + 1) % phrases.length;
          rot.textContent = phrases[i];
          rot.classList.remove("out");
        }, 360);
      }, 3200);
    }
  }

  /* ---- reveal on scroll, counters, bar chart ---- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = prefix + target.toFixed(decimals) + suffix; return; }
    var start = null;
    function tick(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / 1100, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var watched = $$(".reveal, [data-count], .bars, .ticker");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        el.classList.add("in");
        if (el.hasAttribute("data-count")) countUp(el);
        if (el.classList.contains("ticker")) runTicker(el);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    watched.forEach(function (el) { io.observe(el); });
  } else {
    watched.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- "algorithmic" coffee-chat price. It always converges to $0.00. ---- */
  function runTicker(box) {
    var price = $(".t-price", box);
    var delta = $(".t-delta", box);
    if (!price) return;
    if (reduceMotion) { price.textContent = "$0.00"; return; }
    var path = [4.75, 6.2, 5.35, 7.9, 3.1, 4.4, 1.85, 2.6, 0.95, 0.4, 0];
    var k = 0;
    var timer = setInterval(function () {
      var v = path[k];
      price.textContent = "$" + v.toFixed(2);
      if (delta && k > 0) {
        var d = v - path[k - 1];
        delta.textContent = (d >= 0 ? "▲ " : "▼ ") + Math.abs(d).toFixed(2);
      }
      k++;
      if (k >= path.length) {
        clearInterval(timer);
        if (delta) delta.textContent = "converged";
      }
    }, 320);
  }

  /* ---- research filters ---- */
  var chips = $$(".chip[data-filter]");
  if (chips.length) {
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var f = chip.getAttribute("data-filter");
        chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
        $$(".paper").forEach(function (p) {
          var tags = (p.getAttribute("data-tags") || "").split(" ");
          p.hidden = !(f === "all" || tags.indexOf(f) !== -1);
        });
        $$(".paper-group").forEach(function (g) {
          var visible = $$(".paper", g).filter(function (p) { return !p.hidden; }).length;
          g.hidden = visible === 0;
        });
      });
    });
  }

  /* ---- photo gallery (reads window.PHOTOS from assets/photos/photos.js) ---- */
  var gallery = $("#gallery");
  if (gallery) {
    var photos = window.PHOTOS || [];
    var section = gallery.closest("section");
    if (!photos.length) {
      if (section) section.hidden = true;
    } else {
      photos.forEach(function (p) {
        var fig = document.createElement("figure");
        var img = document.createElement("img");
        img.src = p.src;
        img.alt = p.alt || p.caption || "";
        img.loading = "lazy";
        fig.appendChild(img);
        if (p.caption || p.tag) {
          var cap = document.createElement("figcaption");
          if (p.tag) { var b = document.createElement("b"); b.textContent = p.tag; cap.appendChild(b); }
          cap.appendChild(document.createTextNode(p.caption || ""));
          fig.appendChild(cap);
        }
        gallery.appendChild(fig);
      });
    }
  }

  /* ---- job market tool: question log (saved in this browser only) ---- */
  var qBox = $("#question-tool");
  if (qBox) {
    var questions = [];
    try { questions = JSON.parse(store("mf-questions") || "[]") || []; } catch (e) { questions = []; }
    var list = $(".qlist", qBox);
    var form = $("form", qBox);
    var input = $("input", qBox);
    var qVerdict = $(".verdict", qBox);
    var paintQ = function () {
      list.innerHTML = "";
      questions.forEach(function (q, idx) {
        var li = document.createElement("li");
        var span = document.createElement("span");
        span.textContent = q;
        var del = document.createElement("button");
        del.type = "button";
        del.setAttribute("aria-label", "Remove question");
        del.textContent = "×";
        del.addEventListener("click", function () {
          questions.splice(idx, 1);
          store("mf-questions", JSON.stringify(questions));
          paintQ();
        });
        li.appendChild(span);
        li.appendChild(del);
        list.appendChild(li);
      });
      qVerdict.textContent = questions.length
        ? questions.length + " logged. You are done when a talk adds zero new ones."
        : "Nothing logged yet. Saved only in this browser — nothing is sent anywhere.";
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v) return;
      questions.unshift(v);
      store("mf-questions", JSON.stringify(questions));
      input.value = "";
      paintQ();
    });
    var exp = $("[data-export]", qBox);
    if (exp) {
      exp.addEventListener("click", function () {
        if (!questions.length) return;
        var text = "Job talk question log\n\n" + questions.map(function (q, n) { return (n + 1) + ". " + q; }).join("\n");
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
        a.download = "job-talk-questions.txt";
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
    }
    paintQ();
  }

  /* ---- job market guide: highlight the post being read ---- */
  var guideLinks = $$(".guide-nav a.chip");
  if (guideLinks.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        guideLinks.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + e.target.id;
          a.classList.toggle("on", on);
          var row = a.parentNode;
          if (on && row.scrollWidth > row.clientWidth) {
            var pad = parseFloat(getComputedStyle(row).paddingLeft) || 0;
            row.scrollTo({ left: a.offsetLeft - row.offsetLeft - pad, behavior: reduceMotion ? "auto" : "smooth" });
          }
        });
      });
    }, { rootMargin: "-25% 0px -70% 0px" });
    $$(".post").forEach(function (p) { spy.observe(p); });
  }

  /* ---- footer year ---- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
