import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-Memory Database Store with REST APIs for Oil, Flour & Food Powder Business
// Note: In production this connects directly to MongoDB/Mongoose models
interface RateHistoryItem {
  id: string;
  oldRate: number;
  newRate: number;
  changedDate: string;
  reason?: string;
}

interface Product {
  id: string;
  name: string;
  category: 'oil' | 'flour' | 'powder';
  image: string;
  unit: string;
  sellingRate: number;
  purchaseRate: number;
  stockQty: number;
  minStockLevel: number;
  description: string;
  isActive: boolean;
  rateHistory: RateHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalPurchases: number;
  billsCount: number;
  totalPaid: number;
  totalDue: number;
  lastPurchaseDate: string;
  createdAt: string;
}

interface SaleItem {
  productId: string;
  productName: string;
  category: 'oil' | 'flour' | 'powder';
  unit: string;
  quantity: number;
  rate: number;
  purchaseRate: number;
  total: number;
}

interface Sale {
  id: string;
  billNumber: string;
  customerName: string;
  customerPhone: string;
  customerId?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  taxEnabled: boolean;
  taxPercent: number;
  taxAmount: number;
  finalTotal: number;
  purchaseCost: number;
  netProfit: number;
  paymentMethod: 'CASH' | 'GPAY' | 'CREDIT';
  paymentStatus: 'PAID' | 'PENDING' | 'PARTIAL';
  paidAmount: number;
  dueAmount: number;
  referenceId?: string;
  createdAt: string;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  createdAt: string;
}

interface StockTransaction {
  id: string;
  productId: string;
  productName: string;
  type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'DAMAGE';
  quantity: number;
  previousStock: number;
  newStock: number;
  notes: string;
  date: string;
}

interface BusinessSettings {
  businessName: string;
  tagline: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  upiId: string;
  upiQrCodeUrl: string;
  invoiceFooter: string;
  currencySymbol: string;
  taxEnabled: boolean;
  defaultGstPercent: number;
}

// Initial Seed Data
let products: Product[] = [
  // OIL PRODUCTS (எண்ணெய் வகைகள்)
  {
    id: 'prod_oil_1',
    name: 'Groundnut Oil (Cold Pressed / Marachekku)',
    category: 'oil',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
    unit: 'Litre',
    sellingRate: 180,
    purchaseRate: 145,
    stockQty: 45,
    minStockLevel: 15,
    description: 'Pure wood-pressed traditional groundnut oil, 100% natural and unrefined.',
    isActive: true,
    rateHistory: [
      { id: 'rh_1', oldRate: 175, newRate: 180, changedDate: '2026-08-15', reason: 'Raw peanut market price hike' }
    ],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-15T09:30:00.000Z'
  },
  {
    id: 'prod_oil_2',
    name: 'Virgin Coconut Oil (தேங்காய் எண்ணெய்)',
    category: 'oil',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
    unit: 'Litre',
    sellingRate: 240,
    purchaseRate: 190,
    stockQty: 8, // Low stock demo
    minStockLevel: 12,
    description: 'Fresh copra cold pressed coconut oil with aromatic natural fragrance.',
    isActive: true,
    rateHistory: [
      { id: 'rh_2', oldRate: 230, newRate: 240, changedDate: '2026-08-10', reason: 'Seasonal copra adjustment' }
    ],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z'
  },
  {
    id: 'prod_oil_3',
    name: 'Sesame / Gingelly Oil (நல்லெண்ணெய்)',
    category: 'oil',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80',
    unit: 'Litre',
    sellingRate: 320,
    purchaseRate: 260,
    stockQty: 28,
    minStockLevel: 10,
    description: 'Crushed with palm jaggery in traditional stone mill.',
    isActive: true,
    rateHistory: [],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'prod_oil_4',
    name: 'Refined Sunflower Oil (சூரியகாந்தி எண்ணெய்)',
    category: 'oil',
    image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=600&auto=format&fit=crop&q=80',
    unit: 'Litre',
    sellingRate: 140,
    purchaseRate: 118,
    stockQty: 60,
    minStockLevel: 20,
    description: 'Light, healthy cooking sunflower oil fortified with vitamins.',
    isActive: true,
    rateHistory: [],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'prod_oil_5',
    name: 'Deepam / Pancha Deepam Puja Lamp Oil',
    category: 'oil',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80',
    unit: 'Litre',
    sellingRate: 110,
    purchaseRate: 85,
    stockQty: 35,
    minStockLevel: 15,
    description: 'Pancha Deepam fragrant blend for divine temple & home worship.',
    isActive: true,
    rateHistory: [],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'prod_oil_6',
    name: 'Pure Castor Oil (விளக்கெண்ணெய்)',
    category: 'oil',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80',
    unit: 'Litre',
    sellingRate: 260,
    purchaseRate: 200,
    stockQty: 22,
    minStockLevel: 8,
    description: '100% pure cold pressed castor oil for cooling, cooking, and hair care.',
    isActive: true,
    rateHistory: [],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'prod_oil_7',
    name: 'Cold Pressed Mustard Oil (கடுகு எண்ணெய்)',
    category: 'oil',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
    unit: 'Litre',
    sellingRate: 195,
    purchaseRate: 150,
    stockQty: 18,
    minStockLevel: 6,
    description: 'Kachi Ghani pungent pure mustard oil for pickles and healthy frying.',
    isActive: true,
    rateHistory: [],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z'
  },

  // FLOUR PRODUCTS (மாவு வகைகள்)
  {
    id: 'prod_flour_1',
    name: 'Sharbati Whole Wheat Atta (கோதுமை மாவு)',
    category: 'flour',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    unit: 'KG',
    sellingRate: 55,
    purchaseRate: 42,
    stockQty: 120,
    minStockLevel: 30,
    description: 'Stone ground whole wheat atta, 100% bran intact for soft rotis.',
    isActive: true,
    rateHistory: [],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'prod_flour_2',
    name: 'Pure Raw Rice Flour (அரிசி மாவு)',
    category: 'flour',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    unit: 'KG',
    sellingRate: 48,
    purchaseRate: 36,
    stockQty: 6, // Low stock demo
    minStockLevel: 25,
    description: 'Finely milled and roasted white rice flour for Idiyappam, Kozhukattai, and snacks.',
    isActive: true,
    rateHistory: [
      { id: 'rh_3', oldRate: 45, newRate: 48, changedDate: '2026-08-20', reason: 'Paddy cost increase' }
    ],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-20T08:00:00.000Z'
  },
  {
    id: 'prod_flour_3',
    name: 'Organic Ragi / Finger Millet Flour (கேழ்வரகு மாவு)',
    category: 'flour',
    image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=600&auto=format&fit=crop&q=80',
    unit: 'KG',
    sellingRate: 60,
    purchaseRate: 45,
    stockQty: 50,
    minStockLevel: 15,
    description: 'High calcium sprouted finger millet powder for porridge, dosas, and ragi mudde.',
    isActive: true,
    rateHistory: [],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'prod_flour_4',
    name: 'Fresh Besan / Gram Flour (கடலை மாவு)',
    category: 'flour',
    image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&auto=format&fit=crop&q=80',
    unit: 'KG',
    sellingRate: 95,
    purchaseRate: 75,
    stockQty: 40,
    minStockLevel: 15,
    description: 'Freshly ground premium chana dal flour for savouries, pakoras, and sweets.',
    isActive: true,
    rateHistory: [],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'prod_flour_5',
    name: 'Multi-Grain Sathu Maavu / Health Mix (சத்து மாவு)',
    category: 'flour',
    image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=600&auto=format&fit=crop&q=80',
    unit: 'KG',
    sellingRate: 180,
    purchaseRate: 135,
    stockQty: 30,
    minStockLevel: 10,
    description: 'Traditional 18-grain roasted nutrient-dense health mix for family nutrition.',
    isActive: true,
    rateHistory: [],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'prod_flour_6',
    name: 'All-Purpose Maida Flour (மைதா மாவு)',
    category: 'flour',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    unit: 'KG',
    sellingRate: 52,
    purchaseRate: 38,
    stockQty: 75,
    minStockLevel: 20,
    description: 'Ultra-fine soft refined wheat flour for parotta and bakery delicacies.',
    isActive: true,
    rateHistory: [],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z'
  },

  // FOOD POWDER & SPICE PRODUCTS (மசாலா பொடி வகைகள்)
  {
    id: 'prod_powder_1',
    name: 'Guntur Red Chilli Powder (மிளகாய் தூள்)',
    category: 'powder',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    unit: 'KG',
    sellingRate: 340,
    purchaseRate: 260,
    stockQty: 32,
    minStockLevel: 10,
    description: 'Sun-dried premium red chillies stone ground without artificial colours.',
    isActive: true,
    rateHistory: [
      { id: 'rh_4', oldRate: 320, newRate: 340, changedDate: '2026-08-05', reason: 'Spice market revision' }
    ],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-05T08:00:00.000Z'
  },
  {
    id: 'prod_powder_2',
    name: 'Salem Pure Turmeric Powder (மஞ்சள் தூள்)',
    category: 'powder',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
    unit: 'KG',
    sellingRate: 280,
    purchaseRate: 210,
    stockQty: 25,
    minStockLevel: 10,
    description: 'Double polished Salem turmeric fingers ground to fine golden powder high in curcumin.',
    isActive: true,
    rateHistory: [],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'prod_powder_3',
    name: 'Coriander / Dhaniya Powder (மல்லி தூள்)',
    category: 'powder',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80',
    unit: 'KG',
    sellingRate: 220,
    purchaseRate: 165,
    stockQty: 18,
    minStockLevel: 8,
    description: 'Roasted and ground green coriander seeds with rich natural aromatic essential oils.',
    isActive: true,
    rateHistory: [],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'prod_powder_4',
    name: 'Traditional Home-Made Sambar Powder (சாம்பார் பொடி)',
    category: 'powder',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80',
    unit: 'KG',
    sellingRate: 380,
    purchaseRate: 280,
    stockQty: 4, // Low stock demo
    minStockLevel: 10,
    description: '14-ingredient authentic South Indian grandma recipe blend.',
    isActive: true,
    rateHistory: [],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'prod_powder_5',
    name: 'Malabar Black Pepper Powder (மிளகு தூள்)',
    category: 'powder',
    image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80',
    unit: 'KG',
    sellingRate: 750,
    purchaseRate: 590,
    stockQty: 14,
    minStockLevel: 5,
    description: 'Coarse and fine grade tellicherry black pepper for soups and curries.',
    isActive: true,
    rateHistory: [],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'prod_powder_6',
    name: 'Special Chettinad Rasam Powder (ரசம் பொடி)',
    category: 'powder',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80',
    unit: 'KG',
    sellingRate: 360,
    purchaseRate: 270,
    stockQty: 20,
    minStockLevel: 8,
    description: 'Freshly roasted cumin, pepper, garlic & coriander blend for aromatic digestive rasam.',
    isActive: true,
    rateHistory: [],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'prod_powder_7',
    name: 'Spicy Idli Podi / Gunpowder (இட்லி பொடி)',
    category: 'powder',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    unit: 'KG',
    sellingRate: 320,
    purchaseRate: 240,
    stockQty: 25,
    minStockLevel: 10,
    description: 'Crunchy roasted urad dal, sesame, red chilli & hing podi to pair with hot gingelly oil.',
    isActive: true,
    rateHistory: [],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z'
  },
  {
    id: 'prod_powder_8',
    name: 'Aromatic Garam Masala Powder (கரம் மசாலா)',
    category: 'powder',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80',
    unit: 'KG',
    sellingRate: 650,
    purchaseRate: 490,
    stockQty: 16,
    minStockLevel: 6,
    description: 'Royal whole spices roasted with cardamom, clove, cinnamon, and mace.',
    isActive: true,
    rateHistory: [],
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-01T08:00:00.000Z'
  }
];

let customers: Customer[] = [
  {
    id: 'cust_1',
    name: 'Murugan Supermarket & Caterers',
    phone: '9840123456',
    address: 'No 45, Bazaar Street, Market Area',
    totalPurchases: 18450,
    billsCount: 8,
    totalPaid: 15450,
    totalDue: 3000,
    lastPurchaseDate: '2026-08-31',
    createdAt: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'cust_2',
    name: 'Annapoorna Mess & Hotel',
    phone: '9876543210',
    address: '12 Temple Ring Road, Gandhinagar',
    totalPurchases: 32600,
    billsCount: 14,
    totalPaid: 32600,
    totalDue: 0,
    lastPurchaseDate: '2026-08-31',
    createdAt: '2026-08-01T11:00:00.000Z'
  },
  {
    id: 'cust_3',
    name: 'Ramesh Kumar (Retail)',
    phone: '9444112233',
    address: 'Flat 3B, Sunshine Apartments',
    totalPurchases: 2450,
    billsCount: 3,
    totalPaid: 2450,
    totalDue: 0,
    lastPurchaseDate: '2026-08-30',
    createdAt: '2026-08-05T12:00:00.000Z'
  },
  {
    id: 'cust_4',
    name: 'Lakshmi Sweets & Bakery',
    phone: '9789012345',
    address: 'Near Bus Stand, Main Road',
    totalPurchases: 14200,
    billsCount: 5,
    totalPaid: 11700,
    totalDue: 2500,
    lastPurchaseDate: '2026-08-28',
    createdAt: '2026-08-08T09:00:00.000Z'
  }
];

let sales: Sale[] = [
  {
    id: 'sale_1021',
    billNumber: 'INV-1021',
    customerName: 'Annapoorna Mess & Hotel',
    customerPhone: '9876543210',
    customerId: 'cust_2',
    items: [
      { productId: 'prod_oil_1', productName: 'Groundnut Oil (Cold Pressed / Marachekku)', category: 'oil', unit: 'Litre', quantity: 15, rate: 180, purchaseRate: 145, total: 2700 },
      { productId: 'prod_flour_1', productName: 'Sharbati Whole Wheat Atta', category: 'flour', unit: 'KG', quantity: 20, rate: 55, purchaseRate: 42, total: 1100 },
      { productId: 'prod_powder_1', productName: 'Guntur Red Chilli Powder (High Pungency)', category: 'powder', unit: 'KG', quantity: 2, rate: 340, purchaseRate: 260, total: 680 }
    ],
    subtotal: 4480,
    discount: 80,
    taxEnabled: false,
    taxPercent: 0,
    taxAmount: 0,
    finalTotal: 4400,
    purchaseCost: 3535,
    netProfit: 865,
    paymentMethod: 'GPAY',
    paymentStatus: 'PAID',
    paidAmount: 4400,
    dueAmount: 0,
    referenceId: 'UPI-REF-902188',
    createdAt: '2026-08-31T06:30:00.000Z'
  },
  {
    id: 'sale_1022',
    billNumber: 'INV-1022',
    customerName: 'Murugan Supermarket & Caterers',
    customerPhone: '9840123456',
    customerId: 'cust_1',
    items: [
      { productId: 'prod_oil_3', productName: 'Sesame / Gingelly Oil (Nallennai)', category: 'oil', unit: 'Litre', quantity: 5, rate: 320, purchaseRate: 260, total: 1600 },
      { productId: 'prod_powder_2', productName: 'Salem Pure Turmeric Powder (Curcumin Rich)', category: 'powder', unit: 'KG', quantity: 3, rate: 280, purchaseRate: 210, total: 840 }
    ],
    subtotal: 2440,
    discount: 40,
    taxEnabled: false,
    taxPercent: 0,
    taxAmount: 0,
    finalTotal: 2400,
    purchaseCost: 1930,
    netProfit: 470,
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    paidAmount: 2400,
    dueAmount: 0,
    createdAt: '2026-08-31T08:15:00.000Z'
  },
  {
    id: 'sale_1023',
    billNumber: 'INV-1023',
    customerName: 'Walk-in Retail Customer',
    customerPhone: '9888800000',
    items: [
      { productId: 'prod_oil_1', productName: 'Groundnut Oil (Cold Pressed / Marachekku)', category: 'oil', unit: 'Litre', quantity: 2, rate: 180, purchaseRate: 145, total: 360 },
      { productId: 'prod_flour_2', productName: 'Pure Raw Rice Flour (Idiyappam / Kozhukattai)', category: 'flour', unit: 'KG', quantity: 1, rate: 48, purchaseRate: 36, total: 48 },
      { productId: 'prod_powder_4', productName: 'Traditional Home-Made Sambar Powder', category: 'powder', unit: 'KG', quantity: 0.5, rate: 380, purchaseRate: 280, total: 190 }
    ],
    subtotal: 598,
    discount: 18,
    taxEnabled: false,
    taxPercent: 0,
    taxAmount: 0,
    finalTotal: 580,
    purchaseCost: 466,
    netProfit: 114,
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    paidAmount: 580,
    dueAmount: 0,
    createdAt: '2026-08-31T09:40:00.000Z'
  }
];

let expenses: Expense[] = [
  {
    id: 'exp_1',
    title: 'Mill Electricity Bill (July-Aug)',
    amount: 3200,
    category: 'Electricity',
    date: '2026-08-30',
    description: 'TNEB commercial tariff payment for expeller and flour mill motors.',
    createdAt: '2026-08-30T10:00:00.000Z'
  },
  {
    id: 'exp_2',
    title: 'Packaging Pouches & Tin Cans',
    amount: 1450,
    category: 'Packaging',
    date: '2026-08-31',
    description: '500 Nos 1L food grade plastic oil pouches and 100 spice zip locks.',
    createdAt: '2026-08-31T07:00:00.000Z'
  },
  {
    id: 'exp_3',
    title: 'Freight & Transport for Seeds',
    amount: 800,
    category: 'Transport',
    date: '2026-08-29',
    description: 'Auto transport from wholesale mandi for groundnut bags.',
    createdAt: '2026-08-29T11:00:00.000Z'
  }
];

let stockTransactions: StockTransaction[] = [
  {
    id: 'st_1',
    productId: 'prod_oil_1',
    productName: 'Groundnut Oil (Cold Pressed / Marachekku)',
    type: 'PURCHASE',
    quantity: 60,
    previousStock: 2,
    newStock: 62,
    notes: 'Fresh crushing lot from Trichy peanuts batch #402',
    date: '2026-08-25'
  },
  {
    id: 'st_2',
    productId: 'prod_flour_1',
    productName: 'Sharbati Whole Wheat Atta',
    type: 'PURCHASE',
    quantity: 150,
    previousStock: 10,
    newStock: 160,
    notes: 'Milled from MP Sharbati wheat grain shipment',
    date: '2026-08-27'
  }
];

let businessSettings: BusinessSettings = {
  businessName: 'SRI KAMATHCHI OILL & FLOUR MILL',
  tagline: 'Pure Traditional Wood-Pressed Oils, Fresh Milled Flours & Spices',
  logo: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200&auto=format&fit=crop&q=60',
  address: 'No. 88, Mill Street, Gandhi Market, Tamil Nadu - 620008',
  phone: '+91 98401 23456 / +91 94441 67890',
  email: 'srikamathchioill@gmail.com',
  gstNumber: '33AAAAA0000A1Z5',
  upiId: 'srikamathchioill@okaxis',
  upiQrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=srikamathchioill@okaxis%26pn=SRI%20KAMATHCHI%20OILL%20%26%20FLOUR%20MILL',
  invoiceFooter: 'Thank you for supporting pure natural foods! Freshness guaranteed.',
  currencySymbol: '₹',
  taxEnabled: false,
  defaultGstPercent: 5
};

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Auth / Admin Check
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if ((username === 'admin' || username === 'admin@oilmill.com') && (password === 'admin123' || password === 'admin')) {
    return res.json({
      success: true,
      token: 'jwt_mock_token_srilakshmi_mill_secure_2026',
      user: {
        id: 'usr_admin',
        name: 'Balaji (Proprietor)',
        role: 'SUPER_ADMIN',
        email: 'admin@oilmill.com',
        businessName: businessSettings.businessName
      }
    });
  }
  // Allow flexible demo login
  if (username && password) {
    return res.json({
      success: true,
      token: 'jwt_mock_token_srilakshmi_mill_secure_2026',
      user: {
        id: 'usr_admin',
        name: username,
        role: 'ADMIN',
        email: `${username}@oilmill.com`,
        businessName: businessSettings.businessName
      }
    });
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials. Use admin / admin123' });
});

// 2. Products API
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search } = req.query;
  let filtered = [...products];

  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
  }

  res.json({ success: true, count: filtered.length, data: filtered });
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  
  // Calculate sales stats for this product
  let totalSold = 0;
  let totalRevenue = 0;
  let totalProfit = 0;

  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (item.productId === product.id) {
        totalSold += item.quantity;
        totalRevenue += item.total;
        totalProfit += (item.rate - item.purchaseRate) * item.quantity;
      }
    });
  });

  res.json({
    success: true,
    data: {
      ...product,
      stats: {
        totalSold,
        totalRevenue,
        totalProfit
      }
    }
  });
});

app.post('/api/products', (req: Request, res: Response) => {
  const { name, category, image, unit, sellingRate, purchaseRate, stockQty, minStockLevel, description } = req.body;
  if (!name || !category || sellingRate === undefined) {
    return res.status(400).json({ success: false, message: 'Missing required product fields' });
  }

  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    name,
    category,
    image: image || 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=60',
    unit: unit || 'KG',
    sellingRate: Number(sellingRate),
    purchaseRate: Number(purchaseRate || 0),
    stockQty: Number(stockQty || 0),
    minStockLevel: Number(minStockLevel || 10),
    description: description || '',
    isActive: true,
    rateHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  products.unshift(newProduct);
  res.status(201).json({ success: true, data: newProduct });
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });

  const existing = products[index];
  const { name, category, image, unit, sellingRate, purchaseRate, stockQty, minStockLevel, description, isActive } = req.body;

  // Check if rate changed and record rate history
  let updatedRateHistory = [...existing.rateHistory];
  if (sellingRate !== undefined && Number(sellingRate) !== existing.sellingRate) {
    updatedRateHistory.unshift({
      id: `rh_${Date.now()}`,
      oldRate: existing.sellingRate,
      newRate: Number(sellingRate),
      changedDate: new Date().toISOString().split('T')[0],
      reason: req.body.rateChangeReason || 'Manual rate adjustment'
    });
  }

  const updated: Product = {
    ...existing,
    name: name !== undefined ? name : existing.name,
    category: category !== undefined ? category : existing.category,
    image: image !== undefined ? image : existing.image,
    unit: unit !== undefined ? unit : existing.unit,
    sellingRate: sellingRate !== undefined ? Number(sellingRate) : existing.sellingRate,
    purchaseRate: purchaseRate !== undefined ? Number(purchaseRate) : existing.purchaseRate,
    stockQty: stockQty !== undefined ? Number(stockQty) : existing.stockQty,
    minStockLevel: minStockLevel !== undefined ? Number(minStockLevel) : existing.minStockLevel,
    description: description !== undefined ? description : existing.description,
    isActive: isActive !== undefined ? isActive : existing.isActive,
    rateHistory: updatedRateHistory,
    updatedAt: new Date().toISOString()
  };

  products[index] = updated;
  res.json({ success: true, data: updated });
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });
  
  const removed = products.splice(index, 1);
  res.json({ success: true, data: removed[0] });
});

// Update Rate Specific Route
app.patch('/api/products/:id/rate', (req: Request, res: Response) => {
  const { newRate, reason } = req.body;
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  if (newRate === undefined || isNaN(Number(newRate))) {
    return res.status(400).json({ success: false, message: 'Valid new rate is required' });
  }

  const oldRate = product.sellingRate;
  product.sellingRate = Number(newRate);
  product.rateHistory.unshift({
    id: `rh_${Date.now()}`,
    oldRate,
    newRate: Number(newRate),
    changedDate: new Date().toISOString().split('T')[0],
    reason: reason || 'Rate updated'
  });
  product.updatedAt = new Date().toISOString();

  res.json({ success: true, message: 'Rate updated successfully', data: product });
});

// 3. Inventory Stock Adjustment API
app.post('/api/inventory/adjust', (req: Request, res: Response) => {
  const { productId, type, quantity, notes } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const qty = Number(quantity);
  const prevStock = product.stockQty;
  let newStock = prevStock;

  if (type === 'PURCHASE') {
    newStock = prevStock + qty;
  } else if (type === 'DAMAGE' || type === 'SALE') {
    newStock = Math.max(0, prevStock - qty);
  } else if (type === 'ADJUSTMENT') {
    newStock = qty; // Direct override
  }

  product.stockQty = newStock;
  product.updatedAt = new Date().toISOString();

  const transaction: StockTransaction = {
    id: `st_${Date.now()}`,
    productId: product.id,
    productName: product.name,
    type: type || 'ADJUSTMENT',
    quantity: qty,
    previousStock: prevStock,
    newStock,
    notes: notes || 'Manual stock update',
    date: new Date().toISOString().split('T')[0]
  };

  stockTransactions.unshift(transaction);
  res.json({ success: true, message: 'Stock updated', product, transaction });
});

app.get('/api/inventory/transactions', (req: Request, res: Response) => {
  res.json({ success: true, data: stockTransactions });
});

// 4. Sales & Billing POS API (Transactions with Stock Deduction & Customer Stats)
app.get('/api/sales', (req: Request, res: Response) => {
  const { date, paymentMethod, search } = req.query;
  let filtered = [...sales];

  if (date) {
    filtered = filtered.filter(s => s.createdAt.startsWith(String(date)));
  }
  if (paymentMethod && paymentMethod !== 'ALL') {
    filtered = filtered.filter(s => s.paymentMethod === paymentMethod);
  }
  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    filtered = filtered.filter(b => 
      b.billNumber.toLowerCase().includes(s) || 
      b.customerName.toLowerCase().includes(s) || 
      b.customerPhone.includes(s)
    );
  }

  res.json({ success: true, count: filtered.length, data: filtered });
});

app.post('/api/sales', (req: Request, res: Response) => {
  const {
    customerName,
    customerPhone,
    customerId,
    items,
    discount = 0,
    taxEnabled = false,
    taxPercent = 0,
    paymentMethod = 'CASH',
    paidAmount,
    referenceId
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Sale items are required' });
  }

  // Stock check & calculation
  let subtotal = 0;
  let totalPurchaseCost = 0;
  const processedItems: SaleItem[] = [];

  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ success: false, message: `Product ${item.productName || item.productId} not found` });
    }
    if (product.stockQty < item.quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock for ${product.name}. Available: ${product.stockQty} ${product.unit}, Requested: ${item.quantity}` 
      });
    }

    const itemRate = item.rate !== undefined ? Number(item.rate) : product.sellingRate;
    const itemTotal = itemRate * Number(item.quantity);
    const purchaseRate = product.purchaseRate || 0;

    subtotal += itemTotal;
    totalPurchaseCost += purchaseRate * Number(item.quantity);

    processedItems.push({
      productId: product.id,
      productName: product.name,
      category: product.category,
      unit: product.unit,
      quantity: Number(item.quantity),
      rate: itemRate,
      purchaseRate,
      total: itemTotal
    });
  }

  const numericDiscount = Number(discount || 0);
  const taxableAmount = Math.max(0, subtotal - numericDiscount);
  const taxAmount = taxEnabled ? (taxableAmount * Number(taxPercent)) / 100 : 0;
  const finalTotal = Math.round(taxableAmount + taxAmount);
  const netProfit = Math.round(finalTotal - totalPurchaseCost);

  const numPaidAmount = paidAmount !== undefined ? Number(paidAmount) : (paymentMethod === 'CREDIT' ? 0 : finalTotal);
  const dueAmount = Math.max(0, finalTotal - numPaidAmount);
  const paymentStatus = dueAmount === 0 ? 'PAID' : (numPaidAmount > 0 ? 'PARTIAL' : 'PENDING');

  const billNumber = `INV-${1000 + sales.length + 1}`;

  const newSale: Sale = {
    id: `sale_${Date.now()}`,
    billNumber,
    customerName: customerName || 'Walk-in Customer',
    customerPhone: customerPhone || '',
    customerId,
    items: processedItems,
    subtotal,
    discount: numericDiscount,
    taxEnabled: Boolean(taxEnabled),
    taxPercent: Number(taxPercent),
    taxAmount,
    finalTotal,
    purchaseCost: totalPurchaseCost,
    netProfit,
    paymentMethod,
    paymentStatus,
    paidAmount: numPaidAmount,
    dueAmount,
    referenceId,
    createdAt: new Date().toISOString()
  };

  // 1. Decrement product stock and create transaction log
  processedItems.forEach(item => {
    const prod = products.find(p => p.id === item.productId);
    if (prod) {
      const prevStock = prod.stockQty;
      prod.stockQty = Math.max(0, prevStock - item.quantity);
      prod.updatedAt = new Date().toISOString();

      stockTransactions.unshift({
        id: `st_${Date.now()}_${prod.id}`,
        productId: prod.id,
        productName: prod.name,
        type: 'SALE',
        quantity: item.quantity,
        previousStock: prevStock,
        newStock: prod.stockQty,
        notes: `Bill #${billNumber}`,
        date: new Date().toISOString().split('T')[0]
      });
    }
  });

  // 2. Update or create customer record
  if (customerPhone || customerName) {
    let existingCust = customers.find(c => (customerPhone && c.phone === customerPhone) || (customerId && c.id === customerId));
    if (existingCust) {
      existingCust.totalPurchases += finalTotal;
      existingCust.billsCount += 1;
      existingCust.totalPaid += numPaidAmount;
      existingCust.totalDue += dueAmount;
      existingCust.lastPurchaseDate = new Date().toISOString().split('T')[0];
    } else if (customerName && customerName !== 'Walk-in Customer') {
      const newCust: Customer = {
        id: `cust_${Date.now()}`,
        name: customerName,
        phone: customerPhone || '',
        address: '',
        totalPurchases: finalTotal,
        billsCount: 1,
        totalPaid: numPaidAmount,
        totalDue: dueAmount,
        lastPurchaseDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      customers.push(newCust);
      newSale.customerId = newCust.id;
    }
  }

  sales.unshift(newSale);
  res.status(201).json({ success: true, message: `Bill #${billNumber} created successfully`, data: newSale });
});

app.delete('/api/sales/:id', (req: Request, res: Response) => {
  const index = sales.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Sale not found' });
  
  const deleted = sales.splice(index, 1)[0];
  // Revert stock
  deleted.items.forEach(item => {
    const prod = products.find(p => p.id === item.productId);
    if (prod) {
      prod.stockQty += item.quantity;
      stockTransactions.unshift({
        id: `st_${Date.now()}_rev`,
        productId: prod.id,
        productName: prod.name,
        type: 'ADJUSTMENT',
        quantity: item.quantity,
        previousStock: prod.stockQty - item.quantity,
        newStock: prod.stockQty,
        notes: `Cancelled Bill #${deleted.billNumber}`,
        date: new Date().toISOString().split('T')[0]
      });
    }
  });

  res.json({ success: true, message: `Bill #${deleted.billNumber} cancelled & stock reverted`, data: deleted });
});

// 5. Customers API
app.get('/api/customers', (req: Request, res: Response) => {
  const { search } = req.query;
  let filtered = [...customers];
  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    filtered = filtered.filter(c => c.name.toLowerCase().includes(s) || c.phone.includes(s));
  }
  res.json({ success: true, count: filtered.length, data: filtered });
});

app.post('/api/customers', (req: Request, res: Response) => {
  const { name, phone, address } = req.body;
  if (!name || !phone) return res.status(400).json({ success: false, message: 'Name and phone are required' });

  const newCust: Customer = {
    id: `cust_${Date.now()}`,
    name,
    phone,
    address: address || '',
    totalPurchases: 0,
    billsCount: 0,
    totalPaid: 0,
    totalDue: 0,
    lastPurchaseDate: '-',
    createdAt: new Date().toISOString()
  };

  customers.push(newCust);
  res.status(201).json({ success: true, data: newCust });
});

// Mark Customer Due as Paid
app.post('/api/customers/:id/pay-due', (req: Request, res: Response) => {
  const customer = customers.find(c => c.id === req.params.id);
  if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

  const { amount = customer.totalDue } = req.body;
  const payAmt = Math.min(Number(amount), customer.totalDue);

  customer.totalDue = Math.max(0, customer.totalDue - payAmt);
  customer.totalPaid += payAmt;

  res.json({ success: true, message: `Payment of ₹${payAmt} recorded`, data: customer });
});

// 6. Expenses API
app.get('/api/expenses', (req: Request, res: Response) => {
  res.json({ success: true, data: expenses });
});

app.post('/api/expenses', (req: Request, res: Response) => {
  const { title, amount, category, date, description } = req.body;
  if (!title || !amount) return res.status(400).json({ success: false, message: 'Title and amount are required' });

  const newExpense: Expense = {
    id: `exp_${Date.now()}`,
    title,
    amount: Number(amount),
    category: category || 'Other',
    date: date || new Date().toISOString().split('T')[0],
    description: description || '',
    createdAt: new Date().toISOString()
  };

  expenses.unshift(newExpense);
  res.status(201).json({ success: true, data: newExpense });
});

app.delete('/api/expenses/:id', (req: Request, res: Response) => {
  const idx = expenses.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Expense not found' });
  const removed = expenses.splice(idx, 1);
  res.json({ success: true, data: removed[0] });
});

// 7. Analytics & Dashboard Summary API
app.get('/api/dashboard/stats', (req: Request, res: Response) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const todaySales = sales.filter(s => s.createdAt.startsWith(todayStr));
  const todayTotalSales = todaySales.reduce((sum, s) => sum + s.finalTotal, 0);
  const todayCashSales = todaySales.filter(s => s.paymentMethod === 'CASH').reduce((sum, s) => sum + s.finalTotal, 0);
  const todayGpaySales = todaySales.filter(s => s.paymentMethod === 'GPAY').reduce((sum, s) => sum + s.finalTotal, 0);
  const todayCreditSales = todaySales.filter(s => s.paymentMethod === 'CREDIT').reduce((sum, s) => sum + s.finalTotal, 0);
  
  const todayExpensesList = expenses.filter(e => e.date === todayStr);
  const todayExpenses = todayExpensesList.reduce((sum, e) => sum + e.amount, 0);

  const todayNetProfit = todaySales.reduce((sum, s) => sum + s.netProfit, 0) - todayExpenses;
  const todayBillsCount = todaySales.length;

  const lowStockProducts = products.filter(p => p.stockQty <= p.minStockLevel);
  const totalStockValue = products.reduce((sum, p) => sum + (p.stockQty * p.sellingRate), 0);
  const totalPurchaseValue = products.reduce((sum, p) => sum + (p.stockQty * p.purchaseRate), 0);

  // Category breakdown for sales
  let oilSales = 0;
  let flourSales = 0;
  let powderSales = 0;

  todaySales.forEach(sale => {
    sale.items.forEach(item => {
      if (item.category === 'oil') oilSales += item.total;
      else if (item.category === 'flour') flourSales += item.total;
      else if (item.category === 'powder') powderSales += item.total;
    });
  });

  // Top 5 selling products
  const productSaleCounts: { [key: string]: { name: string; category: string; qty: number; revenue: number } } = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSaleCounts[item.productId]) {
        productSaleCounts[item.productId] = { name: item.productName, category: item.category, qty: 0, revenue: 0 };
      }
      productSaleCounts[item.productId].qty += item.quantity;
      productSaleCounts[item.productId].revenue += item.total;
    });
  });

  const topSellingProducts = Object.values(productSaleCounts)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const totalOutstandingDue = customers.reduce((sum, c) => sum + (c.totalDue || 0), 0);

  res.json({
    success: true,
    data: {
      today: {
        totalSales: todayTotalSales,
        cashSales: todayCashSales,
        gpaySales: todayGpaySales,
        creditSales: todayCreditSales,
        expenses: todayExpenses,
        netProfit: todayNetProfit,
        billsCount: todayBillsCount,
        customersCount: new Set(todaySales.map(s => s.customerPhone || s.customerName)).size,
        oilSales,
        flourSales,
        powderSales
      },
      inventory: {
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        lowStockItems: lowStockProducts,
        totalStockValue,
        totalPurchaseValue
      },
      topSellingProducts,
      totalOutstandingDue
    }
  });
});

// 8. Business Settings API
app.get('/api/settings', (req: Request, res: Response) => {
  res.json({ success: true, data: businessSettings });
});

app.put('/api/settings', (req: Request, res: Response) => {
  businessSettings = { ...businessSettings, ...req.body };
  res.json({ success: true, message: 'Settings saved', data: businessSettings });
});

// 9. Full Backup & Restore API
app.get('/api/backup/export', (req: Request, res: Response) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: {
      products,
      customers,
      sales,
      expenses,
      stockTransactions,
      businessSettings
    }
  });
});

app.post('/api/backup/import', (req: Request, res: Response) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ success: false, message: 'No backup data provided' });

  if (Array.isArray(data.products)) products = data.products;
  if (Array.isArray(data.customers)) customers = data.customers;
  if (Array.isArray(data.sales)) sales = data.sales;
  if (Array.isArray(data.expenses)) expenses = data.expenses;
  if (Array.isArray(data.stockTransactions)) stockTransactions = data.stockTransactions;
  if (data.businessSettings) businessSettings = data.businessSettings;

  res.json({ success: true, message: 'Database restored successfully' });
});

// ==========================================
// Vite Middleware / Static Server Integration
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sri Lakshmi Oil, Flour & Spice Mill POS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
