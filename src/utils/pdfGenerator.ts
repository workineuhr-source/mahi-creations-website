import { jsPDF } from 'jspdf';
import { Order } from '../types';
import { formatPrice, CurrencyCode } from './currency';

/**
 * Maps currency symbols to safe text codes for standard PDF fonts (which lack some Unicode glyphs like ₹)
 */
function getSafePdfPrice(priceInNpr: number, currency: CurrencyCode): string {
  const formatted = formatPrice(priceInNpr, currency);
  // Replace rupee symbol for pdf safety
  return formatted.replace('₹', 'INR ').replace('€', 'EUR ').replace('Rs.', 'NPR ');
}

export function generateOrderReceiptPDF(order: Order, settings?: any) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const currency = (order.currency as CurrencyCode) || 'NPR';
  const shopNameStr = settings?.shopName || 'Mahi Creations';
  const shopEmailStr = settings?.adminEmail || 'orders@mahicreations.com';
  const rawPhone = settings?.whatsappNumber || '971501942989';
  const shopPhoneStr = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;
  const shopAddressStr = settings?.shopAddress || 'Mai Tower, 4th Floor, Al Nahda 1, Dubai, United Arab Emirates';

  // --- BRAND COLORS & PALETTE ---
  // Luxury Dark: Charcoal (26, 26, 26)
  // Accent/Brand: Soft gold/clay (197, 160, 122)
  // Light Gray bg: (250, 248, 246)
  // Border Gray: (230, 225, 220)

  // Page Width: 210mm, Margins: 15mm, Net Width: 180mm

  // --- HEADER SECTION ---
  // Logo & Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(26, 26, 26);
  doc.text(shopNameStr.toUpperCase(), 15, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 140, 130);
  doc.text('LUXURY HANDCRAFTED BOUTIQUE', 15, 27);

  // Brand Contact Info
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  doc.text(`WhatsApp: ${shopPhoneStr}`, 15, 34);
  doc.text(`Email: ${shopEmailStr}`, 15, 38);
  doc.text(`Web: ${shopNameStr.toLowerCase().replace(/\s+/g, '')}.com`, 15, 42);

  // Right Side - Invoice metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(197, 160, 122); // brand accent color
  doc.text('OFFICIAL RECEIPT', 195, 22, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`Receipt ID: ${order.id}`, 195, 29, { align: 'right' });
  
  const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(`Date: ${dateStr}`, 195, 34, { align: 'right' });
  doc.text(`Payment: ${order.paymentMethod}`, 195, 39, { align: 'right' });

  // Draw Horizontal Accent Bar
  doc.setDrawColor(197, 160, 122);
  doc.setLineWidth(1);
  doc.line(15, 47, 195, 47);

  // --- CUSTOMER DETAILS (2 COLUMN BLOCKS) ---
  // Background card for "Bill To"
  doc.setFillColor(250, 248, 246);
  doc.roundedRect(15, 52, 85, 30, 2, 2, 'F');
  doc.setDrawColor(235, 230, 225);
  doc.setLineWidth(0.25);
  doc.roundedRect(15, 52, 85, 30, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(26, 26, 26);
  doc.text('RECIPIENT (BILL TO)', 20, 58);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.text(`Name: ${order.customerName}`, 20, 64);
  doc.text(`Phone: ${order.customerPhone}`, 20, 70);

  // Background card for "Ship To"
  doc.setFillColor(250, 248, 246);
  doc.roundedRect(110, 52, 85, 30, 2, 2, 'F');
  doc.roundedRect(110, 52, 85, 30, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(26, 26, 26);
  doc.text('DELIVERY DESTINATION', 115, 58);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  
  // Wrap long addresses nicely
  const addressLines = doc.splitTextToSize(order.customerAddress, 75);
  doc.text(addressLines, 115, 64);
  doc.text(`Region: ${order.deliveryLocationName}`, 115, 76);

  // --- PRODUCTS TABLE ---
  let y = 90;
  
  // Table Header
  doc.setFillColor(26, 26, 26); // Dark header
  doc.rect(15, y, 180, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('#', 18, y + 5.5);
  doc.text('Item Description', 25, y + 5.5);
  doc.text('Unit Price', 125, y + 5.5, { align: 'right' });
  doc.text('Qty', 150, y + 5.5, { align: 'center' });
  doc.text('Total', 190, y + 5.5, { align: 'right' });

  y += 8;

  // Table Body Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);

  order.items.forEach((item, index) => {
    // Alternate row backgrounds for better readability
    if (index % 2 === 1) {
      doc.setFillColor(253, 251, 250);
      doc.rect(15, y, 180, 8.5, 'F');
    }
    // Draw bottom borders
    doc.setDrawColor(240, 235, 230);
    doc.setLineWidth(0.15);
    doc.line(15, y + 8.5, 195, y + 8.5);

    doc.setFont('helvetica', 'bold');
    doc.text((index + 1).toString(), 18, y + 5.5);
    
    // Split long item descriptions
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 26, 26);
    const itemDesc = item.productName + (item.discountPercent > 0 ? ` (${item.discountPercent}% Off Applied)` : '');
    const descLines = doc.splitTextToSize(itemDesc, 90);
    doc.text(descLines, 25, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(getSafePdfPrice(item.price, currency), 125, y + 5.5, { align: 'right' });
    doc.text(item.quantity.toString(), 150, y + 5.5, { align: 'center' });
    doc.text(getSafePdfPrice(item.price * item.quantity, currency), 190, y + 5.5, { align: 'right' });

    y += 8.5;
  });

  y += 4;

  // --- BILL FINANCIAL TOTALS ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);

  // Gross Subtotal
  doc.text('Gross Subtotal:', 140, y);
  doc.text(getSafePdfPrice(order.subtotal - order.discountAmount, currency), 190, y, { align: 'right' });
  y += 5;

  // Discount Savings if any
  if (order.discountAmount > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(197, 160, 122); // brand color
    doc.text('Boutique Savings Discount:', 140, y);
    doc.text(`-${getSafePdfPrice(order.discountAmount, currency)}`, 190, y, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    y += 5;
  }

  // Shipping Logistics Fee
  doc.text('Logistics Shipping Fee:', 140, y);
  const deliveryText = order.deliveryFee === 0 ? 'FREE' : getSafePdfPrice(order.deliveryFee, currency);
  doc.text(deliveryText, 190, y, { align: 'right' });
  y += 6;

  // Grand Total Highlighted Card
  doc.setFillColor(250, 248, 246);
  doc.roundedRect(130, y - 4, 65, 10, 1.5, 1.5, 'F');
  doc.setDrawColor(197, 160, 122);
  doc.setLineWidth(0.35);
  doc.roundedRect(130, y - 4, 65, 10, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(26, 26, 26);
  doc.text('TOTAL AMOUNT PAID:', 134, y + 2.5);
  doc.setTextColor(197, 160, 122);
  doc.text(getSafePdfPrice(order.total, currency), 190, y + 2.5, { align: 'right' });

  // --- TERMS, POLICY & FOOTER GREETING ---
  y = 240;
  doc.setDrawColor(230, 225, 220);
  doc.setLineWidth(0.2);
  doc.line(15, y, 195, y);

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('THANK YOU FOR YOUR PATRONAGE!', 105, y, { align: 'center' });

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  doc.text(`Thank you for shopping with ${shopNameStr} luxury boutique. Please keep this receipt for your personal records.`, 105, y, { align: 'center' });
  
  y += 4.5;
  doc.text('For any product questions, custom returns or order adjustments, please text our customer service team on WhatsApp.', 105, y, { align: 'center' });

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(197, 160, 122);
  doc.text(`${shopNameStr.toUpperCase()} BOUTIQUE  •  ${shopAddressStr.toUpperCase()}`, 105, y, { align: 'center' });

  // Save/Download Action
  doc.save(`Mahi_Creations_Receipt_${order.id}.pdf`);
}
