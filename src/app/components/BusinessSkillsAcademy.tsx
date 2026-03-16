import { useState } from "react";

// ─── BusinessSkillsAcademy ────────────────────────────────────────────────────
// In-app micro-courses aligned with SIDO training mandate and NEDP
// The three modules TechnoServe identified: shop management, financial management, supply chain

const BRAND = "#E56B0A";

interface Lesson {
  title: string;
  titleSw: string;
  duration: string;
  done: boolean;
}

interface Course {
  id: string;
  title: string;
  titleEn: string;
  category: string;
  categoryColor: string;
  emoji: string;
  duration: string;
  lessons: number;
  completed: number;
  level: string;
  partner: string;
  description: string;
  lessons_list: Lesson[];
  badge: string;
}

const COURSES: Course[] = [
  {
    id: "bookkeeping",
    title: "Kuweka Hesabu Sahihi",
    titleEn: "Accurate Bookkeeping",
    category: "Financial Management",
    categoryColor: "#3b82f6",
    emoji: "📒",
    duration: "25 min",
    lessons: 5,
    completed: 3,
    level: "Beginner",
    partner: "SIDO",
    description: "Learn how to record every transaction, separate business from personal money, and understand your daily profit. Msingi wa biashara yenye mafanikio.",
    lessons_list: [
      { title: "Why records matter", titleSw: "Kwa nini hesabu ni muhimu", duration: "4 min", done: true },
      { title: "Daily cash book basics", titleSw: "Daftari la fedha la kila siku", duration: "6 min", done: true },
      { title: "Income vs expense", titleSw: "Mapato na matumizi", duration: "5 min", done: true },
      { title: "Finding your real profit", titleSw: "Kujua faida halisi", duration: "5 min", done: false },
      { title: "Weekly review habit", titleSw: "Tabia ya mapitio ya wiki", duration: "5 min", done: false },
    ],
    badge: "Bookkeeper",
  },
  {
    id: "credit",
    title: "Kusimamia Deni na Mkopo",
    titleEn: "Credit & Debt Management",
    category: "Financial Management",
    categoryColor: "#3b82f6",
    emoji: "💳",
    duration: "30 min",
    lessons: 6,
    completed: 0,
    level: "Intermediate",
    partner: "SIDO + NMB",
    description: "How to give credit wisely, collect overdue debts, and build the financial history that unlocks bank loans. Mkopo mbaya ni sumu kwa biashara.",
    lessons_list: [
      { title: "When to give credit (and when not to)", titleSw: "Lini kutoa mkopo", duration: "5 min", done: false },
      { title: "Setting credit limits per customer", titleSw: "Kuweka kikomo cha mkopo", duration: "6 min", done: false },
      { title: "The debt collection conversation", titleSw: "Mazungumzo ya kukusanya deni", duration: "6 min", done: false },
      { title: "Using WhatsApp for reminders", titleSw: "WhatsApp kwa ukumbusho", duration: "4 min", done: false },
      { title: "Building your credit score", titleSw: "Kujenga alama ya mkopo", duration: "5 min", done: false },
      { title: "Applying for a bank loan", titleSw: "Kuomba mkopo benki", duration: "4 min", done: false },
    ],
    badge: "Credit Manager",
  },
  {
    id: "inventory",
    title: "Kusimamia Hisa na Bidhaa",
    titleEn: "Stock & Inventory Control",
    category: "Supply Chain",
    categoryColor: "#f59e0b",
    emoji: "📦",
    duration: "20 min",
    lessons: 4,
    completed: 4,
    level: "Beginner",
    partner: "SIDO",
    description: "Never run out of fast-moving stock again. Learn how to track what you have, when to reorder, and how to spot slow-moving stock before it wastes your money.",
    lessons_list: [
      { title: "Counting stock correctly", titleSw: "Kuhesabu hisa kwa usahihi", duration: "5 min", done: true },
      { title: "Setting reorder points", titleSw: "Kuweka wakati wa kuagiza", duration: "5 min", done: true },
      { title: "Finding your best and worst sellers", titleSw: "Bidhaa bora na mbaya", duration: "5 min", done: true },
      { title: "Dealing with spoilage and theft", titleSw: "Kuharibika na wizi", duration: "5 min", done: true },
    ],
    badge: "Stock Master",
  },
  {
    id: "tax",
    title: "Kuelewa Kodi ya TRA",
    titleEn: "Understanding TRA Taxes",
    category: "Compliance",
    categoryColor: "#ef4444",
    emoji: "🏛️",
    duration: "35 min",
    lessons: 7,
    completed: 1,
    level: "Intermediate",
    partner: "TRA",
    description: "Taxes don't have to be scary. Learn what VAT means for your business, how EFD receipts work, when to file, and how staying compliant opens doors to government contracts.",
    lessons_list: [
      { title: "What is VAT and who pays it?", titleSw: "VAT ni nini na nani analipa?", duration: "5 min", done: true },
      { title: "How EFD receipts work", titleSw: "EFD inavyofanya kazi", duration: "5 min", done: false },
      { title: "Filing your VAT return", titleSw: "Kuwasilisha ripoti ya VAT", duration: "6 min", done: false },
      { title: "PAYE for your staff", titleSw: "PAYE kwa wafanyakazi wako", duration: "5 min", done: false },
      { title: "Getting your TIN", titleSw: "Kupata namba ya TIN", duration: "4 min", done: false },
      { title: "Benefits of being tax-compliant", titleSw: "Faida za kulipa kodi", duration: "5 min", done: false },
      { title: "Avoiding common penalties", titleSw: "Kuepuka faini za kawaida", duration: "5 min", done: false },
    ],
    badge: "Tax Compliant",
  },
  {
    id: "customers",
    title: "Huduma Bora kwa Wateja",
    titleEn: "Customer Relations",
    category: "Shop Management",
    categoryColor: "#22c55e",
    emoji: "🤝",
    duration: "20 min",
    lessons: 4,
    completed: 2,
    level: "Beginner",
    partner: "TechnoServe",
    description: "Your regulars are your business. Learn how to keep loyal customers coming back, handle complaints gracefully, and use loyalty programs to grow your revenue.",
    lessons_list: [
      { title: "Why regulars are gold", titleSw: "Kwa nini wateja wa kawaida ni dhahabu", duration: "5 min", done: true },
      { title: "Setting up a loyalty stamp card", titleSw: "Kadi ya uaminifu", duration: "5 min", done: true },
      { title: "Handling complaints well", titleSw: "Kushughulikia malalamiko", duration: "5 min", done: false },
      { title: "Growing through word-of-mouth", titleSw: "Kukua kupitia mapendekezo", duration: "5 min", done: false },
    ],
    badge: "Customer Champion",
  },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
.sk-root{font-family:'Plus Jakarta Sans',sans-serif;width:100%}
.sk-root.dark{--bg:#0f1117;--card:#1a1d27;--inp:#22263a;--border:#2e3347;--t:#f0f2ff;--t2:#7c85a8;--t3:#4a5170}
.sk-root.light{--bg:#f4f5f9;--card:#fff;--inp:#f8f9fc;--border:#e2e5ef;--t:#1a1d2e;--t2:#5b6380;--t3:#9ba3bf}
.sk-hero{background:linear-gradient(135deg,#08101a,#0a1520);border:1px solid rgba(59,130,246,.2);border-radius:16px;padding:18px;margin-bottom:16px;position:relative;overflow:hidden}
.sk-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 70% 50%,rgba(59,130,246,.08),transparent 60%)}
.sk-card{background:var(--card);border:1px solid var(--border);border-radius:13px;margin-bottom:8px;overflow:hidden;cursor:pointer;transition:border-color .15s}
.sk-card:hover{border-color:rgba(229,107,10,.4)}
.sk-card.open{border-color:${BRAND}}
.sk-card-header{padding:14px 16px;display:flex;align-items:center;gap:12px}
.sk-emoji{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.sk-card-title{font-size:13px;font-weight:800;color:var(--t)}
.sk-card-sub{font-size:11px;color:var(--t2);margin-top:1px}
.sk-progress-mini{height:4px;background:var(--border);border-radius:2px;margin-top:6px;overflow:hidden;max-width:120px}
.sk-progress-mini-fill{height:100%;border-radius:2px;transition:width .4s}
.sk-card-right{text-align:right;flex-shrink:0}
.sk-badge{font-size:9px;font-weight:800;padding:2px 8px;border-radius:20px;border:1px solid}
.sk-body{padding:0 16px 16px}
.sk-desc{font-size:12px;color:var(--t2);line-height:1.6;margin-bottom:14px;border-top:1px solid var(--border);padding-top:12px}
.sk-lesson-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)}
.sk-lesson-row:last-child{border-bottom:none}
.sk-lesson-check{width:22px;height:22px;border-radius:50%;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px;transition:all .2s;cursor:pointer}
.sk-lesson-check.done{background:#22c55e;border-color:#22c55e;color:#fff}
.sk-lesson-title{flex:1}
.sk-lesson-main{font-size:12px;font-weight:700;color:var(--t)}
.sk-lesson-sw{font-size:10px;color:var(--t2);margin-top:1px;font-style:italic}
.sk-lesson-dur{font-size:10px;color:var(--t2);flex-shrink:0}
.sk-start-btn{background:${BRAND};color:#fff;border:none;border-radius:9px;padding:9px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;width:100%;margin-top:12px;transition:background .15s}
.sk-start-btn:hover{background:#ff8c3a}
.sk-start-btn.complete{background:#22c55e}
.sk-partner-badge{font-size:9px;font-weight:700;padding:2px 7px;border-radius:8px;background:rgba(229,107,10,.1);color:${BRAND};border:1px solid rgba(229,107,10,.2)}
`;

export default function BusinessSkillsAcademy({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const [openCourse, setOpenCourse] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [filter, setFilter] = useState<string>("all");

  const totalLessons = courses.reduce((s, c) => s + c.lessons, 0);
  const totalDone = courses.reduce((s, c) => s + c.completed, 0);
  const overallPct = Math.round((totalDone / totalLessons) * 100);

  const toggleLesson = (courseId: string, lessonIdx: number) => {
    setCourses(prev => prev.map(c => {
      if (c.id !== courseId) return c;
      const updated = c.lessons_list.map((l, i) => i === lessonIdx ? { ...l, done: !l.done } : l);
      return { ...c, lessons_list: updated, completed: updated.filter(l => l.done).length };
    }));
  };

  const categories = ["all", "Financial Management", "Supply Chain", "Compliance", "Shop Management"];
  const filtered = courses.filter(c => filter === "all" || c.category === filter);

  return (
    <>
      <style>{css}</style>
      <div className={`sk-root ${theme}`}>
        {/* Hero */}
        <div className="sk-hero">
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 4 }}>
              Business Skills Academy · Shule ya Biashara
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>
              {totalDone} / {totalLessons} lessons complete
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginTop: 3 }}>
              In partnership with SIDO · TRA · TechnoServe · NMB Bank
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,.1)", borderRadius: 3, marginTop: 12, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${overallPct}%`, background: "#3b82f6", borderRadius: 3, transition: "width .5s" }} />
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 5 }}>
              {overallPct}% complete · {courses.filter(c => c.completed === c.lessons).length} certificates earned
            </div>
          </div>
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              style={{ padding: "4px 11px", borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: "pointer", border: "1px solid var(--border)", background: filter === cat ? BRAND : "var(--card)", color: filter === cat ? "#fff" : "var(--t2)", fontFamily: "inherit" }}>
              {cat === "all" ? "All Courses" : cat}
            </button>
          ))}
        </div>

        {/* Course list */}
        {filtered.map(course => {
          const isOpen = openCourse === course.id;
          const progressPct = Math.round((course.completed / course.lessons) * 100);
          const isComplete = course.completed === course.lessons;

          return (
            <div key={course.id} className={`sk-card ${isOpen ? "open" : ""}`}
              onClick={() => setOpenCourse(isOpen ? null : course.id)}>
              <div className="sk-card-header">
                <div className="sk-emoji"
                  style={{ background: `${course.categoryColor}12`, border: `1px solid ${course.categoryColor}25` }}>
                  {course.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span className="sk-card-title">{course.titleEn}</span>
                    {isComplete && <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>✓ Complete</span>}
                  </div>
                  <div className="sk-card-sub" style={{ fontStyle: "italic" }}>{course.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                    <div className="sk-progress-mini" style={{ flex: 1 }}>
                      <div className="sk-progress-mini-fill"
                        style={{ width: `${progressPct}%`, background: isComplete ? "#22c55e" : course.categoryColor }} />
                    </div>
                    <span style={{ fontSize: 10, color: "var(--t2)" }}>{course.completed}/{course.lessons}</span>
                    <span className="sk-partner-badge">{course.partner}</span>
                  </div>
                </div>
                <div className="sk-card-right">
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t)" }}>{course.duration}</div>
                  <span className="sk-badge"
                    style={{ background: `${course.categoryColor}12`, borderColor: `${course.categoryColor}25`, color: course.categoryColor }}>
                    {course.level}
                  </span>
                </div>
              </div>

              {isOpen && (
                <div className="sk-body" onClick={e => e.stopPropagation()}>
                  <div className="sk-desc">{course.description}</div>
                  {course.lessons_list.map((lesson, idx) => (
                    <div className="sk-lesson-row" key={idx}>
                      <div
                        className={`sk-lesson-check ${lesson.done ? "done" : ""}`}
                        onClick={() => toggleLesson(course.id, idx)}>
                        {lesson.done ? "✓" : idx + 1}
                      </div>
                      <div className="sk-lesson-title">
                        <div className="sk-lesson-main"
                          style={{ textDecoration: lesson.done ? "line-through" : "none", opacity: lesson.done ? 0.6 : 1 }}>
                          {lesson.title}
                        </div>
                        <div className="sk-lesson-sw">{lesson.titleSw}</div>
                      </div>
                      <span className="sk-lesson-dur">{lesson.duration}</span>
                    </div>
                  ))}
                  <button className={`sk-start-btn ${isComplete ? "complete" : ""}`}>
                    {isComplete ? "🏆 Certificate Earned — " + course.badge : "▶ Continue Learning"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
