import { useState } from "react";
import { saveProfile, getProfile, BusinessProfile } from "../hooks/useBusinessProfile";

const BUSINESS_CATEGORIES = [
  "Duka la Jumla (General Store)",
  "Duka la Mboga (Grocery)",
  "Duka la Dawa (Pharmacy)",
  "Duka la Nguuo (Clothing)",
  "Duka la Vifaa (Hardware)",
  "Mkahawa / Hoteli (Restaurant/Hotel)",
  "Saluni (Salon/Barber)",
  "Electronics & Mobile",
  "Kilimo (Agri/Farm)",
  "Nyingine (Other)",
];

const TANZANIAN_REGIONS = [
  "Dar es Salaam", "Mwanza", "Arusha", "Mbeya", "Dodoma",
  "Tanga", "Morogoro", "Zanzibar", "Tabora", "Kigoma",
  "Moshi", "Iringa", "Lindi", "Mtwara", "Shinyanga",
];

interface Props {
  onComplete: (profile: BusinessProfile) => void;
}

export default function OnboardingSetup({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    category: "",
    region: "Dar es Salaam",
    city: "",
    tin: "",
  });
  const [error, setError] = useState("");

  const next = () => {
    setError("");
    if (step === 1) {
      if (!form.businessName.trim()) { setError("Enter your business name to continue."); return; }
      if (!form.ownerName.trim()) { setError("Enter your name."); return; }
    }
    if (step === 2) {
      if (!form.phone.trim()) { setError("Enter your phone number."); return; }
      if (!form.category) { setError("Select your business category."); return; }
    }
    if (step < 3) setStep(s => s + 1);
    else finish();
  };

  const finish = () => {
    const existing = getProfile();
    const profile: BusinessProfile = {
      ...existing,
      businessName: form.businessName.trim(),
      ownerName: form.ownerName.trim(),
      phone: form.phone.trim(),
      tin: form.tin.trim(),
      city: form.city.trim() || form.region,
      region: form.region,
      address: form.city.trim() ? `${form.city.trim()}, ${form.region}` : form.region,
      onboarded: true,
    };
    saveProfile(profile);
    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">P</div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider opacity-80">PESA DUKA</div>
              <div className="text-base font-bold">Business Setup</div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {[1,2,3].map(i => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? "bg-white" : "bg-white/30"}`} />
            ))}
          </div>
          <div className="text-xs mt-2 opacity-70">Step {step} of 3</div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold mb-1">Welcome! Let's set up your business</h2>
              <p className="text-sm text-muted-foreground mb-5">Your data is stored on your device. We never share it.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Business Name *</label>
                  <input
                    autoFocus
                    className="w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                    placeholder="e.g. Duka la Baraka, Hassan's Shop..."
                    value={form.businessName}
                    onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && next()}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Your Name *</label>
                  <input
                    className="w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                    placeholder="e.g. Hassan Mwenda, Amina Ali..."
                    value={form.ownerName}
                    onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && next()}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold mb-1">Contact & Business Type</h2>
              <p className="text-sm text-muted-foreground mb-5">Used for receipts and compliance reports.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Phone Number *</label>
                  <input
                    autoFocus
                    className="w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                    placeholder="+255 7XX XXX XXX"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Business Category *</label>
                  <select
                    className="w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors cursor-pointer"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  >
                    <option value="">-- Select category --</option>
                    {BUSINESS_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Region</label>
                  <select
                    className="w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors cursor-pointer"
                    value={form.region}
                    onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                  >
                    {TANZANIAN_REGIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold mb-1">TRA Compliance (Optional)</h2>
              <p className="text-sm text-muted-foreground mb-5">Add your TIN for EFD receipts and Z-Reports. You can add this later in Settings.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">TIN Number</label>
                  <input
                    autoFocus
                    className="w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                    placeholder="e.g. 123-456-789-T (optional)"
                    value={form.tin}
                    onChange={e => setForm(f => ({ ...f, tin: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && next()}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Town / Area</label>
                  <input
                    className="w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                    placeholder={`e.g. Kariakoo, ${form.region}`}
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && finish()}
                  />
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="text-sm font-bold text-primary mb-1">✓ Your business profile:</div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>📍 <strong>{form.businessName}</strong> — {form.region}</div>
                    <div>👤 Owner: {form.ownerName}</div>
                    <div>📞 {form.phone}</div>
                    {form.category && <div>🏪 {form.category}</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-3 text-xs text-red-500 font-semibold bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2.5 text-sm font-semibold border border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={next}
              className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-lg py-2.5 text-sm font-bold transition-colors"
            >
              {step === 3 ? "🚀 Start Using PESA DUKA" : "Continue →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
