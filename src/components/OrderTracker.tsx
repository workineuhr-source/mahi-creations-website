import React, { useState } from 'react';
import { Order, OrderStatus, BoutiqueSettings } from '../types';
import { Search, MapPin, Calendar, Clock, CreditCard, Sparkles, MessageSquare, AlertCircle, ShoppingBag, Truck, Check, Printer, Copy, Download, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MockDeliveryMap from './MockDeliveryMap';

interface OrderTrackerProps {
  orders: Order[];
  onBackToShop: () => void;
  initialSearchId?: string;
  settings?: BoutiqueSettings;
}

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'Pending', label: 'Order Placed', desc: 'Saman safeli booked bhayo. Pending review.' },
  { status: 'Confirmed', label: 'Boutique Confirmed', desc: 'Stock checked ra order verify vayo.' },
  { status: 'Packaging', label: 'Premium Packing', desc: 'Gift wrapping and protective bubble packing done.' },
  { status: 'Out for Delivery', label: 'Out for Delivery', desc: 'Rider is on the way to your exact location.' },
  { status: 'Delivered', label: 'Saman Delivered', desc: 'Item successfully handed over! Enjoy your glow!' }
];

export default function OrderTracker({ orders, onBackToShop, initialSearchId = '', settings }: OrderTrackerProps) {
  const [searchId, setSearchId] = useState(initialSearchId);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(
    initialSearchId ? orders.find(o => o.id.toLowerCase() === initialSearchId.toLowerCase()) || null : null
  );
  const [errorText, setErrorText] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }).catch(err => {
      console.error('Failed to copy tracking ID: ', err);
    });
  };

  const handleDownloadInvoice = (order: Order) => {
    const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const itemsRows = order.items.map((it, idx) => `
      <tr style="border-bottom: 1px solid #f0e6e0;">
        <td style="padding: 12px; text-align: center; color: #737373;">${idx + 1}</td>
        <td style="padding: 12px; font-weight: 600; color: #1a1a1a;">
          ${it.productName}
          ${it.discountPercent > 0 ? `<div style="font-size: 10px; color: #047857; font-weight: normal; margin-top: 2px;">Discount: ${it.discountPercent}% Off</div>` : ''}
        </td>
        <td style="padding: 12px; text-align: right; color: #404040;">Rs. ${it.price.toLocaleString('en-IN')}</td>
        <td style="padding: 12px; text-align: center; color: #404040;">${it.quantity}</td>
        <td style="padding: 12px; text-align: right; font-weight: bold; color: #1a1a1a;">Rs. ${(it.price * it.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const invoiceHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mahi Creations Invoice - ${order.id}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #333;
      line-height: 1.5;
      background-color: #fcfbfa;
      margin: 0;
      padding: 40px 20px;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e5d5cc;
      border-radius: 24px;
      box-shadow: 0 10px 30px rgba(120, 80, 60, 0.05);
      overflow: hidden;
    }
    .header-bar {
      background: #111111;
      color: #ffffff;
      padding: 24px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-logo {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #c5a880;
    }
    .header-title {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      background: rgba(197, 168, 128, 0.2);
      color: #c5a880;
      padding: 6px 16px;
      border-radius: 20px;
    }
    .content {
      padding: 40px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 40px;
    }
    .meta-box {
      background: #faf8f6;
      border: 1px solid #f2ece8;
      border-radius: 16px;
      padding: 20px;
    }
    .meta-box h3 {
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #8c7365;
      border-bottom: 1px solid #eaded7;
      padding-bottom: 8px;
    }
    .meta-box p {
      margin: 6px 0;
      font-size: 13px;
      color: #4a4a4a;
    }
    .meta-box .important-text {
      font-weight: 700;
      color: #111111;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
    }
    th {
      background: #faf8f6;
      color: #8c7365;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
      padding: 12px;
      border-bottom: 2px solid #e5d5cc;
    }
    .summary-section {
      display: flex;
      justify-content: flex-end;
    }
    .summary-box {
      width: 320px;
      font-size: 13px;
      color: #4a4a4a;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .summary-total {
      border-top: 2px solid #111111;
      padding-top: 12px;
      margin-top: 12px;
      font-weight: 800;
      font-size: 15px;
      color: #111111;
    }
    .footer {
      text-align: center;
      margin-top: 60px;
      padding-top: 30px;
      border-top: 1px solid #eaded7;
      font-size: 11px;
      color: #8c7365;
    }
    .btn-print {
      display: inline-block;
      margin-top: 20px;
      background: #111111;
      color: #ffffff;
      text-decoration: none;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 12px 24px;
      border-radius: 12px;
      transition: background 0.2s;
    }
    .btn-print:hover {
      background: #8c7365;
    }
    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .invoice-card {
        border: none;
        box-shadow: none;
      }
      .btn-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header-bar">
      <div class="header-logo">Mahi Creations</div>
      <div class="header-title">Official Invoice</div>
    </div>
    <div class="content">
      <div class="meta-grid">
        <div class="meta-box">
          <h3>Invoice & Tracking Details</h3>
          <p><span class="important-text">Invoice ID:</span> ${order.id}</p>
          <p><span class="important-text">Date Generated:</span> ${dateFormatted}</p>
          <p><span class="important-text">Status:</span> ${order.status}</p>
          <p><span class="important-text">Store Name:</span> ${settings?.shopName || 'Mahi Creations'}</p>
        </div>
        <div class="meta-box">
          <h3>Customer Details</h3>
          <p><span class="important-text">Name:</span> ${order.customerName}</p>
          <p><span class="important-text">Phone:</span> ${order.customerPhone}</p>
          <p><span class="important-text">Delivery Address:</span> ${order.customerAddress}</p>
          <p><span class="important-text">Region:</span> ${order.deliveryLocationName}</p>
          <p><span class="important-text">Payment Method:</span> ${order.paymentMethod}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 50px; text-align: center;">#</th>
            <th style="text-align: left;">Item Description</th>
            <th style="text-align: right; width: 120px;">Unit Price</th>
            <th style="text-align: center; width: 80px;">Qty</th>
            <th style="text-align: right; width: 120px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div class="summary-section">
        <div class="summary-box">
          <div class="summary-row">
            <span>Gross Subtotal:</span>
            <span>Rs. ${order.subtotal.toLocaleString('en-IN')}</span>
          </div>
          ${order.discountAmount > 0 ? `
          <div class="summary-row" style="color: #047857; font-weight: bold;">
            <span>Automated Savings:</span>
            <span>- Rs. ${order.discountAmount.toLocaleString('en-IN')}</span>
          </div>
          ` : ''}
          <div class="summary-row">
            <span>Boutique Delivery Fee:</span>
            <span>${order.deliveryFee === 0 ? 'FREE' : `Rs. ${order.deliveryFee}`}</span>
          </div>
          <div class="summary-row summary-total">
            <span>Total Paid Amount:</span>
            <span>Rs. ${order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      ${order.notes ? `
      <div class="meta-box" style="margin-top: 40px; margin-bottom: 0;">
        <h3>Customer Notes / Delivery Remarks</h3>
        <p style="font-style: italic;">"${order.notes}"</p>
      </div>
      ` : ''}

      <div class="footer">
        <p class="important-text">Thank you for shopping with ${settings?.shopName || 'Mahi Creations'}!</p>
        <p>We appreciate your loyalty and support for boutique cosmetic luxury.</p>
        <p style="font-size: 9px; color: #a3a3a3; margin-top: 15px;">This is an electronically generated boutique invoice. All taxes and custom duties have been settled during boutique review.</p>
        <a href="#" onclick="window.print(); return false;" class="btn-print">Print Invoice Document</a>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mahi_Creations_Invoice_${order.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show toast for feedback
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    
    if (!searchId) {
      setErrorText('Please enter a valid Order ID (e.g., MC-55120)');
      return;
    }

    const found = orders.find(o => o.id.toLowerCase() === searchId.trim().toLowerCase());
    if (found) {
      setSearchedOrder(found);
    } else {
      setSearchedOrder(null);
      setErrorText(`Sorry, order ID "${searchId}" could not be found in our boutique registry. Try 'MC-55120' for demo testing!`);
    }
  };

  // Status mapping to step index
  const getStatusIndex = (status: OrderStatus): number => {
    const indices: Record<OrderStatus, number> = {
      'Pending': 0,
      'Confirmed': 1,
      'Packaging': 2,
      'Out for Delivery': 3,
      'Delivered': 4,
      'Cancelled': -1
    };
    return indices[status] ?? 0;
  };

  const getDisplayLogs = (order: Order) => {
    if (order.statusLogs && order.statusLogs.length > 0) {
      return order.statusLogs;
    }
    const logs = [];
    const createdTime = new Date(order.createdAt);
    
    logs.push({
      status: 'Pending' as OrderStatus,
      note: `Order ${order.id} has been logged in our luxury boutique system.`,
      timestamp: order.createdAt
    });

    const currentIndex = getStatusIndex(order.status);

    if (order.status === 'Cancelled') {
      logs.push({
        status: 'Cancelled' as OrderStatus,
        note: 'This order has been cancelled by the boutique desk.',
        timestamp: new Date(createdTime.getTime() + 1800000).toISOString()
      });
    } else {
      if (currentIndex >= 1) {
        logs.push({
          status: 'Confirmed' as OrderStatus,
          note: 'Mahi Creations verified inventory stock levels and confirmed the booking details.',
          timestamp: new Date(createdTime.getTime() + 1800000).toISOString()
        });
      }
      if (currentIndex >= 2) {
        logs.push({
          status: 'Packaging' as OrderStatus,
          note: 'Your package is compiled with protective double-layered bubble wrap and boutique gift paper.',
          timestamp: new Date(createdTime.getTime() + 3600000).toISOString()
        });
      }
      if (currentIndex >= 3) {
        logs.push({
          status: 'Out for Delivery' as OrderStatus,
          note: `Handed over to our delivery partner. Custom tracking code: ${order.courierTrackingCode || 'MC-EXP-992'}.`,
          timestamp: new Date(createdTime.getTime() + 5400000).toISOString()
        });
      }
      if (currentIndex >= 4) {
        logs.push({
          status: 'Delivered' as OrderStatus,
          note: 'Successfully delivered to the destination address. Thank you for shopping with us!',
          timestamp: new Date(createdTime.getTime() + 7200000).toISOString()
        });
      }
    }

    return [...logs].reverse();
  };

  const getWhatsAppChatLink = (order: Order) => {
    const adminNum = settings?.whatsappNumber || '971501942989';
    const text = encodeURIComponent(`Hello Mahi Creations! I would like to inquire about my Order ID *${order.id}*. Status is currently: *${order.status}*. Please let me know the update!`);
    return `https://wa.me/${adminNum}?text=${text}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 font-sans">
      
      {/* Dynamic Style injection for print-friendly layouts */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide all general web templates, sidebars, bars, or chat helpers */
          header, footer, nav, .no-print, button, .promo-ticker, #whatsapp-chat-bubble, .fixed {
            display: none !important;
          }
          /* Hide standard screen container wrapper inside OrderTracker */
          .screen-tracker-content {
            display: none !important;
          }
          /* Ensure printable invoice is beautifully laid out and printed */
          #printable-invoice {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Printable Invoice Block (Hidden on screen, visible only on printer) */}
      {searchedOrder && (
        <div id="printable-invoice" className="hidden print:block bg-white text-black p-10 font-sans w-full max-w-4xl mx-auto border border-neutral-200">
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-6">
            <div>
              <h1 className="text-2xl font-serif font-extrabold tracking-tight text-neutral-900 uppercase">
                Mahi Creations
              </h1>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest mt-0.5">
                Premium Luxury Cosmetics & Boutique
              </p>
              <div className="text-[11px] text-neutral-600 mt-3 space-y-0.5">
                <p>WhatsApp: +{settings?.whatsappNumber || '971501942989'}</p>
                <p>Email: orders@mahicreations.com</p>
                <p>Web: www.mahicreations.com</p>
              </div>
            </div>
            
            <div className="text-right">
              <h2 className="text-xl font-bold uppercase tracking-wider text-neutral-800">
                Official Invoice
              </h2>
              <div className="text-[11px] text-neutral-600 mt-3 space-y-1">
                <p><span className="font-semibold text-neutral-800">Invoice No:</span> <span className="font-mono">{searchedOrder.id}</span></p>
                <p>
                  <span className="font-semibold text-neutral-800">Date:</span>{' '}
                  {new Date(searchedOrder.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p>
                  <span className="font-semibold text-neutral-800">Payment Status:</span>{' '}
                  <span className="font-bold uppercase text-neutral-900">Authorized / Paid</span>
                </p>
                <p>
                  <span className="font-semibold text-neutral-800">Delivery Status:</span>{' '}
                  <span className="font-bold uppercase text-neutral-900">{searchedOrder.status}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Billing & Shipping Details */}
          <div className="grid grid-cols-2 gap-8 my-8 text-xs">
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <h3 className="font-bold text-neutral-800 uppercase tracking-wider border-b border-neutral-300 pb-1.5 mb-2.5">
                Bill To (Recipient)
              </h3>
              <div className="space-y-1.5 text-neutral-700">
                <p className="font-bold text-neutral-900">{searchedOrder.customerName}</p>
                <p><span className="font-semibold">Phone:</span> {searchedOrder.customerPhone}</p>
              </div>
            </div>

            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <h3 className="font-bold text-neutral-800 uppercase tracking-wider border-b border-neutral-300 pb-1.5 mb-2.5">
                Ship To (Destination)
              </h3>
              <div className="space-y-1.5 text-neutral-700">
                <p className="font-semibold text-neutral-900">{searchedOrder.customerAddress}</p>
                <p><span className="font-semibold">Region:</span> {searchedOrder.deliveryLocationName}</p>
                <p><span className="font-semibold">Payment Method:</span> {searchedOrder.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="my-8">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-800 text-neutral-800 uppercase font-bold text-[10px] tracking-wider bg-neutral-100">
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-center w-16">Qty</th>
                  <th className="p-3 text-right w-24">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-neutral-700">
                {searchedOrder.items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/50">
                    <td className="p-3 text-center text-neutral-500">{idx + 1}</td>
                    <td className="p-3 font-semibold text-neutral-900">
                      {it.productName}
                      {it.discountPercent > 0 && (
                        <span className="text-[10px] text-emerald-700 block font-normal">
                          Discount Applied: {it.discountPercent}% Off
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      Rs. {it.price.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-center">{it.quantity}</td>
                    <td className="p-3 text-right font-bold text-neutral-900">
                      Rs. {(it.price * it.quantity).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Details */}
          <div className="flex justify-end my-8">
            <div className="w-80 text-xs space-y-2.5">
              <div className="flex justify-between text-neutral-600">
                <span>Gross Subtotal:</span>
                <span>Rs. {searchedOrder.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {searchedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Automated Savings:</span>
                  <span>- Rs. {searchedOrder.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>Boutique Delivery Fee:</span>
                <span>{searchedOrder.deliveryFee === 0 ? 'FREE' : `Rs. ${searchedOrder.deliveryFee}`}</span>
              </div>
              <div className="border-t border-neutral-800 pt-3 flex justify-between font-bold text-neutral-900 text-sm">
                <span>Total Paid Amount:</span>
                <span className="text-base font-extrabold">Rs. {searchedOrder.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Remarks if present */}
          {searchedOrder.notes && (
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 my-6 text-xs">
              <p className="font-bold text-neutral-800 uppercase tracking-wider mb-1">Customer Remarks / Note:</p>
              <p className="italic text-neutral-700">"{searchedOrder.notes}"</p>
            </div>
          )}

          {/* Invoice Footer */}
          <div className="text-center border-t border-neutral-300 pt-8 mt-12 text-[11px] text-neutral-500 space-y-1.5">
            <p className="font-semibold text-neutral-700">Thank you for shopping with Mahi Creations!</p>
            <p>We appreciate your loyalty and support for boutique cosmetic luxury.</p>
            <p className="text-[9px] text-neutral-400 mt-2">This is an electronically generated boutique invoice. All taxes and custom duties have been settled during boutique review.</p>
          </div>
        </div>
      )}

      {/* Screen Tracker Container (Hidden on printing) */}
      <div className="screen-tracker-content no-print">
        {/* Tracker Heading */}
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-brand bg-clay-light px-4.5 py-1.5 rounded-full font-bold">
            Boutique Parcel Tracker
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-dark uppercase tracking-tight mt-3">
            Track Your Mahi Order
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm font-light max-w-md mx-auto leading-relaxed">
            Enter your unique Tracking ID starting with "MC-" to inspect live courier progress, payment logs, and packaging state.
          </p>
        </div>

        {/* Search form */}
        <div className="bg-white p-6 rounded-3xl border border-clay shadow-md max-w-xl mx-auto mb-8">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Enter Tracking ID (e.g. MC-55120)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full text-xs sm:text-sm pl-11 pr-4 py-3.5 bg-bg-warm/45 border border-clay rounded-xl focus:outline-none focus:ring-1 focus:ring-brand font-mono font-medium tracking-wide uppercase"
              />
            </div>
            <button
              type="submit"
              className="bg-dark hover:bg-brand text-white text-xs font-bold uppercase tracking-widest px-6 rounded-xl transition cursor-pointer"
            >
              Track
            </button>
          </form>

          {errorText && (
            <div className="flex items-center gap-2 text-red-600 text-xs mt-3 bg-red-50 p-2.5 rounded-lg border border-red-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorText}</span>
            </div>
          )}
        </div>

        {/* Searched Results Display */}
        {searchedOrder ? (
          <div className="space-y-8 animate-fade-in">
            
            {/* Order Header Slate */}
            <div className="bg-dark text-white p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg border border-white/5">
              <div>
                <p className="text-[9px] uppercase tracking-[0.25em] text-brand font-bold">Currently Tracking</p>
                <div className="flex items-center flex-wrap gap-2.5 mt-1.5">
                  <span className="font-mono text-xl sm:text-2xl font-black text-brand-light">{searchedOrder.id}</span>
                  <button
                    onClick={() => handleCopyId(searchedOrder.id)}
                    className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-neutral-200 hover:text-white px-2.5 py-1.5 rounded-xl transition-all duration-200 text-[10px] font-bold uppercase tracking-wider cursor-pointer border border-white/5 shadow-sm"
                    title="Copy Tracking ID to Clipboard"
                  >
                    <Copy className="w-3 h-3 text-brand" />
                    <span>Copy ID</span>
                  </button>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                    searchedOrder.status === 'Delivered'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : searchedOrder.status === 'Cancelled'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-brand/20 text-brand animate-pulse'
                  }`}>
                    ● {searchedOrder.status}
                  </span>
                </div>
              </div>

              {/* Action and date block */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-left sm:text-right w-full sm:w-auto">
                <div className="text-xs">
                  <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Booked Date:</p>
                  <p className="font-semibold text-neutral-200 mt-0.5">
                    {new Date(searchedOrder.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-3 rounded-xl transition cursor-pointer self-start sm:self-center border border-white/10"
                  title="Print official boutique invoice"
                >
                  <Printer className="w-4 h-4 text-brand" />
                  Print Invoice
                </button>
                <button
                  onClick={() => handleDownloadInvoice(searchedOrder)}
                  className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-opacity-90 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-3 rounded-xl transition cursor-pointer self-start sm:self-center"
                  title="Download offline-ready HTML Invoice document"
                >
                  <Download className="w-4 h-4 text-white" />
                  Download Invoice
                </button>
              </div>
            </div>

            {/* Timeline Tracking */}
            {searchedOrder.status === 'Cancelled' ? (
              <div className="p-8 text-center bg-red-50 border border-red-150 rounded-2xl">
                <p className="text-red-700 font-bold text-lg uppercase tracking-wide">Order Cancelled</p>
                <p className="text-neutral-500 text-xs mt-1">
                  Yo order cancel gariyeko chha. Please contact Mahi Creations support for assistance.
                </p>
              </div>
            ) : (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-clay shadow-sm">
                <h4 className="font-serif text-lg font-bold text-dark mb-6 uppercase tracking-wider">Delivery Progress Status</h4>
                
                <div className="relative flex flex-col md:flex-row md:justify-between gap-8 md:gap-4">
                  {/* Visual horizontal track line for desktop */}
                  <div className="hidden md:block absolute left-8 right-8 top-5 h-[2px] bg-clay -z-10" />

                  {STATUS_STEPS.map((step, index) => {
                    const currentIndex = getStatusIndex(searchedOrder.status);
                    const isCompleted = index <= currentIndex;
                    const isActive = index === currentIndex;

                    return (
                      <div key={index} className="flex md:flex-col items-start md:items-center text-left md:text-center gap-4 md:gap-2 flex-1 relative">
                        {/* Tracking Node bubble */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 ${
                          isActive
                            ? 'bg-brand text-white scale-110 ring-4 ring-clay-light'
                            : isCompleted
                            ? 'bg-dark text-white'
                            : 'bg-clay-light text-neutral-400 border border-clay'
                        }`}>
                          {isCompleted && !isActive ? (
                            <Check className="w-5 h-5 stroke-[2.5]" />
                          ) : (
                            index + 1
                          )}
                        </div>

                        {/* Content details */}
                        <div className="space-y-1">
                          <p className={`text-xs font-bold uppercase tracking-wider ${
                            isActive ? 'text-brand' : isCompleted ? 'text-dark' : 'text-neutral-400'
                          }`}>
                            {step.label}
                          </p>
                          <p className="text-[10px] sm:text-xs text-neutral-500 font-light leading-snug md:max-w-[150px] mx-auto">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MOCK DELIVERY MAP INTERFACE */}
            {searchedOrder.status !== 'Cancelled' && (
              <MockDeliveryMap
                deliveryLocationName={searchedOrder.deliveryLocationName}
                customerAddress={searchedOrder.customerAddress}
                customerName={searchedOrder.customerName}
                orderStatus={searchedOrder.status}
                courierName={searchedOrder.courierName}
                courierPhone={searchedOrder.courierPhone}
                estimatedDelivery={searchedOrder.estimatedDelivery}
                orderId={searchedOrder.id}
              />
            )}

            {/* Details breakdown split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Courier, Address Details */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-clay shadow-sm space-y-4">
                  <h4 className="font-serif text-base font-bold text-dark border-b border-clay pb-2 flex items-center gap-2 uppercase tracking-wide">
                    <MapPin className="w-4.5 h-4.5 text-brand" />
                    Shipping & Contact Info
                  </h4>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Recipient Name:</p>
                      <p className="font-semibold text-dark mt-0.5">{searchedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Recipient Mobile Number:</p>
                      <p className="font-semibold text-dark mt-0.5">{searchedOrder.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Exact Shipping Destination:</p>
                      <p className="font-semibold text-dark mt-0.5">{searchedOrder.customerAddress}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Delivery Location Group:</p>
                      <p className="font-semibold text-dark mt-0.5">{searchedOrder.deliveryLocationName}</p>
                    </div>
                    {searchedOrder.notes && (
                      <div>
                        <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Customer Note / Remarks:</p>
                        <p className="text-dark bg-bg-warm p-2.5 rounded-xl border border-clay-light italic mt-0.5">"{searchedOrder.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* COURIER & RIDER DISPATCH INFO */}
                <div className="bg-white p-6 rounded-3xl border border-clay shadow-sm space-y-4">
                  <h4 className="font-serif text-base font-bold text-dark border-b border-clay pb-2 flex items-center gap-2 uppercase tracking-wide">
                    <Truck className="w-4.5 h-4.5 text-brand" />
                    Courier Dispatch & Rider Info
                  </h4>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Courier Service:</p>
                      <p className="font-bold text-dark mt-0.5">{searchedOrder.courierName || 'Mahi Creations Express'}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Rider Phone:</p>
                      {searchedOrder.courierPhone && searchedOrder.courierPhone !== 'Pending review' ? (
                        <a href={`tel:${searchedOrder.courierPhone}`} className="text-brand hover:underline font-bold block mt-0.5">
                          {searchedOrder.courierPhone}
                        </a>
                      ) : (
                        <p className="text-neutral-400 italic mt-0.5">Assigning soon</p>
                      )}
                    </div>
                    <div>
                      <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Courier tracking code:</p>
                      <p className="font-mono font-bold text-dark bg-clay-light/40 px-2 py-0.5 rounded border border-clay/60 inline-block mt-0.5">
                        {searchedOrder.courierTrackingCode || 'MC-EXP-PENDING'}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Estimated Delivery:</p>
                      <p className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        {searchedOrder.estimatedDelivery || 'Within 24 to 48 Hours'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Invoice Breakdown */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-clay shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-center border-b border-clay pb-2">
                      <h4 className="font-serif text-base font-bold text-dark flex items-center gap-2 uppercase tracking-wide">
                        <ShoppingBag className="w-4.5 h-4.5 text-brand" />
                        Order Items Breakdown
                      </h4>
                      {/* Payment Verification Badge */}
                      <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                        (searchedOrder.paymentStatus || (searchedOrder.paymentMethod === 'COD' ? 'Pending' : 'Verified')) === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-350'
                          : (searchedOrder.paymentStatus || (searchedOrder.paymentMethod === 'COD' ? 'Pending' : 'Verified')) === 'Refunded'
                          ? 'bg-blue-100 text-blue-800 border border-blue-350'
                          : 'bg-amber-100 text-amber-800 border border-amber-350 animate-pulse'
                      }`}>
                        {searchedOrder.paymentMethod === 'COD' ? 'COD' : searchedOrder.paymentMethod}: {searchedOrder.paymentStatus || (searchedOrder.paymentMethod === 'COD' ? 'Pending Verification' : 'Verified')}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-48 overflow-y-auto mt-3 pr-2">
                      {searchedOrder.items.map((it, idx) => (
                        <div key={idx} className="flex gap-3 items-center text-xs">
                          <div className="w-10 h-12 rounded bg-clay-light/40 border border-clay overflow-hidden flex-shrink-0">
                            <img src={it.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="font-semibold text-dark truncate">{it.productName}</p>
                            <p className="text-[10px] text-neutral-400 font-bold">Qty: {it.quantity} @ Rs. {it.price.toLocaleString('en-IN')}</p>
                          </div>
                          <span className="font-bold text-dark">Rs. {(it.price * it.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-clay-light pt-3.5 text-xs space-y-2">
                    <div className="flex justify-between text-neutral-500">
                      <span>Discount Subtotal Saved:</span>
                      <span className="text-brand font-bold">- Rs. {searchedOrder.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-neutral-500">
                      <span>Shipping Fee:</span>
                      <span className="text-dark font-bold">{searchedOrder.deliveryFee === 0 ? 'FREE' : `Rs. ${searchedOrder.deliveryFee}`}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-dark pt-1.5 border-t border-dashed border-clay">
                      <span>Paid via {searchedOrder.paymentMethod}:</span>
                      <span className="text-sm font-extrabold text-brand">Rs. {searchedOrder.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* BOUTIQUE NOTES FROM SELLER */}
                {searchedOrder.sellerNotes && (
                  <div className="bg-gradient-to-tr from-brand/5 to-white p-6 rounded-3xl border border-clay shadow-sm space-y-2">
                    <h5 className="text-[10px] uppercase font-bold tracking-widest text-brand flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Message from Boutique Manager
                    </h5>
                    <p className="text-xs font-serif italic text-dark leading-relaxed font-semibold">
                      "{searchedOrder.sellerNotes}"
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* CHRONOLOGICAL SHIPMENT ACTIVITY UPDATES LOGS */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-clay shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-clay pb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-brand animate-ping" />
                <h4 className="font-serif text-base font-bold text-dark uppercase tracking-wide">
                  Boutique Chronological Shipment Updates
                </h4>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-clay">
                {getDisplayLogs(searchedOrder).map((log, index) => (
                  <div key={index} className="relative group text-xs">
                    {/* Circle tracker node */}
                    <div className="absolute -left-[22px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-brand group-hover:bg-brand transition duration-300 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand group-hover:bg-white" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-dark uppercase bg-clay-light px-2 py-0.5 rounded text-[9px] tracking-wider">
                          {log.status}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-bold">
                          {new Date(log.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="text-neutral-600 font-light leading-relaxed">
                      {log.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Chat help */}
            <div className="bg-clay-light border border-clay rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-dark flex items-center gap-1.5 uppercase tracking-wide">
                  <MessageSquare className="w-4.5 h-4.5 text-brand" />
                  Saman Delivery ma Dhilo Vayo?
                </p>
                <p className="text-[11px] text-neutral-500 font-normal mt-1 leading-relaxed max-w-xl">
                  Dherai jaso delivery 24 hours vitra hunchha. Yadi kei inquiry garna paray direct seller ko WhatsApp ma contact gari kura kani garna saknu hunechha.
                </p>
              </div>
              <a
                href={getWhatsAppChatLink(searchedOrder)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-lg shadow transition cursor-pointer"
              >
                Direct WhatsApp Support
              </a>
            </div>

          </div>
        ) : (
          /* Empty / Search Guide screen */
          <div className="text-center py-12 bg-white rounded-3xl border border-clay shadow-inner max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 bg-clay-light border border-clay rounded-full flex items-center justify-center mx-auto text-neutral-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-dark text-sm uppercase tracking-wide">Waiting for Tracking Input</p>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto mt-1 leading-normal">
                Please enter your order's tracking code from checkout. For sandbox testing, feel free to enter <strong className="font-mono text-dark bg-clay-light px-1.5 py-0.5 rounded font-bold">MC-55120</strong> in the field above!
              </p>
            </div>
          </div>
        )}

        {/* Back button */}
        <div className="text-center mt-10">
          <button
            onClick={onBackToShop}
            className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-dark hover:underline transition cursor-pointer"
          >
            &larr; Back to Makeup Shop Catalog
          </button>
        </div>
      </div>

      {/* Clipboard Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            key="order-tracker-toast"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed bottom-6 right-6 bg-dark text-white border border-brand/50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 z-50 text-xs font-bold uppercase tracking-wider"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>Copied to clipboard</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
