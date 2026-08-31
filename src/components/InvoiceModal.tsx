import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Share2, 
  X, 
  CheckCircle, 
  FileText, 
  QrCode, 
  Phone, 
  Receipt,
  Smartphone
} from 'lucide-react';
import { Sale, BusinessSettings } from '../types';

interface Props {
  sale: Sale | null;
  settings: BusinessSettings;
  onClose: () => void;
  onNewBill: () => void;
}

export const InvoiceModal: React.FC<Props> = ({
  sale,
  settings,
  onClose,
  onNewBill
}) => {
  const [invoiceType, setInvoiceType] = useState<'thermal' | 'standard'>('thermal');

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*${settings.businessName} - Invoice ${sale.billNumber}*\n` +
      `Date: ${new Date(sale.createdAt).toLocaleDateString('en-IN')}\n` +
      `Customer: ${sale.customerName}\n` +
      `Items:\n` +
      sale.items.map(i => `• ${i.productName} (${i.quantity} ${i.unit}) @ ₹${i.rate} = ₹${i.total}`).join('\n') +
      `\n*Total Amount: ₹${sale.finalTotal}*\n` +
      `Payment: ${sale.paymentMethod} (${sale.paymentStatus})\n` +
      `${settings.invoiceFooter}`;
    
    const url = `https://wa.me/${sale.customerPhone ? '91' + sale.customerPhone : ''}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const upiQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.businessName)}&am=${sale.finalTotal}&cu=INR`
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-4 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto animate-in zoom-in-95 duration-150 max-h-[95vh] flex flex-col">
        {/* Header Action Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setInvoiceType('thermal')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                invoiceType === 'thermal' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Thermal Receipt
            </button>
            <button
              onClick={() => setInvoiceType('standard')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                invoiceType === 'standard' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Tax Invoice (A4)
            </button>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Invoice Container */}
        <div className="flex-1 overflow-y-auto py-3 pr-1">
          <div 
            id="printable-invoice"
            className="bg-white text-slate-900 p-4 rounded-2xl border border-slate-200 shadow-xs font-sans text-xs"
          >
            {/* Business Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h2 className="text-base font-extrabold tracking-tight text-slate-900 uppercase">
                {settings.businessName}
              </h2>
              <p className="text-[10px] text-slate-600 mt-0.5">{settings.tagline}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{settings.address}</p>
              <p className="text-[10px] font-medium text-slate-600">Ph: {settings.phone}</p>
              {settings.gstNumber && (
                <p className="text-[10px] font-mono font-bold text-slate-700 mt-0.5">
                  GSTIN: {settings.gstNumber}
                </p>
              )}
            </div>

            {/* Invoice Meta */}
            <div className="py-2.5 border-b border-dashed border-slate-300 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block">Bill No:</span>
                <strong className="font-mono text-slate-900">{sale.billNumber}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Date & Time:</span>
                <span className="font-medium text-slate-800">
                  {new Date(sale.createdAt).toLocaleDateString('en-IN')}{' '}
                  {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-100">
                <span className="text-slate-500">Customer: </span>
                <strong className="text-slate-900">{sale.customerName}</strong>
                {sale.customerPhone && <span className="text-slate-500 ml-1">({sale.customerPhone})</span>}
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2.5">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-500 font-bold uppercase text-[9px]">
                    <th className="pb-1">Item</th>
                    <th className="pb-1 text-center">Qty</th>
                    <th className="pb-1 text-right">Rate</th>
                    <th className="pb-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sale.items.map((item, idx) => (
                    <tr key={idx} className="py-1">
                      <td className="py-1 pr-1 font-semibold text-slate-800">
                        {item.productName}
                      </td>
                      <td className="py-1 text-center font-mono">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-1 text-right font-mono">
                        ₹{item.rate}
                      </td>
                      <td className="py-1 text-right font-bold text-slate-900 font-mono">
                        ₹{item.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">₹{sale.subtotal}</span>
              </div>

              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount Applied:</span>
                  <span className="font-mono">- ₹{sale.discount}</span>
                </div>
              )}

              {sale.taxEnabled && (
                <div className="flex justify-between text-slate-600">
                  <span>GST ({sale.taxPercent}%):</span>
                  <span className="font-mono">₹{sale.taxAmount}</span>
                </div>
              )}

              <div className="pt-1.5 border-t border-slate-400 flex justify-between text-sm font-extrabold text-slate-900">
                <span>NET TOTAL:</span>
                <span className="font-mono text-base">₹{sale.finalTotal}</span>
              </div>

              {/* Payment Details */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px]">
                <div className="flex items-center gap-1 font-bold text-slate-700">
                  <span>Payment Mode:</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 uppercase">
                    {sale.paymentMethod}
                  </span>
                </div>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {sale.paymentStatus}
                </span>
              </div>

              {sale.referenceId && (
                <p className="text-[9px] text-slate-500 font-mono">
                  Ref ID: {sale.referenceId}
                </p>
              )}
            </div>

            {/* Invoice Footer with QR & Blessing */}
            <div className="mt-4 pt-3 border-t border-dashed border-slate-300 text-center">
              <div className="w-20 h-20 mx-auto bg-white p-1 rounded-lg border border-slate-200 mb-1">
                <img src={upiQrImageUrl} alt="UPI QR" className="w-full h-full object-contain" />
              </div>
              <p className="text-[9px] font-mono text-slate-500">Scan & Pay via UPI: {settings.upiId}</p>
              <p className="text-[10px] font-semibold text-slate-700 mt-2">
                {settings.invoiceFooter}
              </p>
              <p className="text-[8px] text-slate-400 mt-0.5">
                Software by Sri Lakshmi Mill POS • Computer Generated Invoice
              </p>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 shrink-0">
          <button
            id="btn-print-invoice"
            onClick={handlePrint}
            className="py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Bill
          </button>

          <button
            id="btn-share-invoice-whatsapp"
            onClick={handleShareWhatsApp}
            className="py-2.5 bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Share2 className="w-4 h-4" />
            WhatsApp
          </button>

          <button
            id="btn-invoice-new-bill"
            onClick={() => {
              onClose();
              onNewBill();
            }}
            className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <Receipt className="w-4 h-4" />
            New Bill
          </button>
        </div>
      </div>
    </div>
  );
};
