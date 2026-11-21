/* The Growth Adda — interactive features.
 * Plan finder quiz, readiness self-check, WhatsApp lead form, scroll effects.
 * Loaded after config.js and main.js. Classic script, no dependencies.
 * All text is rendered with textContent. Nothing is sent to a server:
 * the lead form opens WhatsApp with a pre-filled message.
 */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var links = cfg.links || {};
  var plans = ((cfg.pricing && cfg.pricing.plans) || []).filter(function (p) {
    return p && p.id && p.name && p.price;
  });
  var source = (document.body.getAttribute("data-source") || "").trim();
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---------- helpers ---------- */
  function el(tag, attrs, kids) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      var value = attrs[key];
      if (value === null || value === undefined || value === false) return;
      if (key === "text") node.textContent = value;
      else if (key === "class") node.className = value;
      else node.setAttribute(key, value === true ? "" : String(value));
    });
    (kids || []).forEach(function (kid) {
      if (kid) node.append(kid);
    });
    return node;
  }

  function planById(id) {
    for (var i = 0; i < plans.length; i++) if (plans[i].id === id) return plans[i];
    return null;
  }

  function waUrl(message) {
    var number = String(links.whatsappNumber || "918007974088").replace(/\D/g, "");
    var text = message + (source ? " [Page: " + source + "]" : "");
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(text);
  }

  function store(key, value) {
    try {
      if (value === undefined) return JSON.parse(window.localStorage.getItem(key) || "null");
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      /* storage can be blocked; the page still works */
    }
    return null;
  }

  function scrollToNode(node) {
    if (!node) return;
    node.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }

  /* ---------- plan highlight (used by the quiz) ---------- */
  function highlightPlan(id) {
    var cards = document.querySelectorAll(".plan");
    var target = null;
    cards.forEach(function (card) {
      var match = card.getAttribute("data-plan-id") === id;
      card.classList.toggle("is-reco", match);
      var tag = card.querySelector(".plan-reco");
      if (tag && !match) tag.remove();
      if (match) {
        target = card;
        if (!tag) card.prepend(el("span", { class: "plan-reco", text: "आपके लिए सही ✓" }));
      }
    });
    return target;
  }

  /* ---------- 1. Plan finder quiz ---------- */
  function initQuiz() {
    var mount = document.querySelector("[data-quiz]");
    var recorded = planById("recorded");
    var live = planById("live");
    if (!mount || !recorded || !live) {
      if (mount) mount.hidden = true;
      return;
    }

    var steps = [
      {
        key: "who",
        title: "आप कौन हैं?",
        options: [
          { label: "GeM में नया हूँ", value: "Beginner" },
          { label: "दुकान / supply business है", value: "Shop owner or supplier" },
          { label: "Reseller हूँ", value: "Reseller" },
          { label: "नौकरी के साथ सीखना है", value: "Working professional" },
        ],
      },
      {
        key: "time",
        title: "क्या आप fixed समय पर live classes attend कर सकते हैं?",
        options: [
          { label: "हाँ, attend कर सकता/सकती हूँ", value: "can" },
          { label: "नहीं, अपने समय पर सीखना है", value: "cannot" },
        ],
      },
      {
        key: "budget",
        title: "आपका budget कितना है?",
        options: [
          { label: recorded.price + " तक", value: "low" },
          { label: live.price + " या उससे ज़्यादा", value: "high" },
        ],
      },
    ];

    var state = { step: 0, answers: {} };

    function labelFor(key) {
      var step = steps.filter(function (s) {
        return s.key === key;
      })[0];
      var picked = step.options.filter(function (o) {
        return o.value === state.answers[key];
      })[0];
      return picked ? picked.value : "";
    }

    function recommend() {
      var a = state.answers;
      if (a.budget === "low") {
        return { plan: recorded, why: "आपके budget के हिसाब से " + recorded.name + " सही रहेगा।" };
      }
      if (a.time === "can") {
        return {
          plan: live,
          why: "आप fixed समय पर बैठ सकते हैं और budget भी ठीक है, इसलिए " + live.name + " सही रहेंगी।",
        };
      }
      return { plan: recorded, why: "आप अपने समय पर सीखना चाहते हैं, इसलिए " + recorded.name + " सही रहेगा।" };
    }

    function render(focusHeading) {
      mount.replaceChildren();
      var total = steps.length;
      var done = state.step >= total;

      var bar = el("div", { class: "quiz-bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(total), "aria-valuenow": String(Math.min(state.step, total)), "aria-label": "Quiz progress" }, [
        el("span", { style: "width:" + (Math.min(state.step, total) / total) * 100 + "%" }),
      ]);
      var top = el("div", { class: "quiz-top" }, [
        el("p", { class: "quiz-step", text: done ? "Result" : "Question " + (state.step + 1) + " / " + total }),
        bar,
      ]);

      var content;
      if (!done) {
        var step = steps[state.step];
        var heading = el("h3", { class: "quiz-q", tabindex: "-1", text: step.title });
        var list = el("div", { class: "quiz-options" });
        step.options.forEach(function (option) {
          var chosen = state.answers[step.key] === option.value;
          var btn = el("button", { type: "button", class: "quiz-option" + (chosen ? " is-chosen" : ""), text: option.label });
          btn.addEventListener("click", function () {
            state.answers[step.key] = option.value;
            state.step += 1;
            render(true);
          });
          list.append(btn);
        });
        var nav = el("div", { class: "quiz-nav" });
        if (state.step > 0) {
          var back = el("button", { type: "button", class: "quiz-link", text: "← पीछे" });
          back.addEventListener("click", function () {
            state.step -= 1;
            render(true);
          });
          nav.append(back);
        }
        content = el("div", null, [heading, list, nav]);
        mount.append(top, content);
        if (focusHeading) heading.focus({ preventScroll: true });
        return;
      }

      var result = recommend();
      var plan = result.plan;
      var heading2 = el("h3", { class: "quiz-q", tabindex: "-1", text: "आपके लिए: " + plan.name });
      var summary =
        "Hi Growth Adda, मैंने plan finder भरा। Profile: " +
        labelFor("who") +
        ". Recommended: " +
        plan.name +
        " (" +
        plan.price +
        "). Please share payment link and batch details.";
      var pick = el("button", { type: "button", class: "btn btn-gold", text: plan.name + " चुनें · " + plan.price });
      pick.addEventListener("click", function () {
        var card = highlightPlan(plan.id);
        scrollToNode(card || document.querySelector("[data-plans]"));
      });
      var wa = el("a", { class: "btn btn-ghost", href: waUrl(summary), target: "_blank", rel: "noopener noreferrer", text: "WhatsApp पर भेजें" });
      var again = el("button", { type: "button", class: "quiz-link", text: "फिर से शुरू करें" });
      again.addEventListener("click", function () {
        state = { step: 0, answers: {} };
        highlightPlan(null);
        render(true);
      });

      mount.append(
        top,
        el("div", { class: "quiz-result", "data-plan": plan.id }, [
          el("p", { class: "quiz-price", text: plan.price }),
          heading2,
          el("p", { class: "quiz-why", text: result.why }),
          el("p", { class: "quiz-fine", text: "यह सिर्फ एक सुझाव है। Batch और access की details payment से पहले WhatsApp पर confirm करें।" }),
          el("div", { class: "quiz-actions" }, [pick, wa]),
          again,
        ])
      );
      highlightPlan(plan.id);
      if (focusHeading) heading2.focus({ preventScroll: true });
    }

    render(false);
  }

  /* ---------- 2. Readiness self-check ---------- */
  function initReadiness() {
    var mount = document.querySelector("[data-readiness]");
    if (!mount) return;

    var items = [
      "मेरा business / दुकान / service है",
      "मेरे पास PAN card है",
      "GST registration है (अगर आपके business पर लागू हो)",
      "Business या personal bank account है",
      "Aadhaar से linked mobile number है",
    ];

    var checks = [];
    var fieldset = el("fieldset", { class: "ready-list" }, [
      el("legend", { class: "sr-only", text: "आपके पास क्या-क्या तैयार है?" }),
    ]);
    items.forEach(function (label, index) {
      var input = el("input", { type: "checkbox", id: "ready-" + index });
      checks.push(input);
      input.addEventListener("change", update);
      fieldset.append(
        el("label", { class: "ready-item", for: "ready-" + index }, [
          input,
          el("span", { class: "ready-box", "aria-hidden": "true" }),
          el("span", { class: "ready-label", text: label }),
        ])
      );
    });

    var meter = el("div", { class: "ready-meter", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(items.length), "aria-valuenow": "0", "aria-label": "Readiness" }, [el("span")]);
    var score = el("p", { class: "ready-score", text: "0 / " + items.length });
    var message = el("p", { class: "ready-msg", "aria-live": "polite" });
    var cta = el("a", { class: "btn btn-gold", target: "_blank", rel: "noopener noreferrer", text: "अपना result WhatsApp पर भेजें" });
    var note = el("p", { class: "ready-note", text: "यह सिर्फ self-check है। असली requirements GeM portal और हर bid की शर्तों पर निर्भर करती हैं।" });

    function update() {
      var picked = checks.filter(function (c) {
        return c.checked;
      }).length;
      var pct = (picked / items.length) * 100;
      meter.firstChild.style.width = pct + "%";
      meter.setAttribute("aria-valuenow", String(picked));
      score.textContent = picked + " / " + items.length;
      mount.setAttribute("data-level", picked >= 4 ? "high" : picked >= 2 ? "mid" : "low");

      var text;
      if (picked === 0) text = "जो चीज़ें आपके पास हैं, उन्हें tick करें।";
      else if (picked < 3) text = "अच्छी शुरुआत। बाकी चीज़ें और process course में step by step समझें।";
      else if (picked < items.length) text = "बढ़िया तैयारी। अब सही process सीखना बाकी है।";
      else text = "सब कुछ तैयार है। अब process सीखने का सही समय है।";
      message.textContent = text;

      var haveList = items
        .filter(function (_, i) {
          return checks[i].checked;
        })
        .join("; ");
      cta.setAttribute(
        "href",
        waUrl(
          "Hi Growth Adda, मैंने GeM readiness check किया: " +
            picked +
            "/" +
            items.length +
            (haveList ? " (" + haveList + ")" : "") +
            ". Please guide me about the course."
        )
      );
    }

    mount.replaceChildren(
      fieldset,
      el("div", { class: "ready-side" }, [score, meter, message, cta, note])
    );
    update();
  }

  /* ---------- 3. Lead form -> WhatsApp ---------- */
  function initLeadForm() {
    var mount = document.querySelector("[data-lead]");
    if (!mount) return;
    var saved = store("tga_lead") || {};

    function field(id, label, control, hint) {
      var err = el("p", { class: "field-error", id: id + "-err", role: "alert" });
      err.hidden = true;
      return {
        err: err,
        control: control,
        node: el("div", { class: "field" }, [
          el("label", { for: id, text: label }),
          control,
          hint ? el("p", { class: "field-hint", text: hint }) : null,
          err,
        ]),
      };
    }

    var name = el("input", { type: "text", id: "lead-name", name: "name", autocomplete: "name", required: true, maxlength: "60", placeholder: "आपका नाम" });
    var city = el("input", { type: "text", id: "lead-city", name: "city", autocomplete: "address-level2", required: true, maxlength: "60", placeholder: "जैसे Indore, Jaipur" });
    var type = el("select", { id: "lead-type", name: "type" }, [
      el("option", { value: "Beginner", text: "GeM में नया हूँ" }),
      el("option", { value: "Shop owner or supplier", text: "दुकान / supply business" }),
      el("option", { value: "Reseller", text: "Reseller" }),
      el("option", { value: "Manufacturer", text: "Manufacturer" }),
      el("option", { value: "Service provider", text: "Service provider" }),
      el("option", { value: "Working professional", text: "नौकरी करता/करती हूँ" }),
    ]);
    var interest = el("select", { id: "lead-interest", name: "interest" });
    plans.forEach(function (plan) {
      interest.append(el("option", { value: plan.name + " (" + plan.price + ")", text: plan.name + " · " + plan.price }));
    });
    interest.append(el("option", { value: "Not sure yet", text: "अभी पक्का नहीं" }));

    var presetPlan = planById(document.body.getAttribute("data-focus-plan") || "");
    if (presetPlan) interest.value = presetPlan.name + " (" + presetPlan.price + ")";
    if (saved.name) name.value = saved.name;
    if (saved.city) city.value = saved.city;
    if (saved.type) type.value = saved.type;

    var fName = field("lead-name", "नाम", name);
    var fCity = field("lead-city", "शहर", city);
    var fType = field("lead-type", "आप क्या करते हैं?", type);
    var fInterest = field("lead-interest", "कौन सा plan?", interest);

    var submit = el("button", { type: "submit", class: "btn btn-gold", text: "WhatsApp पर भेजें" });
    var status = el("p", { class: "lead-status", "aria-live": "polite" });
    var fine = el("p", { class: "field-hint", text: "बटन दबाने पर WhatsApp खुलेगा, message पहले से लिखा होगा। अगली बार दोबारा न लिखना पड़े, इसलिए नाम और शहर सिर्फ आपके browser में याद रहते हैं। हमारे server पर कुछ नहीं भेजा जाता।" });

    var form = el("form", { class: "lead-form", novalidate: true }, [
      el("div", { class: "lead-grid" }, [fName.node, fCity.node, fType.node, fInterest.node]),
      submit,
      status,
      fine,
    ]);

    function check(f, input, message) {
      var bad = !input.value.trim();
      f.err.hidden = !bad;
      f.err.textContent = bad ? message : "";
      input.setAttribute("aria-invalid", bad ? "true" : "false");
      if (bad) input.setAttribute("aria-describedby", input.id + "-err");
      else input.removeAttribute("aria-describedby");
      return !bad;
    }

    [name, city].forEach(function (input) {
      input.addEventListener("input", function () {
        input.setAttribute("aria-invalid", "false");
        var f = input === name ? fName : fCity;
        f.err.hidden = true;
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var okName = check(fName, name, "कृपया अपना नाम लिखें।");
      var okCity = check(fCity, city, "कृपया अपना शहर लिखें।");
      if (!okName) return name.focus();
      if (!okCity) return city.focus();

      store("tga_lead", { name: name.value.trim(), city: city.value.trim(), type: type.value });
      var message =
        "Hi Growth Adda, मेरा नाम " +
        name.value.trim() +
        " है। शहर: " +
        city.value.trim() +
        ". मैं: " +
        type.value +
        ". Interested in: " +
        interest.value +
        ". Please share details.";
      var url = waUrl(message);
      var win = window.open(url, "_blank", "noopener");
      status.replaceChildren(
        document.createTextNode(win ? "WhatsApp खुल गया है। अगर नहीं खुला तो " : "WhatsApp नहीं खुला? "),
        el("a", { href: url, target: "_blank", rel: "noopener noreferrer", text: "यहाँ दबाएँ" }),
        document.createTextNode("।")
      );
    });

    mount.replaceChildren(form);
  }

  /* ---------- 4. Hero journey: auto-highlight, click to pick ---------- */
  function initJourney() {
    var list = document.querySelector(".journey-list");
    if (!list) return;
    var items = Array.prototype.slice.call(list.children);
    if (items.length < 2) return;
    var index = 0;
    var timer = null;

    function show(i) {
      index = i;
      items.forEach(function (item, n) {
        item.classList.toggle("is-active", n === i);
      });
    }
    function start() {
      if (reduceMotion || timer) return;
      timer = window.setInterval(function () {
        show((index + 1) % items.length);
      }, 2400);
    }
    function stop() {
      window.clearInterval(timer);
      timer = null;
    }

    items.forEach(function (item, n) {
      item.addEventListener("click", function () {
        show(n);
      });
    });
    list.addEventListener("mouseenter", stop);
    list.addEventListener("mouseleave", start);
    list.addEventListener("focusin", stop);
    list.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });
    show(0);
    start();
  }

  /* ---------- 5. Scroll effects ---------- */
  function initScrollEffects() {
    var header = document.querySelector(".site-header");
    var progress = el("div", { class: "scroll-progress", "aria-hidden": "true" }, [el("span")]);
    if (header) header.prepend(progress);
    var bar = progress.firstChild;
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var pct = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        bar.style.transform = "scaleX(" + pct + ")";
        if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* reveal on scroll */
    var targets = document.querySelectorAll(
      ".section-head, .card, .plan, .accordion, .quiz, .ready, .lead-card, .cta-band, .listing-panel, .plain-list li, .steps li, .session-facts"
    );
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    var seen = new Map();
    targets.forEach(function (node) {
      var parent = node.parentElement;
      var n = seen.get(parent) || 0;
      seen.set(parent, n + 1);
      node.classList.add("reveal");
      node.style.transitionDelay = Math.min(n, 4) * 70 + "ms";
      observer.observe(node);
    });
  }

  /* ---------- 6. Floating WhatsApp button (desktop) ---------- */
  function initFab() {
    var source = document.querySelector("[data-enquiry], [data-masterclass]");
    if (!source) return;
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "22");
    svg.setAttribute("height", "22");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M5 7.2A3.2 3.2 0 0 1 8.2 4h7.6A3.2 3.2 0 0 1 19 7.2v5.6a3.2 3.2 0 0 1-3.2 3.2H13l-2.8 2.2a.6.6 0 0 1-1-.4V16H8.2A3.2 3.2 0 0 1 5 12.8V7.2z");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.8");
    path.setAttribute("stroke-linejoin", "round");
    svg.append(path);
    var fab = el("a", { class: "wa-fab", href: source.getAttribute("href") || "#", target: "_blank", rel: "noopener noreferrer", "aria-label": "WhatsApp पर पूछें" }, [
      svg,
      el("span", { text: "WhatsApp पर पूछें" }),
    ]);
    document.body.append(fab);
  }

  /* ---------- hero rotating headline ---------- */
  function initRotator() {
    var box = document.querySelector("[data-rotator]");
    if (!box) return;
    var items = Array.prototype.slice.call(box.querySelectorAll(".rotator-item"));
    if (items.length < 2 || reduceMotion) return;
    var index = 0;
    window.setInterval(function () {
      var current = items[index];
      index = (index + 1) % items.length;
      var next = items[index];
      current.classList.remove("is-active");
      current.classList.add("is-exit");
      next.classList.add("is-active");
      window.setTimeout(function () {
        current.classList.remove("is-exit");
      }, 600);
    }, 2600);
  }

  /* ---------- init ---------- */
  function ready() {
    initQuiz();
    initReadiness();
    initLeadForm();
    initJourney();
    initRotator();
    initFab();
    initScrollEffects();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
  else ready();
})();
