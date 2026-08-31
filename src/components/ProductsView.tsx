import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Droplet, 
  Wheat, 
  Sparkles, 
  Edit3, 
  TrendingUp, 
  AlertTriangle, 
  History, 
  Boxes, 
  Trash2, 
  ArrowUpDown, 
  Check, 
  X, 
  Image as ImageIcon,
  IndianRupee,
  Layers,
  ChevronDown,
  Info,
  Package
} from 'lucide-react';
import { Product, ProductCategory, RateHistoryItem, BusinessSettings } from '../types';

interface Props {
  products: Product[];
  settings: BusinessSettings;
  activeCategoryFilter?: string;
  onSelectCategoryFilter?: (cat: string) => void;
  onUpdateRate: (id: string, newRate: number, reason?: string) => Promise<void>;
  onAdjustStock?: (id: string, qtyOrType: any, qty?: number, notes?: string) => Promise<void>;
  onSaveProduct?: (product: Partial<Product>) => Promise<void>;
  onAddProduct?: (product: Partial<Product>) => Promise<void>;
  onDeleteProduct?: (id: string) => Promise<void>;
  searchQuery: string;
  onOpenNewBillWithProduct?: (product: Product) => void;
}

// Curated high quality free-to-use food image presets
const PRESET_IMAGES: { label: string; category: ProductCategory; url: string }[] = [
  { label: 'Groundnut Oil (Cold Pressed)', category: 'oil', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60' },
  { label: 'Virgin Coconut Oil', category: 'oil', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60' },
  { label: 'Sesame Gingelly Oil', category: 'oil', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60' },
  { label: 'Sunflower Cooking Oil', category: 'oil', url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=500&auto=format&fit=crop&q=60' },
  { label: 'Deepam Puja Oil', category: 'oil', url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&auto=format&fit=crop&q=60' },
  { label: 'Wheat Atta', category: 'flour', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60' },
  { label: 'Rice Flour', category: 'flour', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60' },
  { label: 'Ragi Finger Millet Flour', category: 'flour', url: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=500&auto=format&fit=crop&q=60' },
  { label: 'Besan Gram Flour', category: 'flour', url: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=500&auto=format&fit=crop&q=60' },
  { label: 'Red Chilli Powder', category: 'powder', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=60' },
  { label: 'Salem Turmeric Powder', category: 'powder', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=60' },
  { label: 'Coriander Dhaniya Powder', category: 'powder', url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500&auto=format&fit=crop&q=60' },
  { label: 'Sambar & Rasam Masala', category: 'powder', url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&auto=format&fit=crop&q=60' },
  { label: 'Black Pepper Powder', category: 'powder', url: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=500&auto=format&fit=crop&q=60' }
];

export const ProductsView: React.FC<Props> = ({
  products,
  settings,
  activeCategoryFilter,
  onSelectCategoryFilter,
  onUpdateRate,
  onAdjustStock,
  onSaveProduct,
  onAddProduct,
  onDeleteProduct,
  searchQuery,
  onOpenNewBillWithProduct
}) => {
  const [internalCategory, setInternalCategory] = useState<string>('all');
  const activeCat = activeCategoryFilter !== undefined ? activeCategoryFilter : internalCategory;
  const setCat = (cat: string) => {
    if (onSelectCategoryFilter) onSelectCategoryFilter(cat);
    setInternalCategory(cat);
  };

  const [sortBy, setSortBy] = useState<'name' | 'rate' | 'stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [rateEditModalProduct, setRateEditModalProduct] = useState<Product | null>(null);
  const [newRateValue, setNewRateValue] = useState<string>('');
  const [rateReason, setRateReason] = useState<string>('');

  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [stockType, setStockType] = useState<'PURCHASE' | 'DAMAGE' | 'ADJUSTMENT'>('PURCHASE');
  const [stockQtyValue, setStockQtyValue] = useState<string>('10');
  const [stockNotes, setStockNotes] = useState<string>('');

  const [productFormModal, setProductFormModal] = useState<{ isOpen: boolean; product?: Product | null }>({ isOpen: false });
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'oil',
    image: PRESET_IMAGES[0].url,
    unit: 'Litre',
    sellingRate: 150,
    purchaseRate: 120,
    stockQty: 25,
    minStockLevel: 10,
    description: '',
    isActive: true
  });

  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);

  // Filter & Sort Logic
  const filteredProducts = products.filter(p => {
    const matchesCat = activeCat === 'all' || p.category === activeCat;
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'rate') {
      return sortOrder === 'asc' ? a.sellingRate - b.sellingRate : b.sellingRate - a.sellingRate;
    }
    if (sortBy === 'stock') {
      return sortOrder === 'asc' ? a.stockQty - b.stockQty : b.stockQty - a.stockQty;
    }
    return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
  });

  // Handle Rate Edit
  const handleOpenRateEdit = (p: Product) => {
    setRateEditModalProduct(p);
    setNewRateValue(String(p.sellingRate));
    setRateReason('');
  };

  const handleSaveRate = async () => {
    if (!rateEditModalProduct) return;
    const rateNum = Number(newRateValue);
    if (isNaN(rateNum) || rateNum <= 0) return;
    await onUpdateRate(rateEditModalProduct.id, rateNum, rateReason || 'Manual Rate Revision');
    setRateEditModalProduct(null);
  };

  // Handle Stock Adjust
  const handleOpenStockModal = (p: Product) => {
    setStockModalProduct(p);
    setStockType('PURCHASE');
    setStockQtyValue('10');
    setStockNotes('New batch arrival');
  };

  const handleSaveStock = async () => {
    if (!stockModalProduct) return;
    const qty = Number(stockQtyValue);
    if (isNaN(qty) || qty <= 0) return;
    if (onAdjustStock) {
      await onAdjustStock(stockModalProduct.id, stockType === 'DAMAGE' ? -qty : qty, qty, stockNotes);
    }
    setStockModalProduct(null);
  };

  // Handle Product Form
  const handleOpenAddProduct = (defaultCategory?: ProductCategory) => {
    const cat = defaultCategory || (activeCat !== 'all' ? (activeCat as ProductCategory) : 'oil');
    const defaultImage = PRESET_IMAGES.find(i => i.category === cat)?.url || PRESET_IMAGES[0].url;
    setFormData({
      name: '',
      category: cat,
      image: defaultImage,
      unit: cat === 'oil' ? 'Litre' : 'KG',
      sellingRate: 150,
      purchaseRate: 120,
      stockQty: 30,
      minStockLevel: 10,
      description: '',
      isActive: true
    });
    setProductFormModal({ isOpen: true, product: null });
  };

  const handleOpenEditProduct = (p: Product) => {
    setFormData({ ...p });
    setProductFormModal({ isOpen: true, product: p });
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sellingRate) return;
    const productPayload = {
      ...formData,
      id: productFormModal.product ? productFormModal.product.id : undefined
    };
    if (onSaveProduct) {
      await onSaveProduct(productPayload);
    } else if (onAddProduct) {
      await onAddProduct(productPayload);
    }
    setProductFormModal({ isOpen: false });
  };

  return (
    <div className="pb-24 space-y-4 px-3 pt-2 max-w-lg mx-auto">
      {/* Category Pills (Android Chips) */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="cat-tab-all"
            onClick={() => setCat('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCat === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            All Items ({products.length})
          </button>

          <button
            id="cat-tab-oil"
            onClick={() => setCat('oil')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeCat === 'oil'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Droplet className="w-3.5 h-3.5 text-amber-500" />
            Oil Products
          </button>

          <button
            id="cat-tab-flour"
            onClick={() => setCat('flour')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeCat === 'flour'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Wheat className="w-3.5 h-3.5 text-amber-600" />
            Flour
          </button>

          <button
            id="cat-tab-powder"
            onClick={() => setCat('powder')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeCat === 'powder'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Food Powders
          </button>
        </div>
      </div>

      {/* Action Bar with Sort & Add Product */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <span className="font-semibold">Sort:</span>
          <button
            onClick={() => {
              if (sortBy === 'rate') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
              else { setSortBy('rate'); setSortOrder('asc'); }
            }}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium border ${
              sortBy === 'rate' ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            Rate {sortBy === 'rate' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => {
              if (sortBy === 'stock') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
              else { setSortBy('stock'); setSortOrder('asc'); }
            }}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium border ${
              sortBy === 'stock' ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}
          >
            Stock {sortBy === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>

        <button
          id="btn-add-new-product"
          onClick={() => handleOpenAddProduct()}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Products Grid */}
      <div className="space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No products found</p>
            <p className="text-xs text-slate-400 mt-1">Try a different search query or category.</p>
            <button
              onClick={() => handleOpenAddProduct()}
              className="mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              Add New Product Now
            </button>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isLowStock = p.stockQty <= p.minStockLevel && p.stockQty > 0;
            const isOutOfStock = p.stockQty <= 0;

            return (
              <div 
                key={p.id}
                id={`product-card-${p.id}`}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-3 border shadow-xs transition-all relative overflow-hidden ${
                  isOutOfStock ? 'border-rose-400 dark:border-rose-800 bg-rose-50/20' :
                  isLowStock ? 'border-amber-300 dark:border-amber-800 bg-amber-50/20' :
                  'border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                }`}
              >
                <div className="flex gap-3">
                  {/* Product Image with Click Preview */}
                  <div 
                    onClick={() => setSelectedProductDetails(p)}
                    className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 relative shrink-0 overflow-hidden cursor-pointer group"
                  >
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                    <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      p.category === 'oil' ? 'bg-amber-500 text-white' :
                      p.category === 'flour' ? 'bg-amber-700 text-white' : 'bg-rose-500 text-white'
                    }`}>
                      {p.category}
                    </span>
                  </div>

                  {/* Product Info & Live Rates */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 
                        onClick={() => setSelectedProductDetails(p)}
                        className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 cursor-pointer hover:text-emerald-600"
                        title={p.name}
                      >
                        {p.name}
                      </h4>
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                        title="Edit Product Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {p.description || 'Natural high quality mill produce'}
                    </p>

                    {/* Prominent Rate Box */}
                    <div className="mt-1.5 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-xl">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">
                          Current Rate
                        </span>
                        <div className="text-sm font-black text-emerald-700 dark:text-emerald-400 flex items-center">
                          <span>{settings.currencySymbol}{p.sellingRate}</span>
                          <span className="text-[10px] font-semibold text-slate-400 ml-1">/ {p.unit}</span>
                        </div>
                      </div>

                      <button
                        id={`btn-edit-rate-${p.id}`}
                        onClick={() => handleOpenRateEdit(p)}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-2xs"
                      >
                        <History className="w-3 h-3" />
                        Edit Rate
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stock Level Footer & Actions */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">Stock:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isOutOfStock ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                      isLowStock ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {p.stockQty} {p.unit}
                      {isOutOfStock ? ' (Out)' : isLowStock ? ' (Low)' : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      id={`btn-adjust-stock-${p.id}`}
                      onClick={() => handleOpenStockModal(p)}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                    >
                      <Boxes className="w-3 h-3" />
                      Adjust Stock
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ======================================= */}
      {/* 1. EDIT RATE MODAL WITH RATE HISTORY    */}
      {/* ======================================= */}
      {rateEditModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                Update Product Rate
              </h3>
              <button 
                onClick={() => setRateEditModalProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {rateEditModalProduct.name}
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl mb-4 border border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400">Current Selling Rate:</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {settings.currencySymbol}{rateEditModalProduct.sellingRate} / {rateEditModalProduct.unit}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Purchase / Milling Cost:</span>
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  {settings.currencySymbol}{rateEditModalProduct.purchaseRate} / {rateEditModalProduct.unit}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                  New Selling Rate ({settings.currencySymbol} per {rateEditModalProduct.unit})
                </label>
                <input
                  id="input-new-rate-val"
                  type="number"
                  value={newRateValue}
                  onChange={(e) => setNewRateValue(e.target.value)}
                  className="w-full px-3 py-2 text-base font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. 180"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                  Reason for Rate Revision (Optional)
                </label>
                <input
                  id="input-rate-reason"
                  type="text"
                  value={rateReason}
                  onChange={(e) => setRateReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Raw seed price hike at mandi"
                />
              </div>
            </div>

            {/* Previous Rate History Log */}
            {rateEditModalProduct.rateHistory && rateEditModalProduct.rateHistory.length > 0 && (
              <div className="mb-4">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                  Rate History Log
                </span>
                <div className="max-h-28 overflow-y-auto space-y-1 text-xs bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                  {rateEditModalProduct.rateHistory.map((rh, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] py-0.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                      <div>
                        <span className="line-through text-slate-400 mr-1">{settings.currencySymbol}{rh.oldRate}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">→ {settings.currencySymbol}{rh.newRate}</span>
                        {rh.reason && <p className="text-[9px] text-slate-400 truncate max-w-[150px]">{rh.reason}</p>}
                      </div>
                      <span className="text-[9px] text-slate-400">{rh.changedDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setRateEditModalProduct(null)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                id="btn-save-new-rate"
                onClick={handleSaveRate}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
              >
                Update Active Rate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 2. STOCK ADJUSTMENT MODAL               */}
      {/* ======================================= */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-indigo-600" />
                Adjust Stock Inventory
              </h3>
              <button 
                onClick={() => setStockModalProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {stockModalProduct.name}
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Current Available Stock: <strong className="text-slate-900 dark:text-white">{stockModalProduct.stockQty} {stockModalProduct.unit}</strong>
            </p>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setStockType('PURCHASE')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  stockType === 'PURCHASE' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                + Add Purchase
              </button>
              <button
                type="button"
                onClick={() => setStockType('DAMAGE')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  stockType === 'DAMAGE' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                - Damaged / Loss
              </button>
              <button
                type="button"
                onClick={() => setStockType('ADJUSTMENT')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  stockType === 'ADJUSTMENT' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                = Set Exact
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                  Quantity ({stockModalProduct.unit})
                </label>
                <input
                  id="input-stock-qty-val"
                  type="number"
                  value={stockQtyValue}
                  onChange={(e) => setStockQtyValue(e.target.value)}
                  className="w-full px-3 py-2 text-base font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                  Notes / Batch Info
                </label>
                <input
                  id="input-stock-notes"
                  type="text"
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Milled today lot #33"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStockModalProduct(null)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                id="btn-save-stock-adj"
                onClick={handleSaveStock}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
              >
                Save Stock Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 3. ADD / EDIT PRODUCT FORM MODAL        */}
      {/* ======================================= */}
      {productFormModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                {productFormModal.product ? 'Edit Product Item' : 'Add New Produce / Item'}
              </h3>
              <button 
                onClick={() => setProductFormModal({ isOpen: false })}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                  Product Name *
                </label>
                <input
                  id="input-prod-name"
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Pure Sesame Oil / Ragi Flour / Chilli Powder"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Category *
                  </label>
                  <select
                    id="select-prod-category"
                    value={formData.category || 'oil'}
                    onChange={(e) => {
                      const newCat = e.target.value as ProductCategory;
                      setFormData(f => ({ 
                        ...f, 
                        category: newCat,
                        unit: newCat === 'oil' ? 'Litre' : 'KG'
                      }));
                    }}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold outline-none"
                  >
                    <option value="oil">Oil Products (Chekku)</option>
                    <option value="flour">Flour Products (Atta/Rice)</option>
                    <option value="powder">Food Powder / Spices</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Unit Measure *
                  </label>
                  <select
                    id="select-prod-unit"
                    value={formData.unit || 'KG'}
                    onChange={(e) => setFormData(f => ({ ...f, unit: e.target.value }))}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold outline-none"
                  >
                    <option value="Litre">Litre (L)</option>
                    <option value="KG">Kilogram (KG)</option>
                    <option value="500g">500 Gram Pkt</option>
                    <option value="250g">250 Gram Pkt</option>
                    <option value="Tin (15L)">Tin (15 Litre)</option>
                    <option value="Bag (25KG)">Bag (25 KG)</option>
                  </select>
                </div>
              </div>

              {/* Image Preview & Library Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                  Product Image
                </label>
                <div className="flex items-center gap-3">
                  <img 
                    src={formData.image || PRESET_IMAGES[0].url} 
                    alt="Preview" 
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0" 
                  />
                  <div className="flex-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => setShowImagePicker(s => !s)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Choose from Free Stock Library
                    </button>
                    <input
                      type="text"
                      value={formData.image || ''}
                      onChange={(e) => setFormData(f => ({ ...f, image: e.target.value }))}
                      placeholder="Or paste custom image URL"
                      className="w-full px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
                    />
                  </div>
                </div>

                {/* Preset image picker drawer */}
                {showImagePicker && (
                  <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                    {PRESET_IMAGES.map((img, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          setFormData(f => ({ ...f, image: img.url }));
                          setShowImagePicker(false);
                        }}
                        className={`cursor-pointer rounded-xl overflow-hidden border-2 relative aspect-square hover:scale-105 transition-transform ${
                          formData.image === img.url ? 'border-emerald-500 ring-2 ring-emerald-300' : 'border-transparent'
                        }`}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white truncate px-1 py-0.5 text-center">
                          {img.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rates & Costs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Selling Rate ({settings.currencySymbol}) *
                  </label>
                  <input
                    id="input-prod-selling-rate"
                    type="number"
                    required
                    value={formData.sellingRate || ''}
                    onChange={(e) => setFormData(f => ({ ...f, sellingRate: Number(e.target.value) }))}
                    placeholder="180"
                    className="w-full px-3 py-2 text-sm font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Purchase Cost ({settings.currencySymbol})
                  </label>
                  <input
                    id="input-prod-purchase-rate"
                    type="number"
                    value={formData.purchaseRate || ''}
                    onChange={(e) => setFormData(f => ({ ...f, purchaseRate: Number(e.target.value) }))}
                    placeholder="145"
                    className="w-full px-3 py-2 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Stock Quantities */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Initial Stock Qty
                  </label>
                  <input
                    id="input-prod-stock-qty"
                    type="number"
                    value={formData.stockQty || ''}
                    onChange={(e) => setFormData(f => ({ ...f, stockQty: Number(e.target.value) }))}
                    placeholder="50"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                    Min Stock Alert Level
                  </label>
                  <input
                    id="input-prod-min-stock"
                    type="number"
                    value={formData.minStockLevel || ''}
                    onChange={(e) => setFormData(f => ({ ...f, minStockLevel: Number(e.target.value) }))}
                    placeholder="15"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                  Description / Quality Notes
                </label>
                <textarea
                  id="textarea-prod-desc"
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                  placeholder="Pure wood-pressed traditional method, 100% natural and unadulterated."
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                {productFormModal.product && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm(`Delete ${productFormModal.product?.name}?`)) {
                        await onDeleteProduct(productFormModal.product.id);
                        setProductFormModal({ isOpen: false });
                      }
                    }}
                    className="px-3 py-2.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setProductFormModal({ isOpen: false })}
                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-save-prod-form"
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                  >
                    Save Product Item
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 4. PRODUCT DETAILS & STATS MODAL        */}
      {/* ======================================= */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600" />
                Product Analytics & History
              </h3>
              <button 
                onClick={() => setSelectedProductDetails(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-3 mb-4">
              <img 
                src={selectedProductDetails.image} 
                alt={selectedProductDetails.name} 
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700" 
              />
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                  {selectedProductDetails.name}
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded mt-1 inline-block">
                  {selectedProductDetails.category} Produce
                </span>
                <p className="text-xs text-slate-400 mt-1">{selectedProductDetails.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl mb-4 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Selling Rate</span>
                <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  {settings.currencySymbol}{selectedProductDetails.sellingRate} / {selectedProductDetails.unit}
                </p>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Cost Rate</span>
                <p className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                  {settings.currencySymbol}{selectedProductDetails.purchaseRate}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">In Stock</span>
                <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                  {selectedProductDetails.stockQty} {selectedProductDetails.unit}
                </p>
              </div>
            </div>

            {/* Rate History section */}
            <div className="mb-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
                <History className="w-3.5 h-3.5" /> Rate Revision History
              </h5>
              {selectedProductDetails.rateHistory && selectedProductDetails.rateHistory.length > 0 ? (
                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl text-xs">
                  {selectedProductDetails.rateHistory.map((rh, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <div>
                        <span className="line-through text-slate-400 mr-1">{settings.currencySymbol}{rh.oldRate}</span>
                        <span className="font-bold text-emerald-600">→ {settings.currencySymbol}{rh.newRate}</span>
                        {rh.reason && <p className="text-[10px] text-slate-400">{rh.reason}</p>}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{rh.changedDate}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl text-center">
                  Original active rate unchanged since launch.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedProductDetails(null);
                  handleOpenRateEdit(selectedProductDetails);
                }}
                className="flex-1 py-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-300"
              >
                Change Rate
              </button>
              <button
                onClick={() => {
                  setSelectedProductDetails(null);
                  handleOpenStockModal(selectedProductDetails);
                }}
                className="flex-1 py-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-300"
              >
                Adjust Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
