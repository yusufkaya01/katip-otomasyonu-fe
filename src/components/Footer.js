import React from 'react';
import { Link } from 'react-router-dom';
import { useContracts } from '../hooks/useContracts';

function Footer() {
  const { contracts } = useContracts('all');

  // Contract mappings to routes
  const contractRoutes = {
    'privacy_policy': '/privacy',
    'terms_of_use': '/terms',
    'kvkk_consent': '/data-policy'
  };

  return (
    <footer className="bg-danger text-white text-center py-3 mt-5">
      <div className="container">
        <p className="mb-1">&copy; 2025 Katip Otomasyonu. Tüm hakları saklıdır.</p>
        <div className="d-flex flex-wrap justify-content-center gap-3">
          {/* Dynamic contract links */}
          {contracts && Object.entries(contractRoutes).map(([contractId, route]) => {
            const contract = contracts[contractId];
            return contract ? (
              <Link 
                key={contractId} 
                to={route} 
                className="text-white small text-decoration-underline"
              >
                {contract.title}
              </Link>
            ) : null;
          })}
          
          {/* Static copyright link */}
          <Link to="/copyright" className="text-white small text-decoration-underline">Telif Hakkı</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
