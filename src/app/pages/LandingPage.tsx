import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import "../../styles/landing.css";

export function LandingPage() {
  const navigate = useNavigate();
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [swahili, setSwahili] = useState(false);
  const [heroEmail, setHeroEmail] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [calcStockouts, setCalcStockouts] = useState(3);
  const [calcLostPerStockout, setCalcLostPerStockout] = useState(3200);
  const [calcDebt, setCalcDebt] = useState(200000);
  const [calcHours, setCalcHours] = useState(2);

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
          <button
            onClick={() => navigate("/dashboard")}
            style={{ background: "transparent", border: "1.5px solid #E56B0A", color: "#E56B0A", borderRadius: "8px", padding: "8px 18px", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#E56B0A", e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent", e.currentTarget.style.color = "#E56B0A")}
          >
            Dashboard
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
            <div style={{ marginTop: "24px" }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={heroEmail}
                  onChange={e => setHeroEmail(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      if (!heroEmail.trim() || !heroEmail.includes("@")) { toast.error("Please enter a valid email address"); return; }
                      localStorage.setItem("lead_email", heroEmail.trim());
                      navigate("/dashboard");
                    }
                  }}
                  style={{ flex: 1, minWidth: "200px", padding: "13px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.08)", color: "#FAF8F5", fontSize: "14px", outline: "none", backdropFilter: "blur(4px)" }}
                />
                <button
                  onClick={() => {
                    if (!heroEmail.trim() || !heroEmail.includes("@")) { toast.error("Enter a valid email to start your free trial"); return; }
                    localStorage.setItem("lead_email", heroEmail.trim());
                    navigate("/dashboard");
                  }}
                  className="btn-primary btn-large"
                  style={{ whiteSpace: "nowrap" }}
                >
                  Start Free — 60 Days <span className="arrow">→</span>
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={async () => {
                    setDemoLoading(true);
                    localStorage.setItem("pesa_demo_mode", "true");
                    setTimeout(() => { setDemoLoading(false); navigate("/dashboard"); }, 800);
                  }}
                  style={{ background: "none", border: "1px solid rgba(255,255,255,.25)", color: "rgba(250,248,245,.8)", padding: "9px 18px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", transition: "all .2s" }}
                >
                  {demoLoading ? "⟳ Loading..." : "▶ Try Live Demo"}
                </button>
                <div style={{ fontSize: "12px", color: "rgba(250,248,245,.35)" }}>
                  No credit card · No TIN required · Cancel anytime
                </div>
              </div>
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

      {/* ══ FIX 1: TRUST BADGES ══ */}
      <div style={{ padding: "20px 0", background: "#FAF8F5", borderTop: "1px solid #e8e0d5", borderBottom: "1px solid #e8e0d5" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            {[
              { icon: "🏛️", label: "TRA EFD Certified", sub: "EFD Compliance System" },
              { icon: "📋", label: "BRELA Compliant", sub: "Business Registration" },
              { icon: "🏗️", label: "SIDO Partner", sub: "SME Development" },
              { icon: "🔒", label: "256-bit Encrypted", sub: "Bank-grade security" },
              { icon: "📱", label: "USSD *150*00#", sub: "Works on any phone" },
              { icon: "⚡", label: "98.9% Uptime", sub: "Always available" },
            ].map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", background: "#fff", borderRadius: "10px", border: "1px solid #e0d8ce", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                <span style={{ fontSize: "16px" }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#1a1208", lineHeight: 1 }}>{b.label}</div>
                  <div style={{ fontSize: "9px", color: "#9a8a78", marginTop: "2px" }}>{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ PAIN ══ */}
      <section className="pain" id="problem">
        <div className="container">
          <div className="section-label" style={{ color: "rgba(229,107,10,.7)" }}>The Problem</div>
          <h2>Most dukas run on<br /><em>notebooks and prayer.</em></h2>
          <p className="lead reveal" style={{ color: "rgba(250,248,245,.45)", marginTop: "16px" }}>
            17 million MSMEs across East Africa. 85% still tracking sales on paper. The average duka loses <strong style={{ color: "#E56B0A" }}>TSh 1.4M per year</strong> to invisible leaks — money they're earning but not keeping.
          </p>
          <div className="pain-grid">
            <div className="pain-card reveal">
              <div className="pain-stat">TSh 840K</div>
              <div className="pain-stat-label">lost to stockouts per year (3/week × TSh 3,200 avg sale × 52 weeks)</div>
              <div className="pain-icon">📦</div>
              <h3>Running out when customers arrive</h3>
              <p>No system tells you when to reorder. A customer walks in for unga, you're empty, they don't come back. That's not one lost sale — it's a lost customer.</p>
            </div>
            <div className="pain-card reveal reveal-delay-2">
              <div className="pain-stat">TSh 380K</div>
              <div className="pain-stat-label">average uncollected debt per duka — money already earned, never received</div>
              <div className="pain-icon">🏦</div>
              <h3>Customers who owe you are running your business</h3>
              <p>No records means debt goes untracked. Awkward reminders get ignored. Informal loans become gifts. And banks still won't lend you anything because you can't prove you're profitable.</p>
            </div>
            <div className="pain-card reveal reveal-delay-3">
              <div className="pain-stat">TSh 4M</div>
              <div className="pain-stat-label">maximum TRA fine — 12,000+ businesses audited in 2023 alone</div>
              <div className="pain-icon">🏛️</div>
              <h3>Compliance is a minefield with no map</h3>
              <p>EFD receipts. Z-Reports. VAT returns. PAYE. SDL. Most shop owners don't know what they're missing until TRA arrives. By then, the fine is already larger than a month of profit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FIX 2: LOSS CALCULATOR ══ */}
      <section style={{ padding: "80px 0", background: "#FAF8F5" }}>
        <div className="container">
          <div className="section-label reveal" style={{ color: "#E56B0A" }}>Your Duka's Leak Calculator</div>
          <h2 className="reveal">How much is your<br /><em>duka losing right now?</em></h2>
          <p className="lead reveal reveal-delay-1" style={{ marginTop: "12px", marginBottom: "40px" }}>Move the sliders to match your situation. See your actual annual loss in real time.</p>

          {(() => {
            const stockoutLoss = calcStockouts * calcLostPerStockout * 52;
            const debtLoss = Math.round(calcDebt * 0.35);
            const hoursLoss = calcHours * 365 * 4000;
            const total = stockoutLoss + debtLoss + hoursLoss;
            const pesaCost = 7500 * 12;
            const netSaving = total - pesaCost;

            return (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", maxWidth: "880px", margin: "0 auto" }}>
                <div style={{ background: "#fff", borderRadius: "20px", padding: "32px", border: "1px solid #e8e0d5", boxShadow: "0 4px 24px rgba(0,0,0,.06)" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "24px", color: "#1a1208" }}>📊 Tell us about your duka</h3>

                  {[
                    { label: "Stockouts per week", sublabel: "How often do you run out of stock?", value: calcStockouts, min: 0, max: 15, step: 1, unit: "/week", setter: setCalcStockouts },
                    { label: "Average sale lost per stockout", sublabel: "Estimated TSh value of a lost customer visit", value: calcLostPerStockout, min: 500, max: 15000, step: 500, unit: " TSh", setter: setCalcLostPerStockout },
                    { label: "Uncollected credit owed to you", sublabel: "Total debt customers haven't paid", value: calcDebt, min: 0, max: 2000000, step: 10000, unit: " TSh", setter: setCalcDebt },
                    { label: "Hours spent on bookkeeping per day", sublabel: "Time you spend on manual records", value: calcHours, min: 0.5, max: 6, step: 0.5, unit: "h/day", setter: setCalcHours },
                  ].map((item, i) => (
                    <div key={i} style={{ marginBottom: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                        <label style={{ fontSize: "13px", fontWeight: 700, color: "#1a1208" }}>{item.label}</label>
                        <span style={{ fontSize: "14px", fontWeight: 900, color: "#E56B0A" }}>{typeof item.value === "number" && item.value >= 1000 ? `TSh ${item.value.toLocaleString()}` : item.value}{item.unit.includes("TSh") ? "" : item.unit}</span>
                      </div>
                      <div style={{ fontSize: "10px", color: "#9a8a78", marginBottom: "8px" }}>{item.sublabel}</div>
                      <input type="range" min={item.min} max={item.max} step={item.step} value={item.value}
                        onChange={e => item.setter(parseFloat(e.target.value))}
                        style={{ width: "100%", accentColor: "#E56B0A", cursor: "pointer" }} />
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ background: "#1a1208", borderRadius: "20px", padding: "28px", color: "#FAF8F5", flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "rgba(250,248,245,.5)", marginBottom: "20px", textTransform: "uppercase", letterSpacing: ".6px" }}>Your annual loss estimate</div>
                    {[
                      { label: "Stock-out losses", value: stockoutLoss, icon: "📦" },
                      { label: "Uncollected debt (35%)", value: debtLoss, icon: "🏦" },
                      { label: "Owner time value", value: hoursLoss, icon: "⏱️" },
                    ].map((row, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
                        <span style={{ fontSize: "13px", color: "rgba(250,248,245,.65)" }}>{row.icon} {row.label}</span>
                        <span style={{ fontSize: "14px", fontWeight: 800, color: "#f87171" }}>TSh {row.value.toLocaleString()}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 0 0", marginTop: "4px" }}>
                      <span style={{ fontSize: "15px", fontWeight: 800 }}>Total annual loss</span>
                      <span style={{ fontSize: "22px", fontWeight: 900, color: "#f87171" }}>TSh {total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={{ background: "rgba(229,107,10,.08)", border: "2px solid rgba(229,107,10,.4)", borderRadius: "20px", padding: "24px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#E56B0A", marginBottom: "12px" }}>💡 What PESA DUKA saves you</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", color: "#5a4a3a" }}>Cost of Growth plan (year)</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#1a1208" }}>TSh {pesaCost.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(229,107,10,.2)", paddingTop: "12px", marginTop: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "#1a1208" }}>Net saving in year 1</span>
                      <span style={{ fontSize: "20px", fontWeight: 900, color: "#16a34a" }}>TSh {netSaving.toLocaleString()}</span>
                    </div>
                    <button onClick={() => navigate("/dashboard")} style={{ marginTop: "16px", width: "100%", padding: "12px", borderRadius: "12px", border: "none", background: "#E56B0A", color: "#fff", fontSize: "14px", fontWeight: 800, cursor: "pointer" }}>
                      Stop the losses — Start Free →
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ══ MARKET OPPORTUNITY ══ */}
      <section style={{ padding: "80px 0", background: "#FAF8F5" }}>
        <div className="container">
          <div className="section-label reveal" style={{ color: "#E56B0A" }}>The Opportunity</div>
          <h2 className="reveal">A $47B market.<br /><em>Zero great software.</em></h2>
          <p className="lead reveal reveal-delay-1" style={{ marginTop: "16px" }}>
            East Africa has the density, the mobile money rails, and the urgency. What it has never had is software built specifically for it.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginTop: "48px" }}>
            {[
              { stat: "17M", label: "MSMEs across East Africa", note: "Less than 4% using any digital business tool" },
              { stat: "85%", label: "Still tracking on paper or WhatsApp", note: "Losing revenue they can't even measure" },
              { stat: "$5.2T", label: "SME finance gap Sub-Saharan Africa", note: "Invisible businesses can't access bank credit" },
              { stat: "92%", label: "Mobile money penetration in Tanzania", note: "The payment rail already exists — we connect it" },
              { stat: "TSh 4M", label: "Max TRA EFD non-compliance fine", note: "12,000+ businesses audited in 2023 alone" },
              { stat: "8% p.a.", label: "East Africa GDP growth forecast", note: "Rising SME class — timing is exactly right" },
            ].map((item, i) => (
              <div key={i} className="reveal" style={{ background: "#fff", borderRadius: "16px", padding: "24px 20px", border: "1px solid #e8e0d5", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
                <div style={{ fontSize: "34px", fontWeight: 900, color: "#1a1208", fontFamily: "Georgia, serif", lineHeight: 1 }}>{item.stat}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1208", marginTop: "10px", lineHeight: 1.4 }}>{item.label}</div>
                <div style={{ fontSize: "11px", color: "#9a8a78", marginTop: "6px", lineHeight: 1.5 }}>{item.note}</div>
              </div>
            ))}
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
                  <div className="ba-label">Before PESA DUKA</div>
                  <div className="ba-item"><div className="ba-dot">✗</div><div>Paper notebook, pencil, eraser</div></div>
                  <div className="ba-item"><div className="ba-dot">✗</div><div>No idea which products are profitable</div></div>
                  <div className="ba-item"><div className="ba-dot">✗</div><div>Chase debt manually, awkward calls</div></div>
                  <div className="ba-item"><div className="ba-dot">✗</div><div>TRA visit = panic, scramble, fine</div></div>
                  <div className="ba-item"><div className="ba-dot">✗</div><div>Bank says no — no records</div></div>
                </div>
                <div className="ba-divider"><div className="ba-divider-circle">→</div></div>
                <div className="ba-col ba-after">
                  <div className="ba-label">After PESA DUKA</div>
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

      {/* ══ 10X COMPARISON ══ */}
      <section style={{ padding: "48px 0", background: "#FAF8F5", borderTop: "1px solid #e8e0d5" }}>
        <div className="container">
          <div className="section-label reveal" style={{ color: "#E56B0A" }}>The Math of Switching</div>
          <h2 className="reveal" style={{ marginBottom: "32px" }}>Time you get back.<br /><em>Every single day.</em></h2>
          <div style={{ overflowX: "auto" }} className="reveal">
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "14px", background: "#fff", borderRadius: "16px", overflow: "hidden", border: "1px solid #e8e0d5" }}>
              <thead>
                <tr style={{ background: "#1a1208", color: "#FAF8F5" }}>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontWeight: 700, fontSize: "12px" }}>Daily Task</th>
                  <th style={{ padding: "14px 20px", textAlign: "center", fontWeight: 700, fontSize: "12px", color: "rgba(250,248,245,.5)" }}>Manual / Paper</th>
                  <th style={{ padding: "14px 20px", textAlign: "center", fontWeight: 700, fontSize: "12px", color: "#E56B0A" }}>PESA DUKA</th>
                  <th style={{ padding: "14px 20px", textAlign: "center", fontWeight: 700, fontSize: "12px", color: "#22c55e" }}>Time Saved</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Daily mobile money reconciliation", "45 min", "0 min", "45 min/day"],
                  ["Issue 1 EFD-compliant receipt", "3–4 min", "4 seconds", "~3 min × every sale"],
                  ["Monthly VAT return filing", "8 hours", "2 taps", "8 hrs/month"],
                  ["Chase 1 overdue debt", "20 min call", "1 WhatsApp (auto)", "20 min/debtor"],
                  ["Reorder inventory alert", "Notice when empty", "Alert before empty", "Every stockout prevented"],
                  ["Loan application package", "Weeks of paperwork", "One tap", "Days to weeks"],
                ].map(([task, manual, fast, saved], i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#faf8f5", borderTop: "1px solid #f0ece6" }}>
                    <td style={{ padding: "12px 20px", fontWeight: 600, color: "#1a1208" }}>{task}</td>
                    <td style={{ padding: "12px 20px", textAlign: "center", color: "#dc2626", fontWeight: 500 }}>{manual}</td>
                    <td style={{ padding: "12px 20px", textAlign: "center", color: "#16a34a", fontWeight: 700, background: "rgba(34,197,94,.04)" }}>{fast}</td>
                    <td style={{ padding: "12px 20px", textAlign: "center", color: "#E56B0A", fontWeight: 700, fontSize: "13px" }}>{saved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="reveal" style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", color: "#7a6a5a" }}>
            A typical duka owner reclaims <strong style={{ color: "#1a1208" }}>3+ hours per day</strong> in the first week. That's time with family, or time to open a second shop.
          </p>
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
              <a href="#pricing" className="btn-primary">Try Akili Now →</a>
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

      {/* ══ WHY NOW ══ */}
      <section style={{ padding: "80px 0", background: "#1a1208", color: "#FAF8F5" }}>
        <div className="container">
          <div className="section-label reveal" style={{ color: "rgba(229,107,10,.7)" }}>Why Now?</div>
          <h2 className="reveal" style={{ color: "#FAF8F5" }}>Five things just changed.<br /><em style={{ color: "#E56B0A" }}>All at once.</em></h2>
          <p className="lead reveal reveal-delay-1" style={{ color: "rgba(250,248,245,.55)", marginTop: "16px" }}>
            This wasn't buildable 5 years ago. The market wasn't ready. Now five converging forces make this the only moment to move.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginTop: "48px" }}>
            {[
              {
                year: "2023",
                icon: "🏛️",
                title: "TRA enforcement went from warning to fines",
                body: "TRA conducted 12,000+ EFD audits in 2023 — up from near zero in 2020. Penalties now reach TSh 4M. Every duka owner now has a deadline, not a suggestion.",
              },
              {
                year: "2022",
                icon: "📱",
                title: "All four mobile money APIs opened to developers",
                body: "M-Pesa, Airtel, Tigo, and HaloPesa all opened developer APIs between 2021–2023. For the first time, a single app can reconcile all four. This was impossible before.",
              },
              {
                year: "2023",
                icon: "🏢",
                title: "BRELA launched fully digital registration",
                body: "BRELA ORS (Online Registration System) went live in 2023. Business registration no longer requires 7 trips to a government office. PESA DUKA automates the whole flow in-app.",
              },
              {
                year: "2024",
                icon: "🤖",
                title: "AI in Swahili became affordable",
                body: "Foundation models made Swahili NLP cost-effective for the first time. Akili, our AI advisor, can now run at under $0.001 per conversation — viable at TSh 7,500/month pricing.",
              },
              {
                year: "2024",
                icon: "🇰🇪",
                title: "Kenya mandated KRA eTIMS for all businesses",
                body: "Kenya's mandatory e-invoicing (eTIMS) rolled out to all businesses in 2024. The same regulatory forcing function that hit Tanzania is now hitting East Africa's largest economy.",
              },
            ].map((item, i) => (
              <div key={i} className="reveal" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "16px", padding: "24px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "16px", right: "16px", fontSize: "11px", fontWeight: 800, color: "#E56B0A", background: "rgba(229,107,10,.12)", padding: "3px 10px", borderRadius: "20px", letterSpacing: ".5px" }}>{item.year}</div>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{item.icon}</div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#FAF8F5", lineHeight: 1.3, marginBottom: "10px" }}>{item.title}</div>
                <div style={{ fontSize: "13px", color: "rgba(250,248,245,.5)", lineHeight: 1.6 }}>{item.body}</div>
              </div>
            ))}
          </div>
          <div className="reveal" style={{ marginTop: "40px", background: "rgba(229,107,10,.1)", border: "1px solid rgba(229,107,10,.25)", borderRadius: "16px", padding: "24px 28px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <div style={{ fontSize: "32px" }}>⏰</div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#FAF8F5" }}>The window is now — and it won't wait.</div>
              <div style={{ fontSize: "13px", color: "rgba(250,248,245,.55)", marginTop: "4px" }}>Regulatory pressure, infrastructure maturity, and AI cost curves are all hitting the same inflection point. The category is being created in real time.</div>
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
              <div className="testi-quote">"I applied for a CRDB loan with the package PESA DUKA generated for me. Approved in 2 weeks. That would have taken months before."</div>
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

      {/* ══ TRACTION ══ */}
      <section className="metrics">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div className="section-label reveal" style={{ color: "rgba(229,107,10,.7)", display: "inline-block" }}>Early Traction</div>
            <h2 className="reveal" style={{ color: "#FAF8F5", marginTop: "8px" }}>Proof before pitch.<br /><em>Numbers before narrative.</em></h2>
          </div>
          <div className="metrics-grid">
            <div className="metric reveal">
              <div className="metric-num">847</div>
              <div className="metric-label">Active shops onboarded · <strong>TSh 0 in paid marketing</strong></div>
            </div>
            <div className="metric reveal reveal-delay-1">
              <div className="metric-num">TSh 1.28B</div>
              <div className="metric-label">Revenue processed monthly · every transaction verified</div>
            </div>
            <div className="metric reveal reveal-delay-2">
              <div className="metric-num">98%</div>
              <div className="metric-label">EFD compliance rate · vs ~30% Tanzania national average</div>
            </div>
            <div className="metric reveal reveal-delay-3">
              <div className="metric-num">68%</div>
              <div className="metric-label">Shops formally registered · up from &lt;5% at signup</div>
            </div>
          </div>
          <div className="reveal" style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            {[
              { num: "4.9★", label: "Average rating from shop owners", sub: "Based on in-app feedback" },
              { num: "91%", label: "30-day retention rate", sub: "Compliance tools are sticky" },
              { num: "TSh 680K", label: "Avg debt collected in first month", sub: "Via WhatsApp reminder feature" },
              { num: "12 min", label: "Avg time to first EFD receipt", sub: "From signup to compliant" },
            ].map((item, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "14px", padding: "18px 20px" }}>
                <div style={{ fontSize: "26px", fontWeight: 900, color: "#E56B0A", fontFamily: "Georgia, serif" }}>{item.num}</div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#FAF8F5", marginTop: "6px", lineHeight: 1.4 }}>{item.label}</div>
                <div style={{ fontSize: "10px", color: "rgba(250,248,245,.4)", marginTop: "3px" }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GROWTH FLYWHEEL ══ */}
      <section style={{ padding: "80px 0", background: "#fff" }}>
        <div className="container">
          <div className="section-label reveal" style={{ color: "#E56B0A" }}>Distribution</div>
          <h2 className="reveal">We don't buy customers.<br /><em>The law sends them to us.</em></h2>
          <p className="lead reveal reveal-delay-1" style={{ marginTop: "16px" }}>
            TRA enforcement is our acquisition engine. Every duka owner facing an EFD audit searches for the fastest path to compliance. That path is PESA DUKA.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginTop: "48px" }}>
            {[
              {
                step: "01",
                icon: "🏛️",
                color: "#ef4444",
                title: "TRA audit forces the decision",
                body: "A shop owner receives an EFD notice or hears about a neighbor's fine. The pain is acute and the timeline is immediate. They search for a solution today.",
              },
              {
                step: "02",
                icon: "📲",
                color: "#E56B0A",
                title: "PESA DUKA is the easiest path",
                body: "We're the only app that handles EFD compliance, BRELA registration, and mobile money reconciliation together. Competitors require multiple tools and English literacy.",
              },
              {
                step: "03",
                icon: "🧾",
                color: "#7c3aed",
                title: "Receipts spread the brand",
                body: "Every EFD receipt generated carries PESA DUKA branding. A busy duka issues 50–200 receipts a day. Customers, suppliers, and other shop owners all see it.",
              },
              {
                step: "04",
                icon: "👥",
                color: "#22c55e",
                title: "Market communities amplify",
                body: "Dukas cluster in markets. One shop owner adopts, their neighbors ask. WhatsApp market groups discuss it. A single market can generate 30–50 organic sign-ups per month.",
              },
            ].map((item, i) => (
              <div key={i} className="reveal" style={{ background: "#faf8f5", borderRadius: "16px", padding: "28px 24px", border: "1px solid #e8e0d5", position: "relative" }}>
                <div style={{ fontSize: "11px", fontWeight: 900, color: item.color, letterSpacing: "1px", marginBottom: "12px" }}>STEP {item.step}</div>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{item.icon}</div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#1a1208", lineHeight: 1.3, marginBottom: "10px" }}>{item.title}</div>
                <div style={{ fontSize: "13px", color: "#7a6a5a", lineHeight: 1.6 }}>{item.body}</div>
              </div>
            ))}
          </div>

          {/* Secondary distribution channels */}
          <div className="reveal" style={{ marginTop: "40px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#9a8a78", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: "16px" }}>Additional channels</div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {[
                { label: "Tax agents (wakala wa kodi)", note: "4,000+ licensed in Tanzania — they advise SMEs on compliance daily" },
                { label: "SIDO & BRELA partnerships", note: "Government agencies actively training SMEs on formalization" },
                { label: "Mobile money operators", note: "M-Pesa & Airtel exploring PESA DUKA as bundled business offering" },
                { label: "CRDB & NMB Biashara", note: "Banks refer clients who need financial records for loan applications" },
              ].map((ch, i) => (
                <div key={i} style={{ background: "#faf8f5", border: "1px solid #e8e0d5", borderRadius: "12px", padding: "14px 18px", flex: "1", minWidth: "200px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1208", marginBottom: "4px" }}>{ch.label}</div>
                  <div style={{ fontSize: "11px", color: "#9a8a78", lineHeight: 1.5 }}>{ch.note}</div>
                </div>
              ))}
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

      {/* ══ COMPETITIVE DIFFERENTIATION ══ */}
      <section style={{ padding: "80px 0", background: "#FAF8F5" }}>
        <div className="container">
          <div className="section-label reveal" style={{ color: "#E56B0A" }}>Why Not The Others?</div>
          <h2 className="reveal">Every alternative fails<br />East Africa <em>in a different way.</em></h2>
          <p className="lead reveal reveal-delay-1" style={{ marginTop: "16px" }}>We spoke to 200 duka owners who tried existing tools. Here's exactly why they stopped.</p>
          <div style={{ overflowX: "auto", marginTop: "48px" }} className="reveal">
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: "13px", background: "#fff", borderRadius: "16px", overflow: "hidden", border: "1px solid #e8e0d5", boxShadow: "0 4px 16px rgba(0,0,0,.05)" }}>
              <thead>
                <tr style={{ background: "#1a1208", color: "#FAF8F5" }}>
                  <th style={{ padding: "14px 18px", textAlign: "left", fontWeight: 700, fontSize: "12px" }}>Feature</th>
                  {["PESA DUKA", "QuickBooks", "Paper / Excel", "Biashara360"].map(name => (
                    <th key={name} style={{ padding: "14px 18px", textAlign: "center", fontWeight: 700, fontSize: "12px", color: name === "PESA DUKA" ? "#E56B0A" : "rgba(250,248,245,.6)" }}>{name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Swahili-first UI", "✅ Native", "❌ English only", "❌ None", "⚠️ Partial"],
                  ["M-Pesa / Airtel / Tigo reconciliation", "✅ Automatic", "❌ Manual import", "❌ Manual", "⚠️ M-Pesa only"],
                  ["TRA EFD compliance built-in", "✅ Certified", "❌ Not supported", "❌ None", "⚠️ Add-on extra"],
                  ["Works on feature phones (USSD)", "✅ *150*00#", "❌ Smartphone only", "✅ (paper)", "❌ App only"],
                  ["Credit score → loan package", "✅ Automated", "❌ None", "❌ None", "❌ None"],
                  ["Price (per month)", "TSh 7,500", "TSh 45,000+", "Free (hidden cost)", "TSh 25,000"],
                  ["AI advisor in Swahili", "✅ Akili", "❌ None", "❌ None", "❌ None"],
                  ["BRELA registration in-app", "✅ Guided", "❌ None", "❌ None", "⚠️ Partial"],
                  ["Offline mode", "✅ Full", "⚠️ Limited", "✅ Always", "❌ Needs internet"],
                ].map(([feature, ...values], i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#faf8f5", borderTop: "1px solid #f0ece6" }}>
                    <td style={{ padding: "12px 18px", fontWeight: 600, color: "#1a1208" }}>{feature}</td>
                    {values.map((val, j) => (
                      <td key={j} style={{ padding: "12px 18px", textAlign: "center", color: j === 0 ? "#16a34a" : val.startsWith("❌") ? "#dc2626" : val.startsWith("⚠️") ? "#d97706" : "#374151", fontWeight: j === 0 ? 700 : 500, background: j === 0 ? "rgba(229,107,10,.04)" : "transparent" }}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="reveal" style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#9a8a78" }}>
            Based on interviews with 200 duka owners in Dar es Salaam, Arusha, and Mwanza · 2024–2025
          </p>
        </div>
      </section>

      {/* ══ DATA MOAT ══ */}
      <section style={{ padding: "80px 0", background: "#1a1208" }}>
        <div className="container">
          <div className="section-label reveal" style={{ color: "rgba(229,107,10,.7)" }}>The Moat</div>
          <h2 className="reveal" style={{ color: "#FAF8F5" }}>After 6 months, PESA DUKA<br /><em style={{ color: "#E56B0A" }}>knows things no one else can.</em></h2>
          <p className="lead reveal reveal-delay-1" style={{ color: "rgba(250,248,245,.55)", marginTop: "16px" }}>
            Every transaction, every stockout, every debt — we see it all. That data compounds into an advantage no competitor can replicate by copying our features.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginTop: "48px" }}>
            {[
              { icon: "📊", title: "Hyper-local demand intelligence", body: "We know what sells in Kariakoo vs Kinondoni vs Mbagala — by day, by weather, by event. Our inventory alerts get smarter as more shops in each market join." },
              { icon: "💳", title: "Credit scoring the banks can't do", body: "Tanzania's credit bureaus cover less than 10% of the adult population. We build credit scores from real transaction history — making lendable businesses visible for the first time." },
              { icon: "🤝", title: "Supplier price benchmarks", body: "When 500 shops are ordering the same products, we can tell each shop whether they're paying above or below market price for every item they stock." },
              { icon: "🔮", title: "Predictions that only get better", body: "Akili's revenue forecasts improve as more transaction history accumulates. A shop using PESA DUKA for 12 months gets predictions that are 40% more accurate than at month 1." },
            ].map((item, i) => (
              <div key={i} className="reveal" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ fontSize: "28px", marginBottom: "14px" }}>{item.icon}</div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#FAF8F5", lineHeight: 1.3, marginBottom: "10px" }}>{item.title}</div>
                <div style={{ fontSize: "13px", color: "rgba(250,248,245,.5)", lineHeight: 1.6 }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ UNIT ECONOMICS ══ */}
      <section style={{ padding: "80px 0", background: "#fff" }}>
        <div className="container">
          <div className="section-label reveal" style={{ color: "#E56B0A" }}>Business Model</div>
          <h2 className="reveal">The unit economics<br /><em>every investor asks for.</em></h2>
          <p className="lead reveal reveal-delay-1" style={{ marginTop: "16px" }}>Compliance-driven acquisition means near-zero CAC. A sticky product means long retention. The math is unusually clean.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px", marginTop: "48px" }}>
            <div className="reveal">
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#9a8a78", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: "20px" }}>Per Customer</div>
              {[
                { label: "Customer Acquisition Cost (CAC)", value: "$3", note: "TRA compliance-driven — not paid ads", highlight: false },
                { label: "Monthly Revenue (Growth plan)", value: "$3 / mo", note: "TSh 7,500 — less than a bag of flour", highlight: false },
                { label: "Avg Retention", value: "24 months", note: "Compliance tools don't get cancelled", highlight: false },
                { label: "Lifetime Value (LTV)", value: "$70", note: "$3 × 24 months", highlight: true },
                { label: "LTV : CAC Ratio", value: "23 : 1", note: "World-class for B2SMB SaaS", highlight: true },
                { label: "Payback Period", value: "1 month", note: "Month 2 onwards is pure profit", highlight: false },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f0ece6" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a1208" }}>{row.label}</div>
                    <div style={{ fontSize: "11px", color: "#9a8a78", marginTop: "2px" }}>{row.note}</div>
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 900, color: row.highlight ? "#E56B0A" : "#1a1208", fontFamily: "Georgia, serif", flexShrink: 0, marginLeft: "16px" }}>{row.value}</div>
                </div>
              ))}
            </div>
            <div className="reveal">
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#9a8a78", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: "20px" }}>At Scale</div>
              {[
                { label: "Tanzania addressable market", value: "3M shops", note: "Registered businesses + informal sector" },
                { label: "1% Tanzania penetration", value: "$9M ARR", note: "30,000 shops × $3/mo × 12" },
                { label: "Kenya + Tanzania (1%)", value: "$25M ARR", note: "Kenya adds 8M+ SMEs — same regulatory pull" },
                { label: "East Africa 4-country (1%)", value: "$72M ARR", note: "Tanzania + Kenya + Uganda + Rwanda" },
                { label: "5% EAC penetration", value: "$360M ARR", note: "Conservative given regulatory forcing function" },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f0ece6" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a1208" }}>{row.label}</div>
                    <div style={{ fontSize: "11px", color: "#9a8a78", marginTop: "2px" }}>{row.note}</div>
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 900, color: "#1a1208", fontFamily: "Georgia, serif", flexShrink: 0, marginLeft: "16px" }}>{row.value}</div>
                </div>
              ))}
              <div style={{ background: "rgba(229,107,10,.08)", border: "1px solid rgba(229,107,10,.2)", borderRadius: "12px", padding: "16px", marginTop: "16px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#E56B0A", marginBottom: "4px" }}>The ceiling</div>
                <div style={{ fontSize: "13px", color: "#5a4a3a", lineHeight: 1.5 }}>200M MSMEs in Sub-Saharan Africa. If PESA DUKA becomes the East African standard and expands south — this is a $1B+ ARR business. We don't need to get there to be a great outcome.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section className="pricing" id="pricing">
        <div className="container">
          <div className="section-label reveal">Pricing</div>
          <h2 className="reveal">Less than a cup of tea.<br /><em>Every day.</em></h2>
          <p className="lead reveal reveal-delay-1">Start with every core feature. Upgrade when your business grows. Cancel anytime. No contracts, no tricks.</p>

          {/* Fix 7: Annual/Monthly toggle */}
          <div className="reveal" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", margin: "24px 0 8px" }}>
            <span style={{ fontSize: "14px", fontWeight: billingAnnual ? 500 : 800, color: billingAnnual ? "#9a8a78" : "#1a1208" }}>Monthly</span>
            <button
              onClick={() => setBillingAnnual(b => !b)}
              style={{ width: "52px", height: "28px", borderRadius: "14px", background: billingAnnual ? "#E56B0A" : "#d4c9bb", border: "none", cursor: "pointer", position: "relative", transition: "background .25s" }}
            >
              <div style={{ position: "absolute", top: "4px", left: billingAnnual ? "26px" : "4px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff", transition: "left .25s", boxShadow: "0 1px 4px rgba(0,0,0,.2)" }} />
            </button>
            <span style={{ fontSize: "14px", fontWeight: billingAnnual ? 800 : 500, color: billingAnnual ? "#1a1208" : "#9a8a78" }}>Annual</span>
            {billingAnnual && (
              <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 10px", borderRadius: "20px", background: "rgba(22,163,74,.12)", color: "#16a34a", border: "1px solid rgba(22,163,74,.25)" }}>Save 20%</span>
            )}
          </div>
          {billingAnnual && (
            <p className="reveal" style={{ textAlign: "center", fontSize: "12px", color: "#9a8a78", marginBottom: "8px" }}>Prices shown as monthly equivalent, billed once per year.</p>
          )}

          <div className="pricing-grid">
            <div className="pricing-card reveal">
              <div className="pricing-tier">Starter — Mwanzo</div>
              <div className="pricing-price">TSh 0 <span>/month</span></div>
              <div className="pricing-desc">Try every core feature free for 60 days. No credit card required.</div>
              <ul className="pricing-features">
                <li>POS with EFD receipts</li>
                <li>Inventory tracking</li>
                <li>Basic cashbook</li>
                <li>BRELA registration guide</li>
                <li>TAN-QR payment display</li>
                <li>25 invoices/month</li>
              </ul>
              <button className="btn-pricing btn-pricing-outline" onClick={() => navigate("/dashboard")}>Get Started →</button>
            </div>
            <div className="pricing-card featured reveal reveal-delay-1">
              <div className="featured-badge">Most Popular</div>
              <div className="pricing-tier" style={{ color: "rgba(250,248,245,.4)" }}>Growth — Ukuaji</div>
              <div className="pricing-price" style={{ color: "#FAF8F5" }}>TSh {billingAnnual ? "6,000" : "7,500"} <span style={{ color: "rgba(250,248,245,.4)" }}>/month</span></div>
              {billingAnnual && <div style={{ fontSize: "11px", color: "rgba(22,163,74,.9)", fontWeight: 700, marginBottom: "4px" }}>TSh 72,000 billed annually · Save TSh 18,000/year</div>}
              <div className="pricing-desc" style={{ color: "rgba(250,248,245,.5)" }}>For shops ready to go formal. Under TSh {billingAnnual ? "200" : "250"}/day.</div>
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
              <div className="pricing-price">TSh {billingAnnual ? "24,000" : "30,000"} <span>/month</span></div>
              {billingAnnual && <div style={{ fontSize: "11px", color: "#16a34a", fontWeight: 700, marginBottom: "4px" }}>TSh 288,000 billed annually · Save TSh 72,000/year</div>}
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

      {/* ══ VISION ══ */}
      <section style={{ padding: "80px 0", background: "#1a1208" }}>
        <div className="container">
          <div className="section-label reveal" style={{ color: "rgba(229,107,10,.7)" }}>The Vision</div>
          <h2 className="reveal" style={{ color: "#FAF8F5" }}>Tanzania is the proof.<br /><em style={{ color: "#E56B0A" }}>East Africa is the prize.</em></h2>
          <p className="lead reveal reveal-delay-1" style={{ color: "rgba(250,248,245,.55)", marginTop: "16px" }}>
            We're not building a Tanzanian app. We're building the financial operating system for African small business. Tanzania is where we prove it works.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0", marginTop: "48px", background: "rgba(255,255,255,.04)", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
            {[
              { phase: "Phase 1", timeline: "2024–2025", flag: "🇹🇿", market: "Dar es Salaam", target: "10,000 shops", milestone: "Prove product-market fit. 91% retention. TSh 0 CAC via compliance pull.", color: "#E56B0A", active: true },
              { phase: "Phase 2", timeline: "2025–2026", flag: "🇹🇿🇰🇪", market: "Tanzania + Nairobi", target: "100,000 shops", milestone: "Same regulatory playbook in Kenya. KRA eTIMS mandate is our Nairobi entry.", color: "#7c3aed", active: false },
              { phase: "Phase 3", timeline: "2026–2027", flag: "🌍", market: "EAC (UG + RW + ET)", target: "500,000 shops", milestone: "East African Community trade integration creates shared compliance needs.", color: "#3b82f6", active: false },
              { phase: "Phase 4", timeline: "2028+", flag: "🌍", market: "Sub-Saharan Africa", target: "2M+ shops", milestone: "200M MSMEs. One operating system. Built in Dar es Salaam, for everyone.", color: "#22c55e", active: false },
            ].map((item, i) => (
              <div key={i} className="reveal" style={{ padding: "28px 24px", borderRight: i < 3 ? "1px solid rgba(255,255,255,.08)" : "none", borderBottom: "none", position: "relative" }}>
                {item.active && <div style={{ position: "absolute", top: "16px", right: "16px", fontSize: "10px", fontWeight: 800, color: "#E56B0A", background: "rgba(229,107,10,.15)", padding: "3px 10px", borderRadius: "20px", letterSpacing: ".5px" }}>NOW</div>}
                <div style={{ fontSize: "10px", fontWeight: 800, color: item.color, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>{item.phase} · {item.timeline}</div>
                <div style={{ fontSize: "20px", marginBottom: "8px" }}>{item.flag}</div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#FAF8F5", marginBottom: "4px" }}>{item.market}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: item.color, marginBottom: "10px" }}>{item.target}</div>
                <div style={{ fontSize: "12px", color: "rgba(250,248,245,.45)", lineHeight: 1.5 }}>{item.milestone}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="final-cta" id="demo">
        <div className="container-narrow">
          <h2 className="reveal">Stop guessing.<br /><em>Start knowing.</em></h2>
          <p className="lead reveal reveal-delay-1">
            847 duka owners in Dar es Salaam are already using PESA DUKA. The ones who start today will be applying for business loans while others are still counting change in a notebook.
          </p>
          <div className="reveal reveal-delay-2" style={{ maxWidth: "480px", margin: "32px auto 0" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={heroEmail}
                onChange={e => setHeroEmail(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    if (!heroEmail.trim() || !heroEmail.includes("@")) { toast.error("Please enter a valid email address"); return; }
                    localStorage.setItem("lead_email", heroEmail.trim());
                    navigate("/dashboard");
                  }
                }}
                style={{ flex: 1, padding: "13px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.08)", color: "#FAF8F5", fontSize: "14px", outline: "none" }}
              />
              <button
                onClick={() => {
                  if (!heroEmail.trim() || !heroEmail.includes("@")) { toast.error("Enter a valid email to start"); return; }
                  localStorage.setItem("lead_email", heroEmail.trim());
                  navigate("/dashboard");
                }}
                className="btn-primary"
                style={{ whiteSpace: "nowrap", padding: "13px 20px" }}
              >
                Anza Leo →
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
              <button
                onClick={() => { setDemoLoading(true); localStorage.setItem("pesa_demo_mode", "true"); setTimeout(() => { setDemoLoading(false); navigate("/dashboard"); }, 600); }}
                style={{ background: "none", border: "1px solid rgba(255,255,255,.2)", color: "rgba(250,248,245,.7)", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
              >
                {demoLoading ? "Loading..." : "▶ Try Live Demo first"}
              </button>
            </div>
          </div>
          <p className="pricing-note reveal reveal-delay-3" style={{ marginTop: "16px" }}>60-day free trial · No credit card · No TIN required · Hakuna hatari.</p>
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
                <li><a href="#">About PESA DUKA</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-heading">Support</div>
              <ul className="footer-links">
                <li><a href="#">Help Centre</a></li>
                <li><a href="mailto:hello@pesaduka.co.tz">Contact Us</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">PDPA Statement</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-legal">© 2025 PESA DUKA Ltd · Dar es Salaam, Tanzania · BRELA Registered</div>
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
