import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import FeaturesPage from './pages/FeaturesPage';
import SetupPage from './pages/SetupPage';
import FAQPage from './pages/FAQPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import CopyrightPage from './pages/CopyrightPage';
import TermsPage from './pages/TermsPage';
import DataPolicyPage from './pages/DataPolicyPage';
import IsletmemPage from './pages/IsletmemPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PricingPage from './pages/PricingPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import WhatsappFloatButton from './WhatsappFloatButton';
import './App.css';

function LoadingSpinner() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
      <div className="spinner-border text-danger" role="status">
        <span className="visually-hidden">Yükleniyor...</span>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return (
    <>
      <Navbar />
      <div className="filigran-bg">
        <div className="container my-5">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/fiyat" element={<PricingPage />} />
            <Route path="/ozellikler" element={<FeaturesPage />} />
            <Route path="/kurulum" element={<SetupPage />} />
            <Route path="/sss" element={<FAQPage />} />
            <Route path="/hakkimizda" element={<AboutPage />} />
            <Route path="/iletisim" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/copyright" element={<CopyrightPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/data-policy" element={<DataPolicyPage />} />
            <Route path="/isletmem" element={<IsletmemPage />} />
            <Route path="/sifremi-unuttum" element={<ForgotPasswordPage />} />
            <Route path="/giris" element={<LoginPage />} />
            <Route path="/kayit" element={<RegisterPage />} />
            <Route path="/sifre-sifirla" element={<ResetPasswordPage />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <WhatsappFloatButton />
        <AppRoutes />
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
