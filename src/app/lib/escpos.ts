// ============================================================================
// Pesa Duka v1 — ESC/POS Thermal Receipt Engine & Pluggable Printer Adapters
// Strict 32-column (58mm) and 48-column (80mm) monospace alignment, Web Bluetooth
// GATT streaming with 512-byte MTU slicing, and continuous-feed print fallback.
// ============================================================================

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ReceiptData {
  businessName: string;
  tin?: string;
  vrn?: string;
  serialNumber?: string;
  receiptNumber: string;
  date: string;
  time: string;
  cashier?: string;
  items: ReceiptItem[];
  subtotal: number;
  vatAmount?: number;
  grandTotal: number;
  paymentMethod: string;
  traConfirmationCode?: string;
  traVerificationUrl?: string;
  footerNote?: string;
}

export interface PrintOptions {
  paperWidth: '58mm' | '80mm';
  copies?: number;
}

export interface PrinterAdapter {
  name: string;
  isAvailable(): Promise<boolean>;
  printReceipt(receipt: ReceiptData, options: PrintOptions): Promise<void>;
}

// Format columns strictly for 58mm (32 chars) or 80mm (48 chars)
export function formatReceiptLine(leftText: string, rightText: string, totalWidth = 32): string {
  const leftMax = totalWidth - rightText.length - 1;
  const truncatedLeft = leftText.length > leftMax ? leftText.slice(0, leftMax) : leftText;
  const padding = ' '.repeat(Math.max(1, totalWidth - truncatedLeft.length - rightText.length));
  return `${truncatedLeft}${padding}${rightText}`;
}

export function formatCenteredLine(text: string, totalWidth = 32): string {
  if (text.length >= totalWidth) return text.slice(0, totalWidth);
  const leftPad = Math.floor((totalWidth - text.length) / 2);
  const rightPad = totalWidth - text.length - leftPad;
  return `${' '.repeat(leftPad)}${text}${' '.repeat(rightPad)}`;
}

export function formatDivider(char = '-', totalWidth = 32): string {
  return char.repeat(totalWidth);
}

// ============================================================================
// ESC/POS Binary Generator
// ============================================================================
export class EscPosEncoder {
  private buffer: number[] = [];

  constructor() {
    this.init();
  }

  init(): this {
    this.buffer.push(0x1b, 0x40); // ESC @ (Initialize printer)
    return this;
  }

  alignCenter(): this {
    this.buffer.push(0x1b, 0x61, 0x01); // ESC a 1
    return this;
  }

  alignLeft(): this {
    this.buffer.push(0x1b, 0x61, 0x00); // ESC a 0
    return this;
  }

  bold(enable: boolean): this {
    this.buffer.push(0x1b, 0x45, enable ? 0x01 : 0x00); // ESC E n
    return this;
  }

  doubleHeight(enable: boolean): this {
    this.buffer.push(0x1d, 0x21, enable ? 0x10 : 0x00); // GS ! n
    return this;
  }

  line(text: string): this {
    // Sanitize string to standard ASCII/CP437 compatible bytes
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      this.buffer.push(code < 128 ? code : 0x3f); // replace non-ascii with '?'
    }
    this.buffer.push(0x0a); // Line feed (LF)
    return this;
  }

  feed(lines = 3): this {
    this.buffer.push(0x1b, 0x64, lines); // ESC d n
    return this;
  }

  cut(): this {
    this.buffer.push(0x1d, 0x56, 0x42, 0x00); // GS V 66 0 (Partial cut)
    return this;
  }

  encodeReceipt(receipt: ReceiptData, options: PrintOptions): Uint8Array {
    const width = options.paperWidth === '80mm' ? 48 : 32;

    this.init()
      .alignCenter()
      .bold(true)
      .doubleHeight(true)
      .line(receipt.businessName)
      .doubleHeight(false)
      .bold(false);

    if (receipt.tin) {
      this.line(`TIN: ${receipt.tin}`);
    }
    if (receipt.serialNumber) {
      this.line(`EFD S/N: ${receipt.serialNumber}`);
    }

    this.alignLeft()
      .line(formatDivider('=', width))
      .line(formatReceiptLine(`Stakabadhi:`, receipt.receiptNumber, width))
      .line(formatReceiptLine(`Tarehe: ${receipt.date}`, receipt.time, width))
      .line(formatDivider('-', width))
      .bold(true)
      .line(formatReceiptLine('MAELEZO', 'BEI (TSH)', width))
      .bold(false)
      .line(formatDivider('-', width));

    // Itemized table
    receipt.items.forEach((item) => {
      const line1 = item.name;
      const line2 = formatReceiptLine(` ${item.quantity} x ${item.price.toLocaleString('en-TZ')}`, item.total.toLocaleString('en-TZ'), width);
      this.line(line1);
      this.line(line2);
    });

    this.line(formatDivider('-', width))
      .line(formatReceiptLine('Jumla Ndogo:', `TSh ${receipt.subtotal.toLocaleString('en-TZ')}`, width));

    if (receipt.vatAmount) {
      this.line(formatReceiptLine('VAT (18%):', `TSh ${receipt.vatAmount.toLocaleString('en-TZ')}`, width));
    }

    this.line(formatDivider('=', width))
      .bold(true)
      .line(formatReceiptLine('JUMLA KUU:', `TSh ${receipt.grandTotal.toLocaleString('en-TZ')}`, width))
      .bold(false)
      .line(formatReceiptLine('Njia ya Malipo:', receipt.paymentMethod.toUpperCase(), width))
      .line(formatDivider('-', width));

    if (receipt.traConfirmationCode) {
      this.alignCenter()
        .bold(true)
        .line('TRA FISCAL VERIFICATION')
        .bold(false)
        .line(`Code: ${receipt.traConfirmationCode}`);
      if (receipt.traVerificationUrl) {
        this.line(`Verify: ${receipt.traVerificationUrl}`);
      }
      this.line(formatDivider('-', width));
    }

    this.alignCenter()
      .line(receipt.footerNote || 'Asante kwa Biashara Yako!')
      .line('Tafadhali Tunza Stakabadhi Hii')
      .feed(4)
      .cut();

    return new Uint8Array(this.buffer);
  }
}

// ============================================================================
// Web Bluetooth ESC/POS Adapter
// ============================================================================
export class BluetoothEscPosAdapter implements PrinterAdapter {
  name = 'Bluetooth Thermal Printer';

  // Standard POS Bluetooth GATT service & characteristic UUIDs
  private readonly SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb';
  private readonly CHAR_UUID = '00002af1-0000-1000-8000-00805f9b34fb';

  async isAvailable(): Promise<boolean> {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  async printReceipt(receipt: ReceiptData, options: PrintOptions): Promise<void> {
    if (!('bluetooth' in navigator)) {
      throw new Error('Web Bluetooth API is not available on this device');
    }

    const device = await (navigator as any).bluetooth.requestDevice({
      filters: [{ services: [this.SERVICE_UUID] }],
      optionalServices: [this.SERVICE_UUID],
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(this.SERVICE_UUID);
    const characteristic = await service.getCharacteristic(this.CHAR_UUID);

    const encoder = new EscPosEncoder();
    const bytes = encoder.encodeReceipt(receipt, options);

    // Slicing into 512-byte MTU packets with 20ms delays
    const CHUNK_SIZE = 512;
    for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
      const chunk = bytes.slice(offset, offset + CHUNK_SIZE);
      await characteristic.writeValue(chunk);
      await new Promise((res) => setTimeout(res, 20));
    }

    device.gatt.disconnect();
  }
}

// ============================================================================
// Continuous Thermal CSS Print Adapter (Fallback)
// ============================================================================
export class CssPrintAdapter implements PrinterAdapter {
  name = 'System Print Dialog (58mm/80mm Thermal CSS)';

  async isAvailable(): Promise<boolean> {
    return typeof window !== 'undefined' && typeof window.print === 'function';
  }

  async printReceipt(receipt: ReceiptData, options: PrintOptions): Promise<void> {
    const widthClass = options.paperWidth === '80mm' ? 'thermal-80mm' : 'thermal-58mm';
    let container = document.getElementById('printable-thermal-receipt');
    if (!container) {
      container = document.createElement('div');
      container.id = 'printable-thermal-receipt';
      document.body.appendChild(container);
    }

    container.className = widthClass;
    container.innerHTML = `
      <div class="receipt-header">
        <h2>${receipt.businessName}</h2>
        ${receipt.tin ? `<p>TIN: ${receipt.tin}</p>` : ''}
        ${receipt.serialNumber ? `<p>EFD S/N: ${receipt.serialNumber}</p>` : ''}
        <div class="divider-double"></div>
        <div class="row"><span>Stakabadhi:</span><span>${receipt.receiptNumber}</span></div>
        <div class="row"><span>Tarehe:</span><span>${receipt.date} ${receipt.time}</span></div>
        <div class="divider-single"></div>
      </div>
      <div class="receipt-items">
        ${receipt.items
          .map(
            (i) => `
          <div class="item-name">${i.name}</div>
          <div class="row">
            <span>${i.quantity} x TSh ${i.price.toLocaleString('en-TZ')}</span>
            <span>TSh ${i.total.toLocaleString('en-TZ')}</span>
          </div>
        `
          )
          .join('')}
      </div>
      <div class="receipt-footer">
        <div class="divider-single"></div>
        <div class="row"><span>Jumla Ndogo:</span><span>TSh ${receipt.subtotal.toLocaleString('en-TZ')}</span></div>
        ${receipt.vatAmount ? `<div class="row"><span>VAT (18%):</span><span>TSh ${receipt.vatAmount.toLocaleString('en-TZ')}</span></div>` : ''}
        <div class="divider-double"></div>
        <div class="row bold grand-total"><span>JUMLA KUU:</span><span>TSh ${receipt.grandTotal.toLocaleString('en-TZ')}</span></div>
        <div class="row"><span>Malipo:</span><span>${receipt.paymentMethod.toUpperCase()}</span></div>
        <div class="divider-single"></div>
        ${
          receipt.traConfirmationCode
            ? `
          <p class="tra-code">TRA Confirmation: ${receipt.traConfirmationCode}</p>
        `
            : ''
        }
        <p class="footer-msg">${receipt.footerNote || 'Asante kwa Biashara Yako!'}</p>
      </div>
    `;

    window.print();
  }
}
