import { useState, useEffect } from 'react';
import SmartReceiptBuilder from '../components/SmartReceiptBuilder';

export function POS() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

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
    <div className="p-4 lg:p-6">
      <SmartReceiptBuilder 
        currentUser={{ name: "Juma Bakari", role: "owner" }}
        businessName="Duka la Mwanga"
        tin="123-456-789-T"
        theme={theme}
      />
    </div>
  );
}