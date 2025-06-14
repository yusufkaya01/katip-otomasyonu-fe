import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-danger text-white text-center py-3 mt-5">
      <div className="container">
        <p className="mb-1">&copy; 2025 Katip Otomasyonu. Tüm hakları saklıdır.</p>
        <Link to="/privacy" className="text-white small text-decoration-underline">Gizlilik Sözleşmesi</Link>
      </div>
    </footer>
  );
}

export default Footer;
