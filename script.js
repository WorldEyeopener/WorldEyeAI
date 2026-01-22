/* =========================
   Config — replace these
   ========================= */
const FIVERR_PROFILE_URL = "https://www.fiverr.com/your_username"; // TODO: replace
const FIVERR_COPY_GIG_URL = "https://www.fiverr.com/your_username/your-copywriting-gig"; // TODO: replace
const FIVERR_BOT_GIG_URL  = "https://www.fiverr.com/your_username/your-chatbot-gig"; // TODO: replace

/* =========================
   Helpers
   ========================= */
function $(sel, root = document){ return root.querySelector(sel); }
function $all(sel, root = document){ return Array.from(root.querySelectorAll(sel)); }

function setFiverrLinks(){
  $all("[data-fiverr-profile]").forEach(a => a.setAttribute("href", FIVERR_PROFILE_URL));
}

function navElevate(){
  const header = document.querySelector("[data-elevate]");
  if(!header) return;

  const onScroll = () => {
    if (window.scrollY > 10) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function mobileMenu(){
  const btn = document.querySelector("[data-navbtn]");
  const menu = document.getElementById("mobileMenu");
  if(!btn || !menu) return;

  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    menu.hidden = open;
  });

  $all(".mobile__link").forEach(link => {
    link.addEventListener("click", () => {
      btn.setAttribute("aria-expanded", "false");
      menu.hidden = true;
    });
  });
}

function revealOnScroll(){
  const els = $all("[data-reveal]");
  if(!("IntersectionObserver" in window)){
    els.forEach(el => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}

function routeButtons(){
  $all("[data-route]").forEach(btn => {
    btn.addEventListener("click", () => {
      const dest = btn.getAttribute("data-route");
      if(dest) window.location.href = dest;
    });
  });
}

/* Tabs (pricing) */
function pricingTabs(){
  const tabs = $all("[data-tab]");
  const panes = $all("[data-pane]");
  if(!tabs.length || !panes.length) return;

  const activate = (key) => {
    tabs.forEach(t => t.classList.toggle("is-active", t.getAttribute("data-tab") === key));
    panes.forEach(p => {
      const show = p.getAttribute("data-pane") === key;
      p.hidden = !show;
    });
  };

  tabs.forEach(t => t.addEventListener("click", () => activate(t.getAttribute("data-tab"))));

  // Deep-link focus from CTA buttons
  $all("[data-focus]").forEach(a => {
    a.addEventListener("click", () => {
      const key = a.getAttribute("data-focus");
      if(key === "copy" || key === "bot") activate(key);
    });
  });

  // If URL hash includes #pricing?tab=bot style (optional)
  const url = new URL(window.location.href);
  const tab = url.searchParams.get("tab");
  if(tab === "bot" || tab === "copy") activate(tab);
}

/* Brief generator */
function briefForm(){
  const form = document.querySelector("[data-brief-form]");
  if(!form) return;

  const output = document.querySelector("[data-message-output]");
  const copyBtn = document.querySelector("[data-copy-message]");
  const mailto = document.querySelector("[data-mailto]");

  // Package preselect from pricing cards
  $all("[data-select]").forEach(a => {
    a.addEventListener("click", () => {
      const sel = a.getAttribute("data-select") || "";
      const [gig, pkg] = sel.split(":");
      const gigEl = form.elements["gig"];
      const pkgEl = form.elements["package"];
      if(gigEl && (gig === "copy" || gig === "bot")) gigEl.value = gig;
      if(pkgEl && (pkg === "basic" || pkg === "standard" || pkg === "premium")) pkgEl.value = pkg;
    });
  });

  function gigLabel(g){
    return g === "copy" ? "Sales Copywriting (AI + Strategy)" : "Customer Support GPT Chatbot";
  }

  function packageLabel(g, p){
    // Keep copy aligned to the locked catalog.
    const map = {
      copy: { basic: "Basic ($100)", standard: "Standard ($250)", premium: "Premium ($650)" },
      bot:  { basic: "Basic ($250)", standard: "Standard ($500)", premium: "Premium ($1,200)" }
    };
    return (map[g] && map[g][p]) ? map[g][p] : p;
  }

  function gigLink(g){
    return g === "copy" ? FIVERR_COPY_GIG_URL : FIVERR_BOT_GIG_URL;
  }

  function buildMessage(values){
    const { gig, package: pkg, offer, goal, timeline, links } = values;

    const lines = [
      "Hey, does this look like the correct message you want to send? If so, then hit complete generate to finish your final generation.",
      "",
      `Gig: ${gigLabel(gig)}`,
      `Package: ${packageLabel(gig, pkg)}`,
      "",
      `What I'm selling/supporting: ${offer}`,
      `Primary goal: ${goal}`,
      timeline ? `Timeline: ${timeline}` : null,
      "",
      "Key info:",
      gig === "copy"
        ? "- Placement (ads/email/LP): [fill in]\n- Audience: [fill in]\n- Brand voice examples: [paste]\n- Must-include claims/constraints: [paste]"
        : "- Where it lives (Custom GPT vs website): [fill in]\n- FAQs/policies + hours/service area: [paste]\n- Tone/voice examples: [paste]\n- Escalation/handoff rules + contact method: [paste]\n- If integrations: systems + captured fields: [paste]",
      "",
      links ? `Links/notes:\n${links}` : null,
      "",
      "Before you start, please confirm:",
      "1) Deliverables + timeline",
      "2) Anything missing from my brief",
      "3) What you need from me to avoid revisions",
    ].filter(Boolean);

    return lines.join("\n");
  }

  function setEnabled(el, enabled){
    if(!el) return;
    el.toggleAttribute("disabled", !enabled);
    el.setAttribute("aria-disabled", String(!enabled));
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const values = Object.fromEntries(new FormData(form).entries());
    const msg = buildMessage(values);

    output.textContent = msg;
    setEnabled(copyBtn, true);
    setEnabled(mailto, true);

    const subject = encodeURIComponent(`Fiverr Brief — ${gigLabel(values.gig)} — ${packageLabel(values.gig, values.package)}`);
    const body = encodeURIComponent(msg);
    mailto.setAttribute("href", `mailto:?subject=${subject}&body=${body}`);
  });

  copyBtn?.addEventListener("click", async () => {
    try{
      await navigator.clipboard.writeText(output.textContent || "");
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy message"), 1200);
    }catch{
      copyBtn.textContent = "Copy failed";
      setTimeout(() => (copyBtn.textContent = "Copy message"), 1200);
    }
  });

  // Helpful: when user clicks pricing tab, nudge form selection (optional)
  $all("[data-tab]").forEach(t => {
    t.addEventListener("click", () => {
      if(!form.elements["gig"]) return;
      form.elements["gig"].value = t.getAttribute("data-tab") === "bot" ? "bot" : "copy";
    });
  });

  // “Smart scroll” into brief from hero CTA
  $all('a[href="#brief"]').forEach(a => {
    a.addEventListener("click", () => {
      // no-op: native anchor
    });
  });

  // Add gig link to output when user changes gig selection (non-invasive)
  const gigSelect = form.elements["gig"];
  if(gigSelect){
    gigSelect.addEventListener("change", () => {
      const g = gigSelect.value;
      const hint = `\n\nGig link: ${gigLink(g)}\n`;
      if(output && output.textContent && !output.textContent.includes("Gig link:")){
        output.textContent = output.textContent + hint;
      }
    });
  }
}

/* Small utility: open details like accordion (optional) */
function faqAccordionSingleOpen(){
  const items = $all(".faq__item");
  if(!items.length) return;

  items.forEach(item => {
    item.addEventListener("toggle", () => {
      if(!item.open) return;
      items.forEach(other => {
        if(other !== item) other.open = false;
      });
    });
  });
}

/* =========================
   Init
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  setFiverrLinks();
  navElevate();
  mobileMenu();
  revealOnScroll();
  routeButtons();
  pricingTabs();
  briefForm();
  faqAccordionSingleOpen();
});
