import React from 'react';
import { NavLink } from 'react-router-dom';

export default function AdminNavbar({ onLogout }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-danger mb-4 border-bottom">
      <div className="container">
        <NavLink className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/admin">
          <img src="/icon-128px-trasnparent-white.png" alt="Admin Logo" style={{ width: 36, height: 36 }} />
          Admin Paneli
        </NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNavbarNav" aria-controls="adminNavbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="adminNavbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            <li className="nav-item">
              <NavLink to="/admin/missing-tax-info" className={({isActive}) => 'nav-link' + (isActive ? ' active fw-bold text-light' : '')}>
                Fatura Bilgisi Kontrol
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/admin/pending-payments" className={({isActive}) => 'nav-link' + (isActive ? ' active fw-bold text-light' : '')}>
                Ödeme Bekleyenler
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/admin" end className={({isActive}) => 'nav-link' + (isActive ? ' active fw-bold text-light' : '')}>
                Ödeme Almadan Lisans Onayı
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/admin/pending-invoices" className={({isActive}) => 'nav-link' + (isActive ? ' active fw-bold text-light' : '')}>
                Fatura Bekleyenler
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/admin/customers" className={({isActive}) => 'nav-link' + (isActive ? ' active fw-bold text-light' : '')}>
                Tüm Müşteriler
              </NavLink>
            </li>
            <li className="nav-item">
              <button className="btn btn-outline-light btn-sm fw-bold ms-3" onClick={onLogout}>Çıkış Yap</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
