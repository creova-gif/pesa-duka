import { useState, useEffect } from "react";
import InvoiceManager from "../components/InvoiceManager";
import BusinessSkillsAcademy from "../components/BusinessSkillsAcademy";
import FormalizationHub from "../components/FormalizationHub";
import AkiliYaBiashara from "../components/AkiliYaBiashara";
import { EFDZReport } from "../components/EFDZReport";
import MobileMoneyLedger from "../components/MobileMoneyLedgerComponent";

export function BusinessTools() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<"akili" | "invoices" | "academy" | "formalization" | "efd" | "mobilemoney">("akili");

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-semibold">Business Tools</h1>
        <p className="text-sm text-muted-foreground mt-1">AI advisor, training, and advanced business features</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("akili")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "akili"
              ? "bg-primary text-white"
              : "bg-card text-muted-foreground hover:bg-primary/10"
          }`}
        >
          🧠 Akili AI Advisor
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "invoices"
              ? "bg-primary text-white"
              : "bg-card text-muted-foreground hover:bg-primary/10"
          }`}
        >
          📄 Invoices
        </button>
        <button
          onClick={() => setActiveTab("academy")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "academy"
              ? "bg-primary text-white"
              : "bg-card text-muted-foreground hover:bg-primary/10"
          }`}
        >
          📚 Business Academy
        </button>
        <button
          onClick={() => setActiveTab("formalization")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "formalization"
              ? "bg-primary text-white"
              : "bg-card text-muted-foreground hover:bg-primary/10"
          }`}
        >
          🏛️ Registration Hub
        </button>
        <button
          onClick={() => setActiveTab("efd")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "efd"
              ? "bg-primary text-white"
              : "bg-card text-muted-foreground hover:bg-primary/10"
          }`}
        >
          📊 EFDZ Report
        </button>
        <button
          onClick={() => setActiveTab("mobilemoney")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "mobilemoney"
              ? "bg-primary text-white"
              : "bg-card text-muted-foreground hover:bg-primary/10"
          }`}
        >
          💰 Mobile Money Ledger
        </button>
      </div>

      {/* Content */}
      {activeTab === "akili" && <AkiliYaBiashara theme={theme} />}
      {activeTab === "invoices" && <InvoiceManager theme={theme} />}
      {activeTab === "academy" && <BusinessSkillsAcademy theme={theme} />}
      {activeTab === "formalization" && <FormalizationHub theme={theme} />}
      {activeTab === "efd" && <EFDZReport theme={theme} />}
      {activeTab === "mobilemoney" && <MobileMoneyLedger theme={theme} />}
    </div>
  );
}