(function () {
  "use strict";

  var MISSING = "Not in the available record";
  var MODE_LABELS = {
    online: "Online",
    "in-person": "In-person",
    hybrid: "Hybrid",
  };

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function safeHref(url) {
    if (typeof url !== "string") return "";
    var trimmed = url.trim();
    if (!trimmed || /^(javascript|data):/i.test(trimmed)) return "";
    try {
      var parsed = new URL(trimmed, window.location.href);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") return trimmed;
    } catch (error) {
      return "";
    }
    return "";
  }

  function safeAsset(url) {
    var href = safeHref(url);
    if (!href) return "";
    if (/^(javascript|data):/i.test(href)) return "";
    return href;
  }

  function cleanText(value) {
    if (typeof value === "number" && isFinite(value)) return String(value);
    if (typeof value === "string" && value.trim()) return value.trim();
    return "";
  }

  function displayDate(value) {
    var clean = cleanText(value);
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean);
    if (!match) return clean;
    var year = Number(match[1]);
    var month = Number(match[2]);
    var day = Number(match[3]);
    var date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return clean;
    }
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        var value = attrs[key];
        if (value == null || value === false) return;
        if (key === "class") node.className = value;
        else if (key === "text") node.textContent = value;
        else if (key === "hidden") node.hidden = Boolean(value);
        else node.setAttribute(key, value === true ? "" : String(value));
      });
    }
    (children || []).forEach(function (child) {
      if (child) node.append(child);
    });
    return node;
  }

  function applyLinks(cfg) {
    var links = cfg.links || {};
    var brand = cfg.brand || {};
    var enquiry = safeHref(links.courseEnquiry);
    var masterclass = safeHref(links.masterclassEnquiry);
    var city = safeHref(links.cityListRequest);
    var instagram = safeHref(brand.instagram);
    var site = safeHref(brand.url);

    if (enquiry) {
      // Landing pages set <body data-source="live"> so the owner can see which page a lead came from.
      var source = cleanText(document.body.getAttribute("data-source"));
      var tagged = source ? enquiry + encodeURIComponent(" [Page: " + source + "]") : enquiry;
      document.querySelectorAll("[data-enquiry]").forEach(function (anchor) {
        anchor.href = tagged;
      });
    }
    if (masterclass) {
      document.querySelectorAll("[data-masterclass]").forEach(function (anchor) {
        anchor.href = masterclass;
      });
    }
    if (city) {
      document.querySelectorAll("[data-city-request]").forEach(function (anchor) {
        anchor.href = city;
      });
    }
    if (instagram) {
      document.querySelectorAll("[data-instagram]").forEach(function (anchor) {
        anchor.href = instagram;
      });
    }
    if (site) {
      document.querySelectorAll("[data-site]").forEach(function (anchor) {
        anchor.href = site;
      });
    }
    if (cleanText(brand.phoneDisplay)) {
      document.querySelectorAll("[data-phone]").forEach(function (node) {
        node.textContent = cleanText(brand.phoneDisplay);
      });
    }
  }

  var RAZORPAY_HOST = /(^|\.)(razorpay\.com|rzp\.io)$/i;

  function razorpayLink(url) {
    var href = safeHref(url);
    if (!href) return "";
    try {
      var parsed = new URL(href);
      return parsed.protocol === "https:" && RAZORPAY_HOST.test(parsed.hostname) ? href : "";
    } catch (error) {
      return "";
    }
  }

  function planWhatsapp(cfg, plan) {
    var links = cfg.links || {};
    var number = cleanText(links.whatsappNumber) || "918007974088";
    var source = cleanText(document.body.getAttribute("data-source"));
    var text =
      "Hi Growth Adda, I want to join the " +
      plan.name +
      " (" +
      plan.price +
      "). Please share the payment link and batch details." +
      (source ? " [Page: " + source + "]" : "");
    return "https://wa.me/" + number.replace(/\D/g, "") + "?text=" + encodeURIComponent(text);
  }

  function renderPlans(cfg) {
    var roots = document.querySelectorAll("[data-plans]");
    if (!roots.length) return;
    var plans = ((cfg.pricing && cfg.pricing.plans) || []).filter(function (plan) {
      return plan && cleanText(plan.name) && cleanText(plan.price);
    });

    roots.forEach(function (root) {
      var only = cleanText(root.getAttribute("data-plans"));
      var focus = cleanText(root.getAttribute("data-focus"));
      // "link" (default) → the card sends the visitor to the plan's dedicated page
      //                    (homepage grid, audience landing pages).
      // "pay"            → the card shows the real Pay control
      //                    (used on each course's own dedicated page).
      var mode = cleanText(root.getAttribute("data-mode")) === "pay" ? "pay" : "link";
      root.replaceChildren();
      if (!plans.length) {
        root.hidden = true;
        return;
      }
      root.hidden = false;
      var pendingButtons = [];

      plans
        .filter(function (plan) {
          return !only || only === "all" || plan.id === only;
        })
        .forEach(function (plan) {
          var rz = plan.razorpay || {};
          var buttonId = cleanText(rz.buttonId);
          var link = razorpayLink(rz.link);
          var validButton = /^pl_[A-Za-z0-9]+$/.test(buttonId);
          var page = safeHref(plan.page);
          var featured =
            plan.featured ||
            (focus && plan.id === focus) ||
            (mode === "pay" && only === plan.id);

          var points = el(
            "ul",
            { class: "plan-points", role: "list" },
            (Array.isArray(plan.points) ? plan.points : [])
              .map(cleanText)
              .filter(Boolean)
              .map(function (point) {
                return el("li", { text: point });
              })
          );

          var actions = el("div", { class: "plan-actions" });
          var secureText = "";
          var form = null;

          if (mode === "link" && page) {
            // Card links to the course's own page, where the Pay control lives.
            actions.append(
              el("a", { class: "btn btn-gold", href: page, text: "Enroll करें →" })
            );
            actions.append(
              el("a", {
                class: "plan-ask",
                href: planWhatsapp(cfg, plan),
                text: "पहले WhatsApp पर पूछें",
              })
            );
          } else if (validButton) {
            // Razorpay Payment Button, restyled via CSS to match the site.
            form = el("form", { class: "pay-form", "data-plan": plan.id });
            // Custom label replaces Razorpay's grey "Pay Now / Secured by Razorpay" lockup.
            form.style.setProperty("--pay-label", JSON.stringify("Pay " + plan.price + " · Enroll"));
            actions.append(form);
            actions.append(
              el("a", {
                class: "plan-ask",
                href: planWhatsapp(cfg, plan),
                text: "पहले WhatsApp पर पूछें",
              })
            );
            secureText = "Razorpay के secure checkout पर payment होगा।";
          } else if (link) {
            actions.append(
              el("a", {
                class: "btn btn-gold",
                href: link,
                target: "_blank",
                rel: "noopener noreferrer",
                text: "Pay " + plan.price + " securely",
              })
            );
            actions.append(
              el("a", {
                class: "plan-ask",
                href: planWhatsapp(cfg, plan),
                text: "पहले WhatsApp पर पूछें",
              })
            );
            secureText = "Razorpay के secure checkout पर payment होगा।";
          } else {
            actions.append(
              el("a", {
                class: "btn btn-gold",
                href: planWhatsapp(cfg, plan),
                text: "WhatsApp पर Payment Link पाएँ",
              })
            );
            secureText = "Online payment link WhatsApp पर भेजा जाएगा।";
          }

          var card = el(
            "article",
            { class: "plan" + (featured ? " is-featured" : ""), "data-plan-id": plan.id },
            [
              plan.badge ? el("p", { class: "plan-badge", lang: "en", text: cleanText(plan.badge) }) : null,
              el("span", { class: "plan-icon", "aria-hidden": "true" }),
              el("h3", { class: "plan-name", lang: "en", text: cleanText(plan.name) }),
              cleanText(plan.tagline) ? el("p", { class: "plan-tag", text: cleanText(plan.tagline) }) : null,
              el("p", { class: "plan-price", text: cleanText(plan.price) }),
              points,
              actions,
              secureText ? el("p", { class: "plan-secure", text: secureText }) : null,
            ]
          );
          root.append(card);
          if (form) pendingButtons.push({ form: form, id: buttonId });
        });

      // Razorpay's script renders the button where the script tag sits, so add it after the form is in the page.
      pendingButtons.forEach(function (item) {
        var script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/payment-button.js";
        script.async = true;
        script.setAttribute("data-payment_button_id", item.id);
        item.form.append(script);
      });
    });
  }

  function renderOffer(course) {
    var facts = document.querySelector("[data-offer-facts]");
    var fallback = document.querySelector("[data-offer-fallback]");
    if (!facts || !fallback) return;

    var fields = [
      ["Course fee", course.fee],
      ["Batch start date", course.batchStart],
      ["Duration", course.duration],
      ["Live or recorded format", course.format],
      ["Teaching language", course.language],
      ["Support included", course.support],
    ]
      .map(function (field) {
        return [field[0], cleanText(field[1])];
      })
      .filter(function (field) {
        return field[1];
      });

    facts.replaceChildren();
    if (!fields.length) {
      facts.hidden = true;
    } else {
      fields.forEach(function (field) {
        var dt = el("dt", { text: field[0], lang: "en" });
        var dd = el("dd", { text: field[1] });
        facts.append(el("div", null, [dt, dd]));
      });
      facts.hidden = false;
    }

    fallback.hidden = fields.length === 6;
  }

  function renderCurriculum(cfg) {
    var root = document.querySelector("[data-curriculum]");
    var note = document.querySelector("[data-curriculum-note]");
    if (note && cfg.curriculumStatus === "confirmed") {
      note.textContent = "इस batch के course modules।";
    }
    if (!root) return;

    var modules = Array.isArray(cfg.curriculum) ? cfg.curriculum : [];
    root.replaceChildren();

    if (!modules.length) {
      root.append(
        el("p", {
          class: "quiet",
          text: "Syllabus की detailed list enquiry पर share की जाती है।",
        })
      );
      return;
    }

    modules.forEach(function (module, index) {
      var title = cleanText(module && module.title);
      if (!title) return;
      var summary = cleanText(module && module.summary);
      var buttonId = "module-button-" + (index + 1);
      var panelId = "module-panel-" + (index + 1);
      var open = index === 0 && Boolean(summary);
      var button = el(
        "button",
        {
          type: "button",
          class: "accordion-button",
          id: buttonId,
          "aria-expanded": open ? "true" : "false",
          "aria-controls": summary ? panelId : null,
          "data-accordion-button": summary ? "true" : null,
        },
        [
          el("span", { class: "mod-num", text: String(index + 1).padStart(2, "0"), "aria-hidden": "true" }),
          el("span", { class: "mod-title", lang: "en", text: title }),
          summary ? el("span", { class: "acc-icon", "aria-hidden": "true" }) : null,
        ]
      );
      if (!summary) button.disabled = true;

      var panel = summary
        ? el(
            "div",
            {
              id: panelId,
              class: "accordion-panel",
              role: "region",
              "aria-labelledby": buttonId,
              hidden: open ? null : true,
            },
            [el("p", { text: summary })]
          )
        : null;

      var heading = el("h3", null, [button]);
      root.append(el("div", { class: "accordion-item" }, [heading, panel]));
    });
  }

  function modeLabel(mode) {
    var key = cleanText(mode).toLowerCase();
    return MODE_LABELS[key] || cleanText(mode);
  }

  function venueLabel(mode) {
    var key = cleanText(mode).toLowerCase();
    if (key === "online") return "Online instructions";
    if (key === "hybrid") return "Venue or online instructions";
    return "Meeting venue";
  }

  function factRow(term, value) {
    var text = cleanText(value);
    var dd = el("dd", { text: text || MISSING });
    if (!text) dd.className = "missing";
    return el("div", null, [el("dt", { text: term, lang: "en" }), dd]);
  }

  function sourceRow(url) {
    var href = safeHref(url);
    var dd = el("dd");
    if (!href) {
      dd.textContent = MISSING;
      dd.className = "missing";
    } else {
      var link = el("a", { href: href, text: "Official source" });
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.append(el("span", { class: "sr-only", text: " (opens in new tab)" }));
      dd.append(link);
    }
    return el("div", null, [el("dt", { text: "Official source", lang: "en" }), dd]);
  }

  function bidCard(record) {
    var mode = modeLabel(record.mode);
    var badge = el("span", {
      class: "badge",
      text: mode || "Mode not specified",
      lang: "en",
    });
    var title = cleanText(record.requirement) || "Requirement not specified";
    var buyer = cleanText(record.buyer);
    var list = el("dl", null, [
      factRow("Tender reference", record.tenderRef),
      factRow("Project city", record.projectCity),
      factRow(venueLabel(record.mode), record.venue),
      factRow("Meeting date", displayDate(record.meetingDate)),
      factRow("Meeting time", record.meetingTime),
      factRow("Time zone", record.timezone),
      factRow("Submission deadline", record.submissionDeadline),
      sourceRow(record.sourceUrl),
      factRow("Last checked", displayDate(record.lastChecked)),
    ]);
    var children = [
      el("p", { class: "bid-meta" }, [badge]),
      el("h3", { text: title }),
      el("p", {
        class: buyer ? "bid-buyer" : "bid-buyer missing",
        text: buyer || "Buyer not specified",
      }),
      list,
    ];
    var limitations = cleanText(record.limitations);
    if (limitations) {
      children.push(
        el("p", { class: "bid-note" }, [
          el("strong", { text: "Verification note", lang: "en" }),
          document.createTextNode(" " + limitations),
        ])
      );
    }
    return el("article", { class: "bid" }, children);
  }

  function buildFilters(records) {
    var cities = [];
    var seenCities = {};
    var modes = [];
    var seenModes = {};

    records.forEach(function (record) {
      var city = cleanText(record.projectCity);
      var cityKey = city.toLowerCase();
      if (city && !seenCities[cityKey]) {
        seenCities[cityKey] = true;
        cities.push(city);
      }
      var mode = cleanText(record.mode).toLowerCase();
      if (mode && !seenModes[mode]) {
        seenModes[mode] = true;
        modes.push(mode);
      }
    });

    cities.sort(function (a, b) {
      return a.localeCompare(b, "en");
    });

    var citySelect = el("select", { "data-city-filter": "true", id: "city-filter" });
    citySelect.append(el("option", { value: "all", text: "All cities" }));
    cities.forEach(function (city) {
      citySelect.append(el("option", { value: city.toLowerCase(), text: city }));
    });

    var modeSelect = el("select", { "data-mode-filter": "true", id: "mode-filter" });
    modeSelect.append(el("option", { value: "all", text: "All modes" }));
    modes.forEach(function (mode) {
      modeSelect.append(el("option", { value: mode, text: modeLabel(mode) }));
    });

    return el("div", { class: "filters" }, [
      el("label", { class: "filter-field", for: "city-filter" }, [
        el("span", { text: "City", lang: "en" }),
        citySelect,
      ]),
      el("label", { class: "filter-field", for: "mode-filter" }, [
        el("span", { text: "Meeting mode", lang: "en" }),
        modeSelect,
      ]),
    ]);
  }

  function renderPrebid(records) {
    var panel = document.querySelector("[data-prebid]");
    if (!panel) return;
    var empty = panel.querySelector("[data-empty]");
    var clean = (Array.isArray(records) ? records : []).filter(function (record) {
      return record && typeof record === "object";
    });
    clean.sort(function (a, b) {
      var aTime = Date.parse(cleanText(a.meetingDate));
      var bTime = Date.parse(cleanText(b.meetingDate));
      if (isNaN(aTime)) aTime = Infinity;
      if (isNaN(bTime)) bTime = Infinity;
      return aTime - bTime;
    });

    var filters = buildFilters(clean);
    if (!clean.length) {
      panel.replaceChildren(filters);
      if (empty) panel.append(empty);
      return;
    }

    var live = el("p", { class: "result-count", "aria-live": "polite" });
    var filterEmpty = el("p", {
      class: "filter-empty",
      text: "इस filter पर कोई listing नहीं।",
      hidden: true,
    });
    var list = el("div", { class: "bid-list" });

    function paint() {
      var city = filters.querySelector("[data-city-filter]").value;
      var mode = filters.querySelector("[data-mode-filter]").value;
      var matched = clean.filter(function (record) {
        var recordCity = cleanText(record.projectCity).toLowerCase();
        var recordMode = cleanText(record.mode).toLowerCase();
        var cityOk = city === "all" || recordCity === city;
        var modeOk = mode === "all" || recordMode === mode;
        return cityOk && modeOk;
      });
      list.replaceChildren.apply(list, matched.map(bidCard));
      live.textContent = matched.length === 1 ? "1 listing" : matched.length + " listings";
      filterEmpty.hidden = matched.length !== 0;
    }

    filters.addEventListener("change", paint);
    panel.replaceChildren(filters, live, filterEmpty, list);
    paint();
  }

  function youtubeId(url) {
    try {
      var parsed = new URL(url);
      var host = parsed.hostname.replace(/^www\./, "");
      var id = "";
      if (host === "youtu.be") id = parsed.pathname.split("/").filter(Boolean)[0] || "";
      else if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
        if (parsed.pathname.indexOf("/embed/") === 0 || parsed.pathname.indexOf("/shorts/") === 0) {
          id = parsed.pathname.split("/")[2] || "";
        } else {
          id = parsed.searchParams.get("v") || "";
        }
      }
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : "";
    } catch (error) {
      return "";
    }
  }

  function vimeoId(url) {
    try {
      var parsed = new URL(url);
      var host = parsed.hostname.replace(/^www\./, "");
      if (host !== "vimeo.com" && host !== "player.vimeo.com") return "";
      var part = parsed.pathname.split("/").filter(Boolean).pop() || "";
      return /^\d+$/.test(part) ? part : "";
    } catch (error) {
      return "";
    }
  }

  function renderTrust(trust) {
    var section = document.querySelector("[data-trust]");
    if (!section) return;
    var any = false;
    if (renderInstructor(trust.instructor)) any = true;
    if (renderVideo(trust.video)) any = true;
    if (renderShots(trust.screenshots)) any = true;
    if (renderQuotes(trust.testimonials)) any = true;
    section.hidden = !any;
  }

  function renderInstructor(person) {
    var slot = document.querySelector("[data-instructor]");
    if (!slot) return false;
    slot.replaceChildren();
    if (!person || !cleanText(person.name) || !cleanText(person.bio)) return false;
    var photo = safeAsset(person.photo);
    var media = photo
      ? el("img", {
          src: photo,
          alt: "",
          width: "120",
          height: "120",
        })
      : null;
    if (media) media.alt = cleanText(person.name);
    var copy = [
      el("h3", { text: cleanText(person.name) }),
      cleanText(person.role) ? el("p", { class: "role", text: cleanText(person.role) }) : null,
      el("p", { text: cleanText(person.bio) }),
    ];
    slot.append(
      el("div", { class: media ? "instructor has-photo" : "instructor" }, [
        media,
        el("div", { class: "instructor-copy" }, copy),
      ])
    );
    return true;
  }

  function renderVideo(video) {
    var slot = document.querySelector("[data-video]");
    if (!slot) return false;
    slot.replaceChildren();
    if (!video || !cleanText(video.src)) return false;
    var src = cleanText(video.src);
    var title = cleanText(video.title) || "Course preview";
    var frame = el("div", { class: "video-frame" });
    var yt = youtubeId(src);
    var vimeo = vimeoId(src);
    if (yt) {
      frame.append(
        el("iframe", {
          src: "https://www.youtube-nocookie.com/embed/" + yt,
          title: title,
          allow: "fullscreen; picture-in-picture",
          allowfullscreen: "true",
          loading: "lazy",
        })
      );
    } else if (vimeo) {
      frame.append(
        el("iframe", {
          src: "https://player.vimeo.com/video/" + vimeo,
          title: title,
          allow: "fullscreen; picture-in-picture",
          allowfullscreen: "true",
          loading: "lazy",
        })
      );
    } else if (safeAsset(src) && /\.(mp4|webm)(\?.*)?$/i.test(src)) {
      var player = el("video", { controls: "true", playsinline: "true", preload: "metadata" });
      player.src = safeAsset(src);
      player.setAttribute("aria-label", title);
      frame.append(player);
    } else {
      return false;
    }
    slot.append(el("h3", { class: "video-title", text: title }), frame);
    return true;
  }

  function renderShots(shots) {
    var slot = document.querySelector("[data-shots]");
    if (!slot) return false;
    slot.replaceChildren();
    var items = (Array.isArray(shots) ? shots : []).filter(function (shot) {
      return shot && safeAsset(shot.src) && cleanText(shot.alt);
    });
    if (!items.length) return false;
    var grid = el("div", { class: "shots" });
    items.forEach(function (shot) {
      var figure = el("figure", null, [
        el("img", {
          src: safeAsset(shot.src),
          alt: cleanText(shot.alt),
          loading: "lazy",
          decoding: "async",
        }),
        cleanText(shot.caption) ? el("figcaption", { text: cleanText(shot.caption) }) : null,
      ]);
      grid.append(figure);
    });
    slot.append(grid);
    return true;
  }

  function renderQuotes(quotes) {
    var slot = document.querySelector("[data-quotes]");
    if (!slot) return false;
    slot.replaceChildren();
    var items = (Array.isArray(quotes) ? quotes : []).filter(function (quote) {
      return quote && cleanText(quote.quote) && cleanText(quote.name);
    });
    if (!items.length) return false;
    var grid = el("div", { class: "quotes" });
    items.forEach(function (quote) {
      var caption = el("figcaption", null, [el("span", { class: "quote-name", text: cleanText(quote.name) })]);
      if (cleanText(quote.detail)) caption.append(el("span", { text: cleanText(quote.detail) }));
      grid.append(
        el("figure", { class: "quote" }, [
          el("blockquote", { text: cleanText(quote.quote) }),
          caption,
        ])
      );
    });
    slot.append(grid);
    return true;
  }

  function renderLegal(links) {
    var list = document.querySelector("[data-legal]");
    if (!list) return;
    var pages = [
      ["Privacy Policy", links.privacy],
      ["Terms", links.terms],
    ].filter(function (page) {
      return safeHref(page[1]);
    });
    list.replaceChildren();
    if (!pages.length) {
      list.hidden = true;
      return;
    }
    pages.forEach(function (page) {
      var anchor = el("a", { href: safeHref(page[1]), text: page[0], lang: "en" });
      list.append(el("li", null, [anchor]));
    });
    list.hidden = false;
  }

  function renderPrebidFaq(course) {
    var answer = document.querySelector("[data-prebid-faq]");
    var extra = document.querySelector("[data-prebid-faq-link]");
    if (!answer) return;
    var included = course.prebidListIncluded;
    if (included === true) {
      answer.textContent =
        "इस batch में city-wise pre-bid list course के साथ included है। List में वही records होते हैं जो check किए गए हों। यह सारी GeM bids की complete coverage नहीं है।";
      if (extra) extra.hidden = true;
      return;
    }
    if (included === false) {
      answer.textContent =
        "City-wise pre-bid list इस course की fee में included नहीं है। Course में pre-bid meetings समझना और questions तैयार करना proposed curriculum का हिस्सा है। List के लिए अलग से request करें।";
    }
    if (extra) extra.hidden = false;
  }

  function initAccordions() {
    document.addEventListener("click", function (event) {
      var button = event.target.closest("[data-accordion-button]");
      if (!button || button.disabled) return;
      var panel = document.getElementById(button.getAttribute("aria-controls"));
      if (!panel) return;
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", expanded ? "false" : "true");
      panel.hidden = expanded;
    });

    document.addEventListener("keydown", function (event) {
      var button = event.target.closest("[data-accordion-button]");
      if (!button) return;
      if (["ArrowDown", "ArrowUp", "Home", "End"].indexOf(event.key) === -1) return;
      var group = button.closest("[data-accordion]");
      if (!group) return;
      var buttons = Array.prototype.slice.call(group.querySelectorAll("[data-accordion-button]"));
      var index = buttons.indexOf(button);
      if (event.key === "ArrowDown") index = (index + 1) % buttons.length;
      if (event.key === "ArrowUp") index = (index - 1 + buttons.length) % buttons.length;
      if (event.key === "Home") index = 0;
      if (event.key === "End") index = buttons.length - 1;
      event.preventDefault();
      buttons[index].focus();
    });
  }

  function initNav() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.getElementById("site-nav");
    var main = document.getElementById("main");
    var footer = document.querySelector(".site-footer");
    var sticky = document.querySelector(".sticky-cta");
    if (!header || !toggle || !nav) return;
    var label = toggle.querySelector(".sr-only");
    var desktop = window.matchMedia("(min-width: 960px)");

    function setOpen(open, focusToggle) {
      header.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (label) label.textContent = open ? "Close menu" : "Open menu";
      document.body.classList.toggle("nav-open", open);
      [main, footer, sticky].forEach(function (node) {
        if (node && "inert" in node) node.inert = open;
      });
      if (!open && focusToggle) toggle.focus();
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && header.classList.contains("is-open")) setOpen(false, true);
    });
    desktop.addEventListener("change", function () {
      if (desktop.matches) setOpen(false);
    });
  }

  function initSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav a[href^='#']"));
    var sections = links
      .map(function (link) {
        return document.querySelector(link.getAttribute("href"));
      })
      .filter(Boolean);
    if (!links.length || !sections.length) return;

    var frame = 0;
    function spy() {
      frame = 0;
      var marker = window.scrollY + 96;
      var ordered = sections.slice().sort(function (a, b) {
        return a.offsetTop - b.offsetTop;
      });
      var current = null;
      ordered.forEach(function (section) {
        if (section.offsetTop <= marker) current = section;
      });
      links.forEach(function (link) {
        if (current && link.getAttribute("href") === "#" + current.id) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    window.addEventListener(
      "scroll",
      function () {
        if (frame) return;
        frame = window.requestAnimationFrame(spy);
      },
      { passive: true }
    );
    spy();
  }

  function initYear() {
    var year = document.querySelector("[data-year]");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  ready(function () {
    var cfg = window.SITE_CONFIG || {};
    try {
      applyLinks(cfg);
      renderPlans(cfg);
      renderOffer(cfg.course || {});
      renderCurriculum(cfg);
      renderPrebid((cfg.prebid && cfg.prebid.records) || []);
      renderTrust(cfg.trust || {});
      renderLegal(cfg.links || {});
      renderPrebidFaq(cfg.course || {});
      initAccordions();
      initNav();
      initSpy();
      initYear();
    } catch (error) {
      console.error(error);
    }
  });
})();
