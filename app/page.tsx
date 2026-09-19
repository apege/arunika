'use client';

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FloatingParticles from './components/FloatingParticles';
import HeroBanner from './components/HeroBanner';
import FeaturesBar from './components/FeaturesBar';
import Step1Account from './components/Step1Account';
import Step2Pricelist from './components/Step2Pricelist';
import Step3Payment, { PaymentMethod } from './components/Step3Payment';
import TransactionFlow from './components/TransactionFlow';
import Step4Testimonials from './components/Step4Testimonials';
import StickyBottomBar from './components/StickyBottomBar';
import CaraOrderModal from './components/CaraOrderModal';
import CartModal, { CartItem } from './components/CartModal';
import CheckoutModal from './components/CheckoutModal';
import Footer from './components/Footer';
import { PRODUCTS, Product } from './data/products';
import { mapDbProductToUI } from '../lib/productsHelper';
import {
  StoreSettings,
  DEFAULT_STORE_SETTINGS,
  getStoredSettings,
  fetchGlobalSettings,
} from './admin/data/adminSettings';

export default function Home() {
  // Theme state: Defaulting to Dark Mode
  const [isDark, setIsDark] = useState(true);

  // Sync dark class on mount and update
  useEffect(() => {
    const savedTheme = localStorage.getItem('arunika-theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('arunika-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('arunika-theme', 'light');
    }
  };

  // State management
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [username, setUsername] = useState('');
  const [robloxUserId, setRobloxUserId] = useState<string | number | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS[3] || PRODUCTS[0]); // Default 2.400 Robux Promo
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');

  // Load store settings & live products
  useEffect(() => {
    // Initial synchronous cache
    setStoreSettings(getStoredSettings());

    // Live sync from server API
    fetchGlobalSettings().then((liveSettings) => {
      if (liveSettings) {
        setStoreSettings(liveSettings);
      }
    });

    async function loadLiveProducts() {
      try {
        const res = await fetch('/api/products');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map(mapDbProductToUI);
          setProducts(mapped);
          // Set default selected product to promo or first item
          const promoItem = mapped.find((p: Product) => p.isPromo) || mapped[0];
          setSelectedProduct((prev) => (prev ? prev : promoItem));
        }
      } catch (err) {
        console.error('Failed to load products from API:', err);
      }
    }
    loadLiveProducts();
  }, []);

  // Modals
  const [isCaraOrderOpen, setIsCaraOrderOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Add to cart handler (triggered specifically when clicking the + button on any package)
  const handleAddToCart = (product: Product) => {
    const newItem: CartItem = {
      ...product,
      cartItemId: `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setCartItems((prev) => [...prev, newItem]);
  };

  // Remove single item from cart
  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  // Clear all items
  const handleClearCart = () => {
    setCartItems([]);
  };

  // Handle promo banner quick-buy
  const handleSelectPromo = () => {
    const promoItem = products.find((p) => p.isPromo) || products[0] || PRODUCTS[3];
    setSelectedProduct(promoItem);

    // Smooth scroll to step 1
    const step1El = document.getElementById('step-account');
    if (step1El) {
      step1El.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCheckout = () => {
    if (!username.trim()) {
      const step1El = document.getElementById('step-account');
      if (step1El) {
        step1El.scrollIntoView({ behavior: 'smooth' });
        const inputEl = step1El.querySelector('input');
        inputEl?.focus();
      }
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleProceedToCheckoutFromCart = () => {
    setIsCartOpen(false);
    if (!username.trim()) {
      const step1El = document.getElementById('step-account');
      if (step1El) {
        step1El.scrollIntoView({ behavior: 'smooth' });
        const inputEl = step1El.querySelector('input');
        inputEl?.focus();
      }
      return;
    }
    setIsCheckoutOpen(true);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f8fbff] dark:bg-[#070b15] text-slate-800 dark:text-slate-100 selection:bg-cyan-500 selection:text-white transition-colors duration-300">
      {/* Background Particles & Ambient Colors */}
      <FloatingParticles />

      {/* Header Navigation with Cart Trigger */}
      <Navbar
        onOpenCaraOrder={() => setIsCaraOrderOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cartItems.length}
        settings={storeSettings}
      />

      {/* Main Content Sections */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-10 pb-44">
        {/* Hero Banner Promo */}
        <HeroBanner
          onSelectPromo={handleSelectPromo}
          settings={storeSettings}
          promoProduct={products.find((p) => p.isPromo) || products[0]}
        />

        {/* 5 Core Features Bar */}
        <FeaturesBar />

        {/* Step 1: Account verification */}
        <section id="step-account" className="scroll-mt-24">
          <Step1Account
            username={username}
            onChangeUsername={setUsername}
            onVerified={setIsVerified}
            isVerified={isVerified}
            onUserIdChange={setRobloxUserId}
          />
        </section>

        {/* Step 2: Catalog / Pricelist */}
        <section className="scroll-mt-24">
          <Step2Pricelist
            products={products}
            selectedProduct={selectedProduct}
            onSelectProduct={(product) => setSelectedProduct(product)}
            onAddToCart={handleAddToCart}
          />
        </section>

        {/* Step 3: Payment Method Selection */}
        <section className="scroll-mt-24">
          <Step3Payment
            paymentMethod={paymentMethod}
            onChangePaymentMethod={setPaymentMethod}
          />
        </section>

        {/* Transaction Flow Guide */}
        <section className="pt-2">
          <TransactionFlow />
        </section>

        {/* Step 4: Testimonials & Reviews */}
        <section className="scroll-mt-24">
          <Step4Testimonials />
        </section>
      </main>

      {/* Footer */}
      <Footer settings={storeSettings} />

      {/* Floating Bottom Sticky Bar */}
      <StickyBottomBar
        selectedProduct={selectedProduct}
        cartItems={cartItems}
        onCheckout={handleCheckout}
      />

      {/* Cara Order Modal */}
      <CaraOrderModal
        isOpen={isCaraOrderOpen}
        onClose={() => setIsCaraOrderOpen(false)}
      />

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckoutFromCart}
      />

      {/* Checkout Payment Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        username={username}
        robloxUserId={robloxUserId}
        selectedProduct={selectedProduct}
        cartItems={cartItems}
        paymentMethod={paymentMethod}
        settings={storeSettings}
      />
    </div>
  );
}
