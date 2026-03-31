import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import "../../styles/landing.css";

export function LandingPage() {
  const navigate = useNavigate();
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [swahili, setSwahili] = useState(false);

  useEffect(() => {
    if (marqueeRef.current) {
      marqueeRef.current.innerHTML += marqueeRef.current.innerHTML;
    }

    const reveals = document.querySelectorAll<HTMLElement>(".landing-root .reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    reveals.forEach((el) => io.observe(el));

    const navEl = document.getElementById("landing-nav");
    const handleScroll = () => {
      if (navEl) {
        navEl.style.borderBottomColor =
          window.scrollY > 60 ? "rgba(139,128,112,.2)" : "rgba(139,128,112,.12)";
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const countUps = document.querySelectorAll<HTMLElement>(".landing-root .metric-num");
    const countIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            const text = el.textContent || "";
            if (text.includes("TSh") || text.includes("Custom")) return;
            const num = parseFloat(text.replace(/[^0-9.]/g, ""));
            const suffix = text.replace(/[0-9.,]/g, "").trim();
            let start = 0;
            const dur = 1800;
            const stepMs = 16;
            const inc = num / (dur / stepMs);
            const timer = setInterval(() => {
              start += inc;
              if (start >= num) {
                start = num;
                clearInterval(timer);
              }
              el.textContent = Number.isInteger(num)
                ? Math.round(start) + suffix
                : start.toFixed(0) + suffix;
            }, stepMs);
            countIO.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    countUps.forEach((el) => countIO.observe(el));

    return () => {
      io.disconnect();
      countIO.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="landing-root">
      {/* ══ NAV ══ */}
      <nav id="landing-nav">
        <div className="nav-logo">PESA <span>DUKA</span></div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it Works</a>
          <a href="#pricing">Pricing</a>
          <a href="#demo">Demo</a>
        </div>
        <div className="nav-cta">
          <button className="nav-lang" onClick={() => setSwahili(!swahili)}>
            {swahili ? "🇬🇧 English" : "🇹🇿 Swahili"}
          </button>
          <a href="#pricing" className="btn-nav">Start Free →</a>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="hero" id="hero">
        <div className="hero-container">
          <div className="hero-left">
            <div className="hero-eyebrow">
              <span></span> Live in Dar es Salaam · Kenya launching Q3 2025
            </div>
            <h1>
              Your duka.<br />
              Running<br />
              <em>itself.</em>
            </h1>
            <p className="hero-sub">
              The first <strong>Swahili-first business OS</strong> for East African shop owners.
              Mobile money reconciliation, TRA compliance, and an AI advisor who knows your shop better than you do.
            </p>
            <div className="hero-actions">
              <a href="#pricing" className="btn-primary btn-large">
                Anza Bure — Start Free <span className="arrow">→</span>
              </a>
              <a href="#demo" className="btn-ghost">
                ▶ See it in action
              </a>
            </div>
            <div className="hero-proof">
              <div className="proof-avatars">
                <div className="proof-avatar">AM</div>
                <div className="proof-avatar" style={{ background: "#3b82f6" }}>JB</div>
                <div className="proof-avatar" style={{ background: "#22c55e" }}>FA</div>
                <div className="proof-avatar" style={{ background: "#a855f7" }}>HM</div>
                <div className="proof-avatar" style={{ background: "#f59e0b" }}>+</div>
              </div>
              <div className="proof-text">
                Trusted by <strong>847 shop owners</strong> in Dar es Salaam
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="float-card fc1">
              <div className="float-card-label">Today's Revenue</div>
              <div className="float-card-value">TSh 312,800</div>
              <div className="float-card-sub">↑ 16% vs last week</div>
            </div>

            <div className="hero-phone">
              <div className="phone-screen">
                <div className="phone-header">
                  <div>
                    <div className="phone-greeting">Habari za asubuhi,</div>
                    <div className="phone-name">Amina ✦</div>
                  </div>
                  <div className="phone-score">68 / 100 ★</div>
                </div>
                <div className="phone-akili">
                  <div className="akili-label">🧠 Akili ya Biashara</div>
                  <div className="akili-msg"><strong>Unga will run out Saturday morning</strong> — 3rd week in a row. Order today. You're losing TSh 28K/week.</div>
                </div>
                <div className="phone-stat-row">
                  <div className="phone-stat">
                    <div className="phone-stat-l">Profit</div>
                    <div className="phone-stat-v green">76%</div>
                  </div>
                  <div className="phone-stat">
                    <div className="phone-stat-l">Owed</div>
                    <div className="phone-stat-v" style={{ color: "#ef4444" }}>189K</div>
                  </div>
                  <div className="phone-stat">
                    <div className="phone-stat-l">Score</div>
                    <div className="phone-stat-v orange">68</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="float-card fc2">
              <div className="float-card-label">Pending Action</div>
              <div className="float-card-value" style={{ fontSize: "15px", lineHeight: "1.3" }}>M-Pesa auto-reconciled</div>
              <div className="float-card-sub warn">34 txns · TSh 312,800</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TRUST STRIP ══ */}
      <div className="trust-strip">
        <div className="marquee" ref={marqueeRef}>
          <div className="marquee-item">✦ TRA EFD Certified <div className="marquee-dot"></div></div>
          <div className="marquee-item">✦ ClickPesa Integrated <div className="marquee-dot"></div></div>
          <div className="marquee-item">✦ M-Pesa · Airtel · Mixx · HaloPesa <div className="marquee-dot"></div></div>
          <div className="marquee-item">✦ Swahili First <div className="marquee-dot"></div></div>
          <div className="marquee-item">✦ Offline Capable <div className="marquee-dot"></div></div>
          <div className="marquee-item">✦ PDPA 2022 Compliant <div className="marquee-dot"></div></div>
          <div className="marquee-item">✦ 847 Active Shops <div className="marquee-dot"></div></div>
          <div className="marquee-item">✦ BRELA + TIN Onboarding <div className="marquee-dot"></div></div>
        </div>
      </div>

      {/* ══ PARTNERS ══ */}
      <div className="partners">
        <div className="container">
          <p className="partners-label">Integrated with the platforms you already use</p>
          <div className="logos-row">
            <div className="logo-item">ClickPesa</div>
            <div className="logo-item">Vodacom M-Pesa</div>
            <div className="logo-item">Airtel Money</div>
            <div className="logo-item">Africa's Talking</div>
            <div className="logo-item">CRDB Bank</div>
            <div className="logo-item">NMB Biashara</div>
            <div className="logo-item">TRA e-Filing</div>
          </div>
        </div>
      </div>

      {/* ══ PAIN ══ */}
      <section className="pain" id="problem">
        <div className="container">
          <div className="section-label" style={{ color: "rgba(229,107,10,.7)" }}>The Problem</div>
          <h2>Most dukas run on<br /><em>notebooks and prayer.</em></h2>
          <p className="lead reveal" style={{ color: "rgba(250,248,245,.45)", marginTop: "16px" }}>
            17 million MSMEs across East Africa. 85% still tracking sales in paper. Losing money they don't even know they're losing.
          </p>
          <div className="pain-grid">
            <div className="pain-card reveal">
              <div className="pain-stat">3</div>
              <div className="pain-stat-label">stockouts per week on average</div>
              <div className="pain-icon">📦</div>
              <h3>Running out when customers arrive</h3>
              <p>No system tells you when to reorder. You discover the gap when a customer walks out empty-handed.</p>
            </div>
            <div className="pain-card reveal reveal-delay-2">
              <div className="pain-stat">$5.2T</div>
              <div className="pain-stat-label">SME finance gap in Sub-Saharan Africa</div>
              <div className="pain-icon">🏦</div>
              <h3>Banks can't see you, so they won't lend to you</h3>
              <p>No financial records means no credit score means no loan means no growth. The informal trap.</p>
            </div>
            <div className="pain-card reveal reveal-delay-3">
              <div className="pain-stat">TSh 4M</div>
              <div className="pain-stat-label">Maximum TRA penalty for EFD non-compliance</div>
              <div className="pain-icon">🏛️</div>
              <h3>Compliance is a minefield you don't have a map for</h3>
              <p>EFD receipts. VAT returns. PAYE. SDL. Missing a filing costs more than a month of profit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SOLUTION ══ */}
      <section className="solution" id="solution">
        <div className="container">
          <div className="solution-grid">
            <div>
              <div className="section-label reveal">The Solution</div>
              <h2 className="reveal">Same duka.<br /><em>Different story.</em></h2>
              <p className="lead reveal reveal-delay-1">
                PESA DUKA watches your business 24/7 — then tells you exactly what to do, in Swahili, in plain language.
              </p>
              <p style={{ fontSize: "15px", color: "var(--muted)", marginTop: "16px", lineHeight: "1.7" }} className="reveal reveal-delay-2">
                Not another dashboard you have to stare at. An operating system that talks to you like a trusted business advisor — and handles the tax paperwork while you're at it.
              </p>
            </div>
            <div className="reveal reveal-delay-2">
              <div className="before-after">
                <div className="ba-col ba-before">
                  <div className="ba-label">Before CREOVA</div>
                  <div className="ba-item"><div className="ba-dot">✗</div><div>Paper notebook, pencil, eraser</div></div>
                  <div className="ba-item"><div className="ba-dot">✗</div><div>No idea which products are profitable</div></div>
                  <div className="ba-item"><div className="ba-dot">✗</div><div>Chase debt manually, awkward calls</div></div>
                  <div className="ba-item"><div className="ba-dot">✗</div><div>TRA visit = panic, scramble, fine</div></div>
                  <div className="ba-item"><div className="ba-dot">✗</div><div>Bank says no — no records</div></div>
                </div>
                <div className="ba-divider"><div className="ba-divider-circle">→</div></div>
                <div className="ba-col ba-after">
                  <div className="ba-label">After CREOVA</div>
                  <div className="ba-item"><div className="ba-dot">✓</div><div>Tap, receipt done, auto-logged</div></div>
                  <div className="ba-item"><div className="ba-dot">✓</div><div>Akili tells you your best products daily</div></div>
                  <div className="ba-item"><div className="ba-dot">✓</div><div>WhatsApp reminder sent automatically</div></div>
                  <div className="ba-item"><div className="ba-dot">✓</div><div>EFD Z-Report transmitted at 11:30pm</div></div>
                  <div className="ba-item"><div className="ba-dot">✓</div><div>Loan package ready in one tap</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-label reveal">Core Features</div>
          <h2 className="reveal">Built for how<br /><em>East Africa actually works.</em></h2>
          <div className="features-grid">
            <div className="feature-card reveal">
              <div className="feature-icon-wrap">📱</div>
              <h3>Mobile Money Ledger</h3>
              <p>Every M-Pesa, Airtel, Mixx, and HaloPesa payment auto-reconciles into your cashbook via ClickPesa. No more manual matching.</p>
              <span className="feature-tag">All 4 TZ wallets →</span>
            </div>
            <div className="feature-card reveal reveal-delay-1">
              <div className="feature-icon-wrap">🧾</div>
              <h3>TRA EFD Compliance</h3>
              <p>Generate fiscal receipts, transmit daily Z-reports to TRA, file VAT returns — all from your phone. Never fear a TRA visit again.</p>
              <span className="feature-tag">EFD Certified →</span>
            </div>
            <div className="feature-card reveal reveal-delay-2">
              <div className="feature-icon-wrap">🧠</div>
              <h3>Akili ya Biashara</h3>
              <p>An AI advisor who speaks Swahili, knows your shop data, and tells you exactly what to fix — before problems become losses.</p>
              <span className="feature-tag">The selling point →</span>
            </div>
            <div className="feature-card reveal reveal-delay-1">
              <div className="feature-icon-wrap">🛒</div>
              <h3>Smart Receipt Builder</h3>
              <p>Tap items from your inventory — receipt auto-builds with correct prices, VAT, and the customer's change. No typing. Ever.</p>
              <span className="feature-tag">2-tap sales →</span>
            </div>
            <div className="feature-card reveal reveal-delay-2">
              <div className="feature-icon-wrap">💳</div>
              <h3>Credit Score → Loan</h3>
              <p>Transaction history builds your credit score. When you hit the threshold, a lender-ready loan package compiles in one tap.</p>
              <span className="feature-tag">CRDB · NMB · SIDO →</span>
            </div>
            <div className="feature-card reveal reveal-delay-3">
              <div className="feature-icon-wrap">📟</div>
              <h3>USSD Mode</h3>
              <p>No smartphone? No internet? Dial *150*00# — record sales, check stock, and send debt reminders from any feature phone.</p>
              <span className="feature-tag">Works on any phone →</span>
            </div>
          </div>

          {/* Akili Callout */}
          <div className="akili-callout reveal">
            <div className="akili-left">
              <div className="akili-eyebrow">🧠 AI-Powered</div>
              <h2>Meet <em>Akili.</em></h2>
              <p className="lead">
                Your shop's business advisor. Watches your data 24/7. Speaks Swahili. Tells you what competitors' apps only show you in charts.
              </p>
              <a href="#pricing" className="btn-primary">Try Akili Free →</a>
            </div>
            <div className="akili-right">
              <div className="chat-bubble chat-akili">
                <strong>Habari Amina! 👋</strong> Unga wako utaisha Jumamosi asubuhi — hii ni mara ya 3 mfululizo. Agiza leo Ijumaa.
                <div className="chat-time">Akili · 07:14</div>
              </div>
              <div className="chat-bubble chat-user">
                Nini kingine ninachohitaji kujua leo?
                <div className="chat-time">You · 07:16</div>
              </div>
              <div className="chat-bubble chat-akili">
                Fatuma Salim anakudai <strong>TSh 34,500</strong> — siku 14 zimepita. Tuma ukumbusho WhatsApp sasa asubuhi. Uwezekano wa kulipwa ni mara mbili zaidi kuliko jioni.
                <div className="chat-time">Akili · 07:16</div>
              </div>
              <div className="chat-bubble chat-akili">
                Na: uko <strong>2% mbali</strong> na mkopo wa Pesapal. Waambie wateja wawili waliope kwa M-Pesa wiki hii.
                <div className="chat-time">Akili · 07:17</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="how" id="how">
        <div className="container">
          <div className="section-label reveal">How It Works</div>
          <h2 className="reveal">From notebook to <em>business intelligence</em><br />in four steps.</h2>
          <div className="steps">
            <div className="step reveal">
              <div className="step-num">1</div>
              <h3>Register your business</h3>
              <p>NIDA → TIN → BRELA in-app. We guide every step. Takes 15 minutes, not 15 trips.</p>
            </div>
            <div className="step reveal reveal-delay-1">
              <div className="step-num">2</div>
              <h3>Add your products</h3>
              <p>Tap to add inventory once. Every sale deducts automatically. Stock alerts fire before you run out.</p>
            </div>
            <div className="step reveal reveal-delay-2">
              <div className="step-num">3</div>
              <h3>Sell and get paid</h3>
              <p>Any payment — M-Pesa, cash, or split — generates a TRA-compliant EFD receipt instantly.</p>
            </div>
            <div className="step reveal reveal-delay-3">
              <div className="step-num">4</div>
              <h3>Akili runs your finances</h3>
              <p>AI reconciles mobile money, files tax returns, chases debts, and tells you what to do tomorrow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="testimonials" id="testimonials">
        <div className="container">
          <div className="section-label reveal">From Shop Owners</div>
          <h2 className="reveal">They didn't believe it.<br />Until <em>it worked.</em></h2>
          <div className="testi-grid">
            <div className="testi-card reveal">
              <div className="stars">★★★★★</div>
              <div className="testi-quote">"Nilikuwa naomba TRA wasinikute. Sasa wananikuta na kila kitu tayari. Akili ananisaidia zaidi ya mtu yeyote."</div>
              <div style={{ fontSize: "13px", color: "var(--muted)", marginTop: "-8px", fontStyle: "normal" }}>"I used to pray TRA wouldn't find me. Now they find everything ready. Akili helps me more than anyone."</div>
              <div className="testi-author">
                <div className="testi-avatar">AM</div>
                <div>
                  <div className="testi-name">Amina Mkanga</div>
                  <div className="testi-role">Duka owner · Kariakoo, Dar es Salaam</div>
                </div>
              </div>
            </div>
            <div className="testi-card reveal reveal-delay-1">
              <div className="stars">★★★★★</div>
              <div className="testi-quote">"I applied for a CRDB loan with the package CREOVA generated for me. Approved in 2 weeks. That would have taken months before."</div>
              <div className="testi-author">
                <div className="testi-avatar" style={{ background: "#3b82f6" }}>JB</div>
                <div>
                  <div className="testi-name">Juma Bakari</div>
                  <div className="testi-role">Agro-dealer · Kinondoni, Dar es Salaam</div>
                </div>
              </div>
            </div>
            <div className="testi-card reveal reveal-delay-2">
              <div className="stars">★★★★★</div>
              <div className="testi-quote">"My staff used to 'forget' to record sales. Now every sale on the system is tracked to their name. I can see exactly what's happening."</div>
              <div className="testi-author">
                <div className="testi-avatar" style={{ background: "#22c55e" }}>FA</div>
                <div>
                  <div className="testi-name">Fatuma Ali</div>
                  <div className="testi-role">Pharmacy owner · Ilala, Dar es Salaam</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ METRICS ══ */}
      <section className="metrics">
        <div className="container">
          <div className="metrics-grid">
            <div className="metric reveal">
              <div className="metric-num">847</div>
              <div className="metric-label">Active shops in Dar es Salaam</div>
            </div>
            <div className="metric reveal reveal-delay-1">
              <div className="metric-num">TSh 1.28B</div>
              <div className="metric-label">Revenue processed monthly</div>
            </div>
            <div className="metric reveal reveal-delay-2">
              <div className="metric-num">98%</div>
              <div className="metric-label">EFD compliance rate</div>
            </div>
            <div className="metric reveal reveal-delay-3">
              <div className="metric-num">68%</div>
              <div className="metric-label">Shops now formally registered</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ COMPLIANCE ══ */}
      <section style={{ padding: "60px 0", background: "var(--warm)" }}>
        <div className="container">
          <div className="compliance reveal">
            <div>
              <div className="section-label" style={{ color: "rgba(255,255,255,.5)" }}>Regulatory</div>
              <h2>Built for <em>Tanzania.</em><br />Ready for Kenya.</h2>
              <p className="lead">The only SME platform with native TRA EFD compliance, BRELA onboarding, and KRA eTIMS for Kenya — in one product, at $3/month.</p>
            </div>
            <div className="compliance-logos">
              <div className="comp-badge">TRA EFD ✓</div>
              <div className="comp-badge">BRELA ORS ✓</div>
              <div className="comp-badge">KRA eTIMS ✓</div>
              <div className="comp-badge">PDPA 2022 ✓</div>
              <div className="comp-badge">TAN-QR ✓</div>
              <div className="comp-badge">BoT Sandbox ✓</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section className="pricing" id="pricing">
        <div className="container">
          <div className="section-label reveal">Pricing</div>
          <h2 className="reveal">Less than a cup of tea.<br /><em>Every day.</em></h2>
          <p className="lead reveal reveal-delay-1">Start free. Upgrade when your business grows. Cancel anytime. No contracts, no tricks.</p>
          <div className="pricing-grid">
            <div className="pricing-card reveal">
              <div className="pricing-tier">Free — Bure Kabisa</div>
              <div className="pricing-price">TSh 0 <span>/month</span></div>
              <div className="pricing-desc">For shop owners just getting started. No credit card required.</div>
              <ul className="pricing-features">
                <li>POS with EFD receipts</li>
                <li>Inventory tracking</li>
                <li>Basic cashbook</li>
                <li>BRELA registration guide</li>
                <li>TAN-QR payment display</li>
                <li>25 invoices/month</li>
              </ul>
              <button className="btn-pricing btn-pricing-outline" onClick={() => navigate("/dashboard")}>Start Free →</button>
            </div>
            <div className="pricing-card featured reveal reveal-delay-1">
              <div className="featured-badge">Most Popular</div>
              <div className="pricing-tier" style={{ color: "rgba(250,248,245,.4)" }}>Growth — Ukuaji</div>
              <div className="pricing-price" style={{ color: "#FAF8F5" }}>TSh 7,500 <span style={{ color: "rgba(250,248,245,.4)" }}>/month</span></div>
              <div className="pricing-desc" style={{ color: "rgba(250,248,245,.5)" }}>For shops ready to go formal. Under TSh 250/day.</div>
              <ul className="pricing-features">
                <li>Everything in Free</li>
                <li>All 4 mobile money wallets</li>
                <li>Auto-reconciliation</li>
                <li>Akili AI insights feed</li>
                <li>EFD Z-Reports</li>
                <li>Staff management + tracking</li>
                <li>USSD feature phone mode</li>
                <li>Unlimited invoices</li>
                <li>WhatsApp debt reminders</li>
              </ul>
              <button className="btn-pricing btn-pricing-solid" onClick={() => navigate("/dashboard")}>Get Growth →</button>
            </div>
            <div className="pricing-card reveal reveal-delay-2">
              <div className="pricing-tier">Business — Biashara</div>
              <div className="pricing-price">TSh 30,000 <span>/month</span></div>
              <div className="pricing-desc">For formal, growing SMEs with multiple staff.</div>
              <ul className="pricing-features">
                <li>Everything in Growth</li>
                <li>Full Akili AI chat + predictions</li>
                <li>VAT + SDL + PAYE + WHT dashboard</li>
                <li>Credit score + loan package</li>
                <li>Kenya KRA eTIMS</li>
                <li>Government data dashboard</li>
                <li>Multi-location (3 shops)</li>
                <li>5 user accounts</li>
              </ul>
              <button className="btn-pricing btn-pricing-outline" onClick={() => navigate("/dashboard")}>Get Business →</button>
            </div>
            <div className="pricing-card reveal reveal-delay-3">
              <div className="pricing-tier">Enterprise</div>
              <div className="pricing-price">Custom <span></span></div>
              <div className="pricing-desc">For chains, NGOs, and development programs.</div>
              <ul className="pricing-features">
                <li>Everything in Business</li>
                <li>API access</li>
                <li>White-label option</li>
                <li>Dedicated support</li>
                <li>Government data exports</li>
                <li>Custom integrations</li>
              </ul>
              <button className="btn-pricing btn-pricing-outline">Contact Us →</button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="final-cta" id="demo">
        <div className="container-narrow">
          <h2 className="reveal">Stop guessing.<br /><em>Start knowing.</em></h2>
          <p className="lead reveal reveal-delay-1">
            847 duka owners in Dar es Salaam are already using CREOVA. The ones who start today will be applying for loans while others are still counting change.
          </p>
          <div className="final-cta-actions reveal reveal-delay-2">
            <a href="#pricing" className="btn-primary btn-large">Anza Bure — Start Free <span className="arrow">→</span></a>
            <a href="mailto:hello@creova.co.tz" className="btn-ghost btn-large">Book a Demo</a>
          </div>
          <p className="pricing-note reveal reveal-delay-3">No credit card. No commitment. Cancel anytime. · Hakuna hatari.</p>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">PESA <span>DUKA</span></div>
              <div className="footer-tagline">The first Swahili-first financial operating system for East African shop owners. Built in Dar es Salaam. For everyone.</div>
            </div>
            <div>
              <div className="footer-heading">Product</div>
              <ul className="footer-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#how">How it Works</a></li>
                <li><a href="#demo">Demo</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-heading">Company</div>
              <ul className="footer-links">
                <li><a href="#">About CREOVA</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-heading">Support</div>
              <ul className="footer-links">
                <li><a href="#">Help Centre</a></li>
                <li><a href="mailto:hello@creova.co.tz">Contact Us</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">PDPA Statement</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-legal">© 2025 CREOVA Ltd · Dar es Salaam, Tanzania · BRELA Registered</div>
            <div className="footer-socials">
              <a href="#" className="social-icon">𝕏</a>
              <a href="#" className="social-icon">in</a>
              <a href="#" className="social-icon">ig</a>
              <a href="#" className="social-icon">yt</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
