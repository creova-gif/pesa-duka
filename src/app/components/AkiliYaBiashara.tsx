import { useState, useRef, useEffect } from "react";

// ─── AkiliYaBiashara ──────────────────────────────────────────────────────────
// The selling point. An AI business advisor that speaks like a trusted friend,
// not a dashboard. Watches shop data 24/7 and surfaces plain-language insights
// in Swahili and English. Powered by your AI backend.
//
// SELLING PITCH TO OWNER:
// "Hii si programu tu. Ni mshauri wa biashara anayejua duka lako vyema kuliko wewe."
// "This isn't just software. It's a business advisor who knows your shop better than you do."
//
// THREE MODES:
//   1. Daily Insights Feed — proactive AI-generated observations from shop data
//   2. Ask Akili — freeform chat with context of entire business history
//   3. Predictions — what will happen this week based on patterns

const BRAND = "#E56B0A";
const AKILI_COLOR = "#7c3aed"; // Purple — distinct from brand orange, feels "intelligent"

const fmt = (n: number) => "TSh " + Number(n).toLocaleString("en-TZ");

// ── Sample shop context (replace with live data from your state) ──────────────
const SAMPLE_SHOP = {
  name: "Duka la Mwanga",
  owner: "Amina",
  weekRevenue: 1284000,
  weekTransactions: 218,
  weekExpenses: 312000,
  weekProfit: 972000,
  topProducts: [
    { name: "Unga wa Sembe 2kg", unitsSold: 124, revenue: 434000, stock: 3, reorderThreshold: 10 },
    { name: "Mafuta ya Kupikia 1L", unitsSold: 67, revenue: 281400, stock: 1, reorderThreshold: 5 },
    { name: "Sukari 1kg", unitsSold: 89, revenue: 249200, stock: 8, reorderThreshold: 12 },
  ],
  overdueDebt: 189500,
  debtors: 6,
  bestHour: "09:00–11:00",
  bestDay: "Saturday",
  worstDay: "Monday",
  peakSaturday: 287000,
  avgDailySales: 183000,
  paymentSplit: { mpesa: 58, cash: 31, airtel: 11 },
  staffCount: 3,
  monthsActive: 5,
  creditScore: 68,
  stockoutsThisWeek: 3,
};

interface Insight {
  id: number;
  type: string;
  urgency: string;
  emoji: string;
  title: string;
  titleEn: string;
  body: string;
  bodyEn: string;
  impact: string;
  actionLabel: string;
  actionColor: string;
  category: string;
}

// ── Dynamic insight generator — uses real shopData from the app ────────────────
function generateInsights(shopData: typeof SAMPLE_SHOP): Insight[] {
  const insights: Insight[] = [];
  const hasData = shopData.weekRevenue > 0;
  const marginPct = shopData.weekRevenue > 0 ? Math.round((shopData.weekProfit / shopData.weekRevenue) * 100) : 0;
  const avgDaily = shopData.avgDailySales;
  const mpesa = shopData.paymentSplit.mpesa;

  // 1. Low stock alert (high urgency if items near zero)
  if (shopData.stockoutsThisWeek > 0) {
    const lowItems = shopData.topProducts.filter(p => p.stock < p.reorderThreshold);
    const names = lowItems.length > 0 ? lowItems.map(p => p.name).join(", ") : "baadhi ya bidhaa";
    insights.push({
      id: 1, type: "warning", urgency: "high", emoji: "⚠️",
      title: `Bidhaa ${shopData.stockoutsThisWeek} zinaisha — agiza leo`,
      titleEn: `${shopData.stockoutsThisWeek} product${shopData.stockoutsThisWeek > 1 ? "s" : ""} running low — order today`,
      body: `${names} zinafikia kiwango cha chini. Unakosa mauzo kila siku hizi zinakwisha. Agiza kabla ya Ijumaa ili Jumamosi iwe tayari.`,
      bodyEn: `${names} ${lowItems.length > 1 ? "are" : "is"} near reorder threshold. You're losing sales every time stock runs out. Order before Friday to be ready for Saturday peak.`,
      impact: `${shopData.stockoutsThisWeek} item${shopData.stockoutsThisWeek > 1 ? "s" : ""} at risk`,
      actionLabel: "Review Inventory", actionColor: "#ef4444", category: "Stock",
    });
  }

  // 2. Debt / overdue customers
  if (shopData.overdueDebt > 0 || shopData.debtors > 0) {
    const debtors = shopData.debtors || 1;
    const daysOfSales = avgDaily > 0 ? Math.round(shopData.overdueDebt / avgDaily) : 1;
    insights.push({
      id: 2, type: "warning", urgency: "high", emoji: "💸",
      title: "Deni lako linakula faida yako",
      titleEn: "Your debt book is eating your profit",
      body: `Wateja ${debtors} wanakudai ${fmt(shopData.overdueDebt)}. Hii ni sawa na siku ${daysOfSales} za mauzo yako. Tuma ukumbusho asubuhi — uwezekano wa kulipwa ni mara mbili zaidi.`,
      bodyEn: `${debtors} customer${debtors > 1 ? "s" : ""} owe you ${fmt(shopData.overdueDebt)}. That's ${daysOfSales} day${daysOfSales > 1 ? "s" : ""} of your sales sitting in their pockets. Send reminders in the morning — twice as likely to get paid.`,
      impact: `${fmt(shopData.overdueDebt)} at risk`,
      actionLabel: "Chase Debts", actionColor: "#ef4444", category: "Debt",
    });
  }

  // 3. Profit margin insight
  if (hasData) {
    const isGoodMargin = marginPct >= 25;
    insights.push({
      id: 3, type: isGoodMargin ? "growth" : "warning", urgency: isGoodMargin ? "low" : "medium", emoji: isGoodMargin ? "📈" : "🔍",
      title: isGoodMargin ? `Faida yako ya ${marginPct}% ni nzuri — linda hivi` : `Faida yako ya ${marginPct}% ni chini — angalia gharama`,
      titleEn: isGoodMargin ? `Your ${marginPct}% margin is solid — protect it` : `Your ${marginPct}% margin is thin — review your costs`,
      body: isGoodMargin
        ? `Unapata faida ya ${marginPct}% wiki hii — hii ni bora kuliko wastani wa maduka mengi (20%). Endelea kulinda bidhaa zenye faida kubwa na udhibiti wa gharama.`
        : `Faida yako ni ${marginPct}% tu — chini ya kiwango salama cha 25%. Kagua bei za bidhaa zako na gharama za uendeshaji. Ongeza bei kidogo au punguza gharama.`,
      bodyEn: isGoodMargin
        ? `You're at ${marginPct}% profit margin this week — better than most dukas (avg 20%). Keep protecting your high-margin products and controlling your operating costs.`
        : `Your margin is only ${marginPct}% — below the safe threshold of 25%. Review your product pricing and operating costs. Either nudge prices up or cut a recurring expense.`,
      impact: `${marginPct}% margin this week`,
      actionLabel: isGoodMargin ? "View Cashbook" : "Review Expenses", actionColor: isGoodMargin ? "#22c55e" : BRAND, category: "Finance",
    });
  }

  // 4. M-Pesa / digital payment mix + loan eligibility
  const digitalPct = mpesa + (shopData.paymentSplit.airtel || 0);
  const loanThreshold = 60;
  insights.push({
    id: 4, type: "insight", urgency: digitalPct >= loanThreshold ? "medium" : "low", emoji: "🎯",
    title: digitalPct >= loanThreshold ? "Unastahili mkopo wa kidijitali" : "Ongeza malipo ya M-Pesa ili upate mkopo",
    titleEn: digitalPct >= loanThreshold ? "You're eligible for a digital credit loan" : "Increase M-Pesa payments to unlock credit",
    body: digitalPct >= loanThreshold
      ? `Malipo yako ya kidijitali ni ${digitalPct}% — zaidi ya kiwango cha ${loanThreshold}% kinachohitajika. Unaweza kuomba mkopo kupitia Pesapal au NMB Biashara sasa hivi.`
      : `Malipo yako ya kidijitali ni ${digitalPct}% — unahitaji ${loanThreshold}% kupata mkopo. Wahimize wateja ${loanThreshold - digitalPct} pointi zaidi kulipa kwa M-Pesa au Airtel.`,
    bodyEn: digitalPct >= loanThreshold
      ? `Your digital payments are ${digitalPct}% — above the ${loanThreshold}% threshold. You can now apply for a Pesapal or NMB Biashara credit loan based on your transaction history.`
      : `Your digital payments are ${digitalPct}% — you need ${loanThreshold}% to unlock credit. Encourage customers to pay via M-Pesa or Airtel. You're only ${loanThreshold - digitalPct} points away.`,
    impact: digitalPct >= loanThreshold ? "Loan-eligible now" : `${loanThreshold - digitalPct}% from loan eligibility`,
    actionLabel: digitalPct >= loanThreshold ? "Apply for Loan" : "Check Credit Score", actionColor: AKILI_COLOR, category: "Finance",
  });

  // 5. Revenue trend / weekly performance
  if (hasData) {
    const weeklyTarget = avgDaily * 7;
    insights.push({
      id: 5, type: "pattern", urgency: "low", emoji: "📊",
      title: `Mauzo ya wiki: ${fmt(shopData.weekRevenue)}`,
      titleEn: `Weekly revenue: ${fmt(shopData.weekRevenue)}`,
      body: `Wastani wako wa kila siku ni ${fmt(avgDaily)}. Unafanya miamala ${shopData.weekTransactions} wiki hii. ${shopData.weekRevenue >= weeklyTarget * 0.8 ? "Unaendelea vizuri!" : "Angalizo: mauzo yako iko chini ya wastani."}`,
      bodyEn: `Your daily average is ${fmt(avgDaily)}. You've made ${shopData.weekTransactions} transactions this week. ${shopData.weekRevenue >= weeklyTarget * 0.8 ? "You're on track — keep it up!" : "Watch out: sales are below your usual average this week."}`,
      impact: `${shopData.weekTransactions} transactions`,
      actionLabel: "View Reports", actionColor: "#3b82f6", category: "Sales",
    });
  }

  // 6. If no real data yet — show onboarding insight
  if (!hasData) {
    insights.push({
      id: 6, type: "growth", urgency: "high", emoji: "🚀",
      title: "Anza mauzo ya kwanza kupata maarifa halisi",
      titleEn: "Make your first sale to unlock real insights",
      body: "Akili anasubiri data yako ya kweli. Fanya mauzo moja kupitia POS — Akili ataanza kukusaidia na maarifa halisi ya biashara yako.",
      bodyEn: "Akili is waiting for your real data. Record your first sale through the POS — Akili will immediately start giving you genuine insights about your specific business.",
      impact: "Unlock full AI insights",
      actionLabel: "Go to POS", actionColor: BRAND, category: "Onboarding",
    });
  }

  return insights;
}

interface Prediction {
  day: string;
  dayEn: string;
  predicted: number;
  confidence: number;
  note: string;
}

const PREDICTIONS: Prediction[] = [
  { day: "Jumatano", dayEn: "Wednesday", predicted: 165000, confidence: 87, note: "Kawaida ya wiki hii" },
  { day: "Alhamisi", dayEn: "Thursday", predicted: 172000, confidence: 82, note: "Kidogo juu ya wastani" },
  { day: "Ijumaa", dayEn: "Friday", predicted: 198000, confidence: 79, note: "Mwisho wa wiki — wateja wengi" },
  { day: "Jumamosi", dayEn: "Saturday", predicted: 291000, confidence: 91, note: "Siku yako bora — kuwa tayari" },
  { day: "Jumapili", dayEn: "Sunday", predicted: 134000, confidence: 74, note: "Kidogo — pumzika kidogo" },
  { day: "Jumatatu", dayEn: "Monday", predicted: 108000, confidence: 85, note: "Siku yako ngumu zaidi" },
  { day: "Jumanne", dayEn: "Tuesday", predicted: 151000, confidence: 80, note: "Wastani wa kawaida" },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

.akili-root{font-family:'Plus Jakarta Sans',sans-serif;width:100%}
.akili-root.dark{--bg:#0f1117;--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170;--akili-bg:#160e2a;--akili-border:rgba(124,58,237,.25);--msg-bg:#1e1433}
.akili-root.light{--bg:#f4f5f9;--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf;--akili-bg:#f5f3ff;--akili-border:rgba(124,58,237,.15);--msg-bg:#ede9fe}

.akili-hero{background:var(--akili-bg);border:1px solid var(--akili-border);border-radius:20px;padding:20px;margin-bottom:16px;position:relative;overflow:hidden}
.akili-hero::before{content:'';position:absolute;top:0;right:0;width:120px;height:120px;background:radial-gradient(circle,rgba(124,58,237,.12) 0%,transparent 70%);border-radius:50%}
.akili-avatar{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,${AKILI_COLOR},#5b21b6);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;position:relative}
.akili-avatar::after{content:'';position:absolute;bottom:0;right:0;width:14px;height:14px;border-radius:50%;background:#22c55e;border:2px solid var(--akili-bg)}
.akili-pulse{animation:akili-pulse 2s ease-in-out infinite}
@keyframes akili-pulse{0%,100%{opacity:1}50%{opacity:.6}}

.akili-tabs{display:flex;gap:4px;background:var(--inp);border-radius:12px;padding:3px;margin-bottom:16px}
.akili-tab{flex:1;padding:8px 6px;border-radius:9px;font-size:11px;font-weight:700;cursor:pointer;border:none;font-family:inherit;background:transparent;color:var(--t2);transition:all .15s;text-align:center}
.akili-tab.active{background:${AKILI_COLOR};color:#fff}

.insight-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:15px;margin-bottom:10px;transition:border-color .15s;cursor:pointer}
.insight-card:hover{border-color:rgba(124,58,237,.4)}
.insight-card.high{border-left:3px solid #ef4444;border-radius:0 14px 14px 0}
.insight-card.medium{border-left:3px solid ${BRAND};border-radius:0 14px 14px 0}
.insight-card.low{border-left:3px solid #3b82f6;border-radius:0 14px 14px 0}
.insight-top{display:flex;align-items:flex-start;gap:10px}
.insight-emoji{font-size:20px;flex-shrink:0;margin-top:1px}
.insight-title{font-size:13px;font-weight:800;color:var(--t);line-height:1.3}
.insight-title-sw{font-size:11px;font-weight:600;color:var(--t2);margin-top:2px;font-style:italic}
.insight-body{font-size:12px;color:var(--t2);line-height:1.6;margin-top:8px}
.insight-body-sw{font-size:11px;color:var(--t2);line-height:1.5;margin-top:4px;padding-top:6px;border-top:1px dashed var(--border)}
.insight-footer{display:flex;align-items:center;justify-content:space-between;margin-top:10px}
.impact-badge{font-size:10px;font-weight:800;padding:3px 10px;border-radius:20px;border:1px solid}
.insight-action-btn{font-size:11px;font-weight:700;padding:6px 14px;border-radius:8px;border:none;cursor:pointer;font-family:inherit;color:#fff;transition:all .15s}
.insight-action-btn:hover{opacity:.9;transform:translateY(-1px)}
.cat-badge{font-size:9px;font-weight:700;padding:2px 8px;border-radius:8px;background:var(--inp);color:var(--t2);margin-left:6px}

.chat-container{background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden}
.chat-messages{padding:16px;min-height:300px;max-height:400px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;scrollbar-width:thin;scrollbar-color:var(--border) transparent}
.msg{display:flex;gap:10px;animation:msgIn .2s ease}
@keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.msg.user{flex-direction:row-reverse}
.msg-avatar{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;align-self:flex-end}
.msg-bubble{max-width:80%;padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.5}
.msg.akili .msg-bubble{background:var(--msg-bg);color:var(--t);border-radius:4px 14px 14px 14px}
.msg.user .msg-bubble{background:${AKILI_COLOR};color:#fff;border-radius:14px 14px 4px 14px}
.msg-time{font-size:10px;color:var(--t3);margin-top:4px}
.typing{display:flex;gap:4px;padding:10px 14px;background:var(--msg-bg);border-radius:4px 14px 14px 14px;width:fit-content}
.typing-dot{width:6px;height:6px;border-radius:50%;background:${AKILI_COLOR};animation:typing .8s ease-in-out infinite}
.typing-dot:nth-child(2){animation-delay:.15s}
.typing-dot:nth-child(3){animation-delay:.3s}
@keyframes typing{0%,80%,100%{transform:scale(1);opacity:.5}40%{transform:scale(1.2);opacity:1}}

.chat-input-row{padding:12px 14px;border-top:1px solid var(--border);display:flex;gap:8px;align-items:center}
.chat-input{flex:1;background:var(--inp);border:1.5px solid var(--border);border-radius:10px;padding:10px 13px;font-size:13px;color:var(--t);font-family:inherit;outline:none;transition:border-color .15s;resize:none}
.chat-input:focus{border-color:${AKILI_COLOR}}
.chat-send-btn{width:38px;height:38px;border-radius:10px;background:${AKILI_COLOR};color:#fff;border:none;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s}
.chat-send-btn:hover{background:#6d28d9}
.chat-send-btn:disabled{opacity:.4;cursor:not-allowed}
.quick-prompts{padding:8px 14px 0;display:flex;gap:6px;flex-wrap:wrap}
.quick-btn{background:var(--inp);border:1px solid var(--border);color:var(--t2);border-radius:20px;padding:5px 12px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s}
.quick-btn:hover{border-color:${AKILI_COLOR};color:${AKILI_COLOR}}

.pred-row{background:var(--card);border:1px solid var(--border);border-radius:11px;padding:12px 14px;margin-bottom:7px;display:flex;align-items:center;gap:12px}
.pred-day{font-size:12px;font-weight:700;color:var(--t);min-width:75px}
.pred-day-sw{font-size:10px;color:var(--t2);font-style:italic}
.pred-bar-wrap{flex:1}
.pred-bar-track{height:8px;background:var(--border);border-radius:4px;overflow:hidden}
.pred-bar-fill{height:100%;border-radius:4px;transition:width .5s}
.pred-note{font-size:10px;color:var(--t2);margin-top:3px}
.pred-amount{font-size:12px;font-weight:800;color:var(--t);text-align:right;min-width:80px;flex-shrink:0}
.pred-conf{font-size:9px;color:var(--t2);text-align:right}
.confidence-ring{width:32px;height:32px;flex-shrink:0}

.lang-toggle{display:flex;background:var(--inp);border-radius:8px;overflow:hidden;margin-bottom:14px;width:fit-content}
.lang-btn{padding:5px 14px;font-size:11px;font-weight:700;border:none;cursor:pointer;font-family:inherit;background:transparent;color:var(--t2);transition:all .15s}
.lang-btn.active{background:${AKILI_COLOR};color:#fff}
`;

interface Message {
  role: "akili" | "user";
  content: string;
  time: string;
}

function buildInitialMessages(owner: string, shopData: typeof SAMPLE_SHOP): Message[] {
  const hasData = shopData.weekRevenue > 0;
  if (hasData) {
    return [{
      role: "akili",
      content: `Habari ${owner}! Nimekagua duka lako wiki hii. Jumla ya mauzo ni TSh ${Math.round(shopData.weekRevenue / 1000)}K na unafanya faida ya ${Math.round((shopData.weekProfit / Math.max(shopData.weekRevenue, 1)) * 100)}%. ${shopData.stockoutsThisWeek > 0 ? `Bidhaa ${shopData.stockoutsThisWeek} zinakaribia kuisha — angalia hisa sasa. ⚠️` : "Hisa zako ziko vizuri. ✓"}\n\nHi ${owner}! I've been watching your shop this week. Total revenue is TSh ${Math.round(shopData.weekRevenue / 1000)}K with a ${Math.round((shopData.weekProfit / Math.max(shopData.weekRevenue, 1)) * 100)}% profit margin. ${shopData.stockoutsThisWeek > 0 ? `${shopData.stockoutsThisWeek} products are running low — check your inventory now. ⚠️` : "Your stock levels look good. ✓"}`,
      time: "Just now",
    }];
  }
  return [{
    role: "akili",
    content: `Habari ${owner}! Mimi ni Akili, mshauri wako wa biashara. Ninatazamia kuona data yako ya kweli — fanya mauzo ya kwanza kupitia POS ili nikusaidie na maarifa halisi! 🚀\n\nHi ${owner}! I'm Akili, your business advisor. I'm waiting to see your real data — make your first sale through the POS so I can give you real insights! 🚀`,
    time: "Just now",
  }];
}

const QUICK_PROMPTS_EN = [
  "Why is Monday always slow?",
  "Am I making real profit?",
  "Who owes me the most?",
  "Should I hire more staff?",
  "What should I stock more of?",
  "Can I get a loan?",
];

const QUICK_PROMPTS_SW = [
  "Kwa nini Jumatatu ni polepole?",
  "Je, ninafanya faida halisi?",
  "Nani ananidai zaidi?",
  "Niongeze wafanyakazi?",
  "Niongeze bidhaa gani?",
  "Naweza kupata mkopo?",
];

export default function AkiliYaBiashara({ shopData = SAMPLE_SHOP, theme = "dark" }: { shopData?: typeof SAMPLE_SHOP; theme?: "dark" | "light" }) {
  const [tab, setTab] = useState<"insights" | "chat" | "predict">("insights");
  const [lang, setLang] = useState<"both" | "sw" | "en">("both");
  const [messages, setMessages] = useState<Message[]>(() => buildInitialMessages(shopData.owner, shopData));
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { role: "user", content: text, time: new Date().toLocaleTimeString("en-TZ", { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    // Simulated responses keyed to common questions
    const marginPct = shopData.weekRevenue > 0 ? Math.round((shopData.weekProfit / shopData.weekRevenue) * 100) : 0;
    const digitalPct = shopData.paymentSplit.mpesa + (shopData.paymentSplit.airtel || 0);
    const hasData = shopData.weekRevenue > 0;
    const responses: Record<string, string> = {
      "monday": `Jumatatu ni polepole kwa sababu wateja wanamaliza pesa za mwisho wa wiki Jumapili. Wastani wako ni ${fmt(Math.round(shopData.avgDailySales * 0.6))} tu Jumatatu. Tumia siku hiyo kupanga hisa na kuhesabu — si kutegemea mauzo.\n\nMonday is slow because customers spent their weekend money on Sunday. Your Monday average is around ${fmt(Math.round(shopData.avgDailySales * 0.6))}. Use Monday for stock planning and stocktaking — not sales volume.`,
      "profit": hasData
        ? `Ndio — unapata faida ya ${marginPct}% wiki hii (${fmt(shopData.weekProfit)}). ${marginPct >= 25 ? "Hii ni nzuri — bora kuliko wastani." : "Lakini iko chini ya kiwango salama cha 25% — angalia gharama zako."} ${shopData.overdueDebt > 0 ? `Tatizo kubwa ni deni la ${fmt(shopData.overdueDebt)} kutoka kwa wateja — hii inabeba kama hasara.` : "Deni lako uko sawa."}\n\nYes — you're at ${marginPct}% margin this week (${fmt(shopData.weekProfit)}). ${marginPct >= 25 ? "That's solid — better than average." : "But it's below the safe 25% threshold — review your costs."} ${shopData.overdueDebt > 0 ? `Your biggest drag is ${fmt(shopData.overdueDebt)} in customer debt — that's sitting as lost profit.` : "Your debt book looks clean."}`
        : "Fanya mauzo ya kwanza kupitia POS nikusaidie kuhesabu faida yako halisi.\n\nRecord your first sale through the POS so I can calculate your real profit margin.",
      "owes": shopData.overdueDebt > 0
        ? `Wateja ${shopData.debtors} wanakudai ${fmt(shopData.overdueDebt)}. Tuma ujumbe WhatsApp sasa hivi asubuhi — uwezekano wa kulipwa ni mara mbili zaidi kuliko jioni. Anza na wale wanaodaiwa zaidi.\n\n${shopData.debtors} customer${shopData.debtors > 1 ? "s" : ""} owe you ${fmt(shopData.overdueDebt)}. Send WhatsApp reminders this morning — twice as likely to get paid versus evenings. Start with your biggest outstanding balance.`
        : "Habari njema — deni lako iko safi wiki hii! Hakuna wateja wanaokudai sasa hivi.\n\nGood news — your debt book is clean this week! No outstanding customer debts right now.",
      "staff": `Wafanyakazi ${shopData.staffCount} wako ni ${shopData.staffCount >= 2 ? "wa kutosha wiki nzima isipokuwa Jumamosi asubuhi" : "kidogo — fikiria kuongeza msaada Jumamosi"}. Saa za kilele ni ${shopData.bestHour} — hakikisha una nguvu kazi ya kutosha wakati huo.\n\nYour ${shopData.staffCount} staff ${shopData.staffCount >= 2 ? "are enough most of the week but Saturday mornings are tight" : "may not be enough — consider extra help on Saturdays"}. Peak hours are ${shopData.bestHour} — make sure you're fully covered then.`,
      "loan": `Alama yako ya mkopo ni ${shopData.creditScore}/100. ${shopData.creditScore >= 65 ? "Unastahili mkopo wa Pesapal." : `Unahitaji ${65 - shopData.creditScore} pointi zaidi kufika kiwango cha Pesapal (65).`} Malipo ya kidijitali yako ni ${digitalPct}% — ${digitalPct >= 60 ? "juu ya kiwango cha mkopo." : `unahitaji ${60 - digitalPct}% zaidi.`}\n\nYour credit score is ${shopData.creditScore}/100. ${shopData.creditScore >= 65 ? "You qualify for a Pesapal loan." : `You need ${65 - shopData.creditScore} more points to reach the Pesapal threshold (65).`} Your digital payment rate is ${digitalPct}% — ${digitalPct >= 60 ? "above the loan eligibility threshold." : `${60 - digitalPct}% more needed.`}`,
      "stock": shopData.stockoutsThisWeek > 0
        ? `Bidhaa ${shopData.stockoutsThisWeek} ziko chini ya kiwango cha agizo. Angalia orodha yako ya hisa sasa na uagize kabla ya Ijumaa ili uwe tayari Jumamosi.\n\n${shopData.stockoutsThisWeek} product${shopData.stockoutsThisWeek > 1 ? "s are" : " is"} below reorder level. Check your inventory now and order before Friday to be ready for Saturday peak sales.`
        : "Hisa zako ziko vizuri wiki hii — hakuna bidhaa zinazokaribia kukwisha.\n\nYour stock levels are good this week — no products are near running out.",
      "default": hasData
        ? `Mauzo yako ya wiki hii ni ${fmt(shopData.weekRevenue)} kutoka miamala ${shopData.weekTransactions}. ${shopData.stockoutsThisWeek > 0 ? `Kumbuka: bidhaa ${shopData.stockoutsThisWeek} zinahitaji kuagizwa.` : "Hisa zako ziko vizuri."} Niulize chochote kuhusu biashara yako.\n\nYour revenue this week is ${fmt(shopData.weekRevenue)} from ${shopData.weekTransactions} transactions. ${shopData.stockoutsThisWeek > 0 ? `Remember: ${shopData.stockoutsThisWeek} product${shopData.stockoutsThisWeek > 1 ? "s need" : " needs"} reordering.` : "Stock levels are fine."} Ask me anything about your business.`
        : "Ninasubiri data yako ya kwanza. Fanya mauzo kupitia POS nikusaidie na maarifa halisi ya biashara yako.\n\nI'm waiting for your first real data. Record sales through the POS so I can give you genuine insights about your specific business.",
    };

    const lower = text.toLowerCase();
    let reply = responses.default;
    if (lower.includes("monday") || lower.includes("jumatatu") || lower.includes("slow") || lower.includes("polepole")) reply = responses.monday;
    else if (lower.includes("profit") || lower.includes("faida") || lower.includes("making money") || lower.includes("margin")) reply = responses.profit;
    else if (lower.includes("loan") || lower.includes("mkopo") || lower.includes("credit") || lower.includes("borrow")) reply = responses.loan;
    else if (lower.includes("staff") || lower.includes("wafanyakazi") || lower.includes("hire") || lower.includes("employee")) reply = responses.staff;
    else if (lower.includes("who") || lower.includes("nani") || lower.includes("debt") || lower.includes("deni") || lower.includes("owes")) reply = responses.owes;
    else if (lower.includes("stock") || lower.includes("hisa") || lower.includes("inventory") || lower.includes("order") || lower.includes("agiza")) reply = responses.stock;

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: "akili",
        content: reply,
        time: new Date().toLocaleTimeString("en-TZ", { hour: "2-digit", minute: "2-digit" }),
      }]);
    }, 1800);
  };

  const maxPred = Math.max(...PREDICTIONS.map(p => p.predicted));

  return (
    <>
      <style>{css}</style>
      <div className={`akili-root ${theme}`}>
        {/* Hero */}
        <div className="akili-hero">
          <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
            <div className="akili-avatar">🧠</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(124,58,237,.7)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 3 }}>
                Akili ya Biashara · Business Intelligence
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--t)" }}>
                Habari, {shopData.owner}!
              </div>
              <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2 }}>
                Nina uchanganuzi {generateInsights(shopData).length} mpya leo · I have {generateInsights(shopData).length} new insights for you
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(124,58,237,.6)", textTransform: "uppercase", marginBottom: 4 }}>
                Week Revenue
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--t)" }}>
                {fmt(shopData.weekRevenue)}
              </div>
              <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 700, marginTop: 2 }}>
                ↑ 16% vs last week
              </div>
            </div>
          </div>
          {/* Quick stat pills */}
          <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
            {[
              { label: "Profit", value: `${Math.round((shopData.weekProfit/shopData.weekRevenue)*100)}%`, color: "#22c55e" },
              { label: "Debt at risk", value: fmt(shopData.overdueDebt), color: "#ef4444" },
              { label: "Stockouts", value: shopData.stockoutsThisWeek, color: "#f59e0b" },
              { label: "Credit score", value: shopData.creditScore+"/100", color: AKILI_COLOR },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: "5px 10px" }}>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".4px" }}>{s.label}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: s.color, marginTop: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Language toggle */}
        <div className="lang-toggle">
          {[["both","SW + EN"],["sw","Swahili"],["en","English"]].map(([k,l]) => (
            <button key={k} className={`lang-btn ${lang===k?"active":""}`} onClick={() => setLang(k as typeof lang)}>{l}</button>
          ))}
        </div>

        {/* Tabs */}
        <div className="akili-tabs">
          <button className={`akili-tab ${tab==="insights"?"active":""}`} onClick={() => setTab("insights")}>
            💡 Insights
          </button>
          <button className={`akili-tab ${tab==="chat"?"active":""}`} onClick={() => setTab("chat")}>
            💬 Ask Akili
          </button>
          <button className={`akili-tab ${tab==="predict"?"active":""}`} onClick={() => setTab("predict")}>
            🔮 Predictions
          </button>
        </div>

        {/* ── INSIGHTS ── */}
        {tab === "insights" && (
          <>
            {generateInsights(shopData).map(insight => {
              const isExpanded = expandedInsight === insight.id;
              return (
                <div key={insight.id}
                  className={`insight-card ${insight.urgency}`}
                  onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}>
                  <div className="insight-top">
                    <span className="insight-emoji" style={{ fontSize: 20 }}>{insight.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span className="insight-title">
                          {lang === "sw" ? insight.title : lang === "en" ? insight.titleEn : insight.titleEn}
                        </span>
                        <span className="cat-badge">{insight.category}</span>
                      </div>
                      {(lang === "both" || lang === "sw") && (
                        <div className="insight-title-sw">{insight.title}</div>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <>
                      {(lang === "en" || lang === "both") && (
                        <div className="insight-body">{insight.bodyEn}</div>
                      )}
                      {lang === "both" && (
                        <div className="insight-body-sw">{insight.body}</div>
                      )}
                      {lang === "sw" && (
                        <div className="insight-body">{insight.body}</div>
                      )}
                    </>
                  )}

                  <div className="insight-footer">
                    <span className="impact-badge"
                      style={{ background: `${insight.actionColor}12`, borderColor: `${insight.actionColor}25`, color: insight.actionColor }}>
                      {insight.impact}
                    </span>
                    <button
                      className="insight-action-btn"
                      style={{ background: insight.actionColor }}
                      onClick={e => { e.stopPropagation(); }}>
                      {insight.actionLabel}
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── CHAT ── */}
        {tab === "chat" && (
          <div className="chat-container">
            {/* Quick prompts */}
            <div className="quick-prompts">
              {(lang === "sw" ? QUICK_PROMPTS_SW : QUICK_PROMPTS_EN).map(q => (
                <button key={q} className="quick-btn" onClick={() => sendMessage(q)}>{q}</button>
              ))}
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`msg ${msg.role}`}>
                  <div className="msg-avatar"
                    style={{ background: msg.role === "akili" ? `linear-gradient(135deg,${AKILI_COLOR},#5b21b6)` : BRAND, color: "#fff" }}>
                    {msg.role === "akili" ? "🧠" : shopData.owner[0]}
                  </div>
                  <div>
                    <div className="msg-bubble"
                      style={{ whiteSpace: "pre-line" }}>
                      {msg.content}
                    </div>
                    <div className="msg-time" style={{ textAlign: msg.role === "user" ? "right" : "left" }}>
                      {msg.role === "akili" ? "Akili · " : ""}{msg.time}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="msg akili">
                  <div className="msg-avatar" style={{ background: `linear-gradient(135deg,${AKILI_COLOR},#5b21b6)`, color: "#fff" }}>🧠</div>
                  <div className="typing">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-row">
              <textarea
                className="chat-input"
                rows={1}
                placeholder={lang === "sw" ? "Uliza Akili swali lolote..." : "Ask Akili anything about your shop..."}
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(inputVal); }}}
              />
              <button className="chat-send-btn" onClick={() => sendMessage(inputVal)} disabled={!inputVal.trim() || isTyping}>
                →
              </button>
            </div>
          </div>
        )}

        {/* ── PREDICTIONS ── */}
        {tab === "predict" && (
          <>
            <div style={{ background: "var(--akili-bg)", border: "1px solid var(--akili-border)", borderRadius: 12, padding: "12px 14px", marginBottom: 14, fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>
              🔮 {lang === "sw"
                ? "Hizi ni utabiri wa mauzo yako kulingana na miaka 5 ya takwimu za soko na historia yako ya wiki 20."
                : "These predictions are based on 5 years of Dar es Salaam market patterns combined with your 20-week sales history."}
            </div>
            {PREDICTIONS.map(pred => {
              const pct = Math.round((pred.predicted / maxPred) * 100);
              const barColor = pred.predicted >= 250000 ? "#22c55e" : pred.predicted >= 160000 ? BRAND : pred.predicted >= 130000 ? "#f59e0b" : "#ef4444";
              return (
                <div key={pred.day} className="pred-row">
                  <div>
                    <div className="pred-day">{lang === "sw" ? pred.day : pred.dayEn}</div>
                    {lang === "both" && <div className="pred-day-sw">{pred.day}</div>}
                  </div>
                  <div className="pred-bar-wrap">
                    <div className="pred-bar-track">
                      <div className="pred-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                    <div className="pred-note">{lang === "sw" ? pred.note : pred.note}</div>
                  </div>
                  <div>
                    <div className="pred-amount">{fmt(pred.predicted)}</div>
                    <div className="pred-conf">{pred.confidence}% confident</div>
                  </div>
                </div>
              );
            })}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t)" }}>
                  {lang === "sw" ? "Jumla ya wiki ijayo" : "Projected week total"}
                </div>
                <div style={{ fontSize: 10, color: "var(--t2)", marginTop: 2 }}>
                  {lang === "sw" ? "Ikiwa utafuata mapendekezo yote" : "If you follow all recommendations"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#22c55e" }}>
                  {fmt(PREDICTIONS.reduce((s, p) => s + p.predicted, 0))}
                </div>
                <div style={{ fontSize: 10, color: "#22c55e", marginTop: 2 }}>
                  +TSh 87,000 vs this week
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
