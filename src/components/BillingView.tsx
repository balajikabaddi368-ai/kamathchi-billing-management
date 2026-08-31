import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Mic, 
  MicOff, 
  Plus, 
  Minus, 
  Trash2, 
  Receipt, 
  ShoppingBag, 
  QrCode, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  X, 
  Volume2,
  Droplet,
  Wheat,
  RotateCcw,
  Smartphone,
  Wallet,
  Clock,
  Layers,
  Check,
  Flame,
  Package,
  Store,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, Customer, CartItem, BusinessSettings, Sale, ProductCategory } from '../types';

interface Props {
  products: Product[];
  customers: Customer[];
  settings: BusinessSettings;
  onCompleteSale: (saleData: any) => Promise<Sale | null>;
  onOpenInvoice: (sale: Sale) => void;
}

// Fallback high quality food image presets by category
const CATEGORY_DEFAULT_IMAGES: Record<ProductCategory, string> = {
  oil: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
  flour: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
  powder: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80'
};

export const BillingView: React.FC<Props> = ({
  products,
  customers,
  settings,
  onCompleteSale,
  onOpenInvoice
}) => {
  // POS Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'grouped'>('grid');
  
  // Customer info
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Discounts & Tax
  const [discount, setDiscount] = useState<number>(0);
  const [applyTax, setApplyTax] = useState<boolean>(settings.taxEnabled);

  // Voice Assistant State
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'CASH' | 'GPAY' | 'CREDIT'>('CASH');
  const [gpayReferenceId, setGpayReferenceId] = useState('');
  const [gpayStep, setGpayStep] = useState<'SHOW_QR' | 'CONFIRMING' | 'DONE'>('SHOW_QR');
  const [creditPaidAmount, setCreditPaidAmount] = useState<string>('0');
  const [isProcessing, setIsProcessing] = useState(false);

  // Image Helper
  const getProductImage = (prod: Product): string => {
    if (prod.image && prod.image.trim() !== '') return prod.image;
    return CATEGORY_DEFAULT_IMAGES[prod.category] || CATEGORY_DEFAULT_IMAGES.oil;
  };

  // Category counts
  const oilCount = products.filter(p => p.category === 'oil' && p.isActive).length;
  const flourCount = products.filter(p => p.category === 'flour' && p.isActive).length;
  const powderCount = products.filter(p => p.category === 'powder' && p.isActive).length;

  // Filtered Products for quick POS selection
  const filteredProducts = products.filter(p => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch && p.isActive;
  });

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxAmount = applyTax ? Math.round((taxableAmount * settings.defaultGstPercent) / 100) : 0;
  const finalTotal = Math.max(0, taxableAmount + taxAmount);

  // Add to cart
  const handleAddToCart = (product: Product, defaultQty: number = 1) => {
    if (product.stockQty <= 0) {
      alert(`${product.name} is currently out of stock!`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + defaultQty;
        if (newQty > product.stockQty) {
          alert(`Max stock available: ${product.stockQty} ${product.unit}`);
          return prev;
        }
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: defaultQty, rate: product.sellingRate }];
    });
  };

  // Update item quantity
  const handleUpdateQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = Math.max(0.5, item.quantity + delta);
          if (newQty > item.product.stockQty) {
            alert(`Stock limit reached (${item.product.stockQty} ${item.product.unit})`);
            return item;
          }
          return { ...item, quantity: Number(newQty.toFixed(2)) };
        }
        return item;
      });
    });
  };

  // Set explicit quantity
  const handleSetExplicitQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          if (qty > item.product.stockQty) {
            alert(`Stock limit reached (${item.product.stockQty} ${item.product.unit})`);
            return { ...item, quantity: item.product.stockQty };
          }
          return { ...item, quantity: qty };
        }
        return item;
      });
    });
  };

  // Remove from cart
  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Setup Voice Assistant with Web Speech API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceFeedback('Listening... Speak product name & quantity (e.g., "2 litre groundnut oil" or "1 kg chilli powder")');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setVoiceTranscript(transcript);
        parseAndExecuteVoiceCommand(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setVoiceFeedback(`Voice recognition stopped: ${event.error}. Please try again.`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [products]);

  // NLP Voice Parser for Mill items (Tamil & English friendly)
  const parseAndExecuteVoiceCommand = (text: string) => {
    const normalized = text.toLowerCase().trim();

    // Check clear bill command
    if (normalized.includes('clear') || normalized.includes('delete bill') || normalized.includes('reset')) {
      setCart([]);
      setVoiceFeedback('Cleared entire current bill items.');
      return;
    }

    // Extract quantity numbers
    const numberMatches = normalized.match(/(\d+(\.\d+)?|\b(half|quarter|one|two|three|four|five|ten)\b)/);
    let qty = 1;
    if (numberMatches) {
      const word = numberMatches[0];
      if (word === 'half') qty = 0.5;
      else if (word === 'quarter') qty = 0.25;
      else if (word === 'one') qty = 1;
      else if (word === 'two') qty = 2;
      else if (word === 'three') qty = 3;
      else if (word === 'four') qty = 4;
      else if (word === 'five') qty = 5;
      else if (word === 'ten') qty = 10;
      else {
        const parsed = parseFloat(word);
        if (!isNaN(parsed)) qty = parsed;
      }
    }

    // Match product keyword in inventory
    let matchedProduct: Product | undefined;

    // Oil matching keywords
    if (normalized.includes('groundnut') || normalized.includes('peanut') || normalized.includes('kadalai')) {
      matchedProduct = products.find(p => p.id === 'prod_oil_1' || p.name.toLowerCase().includes('groundnut'));
    } else if (normalized.includes('coconut') || normalized.includes('thengai')) {
      matchedProduct = products.find(p => p.id === 'prod_oil_2' || p.name.toLowerCase().includes('coconut'));
    } else if (normalized.includes('sesame') || normalized.includes('gingelly') || normalized.includes('nallennai') || normalized.includes('til')) {
      matchedProduct = products.find(p => p.id === 'prod_oil_3' || p.name.toLowerCase().includes('sesame') || p.name.toLowerCase().includes('gingelly'));
    } else if (normalized.includes('sunflower')) {
      matchedProduct = products.find(p => p.id === 'prod_oil_4' || p.name.toLowerCase().includes('sunflower'));
    } else if (normalized.includes('deepam') || normalized.includes('puja') || normalized.includes('lamp') || normalized.includes('vilakku')) {
      matchedProduct = products.find(p => p.id === 'prod_oil_5' || p.name.toLowerCase().includes('deepam') || p.name.toLowerCase().includes('castor'));
    } else if (normalized.includes('castor') || normalized.includes('vilakkennai')) {
      matchedProduct = products.find(p => p.name.toLowerCase().includes('castor') || p.name.toLowerCase().includes('vilakkennai'));
    } else if (normalized.includes('mustard') || normalized.includes('kadugu')) {
      matchedProduct = products.find(p => p.name.toLowerCase().includes('mustard') || p.name.toLowerCase().includes('kadugu'));
    } 
    // Flour matching keywords
    else if (normalized.includes('wheat') || normalized.includes('atta') || normalized.includes('godhumai')) {
      matchedProduct = products.find(p => p.id === 'prod_flour_1' || p.name.toLowerCase().includes('wheat') || p.name.toLowerCase().includes('atta'));
    } else if (normalized.includes('rice flour') || normalized.includes('arisi') || normalized.includes('idiyappam') || normalized.includes('raw rice')) {
      matchedProduct = products.find(p => p.id === 'prod_flour_2' || p.name.toLowerCase().includes('rice flour') || p.name.toLowerCase().includes('raw rice'));
    } else if (normalized.includes('ragi') || normalized.includes('kelvaragu') || normalized.includes('millet')) {
      matchedProduct = products.find(p => p.id === 'prod_flour_3' || p.name.toLowerCase().includes('ragi') || p.name.toLowerCase().includes('millet'));
    } else if (normalized.includes('besan') || normalized.includes('gram') || normalized.includes('kadalai maavu')) {
      matchedProduct = products.find(p => p.id === 'prod_flour_4' || p.name.toLowerCase().includes('besan') || p.name.toLowerCase().includes('gram'));
    } else if (normalized.includes('sathu') || normalized.includes('health mix')) {
      matchedProduct = products.find(p => p.name.toLowerCase().includes('sathu') || p.name.toLowerCase().includes('health'));
    } else if (normalized.includes('maida')) {
      matchedProduct = products.find(p => p.name.toLowerCase().includes('maida'));
    }
    // Powder & Spice matching keywords
    else if (normalized.includes('chilli') || normalized.includes('chili') || normalized.includes('milagai') || normalized.includes('mirchi')) {
      matchedProduct = products.find(p => p.id === 'prod_powder_1' || p.name.toLowerCase().includes('chilli'));
    } else if (normalized.includes('turmeric') || normalized.includes('haldi') || normalized.includes('manjal')) {
      matchedProduct = products.find(p => p.id === 'prod_powder_2' || p.name.toLowerCase().includes('turmeric'));
    } else if (normalized.includes('coriander') || normalized.includes('dhaniya') || normalized.includes('malli')) {
      matchedProduct = products.find(p => p.id === 'prod_powder_3' || p.name.toLowerCase().includes('coriander') || p.name.toLowerCase().includes('dhaniya'));
    } else if (normalized.includes('sambar')) {
      matchedProduct = products.find(p => p.id === 'prod_powder_4' || p.name.toLowerCase().includes('sambar'));
    } else if (normalized.includes('pepper') || normalized.includes('milagu')) {
      matchedProduct = products.find(p => p.id === 'prod_powder_5' || p.name.toLowerCase().includes('pepper'));
    } else if (normalized.includes('rasam')) {
      matchedProduct = products.find(p => p.name.toLowerCase().includes('rasam'));
    } else if (normalized.includes('idli podi') || normalized.includes('gunpowder')) {
      matchedProduct = products.find(p => p.name.toLowerCase().includes('idli podi') || p.name.toLowerCase().includes('gunpowder'));
    } else if (normalized.includes('garam') || normalized.includes('masala')) {
      matchedProduct = products.find(p => p.name.toLowerCase().includes('garam') || p.name.toLowerCase().includes('masala'));
    }

    // Direct fuzzy fallback
    if (!matchedProduct) {
      matchedProduct = products.find(p => {
        const pName = p.name.toLowerCase();
        return normalized.split(' ').some(word => word.length > 3 && pName.includes(word));
      });
    }

    if (matchedProduct) {
      handleAddToCart(matchedProduct, qty);
      setVoiceFeedback(`Added ${qty} ${matchedProduct.unit} of "${matchedProduct.name}" to bill.`);
    } else {
      setVoiceFeedback(`Heard "${text}". Could not find matching product in inventory.`);
    }
  };

  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your browser. You can use the quick voice chips below!');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Quick sample voice triggers
  const triggerSampleVoice = (cmd: string) => {
    setVoiceTranscript(cmd);
    parseAndExecuteVoiceCommand(cmd);
  };

  // Complete & Save Bill
  const handleProcessPayment = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const paidAmt = selectedPaymentMethod === 'CREDIT' 
        ? Number(creditPaidAmount) 
        : finalTotal;

      const salePayload = {
        customerName: customerName || 'Walk-in Customer',
        customerPhone,
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          category: item.product.category,
          unit: item.product.unit,
          quantity: item.quantity,
          rate: item.rate
        })),
        discount,
        taxEnabled: applyTax,
        taxPercent: applyTax ? settings.defaultGstPercent : 0,
        paymentMethod: selectedPaymentMethod,
        paidAmount: paidAmt,
        referenceId: selectedPaymentMethod === 'GPAY' ? (gpayReferenceId || 'UPI-APP-CONFIRMED') : undefined
      };

      const completedSale = await onCompleteSale(salePayload);

      if (completedSale) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Reset cart
        setCart([]);
        setDiscount(0);
        setIsPaymentModalOpen(false);
        setGpayStep('SHOW_QR');
        setGpayReferenceId('');

        // Open Invoice for print / download
        onOpenInvoice(completedSale);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to complete sale. Please check stock levels.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Customer autofill
  const handleSelectCustomer = (c: Customer) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    setShowCustomerDropdown(false);
  };

  // Dynamic UPI URL for QR Code
  const upiPayUrl = `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.businessName)}&am=${finalTotal}&cu=INR&tn=${encodeURIComponent(settings.businessName + ' Bill')}`;
  const upiQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiPayUrl)}`;

  // Render individual product card with image and quick add buttons
  const renderProductCard = (prod: Product) => {
    const inCart = cart.find(i => i.product.id === prod.id);
    const imageUrl = getProductImage(prod);
    const isOutOfStock = prod.stockQty <= 0;
    const isLowStock = prod.stockQty > 0 && prod.stockQty <= prod.minStockLevel;

    return (
      <div
        key={prod.id}
        id={`pos-item-${prod.id}`}
        className={`group rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
          inCart 
            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-sm ring-1 ring-emerald-400/50' 
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-2xs'
        }`}
      >
        {/* Product Image Box */}
        <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
          <img 
            src={imageUrl} 
            alt={prod.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // fallback to category default image
              (e.target as HTMLImageElement).src = CATEGORY_DEFAULT_IMAGES[prod.category];
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Category Badge Overlay */}
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm backdrop-blur-xs ${
              prod.category === 'oil' 
                ? 'bg-amber-500/95 text-slate-950 font-bold' 
                : prod.category === 'flour' 
                ? 'bg-amber-800/95 text-amber-50 font-bold' 
                : 'bg-rose-600/95 text-white font-bold'
            }`}>
              {prod.category === 'oil' && <Droplet className="w-2.5 h-2.5 fill-current" />}
              {prod.category === 'flour' && <Wheat className="w-2.5 h-2.5" />}
              {prod.category === 'powder' && <Flame className="w-2.5 h-2.5 fill-current" />}
              <span>{prod.category === 'oil' ? 'Oil' : prod.category === 'flour' ? 'Flour' : 'Powder'}</span>
            </span>
          </div>

          {/* Stock Tag on Image */}
          <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-white">
            <span className="font-bold text-xs drop-shadow-md">
              {settings.currencySymbol}{prod.sellingRate}<span className="text-[10px] text-slate-200 font-normal">/{prod.unit}</span>
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              isOutOfStock 
                ? 'bg-rose-600/90 text-white' 
                : isLowStock 
                ? 'bg-amber-500/90 text-slate-950 animate-pulse' 
                : 'bg-black/50 text-slate-200'
            }`}>
              {isOutOfStock ? 'Out of Stock' : `${prod.stockQty} ${prod.unit}`}
            </span>
          </div>

          {/* Cart Quantity Indicator Bubble */}
          {inCart && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-600 text-white text-xs font-black rounded-full flex items-center justify-center ring-2 ring-white shadow-md animate-in zoom-in-50">
              {inCart.quantity}
            </div>
          )}
        </div>

        {/* Product Details & Action Buttons */}
        <div className="p-2.5 flex-1 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2" title={prod.name}>
              {prod.name}
            </h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 line-clamp-1 mt-0.5">
              {prod.description}
            </p>
          </div>

          {/* Quantity Selector Chips & 1-Tap Add */}
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            {inCart ? (
              <div className="flex items-center justify-between bg-emerald-100/70 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-xl p-1">
                <button
                  onClick={() => handleUpdateQty(prod.id, -1)}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-bold hover:bg-rose-50 hover:text-rose-600 shadow-2xs active:scale-90"
                  title="Decrease 1"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="text-center px-1">
                  <span className="text-xs font-black text-emerald-900 dark:text-emerald-100 block leading-tight">
                    {inCart.quantity} {prod.unit}
                  </span>
                  <span className="text-[9px] text-emerald-700 dark:text-emerald-300 font-bold">
                    {settings.currencySymbol}{Math.round(inCart.quantity * prod.sellingRate)}
                  </span>
                </div>
                <button
                  onClick={() => handleUpdateQty(prod.id, 1)}
                  className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold hover:bg-emerald-700 shadow-2xs active:scale-90"
                  title="Add 1"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {/* Quick Add +0.5 / +1 / +2 */}
                <button
                  onClick={() => handleAddToCart(prod, prod.category === 'powder' ? 0.5 : 1)}
                  className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add {prod.category === 'powder' ? '500g' : `1 ${prod.unit}`}</span>
                </button>
                <button
                  onClick={() => handleAddToCart(prod, 2)}
                  className="py-1.5 px-2 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-[11px] font-bold border border-slate-200 dark:border-slate-600 transition-colors"
                  title={`Add 2 ${prod.unit}`}
                >
                  +2
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-28 space-y-3 px-3 pt-2 max-w-lg mx-auto">
      {/* Top Customer Bar & Voice Mic */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-xs border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="relative flex-1">
            <input
              id="input-pos-cust-name"
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setShowCustomerDropdown(true);
              }}
              placeholder="Customer Name (or Walk-in)"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {/* Customer autocomplete dropdown */}
            {showCustomerDropdown && customerName.length > 1 && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-36 overflow-y-auto">
                {customers
                  .filter(c => c.name.toLowerCase().includes(customerName.toLowerCase()) || c.phone.includes(customerName))
                  .map(c => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCustomer(c)}
                      className="px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                    >
                      <span className="font-bold text-slate-900 dark:text-white block">{c.name}</span>
                      <span className="text-[10px] text-slate-400">{c.phone} • Due: {settings.currencySymbol}{c.totalDue}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <input
            id="input-pos-cust-phone"
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Phone Number"
            className="w-32 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {/* Voice Assistant Microphone Button */}
          <button
            id="btn-voice-mic"
            onClick={handleToggleVoice}
            className={`p-2.5 rounded-full shadow-md transition-all active:scale-90 relative ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200 dark:ring-rose-900'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title={isListening ? 'Stop Listening' : 'Start Voice Billing (Speak Items)'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            {isListening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
            )}
          </button>
        </div>

        {/* Voice Feedback Banner */}
        {voiceFeedback && (
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{voiceFeedback}</span>
            </div>
            <button onClick={() => setVoiceFeedback(null)} className="text-slate-400 hover:text-slate-600 ml-1">
              ✕
            </button>
          </div>
        )}

        {/* Quick Voice Assistant Trigger Chips */}
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px]">
          <span className="text-slate-400 shrink-0 font-semibold flex items-center gap-0.5">
            <Sparkles className="w-3 h-3 text-amber-500" /> Voice Chips:
          </span>
          <button
            onClick={() => triggerSampleVoice('2 litre groundnut oil')}
            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 rounded-lg text-slate-700 dark:text-slate-300 shrink-0 border border-slate-200 dark:border-slate-700"
          >
            "2L Groundnut Oil"
          </button>
          <button
            onClick={() => triggerSampleVoice('1 kilo rice flour')}
            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 rounded-lg text-slate-700 dark:text-slate-300 shrink-0 border border-slate-200 dark:border-slate-700"
          >
            "1KG Rice Flour"
          </button>
          <button
            onClick={() => triggerSampleVoice('1 kilo chilli powder')}
            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 rounded-lg text-slate-700 dark:text-slate-300 shrink-0 border border-slate-200 dark:border-slate-700"
          >
            "1KG Chilli Powder"
          </button>
          <button
            onClick={() => triggerSampleVoice('clear bill')}
            className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-lg shrink-0 border border-rose-200"
          >
            "Clear Bill"
          </button>
        </div>
      </div>

      {/* POS Products Section with Category Selector & Rich Images */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-xs border border-slate-200 dark:border-slate-800 space-y-3">
        {/* Category Selector Tabs with Visual Badges */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Product Categories
              </h3>
            </div>
            
            {/* View Mode Toggle (Grid vs Grouped Category Sections) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px]">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 py-0.5 rounded-md font-bold transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-slate-500'}`}
              >
                Filtered
              </button>
              <button
                onClick={() => setViewMode('grouped')}
                className={`px-2 py-0.5 rounded-md font-bold transition-colors ${viewMode === 'grouped' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-slate-500'}`}
              >
                All Categories
              </button>
            </div>
          </div>

          {/* Horizontal Category Pill Bar */}
          <div className="grid grid-cols-4 gap-1.5">
            {/* All */}
            <button
              id="pos-tab-all"
              onClick={() => setActiveCategory('all')}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${
                activeCategory === 'all'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="text-[11px] font-bold">All Items</span>
              <span className={`text-[9px] px-1.5 rounded-full ${activeCategory === 'all' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                {products.filter(p => p.isActive).length}
              </span>
            </button>

            {/* Oil */}
            <button
              id="pos-tab-oil"
              onClick={() => setActiveCategory('oil')}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${
                activeCategory === 'oil'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-800/80'
              }`}
            >
              <Droplet className="w-4 h-4 fill-current text-amber-600 dark:text-amber-400" />
              <span className="text-[11px] font-bold">Oils</span>
              <span className={`text-[9px] px-1.5 rounded-full ${activeCategory === 'oil' ? 'bg-amber-600 text-amber-50' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                {oilCount}
              </span>
            </button>

            {/* Flour */}
            <button
              id="pos-tab-flour"
              onClick={() => setActiveCategory('flour')}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${
                activeCategory === 'flour'
                  ? 'bg-amber-800 text-white border-amber-800 font-bold shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-800/80'
              }`}
            >
              <Wheat className="w-4 h-4 text-amber-700 dark:text-amber-300" />
              <span className="text-[11px] font-bold">Flours</span>
              <span className={`text-[9px] px-1.5 rounded-full ${activeCategory === 'flour' ? 'bg-amber-900 text-amber-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                {flourCount}
              </span>
            </button>

            {/* Powder */}
            <button
              id="pos-tab-powder"
              onClick={() => setActiveCategory('powder')}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${
                activeCategory === 'powder'
                  ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-slate-800/80'
              }`}
            >
              <Flame className="w-4 h-4 text-rose-600 dark:text-rose-400 fill-current" />
              <span className="text-[11px] font-bold">Powders</span>
              <span className={`text-[9px] px-1.5 rounded-full ${activeCategory === 'powder' ? 'bg-rose-800 text-rose-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                {powderCount}
              </span>
            </button>
          </div>
        </div>

        {/* Search Input for POS */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="pos-product-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search oil, flour, chilli, turmeric, rice..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* PRODUCTS RENDERING CONTAINER */}
        {viewMode === 'grid' ? (
          <div className="max-h-[380px] overflow-y-auto pr-1 space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {filteredProducts.map(prod => renderProductCard(prod))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="py-10 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <Package className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                <p className="text-xs font-bold">No matching products found</p>
                <p className="text-[10px] mt-0.5">Try clearing your search query or category filter.</p>
              </div>
            )}
          </div>
        ) : (
          /* Grouped by Category View */
          <div className="max-h-[380px] overflow-y-auto pr-1 space-y-4">
            {/* Oil Section */}
            <div>
              <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-amber-200 dark:border-amber-900/50">
                <Droplet className="w-4 h-4 text-amber-500 fill-current" />
                <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                  Traditional Wood-Pressed Oils (மரச்செக்கு எண்ணெய்கள்)
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {products.filter(p => p.category === 'oil' && p.isActive).map(prod => renderProductCard(prod))}
              </div>
            </div>

            {/* Flour Section */}
            <div>
              <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-amber-800/30 dark:border-amber-900/50">
                <Wheat className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                <h4 className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                  Fresh Stone Milled Flours (அரைத்த மாவு வகைகள்)
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {products.filter(p => p.category === 'flour' && p.isActive).map(prod => renderProductCard(prod))}
              </div>
            </div>

            {/* Powder Section */}
            <div>
              <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-rose-200 dark:border-rose-900/50">
                <Flame className="w-4 h-4 text-rose-500 fill-current" />
                <h4 className="text-xs font-black text-rose-900 dark:text-rose-200 uppercase tracking-wide">
                  Pure Spices & Masala Powders (மசாலா பொடி வகைகள்)
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {products.filter(p => p.category === 'powder' && p.isActive).map(prod => renderProductCard(prod))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Bill Items & Cart List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Current Bill Items ({cart.length})
            </h3>
          </div>
          {cart.length > 0 && (
            <button
              id="btn-clear-pos-cart"
              onClick={() => setCart([])}
              className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear Bill
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Receipt className="w-8 h-8 mx-auto mb-1 text-slate-300" />
            <p className="text-xs font-bold">Your bill is empty</p>
            <p className="text-[10px] mt-0.5">Tap products above with images or use the microphone for voice billing!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {cart.map((item) => {
              const itemTotal = Math.round(item.rate * item.quantity);
              const imgUrl = getProductImage(item.product);
              return (
                <div 
                  key={item.product.id}
                  className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2.5"
                >
                  {/* Item Image Thumbnail */}
                  <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                    <img 
                      src={imgUrl} 
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {settings.currencySymbol}{item.rate} × {item.quantity} {item.product.unit}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                    <button
                      onClick={() => handleUpdateQty(item.product.id, item.product.category === 'powder' ? -0.5 : -1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold active:scale-90"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-xs font-black text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQty(item.product.id, item.product.category === 'powder' ? 0.5 : 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold active:scale-90"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Item Total & Remove */}
                  <div className="text-right flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 dark:text-white min-w-[50px] text-right">
                      {settings.currencySymbol}{itemTotal}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.product.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove Item"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bill Calculations Breakdown */}
        {cart.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items):</span>
              <span className="font-semibold">{settings.currencySymbol}{subtotal}</span>
            </div>

            {/* Discount field */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Tag className="w-3 h-3 text-emerald-600" /> Discount ({settings.currencySymbol}):
              </span>
              <input
                id="input-bill-discount"
                type="number"
                min="0"
                value={discount || ''}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-20 px-2 py-1 text-right text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* GST / Tax Checkbox */}
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyTax}
                  onChange={(e) => setApplyTax(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span>Include GST ({settings.defaultGstPercent}%)</span>
              </label>
              <span className="font-semibold">{settings.currencySymbol}{taxAmount}</span>
            </div>

            {/* Final Total Big Display */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Amount</span>
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                  {settings.currencySymbol}{finalTotal}
                </span>
              </div>

              <button
                id="btn-pos-checkout"
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg flex items-center gap-2 transition-all"
              >
                <Receipt className="w-4 h-4" />
                <span>Pay & Print</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================= */}
      {/* PAYMENT METHOD & GPAY QR CODE MODAL     */}
      {/* ======================================= */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  Select Payment Method
                </h3>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                  {settings.businessName}
                </p>
              </div>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/50 p-3 rounded-2xl mb-4 text-center border border-emerald-200 dark:border-emerald-800">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Total Payable Amount</span>
              <p className="text-2xl font-black text-emerald-800 dark:text-emerald-200">
                {settings.currencySymbol}{finalTotal}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Customer: <strong className="text-slate-800 dark:text-slate-200">{customerName}</strong>
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                type="button"
                id="payment-method-cash"
                onClick={() => setSelectedPaymentMethod('CASH')}
                className={`py-3 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                  selectedPaymentMethod === 'CASH'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Wallet className="w-5 h-5 mb-1" />
                <span className="text-xs">CASH</span>
              </button>

              <button
                type="button"
                id="payment-method-gpay"
                onClick={() => setSelectedPaymentMethod('GPAY')}
                className={`py-3 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                  selectedPaymentMethod === 'GPAY'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Smartphone className="w-5 h-5 mb-1" />
                <span className="text-xs">GPAY / UPI</span>
              </button>

              <button
                type="button"
                id="payment-method-credit"
                onClick={() => setSelectedPaymentMethod('CREDIT')}
                className={`py-3 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                  selectedPaymentMethod === 'CREDIT'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md font-bold'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Clock className="w-5 h-5 mb-1" />
                <span className="text-xs">CREDIT DUE</span>
              </button>
            </div>

            {/* If GPAY / UPI Selected: Display Interactive Dynamic QR Code */}
            {selectedPaymentMethod === 'GPAY' && (
              <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 mb-4 text-center">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Scan QR with Google Pay / PhonePe / Paytm
                </p>
                <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow-inner border border-slate-200 my-2">
                  <img 
                    src={upiQrImageUrl} 
                    alt="UPI QR Code" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <p className="text-[11px] font-mono text-slate-600 dark:text-slate-300 font-bold">
                  UPI ID: {settings.upiId}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Amount locked to ₹{finalTotal}
                </p>

                <div className="mt-3 text-left">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    UPI Reference / UTR Number (Optional)
                  </label>
                  <input
                    id="input-gpay-ref"
                    type="text"
                    value={gpayReferenceId}
                    onChange={(e) => setGpayReferenceId(e.target.value)}
                    placeholder="e.g. 902188442200"
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* If CREDIT Selected: Display Paid amount vs Due amount */}
            {selectedPaymentMethod === 'CREDIT' && (
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-300 dark:border-amber-800 mb-4 space-y-2 text-xs">
                <p className="font-bold text-amber-900 dark:text-amber-200">
                  Customer Credit Ledger Entry
                </p>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                    Amount Paid Now ({settings.currencySymbol})
                  </label>
                  <input
                    id="input-credit-paid"
                    type="number"
                    value={creditPaidAmount}
                    onChange={(e) => setCreditPaidAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-bold"
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-between font-semibold pt-1">
                  <span>Balance Outstanding Due:</span>
                  <span className="font-bold text-rose-600">
                    {settings.currencySymbol}{Math.max(0, finalTotal - Number(creditPaidAmount || 0))}
                  </span>
                </div>
              </div>
            )}

            {/* Confirmation & Complete Bill Button */}
            <button
              id="btn-confirm-complete-bill"
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              {isProcessing ? 'Generating Bill...' : `Confirm & Print Bill (${settings.currencySymbol}${finalTotal})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
