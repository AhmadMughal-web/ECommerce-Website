import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRout from "./protectedRout/ProtectedRout";
import {
  LoginPage,
  SignUpPage,
  ActivationPage,
  HomePage,
  ProductsPage,
  BestSellingPage,
  EventsPage,
  FaqPage,
  ProductDetailsPage,
  ProfilePage,
  ShopCreatePage,
  SellerActivationPage,
  ShopLoginPage,
  OrderSuccessPage,
  PaymentPage,
  CheckoutPage,
  OrderDetailsPage,
  TrackOrderPage,
  UserInbox,
} from "./protectedRout/Routes";
import {
  ShopDashboardPage,
  ShopHomePage,
  ShopCreateProduct,
  ShopAllProducts,
  ShopCreateEvents,
  ShopAllEvents,
  ShopAllCoupouns,
  ShopPreviewPage,
  ShopAllOrders,
  ShopOrdersDetails,
  ShopAllRefunds,
  ShopSettingsPage,
  ShopWithdrawMoneyPage,
  ShopInboxPage,
} from "./protectedRout/ShopRout";
import {
  AdminDashboardPage,
  AdminDashboardUsers,
  AdminDashboardSellers,
  AdminDashboardOrders,
  AdminDashboardProducts,
  AdminDashboardEvents,
  AdminDashboardWithdraw,
} from "./protectedRout/AdminRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Store from "./redux/store";
import { loadUser, loadShop } from "./redux/actions/user";
import { useSelector } from "react-redux";
import SellerProtectedRout from "./protectedRout/SellerProtecredRout";
import Loader from "./components/layout/loader";
import { getAllEvents } from "./redux/actions/event";
import { getAllProducts } from "./redux/actions/product";
import axios from "axios";
import { server } from "./server";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import ProtectedAdminRoute from "./protectedRout/ProtectedAdminRoute";

const App = () => {
  const [stripeApikey, setStripeApikey] = useState("");

  // FIXED: added try/catch — was silently failing if backend was down
  // causing "No routes matched location" because stripeApikey stayed empty
  // and the first <Routes> block with "/" was never rendered
  async function getStripeApikey() {
    try {
      const { data } = await axios.get(`${server}/payment/stripeapikey`);
      if (data?.stripeApikey) {
        setStripeApikey(data.stripeApikey);
      }
    } catch (error) {
      console.error("Could not load Stripe key:", error.message);
      // App continues working — payment page will show a message
    }
  }

  const { loading, isAuthenticated } = useSelector((state) => state.user);
  const { isLoading, isSeller } = useSelector((state) => state.seller);

  useEffect(() => {
    Store.dispatch(loadUser());
    Store.dispatch(loadShop());
    Store.dispatch(getAllProducts());
    Store.dispatch(getAllEvents());
    getStripeApikey();
  }, []);

  return (
    <>
      {loading || isLoading ? (
        <Loader />
      ) : (
        <BrowserRouter>
          {/* FIXED: was TWO separate <Routes> blocks
              - First block only rendered when stripeApikey existed
              - When stripe key was missing/loading, "/" had NO matching route → "No routes matched"
              - Now: ONE single <Routes> block with stripe wrapped ONLY around /payment route
          */}
          <Routes>
            {/* USER ROUTES */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route
              path="/activation/:activation_token"
              element={<ActivationPage />}
            />
            <Route
              path="/seller/activation/:activation_token"
              element={<SellerActivationPage />}
            />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/best-selling" element={<BestSellingPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/order/success" element={<OrderSuccessPage />} />
            <Route path="/shop/preview/:id" element={<ShopPreviewPage />} />
            <Route path="/shop-create" element={<ShopCreatePage />} />
            <Route path="/shop-login" element={<ShopLoginPage />} />

            <Route
              path="/checkout"
              element={
                <ProtectedRout isAuthenticated={isAuthenticated}>
                  <CheckoutPage />
                </ProtectedRout>
              }
            />

            {/* FIXED: Stripe Elements wraps ONLY the /payment route — not the whole app
                stripeApikey missing → show loading message instead of crashing */}
            <Route
              path="/payment"
              element={
                <ProtectedRout isAuthenticated={isAuthenticated}>
                  {stripeApikey ? (
                    <Elements stripe={loadStripe(stripeApikey)}>
                      <PaymentPage />
                    </Elements>
                  ) : (
                    <div className="w-full h-screen flex items-center justify-center">
                      <p className="text-gray-500 text-lg">
                        Loading payment gateway... Please make sure backend is running.
                      </p>
                    </div>
                  )}
                </ProtectedRout>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRout isAuthenticated={isAuthenticated}>
                  <ProfilePage />
                </ProtectedRout>
              }
            />
            <Route
              path="/inbox"
              element={
                <ProtectedRout isAuthenticated={isAuthenticated}>
                  <UserInbox />
                </ProtectedRout>
              }
            />
            <Route
              path="/user/order/:id"
              element={
                <ProtectedRout isAuthenticated={isAuthenticated}>
                  <OrderDetailsPage />
                </ProtectedRout>
              }
            />
            <Route
              path="/user/track/order/:id"
              element={
                <ProtectedRout isAuthenticated={isAuthenticated}>
                  <TrackOrderPage />
                </ProtectedRout>
              }
            />

            {/* SHOP ROUTES */}
            <Route
              path="/shop/:id"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopHomePage />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/settings"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopSettingsPage />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopDashboardPage />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/dashboard-create-product"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopCreateProduct />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/dashboard-products"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopAllProducts />
                </SellerProtectedRout>
              }
            />
            {/* FIXED: was " /dashboard-refunds" (space at start) — route never matched */}
            <Route
              path="/dashboard-refunds"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopAllRefunds />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/dashboard-orders"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopAllOrders />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/order/:id"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopOrdersDetails />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/dashboard-create-event"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopCreateEvents />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/dashboard-events"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopAllEvents />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/dashboard-coupouns"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopAllCoupouns />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/dashboard-withdraw-money"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopWithdrawMoneyPage />
                </SellerProtectedRout>
              }
            />
            <Route
              path="/dashboard-messages"
              element={
                <SellerProtectedRout isSeller={isSeller}>
                  <ShopInboxPage />
                </SellerProtectedRout>
              }
            />

            {/* ADMIN ROUTES */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardPage />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin-users"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardUsers />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin-sellers"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardSellers />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin-orders"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardOrders />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin-products"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardProducts />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin-events"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardEvents />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin-withdraw-request"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardWithdraw />
                </ProtectedAdminRoute>
              }
            />

            {/* 404 catch-all */}
            <Route
              path="*"
              element={
                <div className="w-full h-screen flex items-center justify-center">
                  <h1 className="text-2xl text-gray-500">404 — Page not found</h1>
                </div>
              }
            />
          </Routes>

          <ToastContainer
            position="bottom-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </BrowserRouter>
      )}
    </>
  );
};

export default App;
