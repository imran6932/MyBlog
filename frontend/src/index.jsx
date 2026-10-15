import "./index.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import React from "react";
import { createRoot } from "react-dom/client";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/pages/Home";
import SignUp from "./components/pages/SignUp";
import Login from "./components/pages/Login";
import VerifyOTP from "./components/pages/VerifyOTP";
import Dashboard from "./components/pages/Dashboard";
import ForgotPassword from "./components/pages/ForgotPassword";
import ConfirmResetPassword from "./components/pages/ConfirmResetPassword";
import ChangePassword from "./components/pages/ChangePassword";
import MyAccount from "./components/pages/MyAccount";
import ProtectedRoute from "./components/pages/ProtectedRoute";
import NotFound from "./components/pages/NotFound";
import SingleUserPost from "./components/pages/SingleUserPost";
import CreateBlog from "./components/blog/CreateBlog";
import UpdateBlog from "./components/blog/UpdateBlog";
import ScrollToTop from "./components/pages/ScrollToTop";
import UpdateProfile from "./components/user/UpdateProfile";
import TermsAndConditions from "./components/pages/TermsAndConditions";
import DataPolicy from "./components/pages/DataPolicy";
import { Provider } from "react-redux";
import store from "./app/store";
import { ThemeProvider } from "./contexts/ThemeContext";
import AuthNotification from "./components/common/AuthNotification";

const root = createRoot(document.getElementById("root"));
root.render(
  <>
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter
          future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        >
          <AuthNotification />
          <Navbar></Navbar>
          <ScrollToTop></ScrollToTop>

        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute page="Home">
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <ProtectedRoute page="SignUp">
                <SignUp />
              </ProtectedRoute>
            }
          />

          <Route
            path="/login"
            element={
              <ProtectedRoute page="Login">
                <Login />
              </ProtectedRoute>
            }
          />

          <Route path="/verify-otp" element={<VerifyOTP />} />

          <Route
            path="/change-password"
            element={
              <ProtectedRoute page="ChangePassword">
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          <Route path="/reset-password" element={<ForgotPassword />} />

          <Route
            path="/reset-password-confirm"
            element={<ConfirmResetPassword />}
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute page="MyAccount">
                <MyAccount />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute page="Dashboard">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/:userName/posts/:blogTitle"
            element={
              <ProtectedRoute page="SingleUserPost">
                <SingleUserPost />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-blog"
            element={
              <ProtectedRoute page="CreateBlog">
                <CreateBlog />
              </ProtectedRoute>
            }
          />

          <Route
            path="/update-blog/:id"
            element={
              <ProtectedRoute page="UpdateBlog">
                <UpdateBlog />
              </ProtectedRoute>
            }
          />

          <Route
            path="/update-profile"
            element={
              <ProtectedRoute page="UpdateProfile">
                <UpdateProfile />
              </ProtectedRoute>
            }
          />

          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<DataPolicy />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer></Footer>
      </BrowserRouter>
    </ThemeProvider>
    </Provider>
  </>
);
