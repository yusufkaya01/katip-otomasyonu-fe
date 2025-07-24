import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Ana Sayfa' },
  { path: '/fiyat', label: 'Fiyatlandırma' },
  { path: '/ozellikler', label: 'Özellikler' },
  { path: '/kurulum', label: 'Kurulum' },
  { path: '/sss', label: 'SSS' },
  { path: '/hakkimizda', label: 'Hakkımızda' },
  { path: '/iletisim', label: 'İletişim' },
];

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Helper to truncate company name
  function getShortCompanyName(name) {
    if (!name) return '';
    return name.length > 10 ? name.slice(0, 10) + '..' : name;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Collapse navbar on link click (for mobile)
  const handleNavLinkClick = () => {
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      // Bootstrap 5 collapse API
      const collapse = window.bootstrap && window.bootstrap.Collapse
        ? window.bootstrap.Collapse.getOrCreateInstance(navbarCollapse)
        : null;
      if (collapse) {
        collapse.hide();
      } else {
        // fallback: manually remove 'show' class
        navbarCollapse.classList.remove('show');
      }
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-danger">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/" onClick={handleNavLinkClick}>
          <img src="/icon-128px-trasnparent-white.png" alt="Katip Otomasyonu Logo" style={{ width: 36, height: 36 }} />
          Katip Otomasyonu
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            {navItems.map((item) => (
              <li className="nav-item" key={item.path}>
                <Link
                  className={`nav-link${location.pathname === item.path ? ' active' : ''}`}
                  to={item.path}
                  onClick={handleNavLinkClick}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {!user && (
              <>
                <li className="nav-item">
                  <Link to="/giris" className="btn btn-light btn-sm fw-bold me-2" onClick={handleNavLinkClick}>Giriş Yap</Link>
                </li>
                <li className="nav-item">
                  <Link to="/kayit" className="btn btn-outline-light btn-sm fw-bold" onClick={handleNavLinkClick}>Kayıt Ol</Link>
                </li>
              </>
            )}
            {user && (
              <>
                <li className="nav-item">
                  <Link to="/isletmem" className="btn btn-light btn-sm fw-bold me-2" onClick={handleNavLinkClick}>İşletmem</Link>
                </li>
                <li className="nav-item">
                  <button onClick={() => { handleLogout(); handleNavLinkClick(); }} className="btn btn-outline-light btn-sm fw-bold">Çıkış Yap</button>
                </li>
                <li className="nav-item text-white small ms-2">
                  Hoşgeldiniz, {getShortCompanyName(user.company_name)}
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
