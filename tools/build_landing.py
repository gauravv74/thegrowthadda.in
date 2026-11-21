#!/usr/bin/env python3
"""Generate lead landing pages (live, recorded, shop-owners, beginners).

Run from the project root:  python3 tools/build_landing.py
Copy edits go in PAGES below; layout lives in TEMPLATE.
"""
import html
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://thegrowthadda.in"
ENQ = ("https://wa.me/918007974088?text=Hi%20Growth%20Adda%2C%20please%20share%20your%20GeM%20"
       "course%20fees%2C%20syllabus%20and%20upcoming%20batch%20details.")

def LOGO(badge, bar, bar_top, stroke):
    return (
        '<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">'
        '<rect class="lm-badge" width="40" height="40" rx="11" fill="' + badge + '"/>'
        '<g class="lm-bars">'
        '<rect x="8.5" y="21" width="5.4" height="10.5" rx="2.7" fill="' + bar + '"/>'
        '<rect x="17.3" y="16" width="5.4" height="15.5" rx="2.7" fill="' + bar + '"/>'
        '<rect x="26.1" y="11" width="5.4" height="20.5" rx="2.7" fill="' + bar_top + '"/>'
        '</g>'
        '<path class="lm-arrow" d="M9 26 L16.5 20.5 L24 15.5 L31 9.5" fill="none" stroke="' + stroke + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
        '<path class="lm-arrow-head" d="M25.5 9 L31.5 9 L31.5 15" fill="none" stroke="' + stroke + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
        "</svg>"
    )

LOGO_DARK = LOGO("#1b2a63", "#f2b63c", "#ffd25a", "#ffffff")
LOGO_GOLD = LOGO("#f2b63c", "#1b2a63", "#223072", "#1b2a63")

COMMON_FAQ = [
    ("क्या course के बाद order मिलना guaranteed है?",
     "नहीं। Course में process सिखाया जाता है। Participation से eligibility, tender award या income "
     "guaranteed नहीं होती। नतीजा official bid conditions, documents, pricing और buyer की evaluation पर निर्भर करता है।"),
    ("Payment कैसे करना है?",
     "Plan चुनकर page पर दिए Pay बटन से Razorpay के secure checkout पर payment करें। अगर बटन अभी active नहीं है, "
     "तो WhatsApp पर payment link माँगें। Payment से पहले batch और access की details confirm करना चाहें तो WhatsApp पर पूछ सकते हैं।"),
    ("Batch timing, duration और support details कहाँ मिलेंगी?",
     "इस page पर सिर्फ confirmed details दिखाई जाती हैं। Start date, duration, teaching language और support की जानकारी "
     "WhatsApp enquiry पर दी जाती है।"),
]

PAGES = [
    dict(
        slug="live", source="live", focus="live", plans="live", mode="pay",
        plan_sub="Live classes ₹3,999। Payment Razorpay के secure checkout पर होगा। Batch की start date और timing payment से पहले WhatsApp पर confirm करें।",
        title="Live GeM Classes — ₹3,999 | The Growth Adda",
        desc="GeM का process live classes में सीखिए। ₹3,999। Registration, tender documents और bid submission step by step.",
        tag="Live Classes · ₹3,999",
        h1="GeM का Process,<br><span class=\"accent\">Live Classes में सीखिए।</span>",
        lead="Registration, tender documents और bid submission को live classes में step by step समझिए। Batch की start date और timing payment से पहले WhatsApp पर confirm करें।",
        pay_cta="Live Classes जॉइन करें",
        points=[("Live format", "Live classes में course।"),
                ("Process-first", "Portal के साथ bid की शर्तें पढ़ना भी।"),
                ("Batch details", "Date और timing WhatsApp पर confirm होगी।")],
        faq=[("Live classes और recorded में क्या फ़र्क है?",
              "Live classes ₹3,999 में हैं और recorded sessions ₹1,999 में। Live batch की start date और timing WhatsApp पर confirm की जाती है।")],
        plan_head="Live classes के लिए enroll करें",
    ),
    dict(
        slug="recorded", source="recorded", focus="recorded", plans="recorded", mode="pay",
        plan_sub="Recorded sessions ₹1,999। Access और support की details payment से पहले WhatsApp पर confirm करें।",
        title="Recorded GeM Course — ₹1,999 | The Growth Adda",
        desc="GeM course recorded sessions में। ₹1,999। अपनी speed से process सीखिए।",
        tag="Recorded Sessions · ₹1,999",
        h1="अपनी Speed से<br><span class=\"accent\">GeM सीखिए।</span>",
        lead="Course recorded sessions के रूप में। Registration से bid submission तक का process अपने समय पर समझिए। Access की details payment से पहले WhatsApp पर confirm करें।",
        pay_cta="Recorded Course लें",
        points=[("Recorded format", "Course recorded sessions के रूप में।"),
                ("₹1,999", "Live classes से अलग, कम fee वाला plan।"),
                ("Access details", "Payment से पहले WhatsApp पर confirm करें।")],
        faq=[("Recorded sessions कितने दिन available रहेंगे?",
              "यह अभी इस page पर confirm नहीं है। Payment से पहले WhatsApp पर access की अवधि पूछ लें।")],
        plan_head="Recorded course के लिए enroll करें",
    ),
    dict(
        slug="shop-owners", source="shop-owners", focus="live", plans="all", mode="link",
        plan_sub="Recorded sessions ₹1,999 · Live classes ₹3,999। Format चुनकर उसके page पर enroll करें।",
        title="दुकानदारों के लिए GeM Course | The Growth Adda",
        desc="Shop owners और suppliers के लिए GeM का practical course। Registration, documents और bids का process.",
        tag="दुकानदार और Suppliers के लिए",
        h1="दुकान से<br><span class=\"accent\">Government Tenders तक।</span>",
        lead="अगर आपकी दुकान या supply business है, तो GeM का process समझिए: seller registration, ज़रूरी documents और bid submission। Course से bid award या income guaranteed नहीं है।",
        pay_cta="Course की जानकारी लें",
        points=[("Seller registration", "Documents और profile की तैयारी।"),
                ("Tender की शर्तें", "Bid document में क्या देखना है।"),
                ("Reseller role", "OEM authorisation कब लगती है, यह समझना।")],
        faq=[("क्या मेरी दुकान के लिए यह course सही है?",
              "Course process सिखाता है। आपकी category में bids मिलेंगी या नहीं, यह official bid conditions पर निर्भर करता है। अपनी category WhatsApp पर बताकर पूछ सकते हैं।")],
        plan_head="अपना plan चुनें",
    ),
    dict(
        slug="beginners", source="beginners", focus="recorded", plans="all", mode="link",
        plan_sub="Recorded sessions ₹1,999 · Live classes ₹3,999। Format चुनकर उसके page पर enroll करें।",
        title="GeM Beginners Course | The Growth Adda",
        desc="GeM बिल्कुल शुरू से सीखिए। Beginners के लिए step-by-step course।",
        tag="Beginners के लिए",
        h1="GeM बिल्कुल<br><span class=\"accent\">शुरू से सीखिए।</span>",
        lead="कोई experience नहीं है? कोई बात नहीं। GeM का process—registration से bid submission तक—शुरू से समझिए। Course से eligibility, tender award या income guaranteed नहीं होती।",
        pay_cta="Course की जानकारी लें",
        points=[("शुरू से", "Registration से शुरुआत।"),
                ("Simple steps", "Process को step by step समझना।"),
                ("Format चुनें", "Recorded ₹1,999 या live ₹3,999।")],
        faq=[("क्या beginners यह course कर सकते हैं?",
              "हाँ। Course beginners के लिए भी है। Course join करने से किसी bid की eligibility अपने आप नहीं बनती। Eligibility उसी tender की शर्तों पर निर्भर करती है।")],
        plan_head="अपना format चुनें",
    ),
]

TEMPLATE = """<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#2C3777">
  <meta name="color-scheme" content="light">
  <meta name="format-detection" content="telephone=no">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="{site}/{slug}.html">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="hi_IN">
  <meta property="og:site_name" content="The Growth Adda">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{site}/{slug}.html">
  <meta property="og:image" content="{site}/assets/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{desc}">
  <meta name="twitter:image" content="{site}/assets/og.png">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body data-source="{source}" data-focus-plan="{focus}">
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header">
    <div class="wrap header-bar">
      <a class="brand" href="index.html">
        {logo_dark}
        <span class="brand-name">The Growth Adda</span>
      </a>
      <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="site-nav">
        <span class="sr-only">Open menu</span>
        <span class="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>
      </button>
      <nav id="site-nav" class="nav" aria-label="Primary">
        <ul role="list">
          <li role="listitem"><a href="#plans">Plans</a></li>
          <li role="listitem"><a href="#learn">What You’ll Learn</a></li>
          <li role="listitem"><a href="#faqs">FAQs</a></li>
          <li role="listitem"><a href="index.html">Home</a></li>
        </ul>
        <a class="btn btn-gold" href="#plans" lang="en">Enroll Now</a>
      </nav>
    </div>
  </header>

  <main id="main" tabindex="-1">
    <section class="hero" aria-labelledby="hero-title">
      <div class="wrap hero-grid">
        <div class="hero-copy">
          <p class="promo"><span class="promo-tag">{tag}</span></p>
          <h1 id="hero-title">{h1}</h1>
          <p class="lead">{lead}</p>
          <div class="hero-actions">
            <a class="btn btn-gold" href="#plans">{pay_cta}</a>
            <a class="btn btn-ghost" data-enquiry href="{enq}">WhatsApp पर पूछें</a>
          </div>
        </div>

        <figure class="journey">
          <div class="journey-top">
            {logo_small}
            <figcaption class="journey-caption" lang="en">What’s inside</figcaption>
          </div>
          <ol class="journey-list" role="list">
{points}
          </ol>
        </figure>
      </div>
    </section>

    <section class="section section-soft" id="learn" aria-labelledby="learn-title">
      <div class="wrap">
        <div class="section-head">
          <h2 id="learn-title">क्या सीखेंगे</h2>
          <p class="note" data-curriculum-note>यह proposed curriculum है। Exact modules की confirmation batch details के साथ दी जाएगी।</p>
        </div>
        <div class="accordion" data-accordion data-curriculum></div>
      </div>
    </section>

    <section class="section offer" id="plans" aria-labelledby="plans-title">
      <div class="wrap">
        <div class="section-head on-dark">
          <p class="eyebrow" lang="en">Course plans</p>
          <h2 id="plans-title">{plan_head}</h2>
          <p class="lead">{plan_sub}</p>
        </div>
        <div class="plans-grid" data-plans="{plans}" data-mode="{mode}" data-focus="{focus}"></div>
      </div>
    </section>

    <section class="section section-soft" id="enquire" aria-labelledby="enquire-title">
      <div class="wrap">
        <div class="lead-card">
          <div class="section-head">
            <p class="eyebrow" lang="en">Talk to us</p>
            <h2 id="enquire-title">अपनी details भेजें, हम WhatsApp पर जवाब देंगे।</h2>
            <p class="lead">नाम और शहर लिखें, बाकी बातचीत WhatsApp पर।</p>
          </div>
          <div data-lead></div>
        </div>
      </div>
    </section>

    <section class="section" id="faqs" aria-labelledby="faq-title">
      <div class="wrap">
        <div class="section-head center">
          <p class="eyebrow" lang="en">FAQs</p>
          <h2 id="faq-title">अक्सर पूछे जाने वाले सवाल</h2>
        </div>
        <div class="accordion" data-accordion>
{faqs}
        </div>
      </div>
    </section>

    <section class="section section-follow" aria-labelledby="final-title">
      <div class="wrap cta-band">
        <h2 id="final-title">कोई सवाल है? WhatsApp पर पूछिए।</h2>
        <p class="lead">अपना experience और business category बताइए। Course और batch की जानकारी पाइए।</p>
        <div class="final-actions">
          <a class="btn btn-gold" data-enquiry href="{enq}">WhatsApp पर Course Details लें</a>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-top">
        <div class="footer-brand">
          <a class="footer-logo" href="index.html">
            {logo_gold}
            <span>The Growth Adda</span>
          </a>
          <p class="footer-tag">Independent GeM learning for beginners, suppliers and working professionals.</p>
        </div>
        <nav class="footer-nav" aria-label="Contact">
          <ul class="footer-links">
            <li>
              <a data-instagram href="https://www.instagram.com/thegrowthadda.in/" target="_blank" rel="noopener noreferrer">
                <span>Instagram</span>
                <span class="footer-meta">@thegrowthadda.in<span class="sr-only"> (opens in new tab)</span></span>
              </a>
            </li>
            <li>
              <a data-enquiry href="{enq}">
                <span>Course enquiry</span>
                <span class="footer-meta">WhatsApp · <span data-phone>+91 80079 74088</span></span>
              </a>
            </li>
            <li>
              <a href="index.html">
                <span>Website</span>
                <span class="footer-meta">thegrowthadda.in</span>
              </a>
            </li>
          </ul>
          <ul class="legal" data-legal hidden></ul>
        </nav>
      </div>
      <p class="disclaimer" lang="en">The Growth Adda is an independent education platform and is not affiliated with or endorsed by Government e-Marketplace. Tender requirements and outcomes depend on official bid conditions.</p>
      <p class="copyright">© <span data-year>2026</span> The Growth Adda</p>
    </div>
  </footer>

  <div class="sticky-cta" role="region" aria-label="Enroll">
    <div class="wrap">
      <a class="btn btn-gold" href="#plans" lang="en">Enroll Now</a>
    </div>
  </div>

  <script src="js/config.js"></script>
  <script src="js/main.js"></script>
  <script src="js/interactive.js"></script>
</body>
</html>
"""


def e(s):
    return html.escape(s, quote=True)


def points_html(points):
    out = []
    for i, (label, note) in enumerate(points, 1):
        out.append(
            '            <li role="listitem">\n'
            f'              <span class="journey-index" aria-hidden="true">{i}</span>\n'
            '              <div>\n'
            f'                <p class="journey-label">{e(label)}</p>\n'
            f'                <p class="journey-note">{e(note)}</p>\n'
            '              </div>\n'
            '            </li>')
    return "\n".join(out)


def faqs_html(items):
    out = []
    for i, (q, a) in enumerate(items, 1):
        out.append(f"""          <div class="accordion-item">
            <h3>
              <button type="button" class="accordion-button" id="faq-btn-{i}" aria-expanded="false" aria-controls="faq-{i}" data-accordion-button>
                <span class="mod-title">{e(q)}</span>
                <span class="acc-icon" aria-hidden="true"></span>
              </button>
            </h3>
            <div id="faq-{i}" class="accordion-panel" role="region" aria-labelledby="faq-btn-{i}" hidden>
              <p>{e(a)}</p>
            </div>
          </div>""")
    return "\n\n".join(out)


def main():
    for p in PAGES:
        out = TEMPLATE.format(
            title=e(p["title"]), desc=e(p["desc"]), slug=p["slug"], site=SITE,
            source=p["source"], tag=e(p["tag"]), h1=p["h1"], lead=e(p["lead"]),
            pay_cta=e(p["pay_cta"]), plan_head=e(p["plan_head"]),
            plan_sub=e(p["plan_sub"]), mode=p["mode"],
            plans=p["plans"], focus=p["focus"], enq=ENQ,
            points=points_html(p["points"]),
            faqs=faqs_html(p["faq"] + COMMON_FAQ),
            logo_dark=LOGO_DARK,
            logo_small=LOGO_DARK,
            logo_gold=LOGO_GOLD,
        )
        (ROOT / f"{p['slug']}.html").write_text(out, encoding="utf-8")
        print("wrote", p["slug"] + ".html")


if __name__ == "__main__":
    main()
