import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container my-5">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ozellikler" element={<FeaturesPage />} />
          <Route path="/kurulum" element={<SetupPage />} />
          <Route path="/sss" element={<FAQPage />} />
          <Route path="/hakkimizda" element={<AboutPage />} />
          <Route path="/iletisim" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/copyright" element={<CopyrightPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/data-policy" element={<DataPolicyPage />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
