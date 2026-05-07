import { useState, useEffect } from 'react';
import SmartReceiptBuilder from '../components/SmartReceiptBuilder';
import { useProducts, useUpdateStock, useCreateTransaction } from '../hooks/useData';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getProfile } from '../hooks/useBusinessProfile';
import { CardListSkeleton } from '../components/SkeletonLoader';

export function POS() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const { data: products = [], isLoading } = useProducts();
  const updateStock = useUpdateStock();
  const createTransaction = useCreateTransaction();
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
      for (const item of saleData.items) {
        await updateStock.mutateAsync({
          id: item.id,
          stock: item.stock - item.qty
        });
      }

      await createTransaction.mutateAsync({
        type: 'income',
        description: saleData.items.map((item: any) => `${item.qty}× ${item.name}`).join(', '),
        amount: saleData.grandTotal,
        paymentMethod: saleData.payMethod,
        date: new Date().toISOString(),
        time: new Date().toLocaleTimeString('en-TZ', { hour: '2-digit', minute: '2-digit' }),
      });

      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

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
        toast.success(`Sale recorded — TSh ${saleData.grandTotal.toLocaleString()} ✓`);
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
