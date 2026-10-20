// ============================================================================
// Pesa Duka v1 — WhatsApp Deep-Link Automation & Phone Normalization
// Localized Swahili templates for debt recovery and supplier purchase orders.
// Zero recurring third-party WhatsApp Business API fees.
// ============================================================================

/**
 * Normalizes East African phone numbers to standard E.164 digits format (no plus, no spaces)
 * Default country prefix: 255 (Tanzania)
 * Examples:
 *   "0712 334 556"  -> "255712334556"
 *   "+255 754 221 889" -> "255754221889"
 *   "0699447112"    -> "255699447112"
 */
export function normalizeE164Phone(rawPhone: string, defaultPrefix = '255'): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');

  // Already prefixed with 255
  if (digits.startsWith('255') && digits.length >= 12) {
    return digits;
  }

  // Starts with leading 0 (e.g. 07XXXXXXXX or 06XXXXXXXX)
  if (digits.startsWith('0') && digits.length === 10) {
    return `${defaultPrefix}${digits.slice(1)}`;
  }

  // 9-digit format without leading 0 (e.g. 712345678)
  if (digits.length === 9) {
    return `${defaultPrefix}${digits}`;
  }

  return digits;
}

/**
 * Generates a wa.me URL for respectful Swahili customer debt collection
 */
export function buildDebtReminderUrl(params: {
  customerName: string;
  phone: string;
  debtAmount: number;
  purchaseDate?: string;
  paymentLink?: string;
  businessName?: string;
}): string {
  const normalizedPhone = normalizeE164Phone(params.phone);
  const formattedDebt = Number(params.debtAmount).toLocaleString('en-TZ');
  const dukaName = params.businessName || 'Duka Lako';

  const text = `Habari ${params.customerName}, natumai uko salama.
Tunakukumbusha kwa heshima salio lako la TSh ${formattedDebt}${params.purchaseDate ? ` la ununuzi wa tarehe ${params.purchaseDate}` : ''} kwenye ${dukaName}.

${params.paymentLink ? `Unaweza kulipa moja kwa moja kupitia M-Pesa / Mixx kwa kiungo hiki:\n${params.paymentLink}\n\n` : ''}Asante sana kwa ushirikiano wako na biashara yetu! 🙏`;

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generates a wa.me URL for automated Supplier Purchase Orders (PO)
 */
export function buildSupplierPOUrl(params: {
  supplierName: string;
  supplierPhone: string;
  items: Array<{ name: string; quantity: number; unit?: string; wholesalePrice?: number }>;
  businessName?: string;
  deliveryNotes?: string;
}): string {
  const normalizedPhone = normalizeE164Phone(params.supplierPhone);
  const dukaName = params.businessName || 'Duka Langu';

  const itemsList = params.items
    .map((item, idx) => `${idx + 1}. ${item.name} — ${item.quantity} ${item.unit || 'pcs'}${item.wholesalePrice ? ` (@ TSh ${item.wholesalePrice.toLocaleString()})` : ''}`)
    .join('\n');

  const text = `Habari ${params.supplierName},
Hapa ni ${dukaName}. Naomba kuagiza bidhaa zifuatazo kwa ajili ya duka:

${itemsList}

${params.deliveryNotes ? `Maelekezo: ${params.deliveryNotes}\n` : ''}Tafadhali nithibitishie upatikanaji na muda wa kuleta. Asante! 📦`;

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Generates a wa.me URL for instant digital customer receipts via WhatsApp
 */
export function buildCustomerReceiptUrl(params: {
  customerPhone?: string;
  businessName: string;
  receiptNo: string;
  grandTotal: number;
  items: Array<{ name: string; qty: number; price: number }>;
  fiscalNo?: string;
}): string {
  const normalizedPhone = params.customerPhone ? normalizeE164Phone(params.customerPhone) : '';
  const itemsText = params.items
    .map(it => `• ${it.qty}x ${it.name} - TSh ${(it.qty * it.price).toLocaleString('en-TZ')}`)
    .join('\n');
  const text = `🧾 *${params.businessName.toUpperCase()} - RISITI YA MALIPO*\n\n` +
    `Namba: ${params.receiptNo}\n` +
    (params.fiscalNo ? `EFD/TRA: ${params.fiscalNo}\n` : '') +
    `Tarehe: ${new Date().toLocaleDateString('en-TZ')}\n\n` +
    `*Bidhaa:*\n${itemsText}\n\n` +
    `*JUMLA YOTE: TSh ${Number(params.grandTotal).toLocaleString('en-TZ')}*\n\n` +
    `Asante sana kwa biashara yako! Karibu tena! 🙏`;

  return normalizedPhone
    ? `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
}