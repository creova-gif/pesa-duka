import { useState, useEffect } from 'react';
import SmartReceiptBuilder from '../components/SmartReceiptBuilder';
import { useProducts } from '../hooks/useData';
import { completeAtomicCheckout } from '../lib/db';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getProfile } from '../hooks/useBusinessProfile';
import { CardListSkeleton } from '../components/SkeletonLoader';

export function POS() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const { data: products = [], isLoading } = useProducts();
  const queryClient = useQueryClient();

  const profile = getProfile();

  useEffect(() => {
    const checkTheme = () => {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const handleCompleteSale = async (saleData: any) => {
    try {
      const paymentMethod = (saleData.payMethod === 'cash' ? 'cash' : (saleData.payMethod === 'credit' ? 'credit' : 'mobile_money')) as 'cash' | 'mobile_money' | 'credit';

      await completeAtomicCheckout({
        items: saleData.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.qty,
        })),
        totalAmount: saleData.grandTotal,
        paymentMethod,
      });

      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['sync_queue'] });

      const isFirst = !localStorage.getItem("pesa_first_sale_done");
      if (isFirst) {
        localStorage.setItem("pesa_first_sale_done", "true");
        toast.success("🎉 Mauzo ya kwanza! / First sale complete!", {
          description: `TSh ${saleData.grandTotal.toLocaleString()} recorded. Share on WhatsApp?`,
          duration: 10000,
          action: {
            label: "📲 Share",
            onClick: () => {
              const msg = encodeURIComponent(`Nimeweka mauzo yangu ya kwanza kwenye PESA DUKA! TSh ${saleData.grandTotal.toLocaleString()} 🎉 Jaribu sasa: https://pesaduka.co.tz`);
              window.open(`https://wa.me/?text=${msg}`, "_blank");
            },
          },
        });
      } else {
        toast.success(`Sale recorded — TSh ${saleData.grandTotal.toLocaleString()} ✓ (Saved locally & queued)`);
      }

      return true;
    } catch (error: any) {
      toast.error(`Sale failed: ${error?.message || 'Unknown error'}`);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6">
        <CardListSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <SmartReceiptBuilder
        currentUser={{
          name: profile.ownerName || "Staff",
          role: "owner"
        }}
        businessName={profile.businessName || "My Business"}
        tin={profile.tin || ""}
        theme={theme}
        inventory={products}
        onCompleteSale={handleCompleteSale}
      />
    </div>
  );
}
