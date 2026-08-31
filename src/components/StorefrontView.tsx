import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Sparkles, 
  Droplets, 
  Flame, 
  Heart, 
  ShieldCheck, 
  Truck, 
  Clock, 
  ChevronRight, 
  Star, 
  Check, 
  Plus, 
  Minus, 
  MessageSquare, 
  Share2, 
  QrCode, 
  ExternalLink,
  Info,
  MapPin,
  RefreshCw,
  Award,
  Leaf,
  X,
  Phone,
  ArrowRight,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Product, ProductCategory, BusinessSettings } from '../types';

interface Props {
  products: Product[];
  settings: BusinessSettings;
  onOpenPosWithItem?: (product: Product, qty: number) => void;
  onNavigateToStaff?: () => void;
}

interface CartItemState {
  product: Product;
  packLabel: string;
  packQty: number; // in unit (e.g. 0.5, 1, 2, 5)
  unitPrice: number;
  count: number;
}

export const StorefrontView: React.FC<Props> = ({
  products,
  settings,
  onOpenPosWithItem,
  onNavigateToStaff
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItemState[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [selectedPackByProduct, setSelectedPackByProduct] = useState<Record<string, number>>({});
  const [pincodeInput, setPincodeInput] = useState<string>('620002');
  const [pincodeChecked, setPincodeChecked] = useState<boolean>(true);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: '620002',
    deliveryTime: 'Today Evening (5 PM - 8 PM)',
    paymentMethod: 'UPI' as 'UPI' | 'COD'
  });
  const [orderSuccessModal, setOrderSuccessModal] = useState<boolean>(false);

  // Pack size definitions based on category
  const getPacksForProduct = (product: Product) => {
    if (product.category === 'oil') {
      return [
        { label: '500 ml', multiplier: 0.5, discount: 0, badge: '' },
        { label: '1 Litre', multiplier: 1.0, discount: 0, badge: 'Popular' },
        { label: '2 Litres Can', multiplier: 2.0, discount: 3, badge: 'Save ₹20' },
        { label: '5 Litres Tin', multiplier: 5.0, discount: 5, badge: 'Best Value' }
      ];
    } else if (product.category === 'flour') {
      return [
        { label: '500 g', multiplier: 0.5, discount: 0, badge: '' },
        { label: '1 kg Pack', multiplier: 1.0, discount: 0, badge: 'Standard' },
        { label: '5 kg Bag', multiplier: 5.0, discount: 6, badge: 'Family Pack' },
        { label: '10 kg Bulk', multiplier: 10.0, discount: 8, badge: 'Save 8%' }
      ];
    } else {
      // powder / spices
      return [
        { label: '100 g Pouch', multiplier: 0.1, discount: 0, badge: '' },
        { label: '250 g Pouch', multiplier: 0.25, discount: 0, badge: 'Trial' },
        { label: '500 g Pack', multiplier: 0.5, discount: 4, badge: 'Popular' },
        { label: '1 kg Box', multiplier: 1.0, discount: 8, badge: 'Save ₹30' }
      ];
    }
  };

  const calculatePackPrice = (product: Product, packMultiplier: number, discountPercent = 0) => {
    const rawPrice = product.sellingRate * packMultiplier;
    const finalPrice = discountPercent > 0 ? Math.round(rawPrice * (1 - discountPercent / 100)) : Math.round(rawPrice);
    return finalPrice;
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch && p.isActive !== false;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart calculations
  const cartTotalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.unitPrice * item.count), 0);
  }, [cart]);

  const cartTotalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.count, 0);
  }, [cart]);

  const freeDeliveryThreshold = 499;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartTotalAmount);
  const deliveryCharge = cartTotalAmount >= freeDeliveryThreshold || cartTotalAmount === 0 ? 0 : 40;
  const finalOrderAmount = cartTotalAmount + deliveryCharge;

  // Add to cart
  const handleAddToCart = (product: Product, customMultiplier?: number) => {
    const packs = getPacksForProduct(product);
    const selectedMultiplier = customMultiplier !== undefined 
      ? customMultiplier 
      : (selectedPackByProduct[product.id] ?? packs[1]?.multiplier ?? 1);
    
    const packObj = packs.find(p => p.multiplier === selectedMultiplier) || packs[0];
    const unitPrice = calculatePackPrice(product, packObj.multiplier, packObj.discount);

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && item.packLabel === packObj.label);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].count += 1;
        return updated;
      } else {
        return [...prev, {
          product,
          packLabel: packObj.label,
          packQty: packObj.multiplier,
          unitPrice,
          count: 1
        }];
      }
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartCount = (index: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev];
      const newCount = updated[index].count + delta;
      if (newCount <= 0) {
        updated.splice(index, 1);
      } else {
        updated[index].count = newCount;
      }
      return updated;
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // WhatsApp Checkout builder
  const handleCheckoutViaWhatsApp = () => {
    if (cart.length === 0) return;
    const millPhone = settings.phone.replace(/[^0-9]/g, '') || '919842145678';
    
    let message = `🛒 *NEW ONLINE ORDER from ${settings.businessName}*\n`;
    message += `───────────────────\n`;
    message += `👤 *Customer:* ${customerDetails.name || 'Customer'}\n`;
    message += `📞 *Phone:* ${customerDetails.phone || 'N/A'}\n`;
    message += `📍 *Delivery Address:* ${customerDetails.address || 'Trichy'}\n`;
    message += `⏰ *Preferred Slot:* ${customerDetails.deliveryTime}\n`;
    message += `💳 *Payment Method:* ${customerDetails.paymentMethod}\n`;
    message += `───────────────────\n`;
    message += `*ORDER ITEMS:*\n`;

    cart.forEach((item, idx) => {
      message += `${idx + 1}. ${item.product.name} (${item.packLabel}) x ${item.count} = ${settings.currencySymbol}${item.unitPrice * item.count}\n`;
    });

    message += `───────────────────\n`;
    message += `💰 *Subtotal:* ${settings.currencySymbol}${cartTotalAmount}\n`;
    message += `🚚 *Delivery:* ${deliveryCharge === 0 ? 'FREE' : settings.currencySymbol + deliveryCharge}\n`;
    message += `🔥 *TOTAL AMOUNT:* ${settings.currencySymbol}${finalOrderAmount}\n\n`;
    message += `Please confirm my order & send live extraction update! 🙏`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${millPhone}?text=${encoded}`, '_blank');
    setCheckoutModalOpen(false);
    setOrderSuccessModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24">
      
      {/* 1. HERO BANNER WITH AUTHENTIC CHEKKU MACHINE BACKGROUND */}
      <div className="relative overflow-hidden bg-emerald-950 text-white border-b border-emerald-800/40">
        {/* Background Image with Ambient Gradient Overlays */}
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-luminosity opacity-25 scale-105 transform duration-1000"
          style={{ backgroundImage: `url('/images/chekku_oil_machine.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/90 to-amber-950/80" />
        
        {/* Top Announcement Bar */}
        <div className="relative z-10 bg-amber-500/20 backdrop-blur-md px-4 py-1.5 border-b border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="font-semibold text-amber-100">Live Cold Pressing Today:</span>
            <span className="truncate">Fresh Groundnut & Gingelly Mara Chekku batch running below 42°C</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] shrink-0 font-medium">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Unrefined</span>
            <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-amber-400" /> Free Mill Delivery ₹499+</span>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 md:py-10">
          <div className="grid md:grid-cols-12 gap-6 items-center">
            
            {/* Left text column */}
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-sm">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                <span>Traditional Vaagai Wood Mara Chekku Mill</span>
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
                Pure Cold-Pressed Oils, Stoneground Flours & Fresh Spices
              </h1>

              <p className="text-sm md:text-base text-emerald-100/90 leading-relaxed max-w-xl">
                Directly extracted from locally sourced seeds using traditional rotary wood chekku machinery. Unbleached, free from palm oil adulteration, zero preservatives.
              </p>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-left max-w-lg">
                <div className="bg-emerald-900/60 backdrop-blur-sm border border-emerald-700/50 p-2.5 rounded-xl">
                  <Droplets className="w-5 h-5 text-amber-400 mb-1" />
                  <p className="text-xs font-bold text-white">Wood Pressed</p>
                  <p className="text-[10px] text-emerald-200">Preserves natural Vitamin E</p>
                </div>
                <div className="bg-emerald-900/60 backdrop-blur-sm border border-emerald-700/50 p-2.5 rounded-xl">
                  <Award className="w-5 h-5 text-emerald-400 mb-1" />
                  <p className="text-xs font-bold text-white">Stoneground</p>
                  <p className="text-[10px] text-emerald-200">Slow ground without heat</p>
                </div>
                <div className="bg-emerald-900/60 backdrop-blur-sm border border-emerald-700/50 p-2.5 rounded-xl">
                  <Truck className="w-5 h-5 text-rose-400 mb-1" />
                  <p className="text-xs font-bold text-white">Direct Mill Fresh</p>
                  <p className="text-[10px] text-emerald-200">Packed same day as order</p>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="hero-shop-oils-btn"
                  onClick={() => setSelectedCategory('oil')}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
                >
                  <Droplets className="w-4 h-4 fill-slate-950" />
                  <span>Shop Cold Pressed Oils</span>
                </button>
                <button
                  id="hero-check-pincode-btn"
                  onClick={() => {
                    const el = document.getElementById('pincode-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white font-semibold text-xs md:text-sm border border-emerald-600/40 flex items-center gap-2 transition-all"
                >
                  <MapPin className="w-4 h-4 text-emerald-300" />
                  <span>Check Mill Delivery Area</span>
                </button>
              </div>
            </div>

            {/* Right Showcase Card - Machine Highlight */}
            <div className="md:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-2xl bg-emerald-900/80 backdrop-blur-md group">
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img 
                    src="/images/chekku_oil_machine.jpg" 
                    alt="Authentic Mara Chekku Machine" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-black/20" />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Live Mill Machine</span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> Cold Press Chamber: 38°C (No heat damage)
                    </span>
                    <span className="text-emerald-300 text-[11px]">Daily 10 AM - 7 PM</span>
                  </div>
                  <p className="text-xs text-emerald-100">
                    See live extraction at our mill in Trichy or order online for door delivery.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-300/80 border-t border-emerald-800/60">
                    <span>FSSAI Certified: 12421008000123</span>
                    <span className="font-bold text-amber-300">★ 4.9 (480+ local reviews)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. STICKY E-COMMERCE CONTROLS (SEARCH & CATEGORY TABS) */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              id="store-tab-all"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>All Produce</span>
              <span className="text-[10px] opacity-80">({products.length})</span>
            </button>

            <button
              id="store-tab-oil"
              onClick={() => setSelectedCategory('oil')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'oil'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Mara Chekku Oils</span>
            </button>

            <button
              id="store-tab-flour"
              onClick={() => setSelectedCategory('flour')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'flour'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fresh Flours</span>
            </button>

            <button
              id="store-tab-powder"
              onClick={() => setSelectedCategory('powder')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === 'powder'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Authentic Spices</span>
            </button>
          </div>

          {/* Search Box & Floating Cart Quick Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="storefront-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groundnut oil, atta, turmeric..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Cart Trigger */}
            <button
              id="storefront-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              <span className="bg-amber-400 text-slate-950 text-[11px] font-extrabold px-1.5 py-0.2 rounded-full">
                {cartTotalItemsCount}
              </span>
              {cartTotalAmount > 0 && (
                <span className="hidden md:inline font-bold text-emerald-100">
                  {settings.currencySymbol}{cartTotalAmount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* 3. PRODUCT CATALOG GRID */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        
        {/* Category Header Title */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-extrabold capitalize text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>
                {selectedCategory === 'all' && 'All Mill Products'}
                {selectedCategory === 'oil' && 'Cold-Pressed Wood Chekku Oils (மரச்செக்கு எண்ணெய்)'}
                {selectedCategory === 'flour' && 'Stoneground Whole Grain Flours (மாவு வகைகள்)'}
                {selectedCategory === 'powder' && 'Pure Spices & Food Masala Powders (மசாலா தூள்)'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredProducts.length} farm-fresh items available for direct delivery
            </p>
          </div>

          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            <span>FSSAI Verified Pure</span>
          </div>
        </div>

        {/* Grid of Product Cards */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800 space-y-3">
            <Droplets className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">No products found matching "{searchQuery}"</p>
            <p className="text-xs text-slate-500">Try searching for Groundnut Oil, Sesame, Atta, or Turmeric.</p>
            <button 
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const packs = getPacksForProduct(product);
              const activeMultiplier = selectedPackByProduct[product.id] ?? packs[1]?.multiplier ?? 1;
              const selectedPack = packs.find(p => p.multiplier === activeMultiplier) || packs[0];
              const price = calculatePackPrice(product, selectedPack.multiplier, selectedPack.discount);
              const originalPrice = Math.round(product.sellingRate * selectedPack.multiplier);

              return (
                <div 
                  key={product.id}
                  id={`product-card-${product.id}`}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group hover:border-emerald-500/50"
                >
                  <div>
                    {/* Image Container with Badges */}
                    <div className="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer" onClick={() => setSelectedProductForModal(product)}>
                      <img 
                        src={product.image || '/images/chekku_oil_machine.jpg'} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Category Pill */}
                      <span className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs ${
                        product.category === 'oil' ? 'bg-amber-600' :
                        product.category === 'flour' ? 'bg-amber-800' : 'bg-rose-600'
                      }`}>
                        {product.category === 'oil' ? 'Wood Pressed' : product.category === 'flour' ? 'Stoneground' : 'Pure Spice'}
                      </span>

                      {/* Stock indicator */}
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/90 backdrop-blur-xs text-white flex items-center gap-1">
                        <Check className="w-3 h-3" /> In Stock
                      </span>

                      {/* Bottom Rating & Tamil Title */}
                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                        <span className="font-medium text-emerald-200 text-[11px] truncate">
                          {product.category === 'oil' ? 'மரச்செக்கு எண்ணெய்' : product.category === 'flour' ? 'சுத்தமான மாவு' : 'நாட்டு மசாலா'}
                        </span>
                        <span className="flex items-center gap-1 bg-black/50 px-1.5 py-0.5 rounded text-[11px] font-bold text-amber-300">
                          <Star className="w-3 h-3 fill-amber-300 text-amber-300" /> 4.9
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-3.5 space-y-2.5">
                      <div>
                        <h3 
                          onClick={() => setSelectedProductForModal(product)}
                          className="font-bold text-sm text-slate-800 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer line-clamp-1"
                        >
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {product.description || '100% natural and pure traditional mill extraction with zero additives.'}
                        </p>
                      </div>

                      {/* Pack Size Selector Tabs */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Select Pack Size:
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {packs.map((p) => {
                            const isSelected = selectedPack.multiplier === p.multiplier;
                            return (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => {
                                  setSelectedPackByProduct(prev => ({
                                    ...prev,
                                    [product.id]: p.multiplier
                                  }));
                                }}
                                className={`px-2 py-1.5 rounded-lg text-xs font-semibold border flex items-center justify-between transition-all ${
                                  isSelected 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs' 
                                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                                }`}
                              >
                                <span className="truncate">{p.label}</span>
                                {p.badge ? (
                                  <span className="text-[9px] bg-amber-500 text-slate-950 px-1 py-0.2 rounded font-extrabold shrink-0">
                                    {p.badge}
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price & Add to Cart Footer */}
                  <div className="p-3.5 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-2">
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                            {settings.currencySymbol}{price}
                          </span>
                          {selectedPack.discount > 0 && (
                            <span className="text-xs text-slate-400 line-through">
                              {settings.currencySymbol}{originalPrice}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                          Inclusive of all mill taxes
                        </span>
                      </div>

                      <button
                        id={`btn-add-${product.id}`}
                        onClick={() => handleAddToCart(product, selectedPack.multiplier)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 4. PINCODE & DELIVERY ESTIMATOR SECTION */}
      <div id="pincode-section" className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden border border-emerald-700/40 shadow-xl">
          <div 
            className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 bg-cover bg-center hidden md:block"
            style={{ backgroundImage: `url('/images/chekku_oil_machine.jpg')` }}
          />
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold inline-flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              <span>Mill Doorstep Delivery Service</span>
            </span>
            
            <h3 className="text-xl md:text-2xl font-extrabold text-white">
              Fresh Oil & Flour Delivered Straight to Your Kitchen
            </h3>
            
            <p className="text-xs md:text-sm text-emerald-200 leading-relaxed">
              We deliver freshly pressed batches across Trichy with same-day delivery, and safely package heavy tins across Tamil Nadu & India via express partner courier.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 max-w-md">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value)}
                  placeholder="Enter 6-digit Pincode"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/10 border border-emerald-500/40 text-white placeholder-emerald-300/60 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <button
                onClick={() => setPincodeChecked(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all"
              >
                Check Delivery
              </button>
            </div>

            {pincodeChecked && (
              <div className="pt-2 flex items-center gap-2 text-xs text-emerald-300">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Delivery available for <strong>{pincodeInput || '620002'}</strong>: <strong>Same Day Evening (5 PM - 8 PM)</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. MILL PURITY & TRADITION PROMISE SECTION */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Why Our Mara Chekku Produce is Superior
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare modern commercial refined oil with our authentic single-pressed wood mill method.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center font-bold">
              <Droplets className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Low Temperature Wood Chekku</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We use Vaagai wood pestles running at slow 14 RPM to keep oil temperatures strictly below 45°C, ensuring natural micronutrients and authentic nutty aroma remain intact.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
              <Leaf className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Zero Chemical Refining</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              No hexane solvents, no artificial bleaching agents, and no added palm oil. Filtered naturally through unbleached cotton cloths by sedimentation.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Stoneground Flours & Spices</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Our chakki stones grind whole wheat, ragi, and spices at low speed, preserving essential dietary fiber, bran vitamins, and authentic fragrant oils.
            </p>
          </div>
        </div>
      </div>

      {/* 6. SLIDE-OVER SHOPPING BAG / CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
              
              {/* Cart Drawer Header */}
              <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-300" />
                  <div>
                    <h3 className="font-bold text-base">Your Mill Shopping Bag</h3>
                    <p className="text-[11px] text-emerald-200">{cartTotalItemsCount} items selected</p>
                  </div>
                </div>
                <button
                  id="close-cart-btn"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-full hover:bg-emerald-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Delivery Bar */}
              <div className="bg-amber-50 dark:bg-amber-950/50 p-3 border-b border-amber-200 dark:border-amber-900/60 text-xs">
                {amountNeededForFreeDelivery > 0 ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-amber-900 dark:text-amber-200 font-semibold text-[11px]">
                      <span>Add {settings.currencySymbol}{amountNeededForFreeDelivery} more for <strong>FREE Delivery</strong></span>
                      <span>{Math.round((cartTotalAmount / freeDeliveryThreshold) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-amber-200 dark:bg-amber-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 transition-all duration-300" 
                        style={{ width: `${Math.min(100, (cartTotalAmount / freeDeliveryThreshold) * 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Unlocked FREE Mill Doorstep Delivery!</span>
                  </div>
                )}
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-3 py-12">
                    <ShoppingBag className="w-12 h-12 text-slate-300" />
                    <p className="font-bold text-sm text-slate-600 dark:text-slate-300">Your bag is empty</p>
                    <p className="text-xs text-slate-400 max-w-xs">Add fresh cold pressed oil or stoneground flours to enjoy genuine mill taste.</p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div 
                      key={`${item.product.id}-${item.packLabel}`}
                      className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                        <img 
                          src={item.product.image || '/images/chekku_oil_machine.jpg'} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {item.packLabel}
                        </p>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">
                          {settings.currencySymbol}{item.unitPrice * item.count}
                        </p>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                        <button
                          onClick={() => handleUpdateCartCount(idx, -1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-rose-600 rounded"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold">
                          {item.count}
                        </span>
                        <button
                          onClick={() => handleUpdateCartCount(idx, 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-emerald-600 rounded"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Footer & Checkout */}
              {cart.length > 0 && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Item Total</span>
                      <span>{settings.currencySymbol}{cartTotalAmount}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Mill Delivery</span>
                      <span>{deliveryCharge === 0 ? <strong className="text-emerald-600">FREE</strong> : `${settings.currencySymbol}${deliveryCharge}`}</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                      <span>Order Total</span>
                      <span className="text-emerald-700 dark:text-emerald-400">{settings.currencySymbol}{finalOrderAmount}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      id="cart-checkout-whatsapp-btn"
                      onClick={() => setCheckoutModalOpen(true)}
                      className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Order on WhatsApp</span>
                    </button>
                    
                    <button
                      id="cart-checkout-upi-btn"
                      onClick={() => setCheckoutModalOpen(true)}
                      className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Instant UPI Pay</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 7. CHECKOUT DETAILS & UPI QR MODAL */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Complete Mill Order</h3>
                <p className="text-xs text-slate-500">Instant WhatsApp & UPI Delivery Confirmation</p>
              </div>
              <button onClick={() => setCheckoutModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery Inputs */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Your Full Name *</label>
                <input 
                  type="text"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">WhatsApp Phone *</label>
                  <input 
                    type="tel"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                    placeholder="e.g. 9842100000"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Pincode</label>
                  <input 
                    type="text"
                    value={customerDetails.pincode}
                    onChange={(e) => setCustomerDetails({...customerDetails, pincode: e.target.value})}
                    placeholder="620002"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Delivery Address & Landmark *</label>
                <textarea 
                  value={customerDetails.address}
                  onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                  placeholder="Door No, Street Name, Near Temple / Main Road, Trichy..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* UPI QR Display */}
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3">
                <div className="w-20 h-20 bg-white p-1 rounded-xl shadow-xs shrink-0 flex items-center justify-center">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.businessName)}&am=${finalOrderAmount}&cu=INR`} 
                    alt="UPI QR"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-emerald-900 dark:text-emerald-200">Scan & Pay via GPay / PhonePe</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">UPI ID: <strong className="text-emerald-700 dark:text-emerald-400">{settings.upiId}</strong></p>
                  <p className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">Amount: {settings.currencySymbol}{finalOrderAmount}</p>
                </div>
              </div>
            </div>

            {/* Confirm & Send Button */}
            <div className="pt-2">
              <button
                id="submit-whatsapp-order-btn"
                onClick={handleCheckoutViaWhatsApp}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Confirm & Send Order via WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-2">
                Our mill manager will immediately reply with live packing status & delivery ETA.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* 8. PRODUCT QUICK VIEW MODAL */}
      {selectedProductForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-400/30">
                100% Traditional Mara Chekku Produce
              </span>
              <button onClick={() => setSelectedProductForModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 items-center">
              <div className="h-56 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img 
                  src={selectedProductForModal.image || '/images/chekku_oil_machine.jpg'} 
                  alt={selectedProductForModal.name} 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 text-xs">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedProductForModal.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedProductForModal.description}
                </p>

                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Cold extracted below 45°C</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Zero chemical preservatives or bleaching</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Rich in natural aroma and antioxidants</span>
                  </div>
                </div>

                <div className="pt-3">
                  <span className="text-xs text-slate-400">Standard 1 Unit Rate:</span>
                  <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                    {settings.currencySymbol}{selectedProductForModal.sellingRate} / {selectedProductForModal.unit}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  handleAddToCart(selectedProductForModal);
                  setSelectedProductForModal(null);
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Standard Pack to Bag</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 9. ORDER SUCCESS NOTIFICATION MODAL */}
      {orderSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Order Sent to Mill!</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your order details have been forwarded to the mill WhatsApp manager. Your fresh batch will be packed and dispatched for delivery!
            </p>
            <button
              onClick={() => {
                setOrderSuccessModal(false);
                handleClearCart();
              }}
              className="w-full py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
