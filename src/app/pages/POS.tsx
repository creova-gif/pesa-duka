import { useState, useEffect } from 'react';
import SmartReceiptBuilder from '../components/SmartReceiptBuilder';
import { useProducts, useUpdateStock, useCreateTransaction } from '../hooks/useData';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function POS() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  // Fetch products and mutations
  const { data: products = [], isLoading } = useProducts();
  const updateStock = useUpdateStock();
  const createTransaction = useCreateTransaction();
  const queryClient = useQueryClient();

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

  const handleCompleteSale = async (saleData: any) => {
    try {
      // Update stock for each item in the cart
      for (const item of saleData.items) {
        await updateStock.mutateAsync({ 
          id: item.id, 
          stock: item.stock - item.qty 
        });
      }

      // Create transaction record
      await createTransaction.mutateAsync({
        type: 'income',
        description: saleData.items.map((item: any) => `${item.qty}× ${item.name}`).join(', '),
        amount: saleData.grandTotal,
        paymentMethod: saleData.payMethod,
        date: new Date().toISOString(),
        time: new Date().toLocaleTimeString('en-TZ', { hour: '2-digit', minute: '2-digit' }),
      });

      toast.success('Sale completed successfully! 🎉');
      
      // Refetch all data
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      
      return true;
    } catch (error) {
      toast.error(`Sale failed: ${error.message}`);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading POS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <SmartReceiptBuilder 
        currentUser={{ name: "Juma Bakari", role: "owner" }}
        businessName="Duka la Mwanga"
        tin="123-456-789-T"
        theme={theme}
        inventory={products}
        onCompleteSale={handleCompleteSale}
      />
    </div>
  );
}