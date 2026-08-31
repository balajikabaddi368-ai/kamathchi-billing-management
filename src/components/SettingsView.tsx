import React, { useState } from 'react';
import { 
  Building2, 
  Save, 
  Smartphone, 
  QrCode, 
  FileText, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  Percent, 
  MapPin, 
  Phone, 
  Mail,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { BusinessSettings } from '../types';

interface Props {
  settings: BusinessSettings;
  onUpdateSettings: (newSettings: BusinessSettings) => Promise<void>;
  onExportBackup: () => void;
  onImportBackup: (jsonData: any) => Promise<void>;
}

export const SettingsView: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  onExportBackup,
  onImportBackup
}) => {
  const [formData, setFormData] = useState<BusinessSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm('Importing will restore all products, sales, customers, and expenses. Continue?')) {
          await onImportBackup(json);
          alert('Backup restored successfully!');
        }
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const upiQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `upi://pay?pa=${formData.upiId}&pn=${encodeURIComponent(formData.businessName)}&cu=INR`
  )}`;

  return (
    <div className="pb-28 space-y-4 px-3 pt-2 max-w-lg mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Business Profile & Config
            </h3>
            <p className="text-[11px] text-slate-400">
              Configure Mill info, GST, UPI & Invoices
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Business Store Information */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            Mill Store Details
          </h4>

          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
              Mill Name / Business Name *
            </label>
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => setFormData(f => ({ ...f, businessName: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
              Business Tagline / Subtitle
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData(f => ({ ...f, tagline: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
              Physical Store Address *
            </label>
            <textarea
              rows={2}
              required
              value={formData.address}
              onChange={(e) => setFormData(f => ({ ...f, address: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
              GSTIN / Tax ID (Optional)
            </label>
            <input
              type="text"
              value={formData.gstNumber}
              onChange={(e) => setFormData(f => ({ ...f, gstNumber: e.target.value }))}
              placeholder="e.g. 33AAAAA0000A1Z5"
              className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>

        {/* UPI & Digital Payment Config */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            UPI & GPay Payment Configuration
          </h4>

          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
              Business UPI ID (VPA) *
            </label>
            <input
              type="text"
              required
              value={formData.upiId}
              onChange={(e) => setFormData(f => ({ ...f, upiId: e.target.value }))}
              placeholder="e.g. srilakshmimill@okaxis"
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold outline-none"
            />
          </div>

          {/* QR Code Live Preview */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center gap-3 border border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-200 shrink-0">
              <img src={upiQrImageUrl} alt="UPI QR" className="w-full h-full object-contain" />
            </div>
            <div className="text-[11px]">
              <span className="font-bold text-slate-900 dark:text-white block">Auto Generated UPI QR</span>
              <p className="text-slate-500 text-[10px] mt-0.5">
                Bills will automatically embed dynamic QR codes locked with bill amounts.
              </p>
            </div>
          </div>
        </div>

        {/* Invoicing, Tax & Footer Policy */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            Invoice & Tax Preferences
          </h4>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Default GST %
              </label>
              <input
                type="number"
                min="0"
                max="28"
                value={formData.defaultGstPercent}
                onChange={(e) => setFormData(f => ({ ...f, defaultGstPercent: Number(e.target.value) }))}
                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => setFormData(f => ({ ...f, currencySymbol: e.target.value }))}
                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
              Printed Invoice Footer Greeting
            </label>
            <input
              type="text"
              value={formData.invoiceFooter}
              onChange={(e) => setFormData(f => ({ ...f, invoiceFooter: e.target.value }))}
              placeholder="e.g. Thank you for choosing pure cold pressed oil! Visit again."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          id="btn-save-settings"
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
        >
          <Save className="w-4 h-4" />
          {savedSuccess ? 'Settings Saved Successfully!' : 'Save Business Settings'}
        </button>
      </form>

      {/* Database Backup & Restore Center */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-purple-600" />
          Database Backup & Migration
        </h4>
        <p className="text-[11px] text-slate-500">
          Export full business data (inventory, sales records, customer ledgers, and expenses) to a secure offline JSON backup file.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onExportBackup}
            className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Export Backup
          </button>

          <label className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-slate-200 dark:border-slate-700">
            <Upload className="w-4 h-4 text-blue-600" />
            Import Backup
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
