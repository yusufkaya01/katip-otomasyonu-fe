import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminNavbar from './AdminNavbar';
import AdminPagination from '../components/AdminPagination';
import PageLoadingSpinner from '../components/PageLoadingSpinner';

export default function AdminMissingTaxInfoPage({ token, onLogout }) {
  // Use token from props, fallback to adminUser?.accessToken for compatibility
  const { user: adminUser } = useAuth();
  const adminToken = token || adminUser?.accessToken;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [companies, setCompanies] = useState([]);
  const [updating, setUpdating] = useState({});
  const [success, setSuccess] = useState({});

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [total, setTotal] = useState(0);

  const API_KEY = process.env.REACT_APP_ADMIN_API_KEY;
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://customers.katipotomasyonu.com/api';

  useEffect(() => {
    setLoading(true);
    setError('');
    if (!adminToken) {
      setError('Admin token bulunamadı. Lütfen tekrar giriş yapın.');
      setLoading(false);
      return;
    }
    fetch(`${API_BASE_URL}/admin/osgbs/missing-tax-info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-api-key': API_KEY,
        'Authorization': `Bearer ${adminToken}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const allCompanies = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
        setTotal(allCompanies.length);
        setCompanies(allCompanies);
      })
      .catch(() => setError('Eksik vergi bilgisi olan şirketler alınamadı.'))
      .finally(() => setLoading(false));
  }, [API_BASE_URL, API_KEY, adminToken]); // Only fetch once, FE paginates

  const handleUpdate = async (customer_id, idx) => {
    const tax_office = document.getElementById(`tax_office_${idx}`).value;
    const tax_number = document.getElementById(`tax_number_${idx}`).value;
    if (!tax_office || !tax_number) return;
    setUpdating(u => ({ ...u, [customer_id]: true }));
    setSuccess(s => ({ ...s, [customer_id]: false }));
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/admin/osgbs/update-tax-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-api-key': API_KEY,
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ customer_id, tax_office, tax_number })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(s => ({ ...s, [customer_id]: true }));
      } else {
        setError('Vergi bilgisi güncellenemedi.');
      }
    } catch {
      setError('Sunucuya ulaşılamadı.');
    }
    setUpdating(u => ({ ...u, [customer_id]: false }));
  };

  return (
    <>
      <PageLoadingSpinner show={loading} fullscreen />
      <AdminNavbar />
      <div className="container py-4">
        <h3 className="mb-4">Eksik Vergi Bilgili Şirketler</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        {companies.length === 0 && !loading && <div className="alert alert-info">Tüm şirketlerin vergi bilgileri tamam.</div>}
        <div className="row g-4">
          {companies.slice((page-1)*perPage, page*perPage).map((c, idx) => (
            <div className="col-12 col-md-6 col-lg-4" key={c.customer_id}>
              <div className="card shadow-sm p-3">
                <div className="fw-bold mb-2">{c.company_name}</div>
                <div><b>Müşteri No:</b> {c.customer_id}</div>
                <div><b>Lisans Anahtarı:</b> {c.license_key}</div>
                <div><b>E-posta:</b> {c.email}</div>
                <div className="mt-2">
                  <a
                    href={c.vergiLevhasiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm me-2 mb-2"
                  >Vergi Levhası</a>
                  <a
                    href={c.yetkiBelgesiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-secondary btn-sm mb-2"
                  >Yetki Belgesi</a>
                </div>
                <div className="mb-2 mt-2">
                  <input id={`tax_office_${idx}`} className="form-control mb-2" placeholder="Vergi Dairesi" defaultValue={c.tax_office || ''} />
                  <input id={`tax_number_${idx}`} className="form-control mb-2" placeholder="Vergi Kimlik No" defaultValue={c.tax_number || ''} />
                  <button className="btn btn-success w-100" onClick={() => handleUpdate(c.customer_id, idx)} disabled={updating[c.customer_id]}>Kaydet</button>
                  {success[c.customer_id] && <div className="alert alert-success mt-2 py-1">Güncellendi!</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
        {companies.length > 0 && (
          <AdminPagination
            page={page}
            perPage={perPage}
            total={total}
            onPageChange={setPage}
            onPerPageChange={v => { setPerPage(v); setPage(1); }}
          />
        )}
      </div>
    </>
  );
}
