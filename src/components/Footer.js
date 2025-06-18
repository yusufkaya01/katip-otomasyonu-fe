import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-danger text-white text-center py-3 mt-5">
      <div className="container">
        <p className="mb-1">&copy; 2025 Katip Otomasyonu. Tüm hakları saklıdır.</p>
        <div className="d-flex flex-wrap justify-content-center gap-3">
          <Link to="/privacy" className="text-white small text-decoration-underline">Gizlilik Sözleşmesi</Link>
          <Link to="/copyright" className="text-white small text-decoration-underline">Telif Hakkı</Link>
          <Link to="/terms" className="text-white small text-decoration-underline">Kullanım Koşulları</Link>
          <Link to="/data-policy" className="text-white small text-decoration-underline">KVKK Politikası</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
