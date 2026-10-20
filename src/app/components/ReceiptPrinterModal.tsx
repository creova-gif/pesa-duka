import React, { useState } from 'react';
import { Printer, Bluetooth, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { ReceiptData, PrintOptions, BluetoothEscPosAdapter, CssPrintAdapter, formatReceiptLine, formatDivider } from '../lib/escpos';
import { toast } from 'sonner';

interface ReceiptPrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: ReceiptData;
}

export function ReceiptPrinterModal({ isOpen, onClose, receiptData }: ReceiptPrinterModalProps) {
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('58mm');
  const [isPrinting, setIsPrinting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBluetoothPrint = async () => {
    setIsPrinting(true);
    setStatusMessage('Inatafuta printa ya Bluetooth... / Connecting to Bluetooth printer...');
    try {
      const adapter = new BluetoothEscPosAdapter();
      await adapter.printReceipt(receiptData, { paperWidth });
      toast.success('Stakabadhi imechapishwa kikamilifu! / Receipt printed successfully!');
      setStatusMessage('Imechapishwa! / Printed!');
      setTimeout(() => {
        setIsPrinting(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.warn('Bluetooth print failed, falling back to CSS:', err);
      toast.error('Bluetooth haipatikani. Inatumia mfumo wa simu... / Falling back to system print...');
      handleSystemPrint();
    } finally {
      setIsPrinting(false);
    }
  };

  const handleSystemPrint = async () => {
    try {
      const adapter = new CssPrintAdapter();
      await adapter.printReceipt(receiptData, { paperWidth });
    } catch (err: any) {
      toast.error('Hitilafu wakati wa kuchapa: ' + err.message);
    }
  };

  const colWidth = paperWidth === '80mm' ? 48 : 32;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Chapa Stakabadhi / Print Receipt
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper Toggle */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Ukubwa wa Karatasi / Paper Width:</span>
          <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => setPaperWidth('58mm')}
              className={`px-3 py-1 font-bold rounded-md transition-colors ${
                paperWidth === '58mm' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              58mm (32 cols)
            </button>
            <button
              onClick={() => setPaperWidth('80mm')}
              className={`px-3 py-1 font-bold rounded-md transition-colors ${
                paperWidth === '80mm' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              80mm (48 cols)
            </button>
          </div>
        </div>

        {/* Preview Scrollbox (Strict Monospace 32/48 col) */}
        <div className="flex-1 overflow-y-auto p-4 bg-amber-50/40 dark:bg-slate-950 font-mono text-[11px] leading-tight text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 select-none">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-inner border border-slate-200 dark:border-slate-800 whitespace-pre">
            <div className="text-center font-bold text-sm mb-1">{receiptData.businessName}</div>
            {receiptData.tin && <div className="text-center text-xs">TIN: {receiptData.tin}</div>}
            <div className="text-center text-xs">{formatDivider('=', colWidth)}</div>
            <div>{formatReceiptLine('Stakabadhi:', receiptData.receiptNumber, colWidth)}</div>
            <div>{formatReceiptLine(`Tarehe: ${receiptData.date}`, receiptData.time, colWidth)}</div>
            <div>{formatDivider('-', colWidth)}</div>
            <div className="font-bold">{formatReceiptLine('MAELEZO', 'BEI (TSH)', colWidth)}</div>
            <div>{formatDivider('-', colWidth)}</div>
            {receiptData.items.map((i, idx) => (
              <div key={idx}>
                <div>{i.name.slice(0, colWidth)}</div>
                <div>{formatReceiptLine(` ${i.quantity} x ${i.price.toLocaleString()}`, i.total.toLocaleString(), colWidth)}</div>
              </div>
            ))}
            <div>{formatDivider('-', colWidth)}</div>
            <div>{formatReceiptLine('Jumla Ndogo:', `TSh ${receiptData.subtotal.toLocaleString()}`, colWidth)}</div>
            <div>{formatDivider('=', colWidth)}</div>
            <div className="font-bold text-xs">{formatReceiptLine('JUMLA KUU:', `TSh ${receiptData.grandTotal.toLocaleString()}`, colWidth)}</div>
            <div>{formatReceiptLine('Malipo:', receiptData.paymentMethod.toUpperCase(), colWidth)}</div>
            <div>{formatDivider('-', colWidth)}</div>
            <div className="text-center mt-2 text-[10px] text-slate-500">
              {receiptData.footerNote || 'Asante kwa Biashara Yako!'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white dark:bg-slate-900 flex flex-col gap-2">
          {statusMessage && (
            <div className="text-xs text-center font-medium text-emerald-600 dark:text-emerald-400 py-1 flex items-center justify-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              {statusMessage}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleBluetoothPrint}
              disabled={isPrinting}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              <Bluetooth className="w-4 h-4" />
              Bluetooth (POS)
            </button>
            <button
              onClick={handleSystemPrint}
              disabled={isPrinting}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-white font-bold text-sm transition-all"
            >
              <FileText className="w-4 h-4" />
              Mfumo wa Simu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
