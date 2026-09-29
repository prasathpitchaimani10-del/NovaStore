import React, { useState } from 'react';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { CatalogPage } from './pages/CatalogPage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { OrderSuccessPage } from './pages/OrderSuccessPage.tsx';
import { MyOrdersPage } from './pages/MyOrdersPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { Product, Order } from './types/index.ts';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>({});
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProductId(product._id);
    setCurrentPage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProductById = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentPage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setCompletedOrder(order);
    setCurrentPage('order-success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
            {/* Header */}
            <Header
              currentPage={currentPage}
              onNavigate={handleNavigate}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {currentPage === 'home' && (
                <HomePage
                  onNavigate={handleNavigate}
                  onSelectProduct={handleSelectProduct}
                />
              )}

              {currentPage === 'catalog' && (
                <CatalogPage
                  key={`${pageParams.category || ''}-${pageParams.search || ''}`}
                  initialCategory={pageParams.category}
                  initialSearch={pageParams.search}
                  initialInStock={pageParams.inStock}
                  onSelectProduct={handleSelectProduct}
                />
              )}

              {currentPage === 'product-detail' && selectedProductId && (
                <ProductDetailPage
                  productId={selectedProductId}
                  onBack={() => handleNavigate('catalog')}
                  onOpenAuth={() => setIsAuthModalOpen(true)}
                />
              )}

              {currentPage === 'checkout' && (
                <CheckoutPage
                  onOrderSuccess={handleOrderSuccess}
                  onBrowse={() => handleNavigate('catalog')}
                  onOpenAuth={() => setIsAuthModalOpen(true)}
                />
              )}

              {currentPage === 'order-success' && completedOrder && (
                <OrderSuccessPage
                  order={completedOrder}
                  onNavigate={handleNavigate}
                />
              )}

              {currentPage === 'my-orders' && (
                <MyOrdersPage
                  onNavigate={handleNavigate}
                  onOpenProduct={handleOpenProductById}
                  onOpenAuth={() => setIsAuthModalOpen(true)}
                />
              )}

              {currentPage === 'profile' && <ProfilePage />}

              {currentPage === 'admin' && (
                <AdminDashboard onNavigate={handleNavigate} />
              )}
            </main>

            {/* Slide-out Cart Drawer */}
            <CartDrawer
              onCheckout={() => handleNavigate('checkout')}
              onBrowse={() => handleNavigate('catalog')}
            />

            {/* Auth Modal */}
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
            />

            {/* Footer */}
            <Footer onNavigate={handleNavigate} />
          </div>
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
