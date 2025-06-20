import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoadingSpinner() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
      <div className="spinner-border text-danger" role="status">
        <span className="visually-hidden">Yükleniyor...</span>
      </div>
    </div>
  );
}

function IsletmemPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('osgbUser');
    if (!userData) {
      navigate('/giris', { replace: true });
      return;
    }
    setUser(JSON.parse(userData));
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) return null;

  return (
    <div className="container py-5" style={{ maxWidth: 600 }}>
      <h2 className="mb-4">İşletmem</h2>
      <div className="card p-4 shadow-sm">
        <h5 className="mb-3">{user.company_name}</h5>
        <p><strong>Adres:</strong> {user.address}</p>
        <p><strong>Telefon:</strong> {user.phone}</p>
        <p><strong>E-posta:</strong> {user.email}</p>
        {/* Add more fields as needed */}
      </div>
    </div>
  );
}

export default IsletmemPage;
