/**
 * The Growth Adda — edit this file to update the site.
 *
 * Leave a value null until it is confirmed. The page hides unconfirmed
 * course facts, testimonials, screenshots and tender rows.
 * Do not add fees, seat limits, discounts, student counts or listings
 * unless they are real.
 *
 * Screenshots: blur phone numbers, IDs, bank details and personal names first.
 */
window.SITE_CONFIG = {
  brand: {
    name: "The Growth Adda",
    domain: "thegrowthadda.in",
    url: "https://thegrowthadda.in/",
    instagram: "https://www.instagram.com/thegrowthadda.in/",
    phoneDisplay: "+91 80079 74088",
  },

  links: {
    courseEnquiry:
      "https://wa.me/918007974088?text=Hi%20Growth%20Adda%2C%20please%20share%20your%20GeM%20course%20fees%2C%20syllabus%20and%20upcoming%20batch%20details.",
    masterclassEnquiry:
      "https://wa.me/918007974088?text=Hi%20Growth%20Adda%2C%20I%20want%20to%20join%20the%20%E2%82%B949%20GeM%20masterclass%20on%20Saturday%2021%20November%20at%2010%20AM.",
    cityListRequest:
      "https://wa.me/918007974088?text=Hi%20Growth%20Adda%2C%20please%20share%20the%20pre-bid%20list%20for%20my%20city.",
    whatsappNumber: "918007974088",
    privacy: null,
    terms: null,
  },

  /**
   * Plans shown on every page that has a [data-plans] container.
   *
   * PAYMENT: paste the Razorpay details into each plan's `razorpay` block.
   *   - Payment Button: razorpay.buttonId = "pl_XXXXXXXXXXXXXX"
   *       (Dashboard > Payment Button > copy the id from data-payment_button_id)
   *   - Payment Link:   razorpay.link = "https://rzp.io/rzp/xxxx"
   *       (use this if you only have a link; it opens in a new tab)
   * Leave both null and the card shows a WhatsApp button instead of a Pay button.
   * Use a different button/link for each plan so the amounts match.
   */
  pricing: {
    plans: [
      {
        id: "recorded",
        name: "Recorded Sessions",
        price: "₹1,999",
        tagline: "Recorded sessions के रूप में GeM course.",
        // Dedicated page for this course (used by the "Enroll" button on cards).
        page: "recorded.html",
        points: [
          "Course recorded sessions के रूप में",
          "Access और support की details payment से पहले WhatsApp पर confirm करें",
        ],
        razorpay: { buttonId: "pl_U2wIMHH0D1kU4v", link: null },
      },
      {
        id: "live",
        name: "Live Classes",
        price: "₹3,999",
        tagline: "Live classes में GeM course.",
        // Dedicated page for this course (used by the "Enroll" button on cards).
        page: "live.html",
        badge: "Live",
        featured: true,
        points: [
          "Course live classes के रूप में",
          "Batch की start date और timing payment से पहले WhatsApp पर confirm करें",
        ],
        razorpay: { buttonId: "pl_U2mcnLJXkNbIbY", link: null },
      },
    ],
  },

  course: {
    // Display text, exactly as it should appear. null hides the row.
    fee: null,
    batchStart: null,
    duration: null,
    format: null,
    language: null,
    support: null,
    // true, false, or null. null means "not confirmed" — the FAQ will not claim the list is included.
    prebidListIncluded: null,
  },

  // "proposed" until the owner confirms the batch syllabus. Then set "confirmed".
  curriculumStatus: "proposed",

  curriculum: [
    {
      title: "GeM basics and buyer–seller roles",
      summary:
        "GeM क्या है, buyer और seller की भूमिका क्या होती है, और एक साधारण खरीद कैसे आगे बढ़ती है।",
    },
    {
      title: "Seller registration and document preparation",
      summary:
        "Registration के लिए आमतौर पर कौन से documents लगते हैं, और उन्हें जमा करने से पहले कैसे जाँचें।",
    },
    {
      title: "OEM versus reseller roles and authorisation requirements",
      summary:
        "Manufacturer/OEM और reseller में फ़र्क, और authorisation किस तरह की bids में माँगी जा सकती है।",
    },
    {
      title: "Product categories, specifications and catalogue basics",
      summary:
        "Category चुनना, specification पढ़ना, और catalogue listing की basic बातें।",
    },
    {
      title: "Finding relevant tenders",
      summary:
        "अपने product या service से जुड़ी bids कैसे ढूँढें, और जो match न करें उन्हें कैसे छोड़ें।",
    },
    {
      title: "Reading eligibility, turnover, experience and EMD requirements",
      summary:
        "Bid document में eligibility, turnover, experience और EMD की शर्तें कैसे पढ़ें।",
    },
    {
      title: "Understanding pre-bid meetings and preparing questions",
      summary:
        "Pre-bid meeting का मतलब, venue या online instructions कैसे पढ़ें, और उपयोगी questions कैसे तैयार करें।",
    },
    {
      title: "Pricing, costing, GST considerations and delivery planning",
      summary:
        "Cost, GST और delivery time को साथ रखकर bid price के बारे में कैसे सोचें।",
    },
    {
      title: "Preparing and submitting bid documents",
      summary:
        "माँगे गए papers इकट्ठा करना, format जाँचना, और submission से पहले एक review checklist।",
    },
    {
      title: "Order fulfilment, invoicing, payment tracking and common mistakes",
      summary:
        "Order के बाद delivery, invoice और payment tracking की practical समझ, और आम गलतियाँ।",
    },
  ],

  // Real records only. Leave this array empty until a listing is checked.
  // City filter uses projectCity. Keep the meeting venue separate.
  // {
  //   tenderRef: "GEM/2026/B/0000000",
  //   buyer: "Buyer organisation",
  //   requirement: "What is being procured",
  //   projectCity: "Jaipur",
  //   venue: "Exact venue, or the online joining instruction",
  //   meetingDate: "2026-04-18",
  //   meetingTime: "11:00",
  //   timezone: "Asia/Kolkata",
  //   mode: "online", // "online", "in-person", or "hybrid"
  //   submissionDeadline: "20 Apr 2026, 6:00 pm IST",
  //   sourceUrl: "https://bidplus.gem.gov.in/...",
  //   lastChecked: "2026-04-01",
  //   limitations: "What could not be verified from the official notice"
  // }
  prebid: {
    records: [],
  },

  trust: {
    // { name: "", role: "", bio: "", photo: "assets/instructor.jpg" }
    instructor: null,
    // { title: "", src: "https://www.youtube.com/watch?v=..." }
    video: null,
    // { src: "assets/lesson.jpg", alt: "", caption: "" }
    screenshots: [],
    // { quote: "", name: "", detail: "" }
    testimonials: [],
  },
};
