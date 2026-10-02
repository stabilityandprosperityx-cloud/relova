const mobileNav = document.querySelector(".main-nav");
if (mobileNav && !mobileNav.querySelector(".mobile-auth-links")) {
  const auth = document.createElement("div");
  auth.className = "mobile-auth-links";
  auth.innerHTML =
    '<a href="/login">Log in</a><a href="/signup">Get started</a>';
  mobileNav.appendChild(auth);
}
document.querySelector(".menu-toggle")?.addEventListener("click", (e) => {
  const n = document.querySelector(".main-nav");
  const open = n.classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", String(open));
  e.currentTarget.textContent = open ? "×" : "☰";
});
document.querySelector(".search-input")?.addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase().trim();
  document
    .querySelectorAll(".directory-card")
    .forEach((c) =>
      c.classList.toggle("hidden", !c.dataset.search.includes(q)),
    );
});
const tabs = document.querySelectorAll(".tour-tabs button");
const tourCopy = [
  ["Relocation Expert", "Answers that know your plan."],
  ["My Plan", "Your move, clearly mapped."],
  ["Documents", "Documents, organized."],
  ["Checklists", "Every step, covered."],
  ["Country Guide", "Compare what matters."],
  ["Cost Calculator", "Know the real cost."],
];
const tourPanels = [
  `<section class="tm-screen tm-advisor">
    <div class="tm-screen-head"><div><span>YOUR RELOCATION EXPERT</span><h4>Ask with context.<br>Move with confidence.</h4></div><b class="tm-status">ONLINE</b></div>
    <div class="tm-chat-shell">
      <aside><button>+ New conversation</button><small>RECENT</small><strong>Portugal D7 income rules</strong><span>Health insurance options</span><span>Moving with family</span></aside>
      <div class="tm-chat"><header><i></i><b>Relova Advisor</b><small>Knows your plan</small></header><p>Based on your Portugal D7 path, the strongest next step is to organize six months of consistent income evidence.</p><p class="mine">Can rental income qualify?</p><p>Yes. I can add the exact supporting documents to your checklist.</p><div class="tm-input">Ask about visas, taxes or documents… <b>↑</b></div></div>
    </div>
  </section>`,
  `<section class="tm-screen tm-plan">
    <div class="tm-country-hero"><img src="/assets/portugal-street.jpg" alt=""><div><span>YOUR RELOCATION PLAN</span><h4>Portugal</h4><p>D7 pathway · Target move: March 2027</p></div><b>64<small>%</small></b></div>
    <div class="tm-plan-grid"><article><span>NEXT BEST ACTION</span><h5>Prepare proof of income</h5><p>Collect six months of bank statements and rental agreements.</p><button>Mark as done</button></article><article><span>YOUR JOURNEY</span><h5>3 of 7 complete</h5><div class="tm-progress"><i></i></div><ul><li class="done">Profile & country match</li><li class="done">Choose visa pathway</li><li>Prepare documents</li><li>Submit application</li></ul></article></div>
  </section>`,
  `<section class="tm-screen tm-documents">
    <div class="tm-screen-head"><div><span>SECURE DOCUMENT VAULT</span><h4>Everything ready,<br>before it’s requested.</h4></div><button class="tm-primary">+ Upload document</button></div>
    <div class="tm-stats"><article><b>3</b><span>Ready</span></article><article><b>1</b><span>Needs review</span></article><article><b>2</b><span>Missing</span></article><article class="wide"><span>Overall readiness</span><b>60%</b><div class="tm-progress"><i style="width:60%"></i></div></article></div>
    <div class="tm-doc-list"><div><i>PDF</i><p><b>Passport copy</b><span>D7 application</span></p><em class="ready">Ready</em></div><div><i>PDF</i><p><b>Bank statement</b><span>Income evidence</span></p><em class="review">Review</em></div><div><i>DOC</i><p><b>Rental income agreement</b><span>Income evidence</span></p><em>Missing</em></div></div>
  </section>`,
  `<section class="tm-screen tm-checklist">
    <div class="tm-screen-head"><div><span>PERSONAL CHECKLIST</span><h4>Your next steps,<br>in the right order.</h4></div><b class="tm-score">7 / 12</b></div>
    <div class="tm-phase"><div><span>01</span><p><b>Preparation</b><small>Documents, finances and logistics</small></p><em>75%</em></div><div class="tm-progress"><i style="width:75%"></i></div></div>
    <div class="tm-task-list"><div class="done"><i>✓</i><p><b>Check passport validity</b><span>Completed</span></p></div><div class="done"><i>✓</i><p><b>Confirm D7 income threshold</b><span>Completed</span></p></div><div><i></i><p><b>Request criminal record certificate</b><span>Due this week</span></p><strong>Next</strong></div><div><i></i><p><b>Arrange international health insurance</b><span>Estimated time: 2 days</span></p></div></div>
  </section>`,
  `<section class="tm-screen tm-countries">
    <div class="tm-screen-head"><div><span>COUNTRY EXPLORER</span><h4>Compare the places<br>that fit your life.</h4></div><div class="tm-search">Search countries…</div></div>
    <div class="tm-country-grid"><article class="selected"><img src="/assets/portugal-street.jpg" alt=""><div><span>BEST MATCH · 92</span><h5>Portugal</h5><p>D7 Visa · €1,500–2,000/mo</p></div></article><article><img src="/assets/spain-city.jpg" alt=""><div><span>MATCH · 88</span><h5>Spain</h5><p>Digital Nomad Visa</p></div></article><article><img src="/assets/germany-berlin.jpg" alt=""><div><span>MATCH · 81</span><h5>Germany</h5><p>EU Blue Card</p></div></article></div>
    <div class="tm-compare"><span>Safety <b>9.1</b></span><span>Visa ease <b>High</b></span><span>Quality of life <b>Excellent</b></span><button>Compare</button></div>
  </section>`,
  `<section class="tm-screen tm-cost">
    <div class="tm-screen-head"><div><span>RELOCATION COST CALCULATOR</span><h4>Know the real cost<br>before you move.</h4></div><b class="tm-total">€2,348<small>/ month</small></b></div>
    <div class="tm-cost-grid"><article><span>Housing</span><b>€1,200</b><i style="--h:76%"></i></article><article><span>Daily life</span><b>€540</b><i style="--h:46%"></i></article><article><span>Insurance</span><b>€188</b><i style="--h:25%"></i></article><article><span>Transport</span><b>€120</b><i style="--h:18%"></i></article></div>
    <div class="tm-cost-footer"><div><span>One-time relocation budget</span><strong>€7,240</strong><small>Visa, deposit, flights and setup</small></div><div class="tm-budget"><span>Your monthly budget</span><b>€3,200</b><div class="tm-progress"><i style="width:73%"></i></div><small>€852 remaining each month</small></div></div>
  </section>`,
];
function activateTour(index) {
  tabs.forEach((tab, i) => {
    const active = i === index;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  const body = document.querySelector(".tour-mock-body");
  if (body && body.dataset.view !== String(index)) {
    body.dataset.view = String(index);
    body.classList.remove("is-visible");
    body.innerHTML = tourPanels[index];
    requestAnimationFrame(() => body.classList.add("is-visible"));
  }
  const narrative = document.querySelector(".tour-narrative");
  if (!narrative) return;
  narrative.querySelector(".eyebrow").textContent =
    "Relova / " + tourCopy[index][0];
  narrative.querySelector("h3").textContent = tourCopy[index][1];
}
tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => activateTour(i));
  tab.addEventListener("mouseenter", () => activateTour(i));
  tab.addEventListener("focus", () => activateTour(i));
});
activateTour(0);
document.querySelectorAll(".billing-toggle button").forEach((button) =>
  button.addEventListener("click", () => {
    const mode = button.dataset.billing;
    document
      .querySelectorAll(".billing-toggle button")
      .forEach((item) => item.classList.toggle("active", item === button));
    document.querySelectorAll(".price").forEach((price) => {
      price.querySelector("span").textContent = price.dataset[mode];
      price.querySelector("small").textContent = price.dataset[`${mode}Period`];
    });
    document
      .querySelectorAll(".price-cta")
      .forEach((cta) => (cta.textContent = cta.dataset[`${mode}Label`]));
    const note = document.querySelector(".lifetime-note");
    if (note) note.hidden = mode !== "lifetime";
  }),
);
document.querySelectorAll(".price-cta").forEach((cta) =>
  cta.addEventListener("click", (event) => {
    event.preventDefault();
    const plan = (
      cta.closest(".price-card")?.querySelector("h3")?.textContent || ""
    )
      .trim()
      .toLowerCase();
    if (plan === "free") {
      location.href = "/chat";
      return;
    }
    const lifetime =
      document.querySelector(".billing-toggle button.active")?.dataset
        .billing === "lifetime";
    location.href = `/checkout?plan=${plan}${lifetime ? "_lifetime" : ""}`;
  }),
);
document
  .querySelector(".concierge .btn")
  ?.addEventListener("click", (event) => {
    event.preventDefault();
    location.href = "/checkout?plan=concierge";
  });
if (
  matchMedia(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
  ).matches
) {
  document
    .querySelectorAll(
      ".feature,.tile,.price-card,.tool-card,.directory-card,.country-card",
    )
    .forEach((card) => {
      let frame = 0;
      card.addEventListener("pointermove", (event) => {
        if (frame) cancelAnimationFrame(frame);
        const x = event.clientX,
          y = event.clientY;
        frame = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${x - rect.left}px`);
          card.style.setProperty("--my", `${y - rect.top}px`);
          frame = 0;
        });
      });
      card.addEventListener("pointerleave", () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        card.style.removeProperty("--mx");
        card.style.removeProperty("--my");
      });
    });
}
