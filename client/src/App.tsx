import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/ui/Layout';
import Loading from './components/ui/loading';
import ScrollToTop from './components/ui/ScrollToTop';

// Public Storefront Pages
const LandingPage = lazy(() => import('./pages/home/page'));
const ShopPage = lazy(() => import('./pages/shop/page'));
const CollectionsPage = lazy(() => import('./pages/collections/page'));
const JournalPage = lazy(() => import('./pages/journal/page'));
const JournalDetailPage = lazy(() => import('./pages/journal/detail'));
const AboutPage = lazy(() => import('./pages/about/page'));
const CartPage = lazy(() => import('./pages/cart/page'));
const WishlistPage = lazy(() => import('./pages/wishlist/page'));
const CheckoutPage = lazy(() => import('./pages/checkout/page'));
const FaqPage = lazy(() => import('./pages/faq/page'));
const ShippingAndReturnsPage = lazy(() => import('./pages/shipping-and-returns/page'));
const PrivacyPolicyPage = lazy(() => import('./pages/privacy/page'));
const TermsOfServicePage = lazy(() => import('./pages/terms/page'));
const ContactPage = lazy(() => import('./pages/contact/page'));
const VerifyMagicLinkPage = lazy(() => import('./pages/auth/VerifyMagicLinkPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const ProductDetailPage = lazy(() => import('./pages/product/page'));
const OrdersPage = lazy(() => import('./pages/orders/page'));
const ProfilePage = lazy(() => import('./pages/profile/page'));
const NotFoundPage = lazy(() => import('./pages/not-found/page'));

// Admin Suite Pages & Guards
const AdminGuard = lazy(() => import('./components/auth/AdminGuard'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const OverviewPage = lazy(() => import('./pages/admin/OverviewPage'));
const ProductsPage = lazy(() => import('./pages/admin/ProductsPage'));
const ProductFormPage = lazy(() => import('./pages/admin/ProductFormPage'));
const OrdersAdminPage = lazy(() => import('./pages/admin/OrdersPage'));
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'));
const CollectionsAdminPage = lazy(() => import('./pages/admin/CollectionsPage'));
const ReviewsPage = lazy(() => import('./pages/admin/ReviewsPage'));
const JournalAdminPage = lazy(() => import('./pages/admin/JournalPage'));

function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Loading message="Accessing Phantom..." fullScreen={true} />}>
        <Routes>
          {/* Admin Suite (No public navbar/footer; protected by AdminGuard) */}
          <Route
            path="/admin/*"
            element={
              <AdminGuard>
                <AdminLayout>
                  <Routes>
                    <Route index element={<OverviewPage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="products/new" element={<ProductFormPage />} />
                    <Route path="products/:id/edit" element={<ProductFormPage />} />
                    <Route path="orders" element={<OrdersAdminPage />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="collections" element={<CollectionsAdminPage />} />
                    <Route path="reviews" element={<ReviewsPage />} />
                    <Route path="journal" element={<JournalAdminPage />} />
                    <Route path="*" element={<OverviewPage />} />
                  </Routes>
                </AdminLayout>
              </AdminGuard>
            }
          />

          {/* Public Storefront with Brand Layout (Navbar + Footer) */}
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/shop/:slug" element={<ProductDetailPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />
                  <Route path="/collections" element={<CollectionsPage />} />
                  <Route path="/journal" element={<JournalPage />} />
                  <Route path="/journal/:slug" element={<JournalDetailPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/account/orders" element={<OrdersPage />} />
                  <Route path="/my-orders" element={<OrdersPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/account/profile" element={<ProfilePage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/shipping-and-returns" element={<ShippingAndReturnsPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsOfServicePage />} />
                  <Route path="/auth/verify-magic-link" element={<VerifyMagicLinkPage />} />
                  <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
