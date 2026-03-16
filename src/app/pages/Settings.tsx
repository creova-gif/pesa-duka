import { useState, useRef } from "react";
import { Upload, Trash2, Save, CheckCircle, Settings as SettingsIcon, AlertTriangle } from "lucide-react";
import { useTheme } from "next-themes";

export function Settings() {
  const { theme, setTheme } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "sw">("en");
  const [printer, setPrinter] = useState<"none" | "bluetooth" | "wifi">("none");
  const [saved, setSaved] = useState(false);
  const [toggles, setToggles] = useState({
    smsReceipts: true,
    whatsappReceipts: false,
    lowStockAlerts: true,
    paymentReminders: true,
  });
  const [form, setForm] = useState({
    businessName: "Duka la Mwanga",
    ownerName: "Amina Hassan",
    phone: "+255 712 345 678",
    email: "amina@dukalamwanga.co.tz",
    tin: "123-456-789",
    address: "Kariakoo Market, Block C, Dar es Salaam",
    city: "Dar es Salaam",
    region: "Dar es Salaam",
    receiptFooter: "Asante kwa ununuzi wako! / Thank you for your purchase!",
    currency: "TZS",
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLogo(URL.createObjectURL(file));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleSwitch = (key: keyof typeof toggles) =>
    setToggles((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">
            Business <span className="text-primary">Settings</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your profile, preferences & integrations
          </p>
        </div>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2 bg-card border border-border rounded-full px-3.5 py-2 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          {theme === "dark" ? "☀️" : "🌙"} {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Business Profile */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-xs font-bold uppercase tracking-wider text-primary mb-4">
            Business Profile
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-3xl font-extrabold text-white overflow-hidden border-2 border-border">
              {logo ? <img src={logo} alt="logo" className="w-full h-full object-cover" /> : form.businessName[0]}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="bg-primary hover:bg-primary/90 text-white border-none rounded-lg px-4 py-2 text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Upload Logo
              </button>
              {logo && (
                <button
                  onClick={() => setLogo(null)}
                  className="bg-transparent border border-border text-muted-foreground hover:border-red-500 hover:text-red-500 rounded-lg px-4 py-2 text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Business Name</label>
              <input
                className="w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Owner / Manager Name</label>
              <input
                className="w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Phone Number</label>
                <input
                  className="w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Email (Optional)</label>
                <input
                  className="w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">TIN Number</label>
              <input
                className="w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                value={form.tin}
                onChange={(e) => setForm({ ...form, tin: e.target.value })}
                placeholder="Tax Identification Number"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Business Address</label>
              <input
                className="w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">City</label>
                <input
                  className="w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Region</label>
                <select
                  className="w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors cursor-pointer"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                >
                  {["Dar es Salaam", "Mwanza", "Arusha", "Mbeya", "Dodoma"].map(r => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* App Preferences */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-xs font-bold uppercase tracking-wider text-primary mb-4">
            App Preferences
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Language / Lugha</label>
              <div className="flex bg-input border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setLang("en")}
                  className={`flex-1 py-2.5 text-sm font-bold transition-all ${
                    lang === "en" ? "bg-primary text-white" : "bg-transparent text-muted-foreground"
                  }`}
                >
                  🇬🇧 English
                </button>
                <button
                  onClick={() => setLang("sw")}
                  className={`flex-1 py-2.5 text-sm font-bold transition-all ${
                    lang === "sw" ? "bg-primary text-white" : "bg-transparent text-muted-foreground"
                  }`}
                >
                  🇹🇿 Kiswahili
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Currency</label>
              <select
                className="w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors cursor-pointer"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              >
                <option value="TZS">TZS — Tanzanian Shilling</option>
                <option value="KES">KES — Kenyan Shilling</option>
                <option value="USD">USD — US Dollar</option>
              </select>
            </div>

            <div className="pt-5">
              <label className="block text-xs font-semibold text-muted-foreground mb-3">Notifications</label>
              {[
                { key: "smsReceipts" as const, label: "SMS Receipts", desc: "Send receipts via SMS after each sale" },
                { key: "whatsappReceipts" as const, label: "WhatsApp Receipts", desc: "Send receipts via WhatsApp Business" },
                { key: "lowStockAlerts" as const, label: "Low Stock Alerts", desc: "Notify when products fall below threshold" },
                { key: "paymentReminders" as const, label: "Payment Reminders", desc: "Auto-remind customers with overdue balances" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <div className="text-sm font-semibold">{label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                  </div>
                  <button
                    onClick={() => toggleSwitch(key)}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      toggles[key] ? "bg-primary" : "bg-border"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                        toggles[key] ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Receipt Customization */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-xs font-bold uppercase tracking-wider text-primary mb-4">
            Receipt Customization
          </div>
          <div className="mb-3">
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Footer Message</label>
            <input
              className="w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm font-medium focus:border-primary outline-none transition-colors"
              value={form.receiptFooter}
              onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })}
            />
          </div>

          <div className="bg-input border border-dashed border-border rounded-lg p-4 text-sm leading-relaxed text-muted-foreground font-mono mt-3">
            <div className="text-base font-bold text-foreground text-center mb-1">{form.businessName}</div>
            <div className="text-center text-xs">{form.address}</div>
            <div className="text-center text-xs">{form.phone}</div>
            {form.tin && <div className="text-center text-xs">TIN: {form.tin}</div>}
            <hr className="border-t border-dashed border-border my-2" />
            <div className="flex justify-between"><span>Unga (2kg)</span><span>TSh 3,500</span></div>
            <div className="flex justify-between"><span>Mafuta (1L)</span><span>TSh 4,200</span></div>
            <hr className="border-t border-dashed border-border my-2" />
            <div className="flex justify-between font-bold text-foreground">
              <span>JUMLA / TOTAL</span>
              <span>TSh 7,700</span>
            </div>
            <div className="flex justify-between"><span>Malipo: M-Pesa</span><span>✓ Lipa</span></div>
            <hr className="border-t border-dashed border-border my-2" />
            <div className="text-center text-xs">{form.receiptFooter}</div>
          </div>
        </div>

        {/* Printer Setup */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-xs font-bold uppercase tracking-wider text-primary mb-4">
            Printer Setup
          </div>
          {[
            { id: "none" as const, icon: "📵", name: "No Printer", desc: "Digital receipts only (SMS / WhatsApp)" },
            { id: "bluetooth" as const, icon: "🖨️", name: "Bluetooth Thermal", desc: "58mm or 80mm portable receipt printer" },
            { id: "wifi" as const, icon: "📡", name: "Wi-Fi Network Printer", desc: "Shared printer on local network" },
          ].map((p) => (
            <div
              key={p.id}
              onClick={() => setPrinter(p.id)}
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer mb-2 transition-all ${
                printer === p.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-lg">{p.icon}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.desc}</div>
              </div>
              <div className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center ${
                printer === p.id ? "border-primary" : "border-border"
              }`}>
                {printer === p.id && <div className="w-2 h-2 bg-primary rounded-full" />}
              </div>
            </div>
          ))}
          {printer === "bluetooth" && (
            <button className="mt-2 w-full border-2 border-dashed border-primary text-primary rounded-lg py-2.5 text-sm font-bold hover:bg-primary/5 transition-colors">
              🔍 Scan for Bluetooth Devices
            </button>
          )}
        </div>

        {/* Subscription */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-xs font-bold uppercase tracking-wider text-primary mb-4">
            Subscription
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-base font-bold">Free Plan</div>
              <div className="text-sm text-muted-foreground">TSh 0/month</div>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/30 rounded-full px-3 py-1 text-xs font-bold">
              ⚡ FREE
            </span>
          </div>
          {[
            { label: "Products", used: 18, max: 100 },
            { label: "Users", used: 1, max: 1 },
          ].map(({ label, used, max }) => (
            <div key={label} className="mb-3.5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground font-semibold">{label}</span>
                <span className="font-bold">{used} / {max}</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(used/max)*100}%` }} />
              </div>
            </div>
          ))}
          <button className="w-full bg-primary hover:bg-primary/90 text-white border-none rounded-lg py-2.5 text-sm font-bold flex items-center justify-center gap-2 mt-2 transition-colors">
            ✨ Upgrade to Pro — TSh 30,000/mo
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-xs font-bold uppercase tracking-wider text-red-500 mb-4">
            Account
          </div>
          <div className="border border-red-500/30 rounded-xl p-4 bg-red-500/5">
            <div className="text-sm font-bold text-red-500 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Delete Account
            </div>
            <div className="text-xs text-muted-foreground mb-3">
              Permanently delete your business data, products, and transaction history.
              This action cannot be undone.
            </div>
            <button className="bg-transparent border border-red-500/40 text-red-500 hover:bg-red-500/10 rounded-lg px-4 py-2 text-sm font-semibold transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className="sticky bottom-6 bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-3 mt-6 shadow-lg">
        <span className="text-xs text-muted-foreground">
          {saved ? "✅ Changes saved successfully" : "Unsaved changes will be lost"}
        </span>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 border-none rounded-lg px-6 py-2.5 text-sm font-bold transition-all ${
            saved ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-primary/90 hover:-translate-y-0.5"
          }`}
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" /> Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
