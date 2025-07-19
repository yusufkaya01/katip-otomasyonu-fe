import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_API_KEY || '';

export default function AdminCustomersPage({ token, onLogout }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/admin/customers`, {
          headers: {
            'Content-Type': 'application/json',
            'x-admin-api-key': ADMIN_API_KEY,
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.customers) {
          setCustomers(data.customers);
        } else {
          setError(data.error || 'Müşteriler alınamadı.');
        }
      } catch (err) {
        setError('Sunucuya ulaşılamadı.');
      }
      setLoading(false);
    }
    fetchCustomers();
  }, [token]);

  return (
    <div className="container-fluid px-0">
      <AdminNavbar onLogout={onLogout} />
      <div className="container py-4">
        <h3 className="mb-4">Tüm Müşteriler</h3>
        {loading && <div className="alert alert-info">Yükleniyor...</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        {customers.length > 0 && (
          <div style={{overflowX:'auto'}}>
            <table className="table table-bordered table-sm">
              <thead>
                <tr>
                  <th>Müşteri No</th>
                  <th>Şirket Ünvanı</th>
                  <th>OSGB ID</th>
                  <th>Bakiye</th>
                  <th>Faturalandırılan</th>
                  <th>Ödenen</th>
                  <th>Bitiş Tarihi</th>
                  <th>Lisans Kodu</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.customer_id}>
                    <td>{c.customer_id}</td>
                    <td>{c.company_name}</td>
                    <td>{c.osgb_id}</td>
                    <td>{c.current_balance} TL</td>
                    <td>{c.total_invoiced_amount} TL</td>
                    <td>{c.total_paid} TL</td>
                    <td>{c.expiration_date ? new Date(c.expiration_date).toLocaleDateString('tr-TR') : ''}</td>
                    <td>{c.license_code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(!loading && customers.length === 0 && !error) && <div className="alert alert-warning">Hiç müşteri bulunamadı.</div>}
      </div>
    </div>
  );
}
