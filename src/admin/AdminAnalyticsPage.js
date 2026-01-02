import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import 'bootstrap-icons/font/bootstrap-icons.css';

function getAuthHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'x-admin-api-key': process.env.REACT_APP_ADMIN_API_KEY,
    'Content-Type': 'application/json'
  };
}

function formatDate(dateString) {
  try {
    if (!dateString || dateString === null) {
      return 'Tarih yok';
    }
    
    // Create date object and add 2 hours for Turkey timezone
    const date = new Date(dateString);
    const adjustedDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
    
    // Ensure we get a proper date object
    if (isNaN(adjustedDate.getTime())) {
      return 'Geçersiz tarih';
    }
    
    // Manual Turkish month names to avoid locale issues
    const turkishMonths = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    
    const day = adjustedDate.getDate();
    const month = turkishMonths[adjustedDate.getMonth()];
    const year = adjustedDate.getFullYear();
    
    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error('Date formatting error:', error, dateString);
    return 'Tarih hatası';
  }
}

function formatTime(timeString) {
  if (!timeString) return '-';
  
  try {
    // Parse the time string (HH:MM format)
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Add 2 hours for Turkey timezone
    let adjustedHours = hours + 2;
    
    // Handle day overflow
    if (adjustedHours >= 24) {
      adjustedHours -= 24;
    }
    
    // Format back to HH:MM
    const formattedHours = adjustedHours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    return `${formattedHours}:${formattedMinutes}`;
  } catch (error) {
    console.error('Time formatting error:', error, timeString);
    return timeString; // Return original if parsing fails
  }
}

function calculateSuccessRate(successful, total) {
  return total > 0 ? ((successful / total) * 100).toFixed(1) + '%' : '0%';
}

function PaginationControls({ currentPage, totalPages, totalCount, onPageChange, itemName = 'kayıt' }) {
  console.log('Pagination Controls - Current:', currentPage, 'Total Pages:', totalPages, 'Total Count:', totalCount);
  
  if (totalPages <= 1) {
    console.log('Not showing pagination - totalPages <= 1');
    return null;
  }

  return (
    <div className="d-flex justify-content-between align-items-center mt-3 px-3 pb-3">
      <div>
        <small className="text-muted">
          Sayfa {currentPage} / {totalPages} 
          {totalPages > currentPage ? `(En az ${totalCount} ${itemName})` : `(Toplam ${totalCount} ${itemName})`}
        </small>
      </div>
      <nav>
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              İlk
            </button>
          </li>
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Önceki
            </button>
          </li>
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </button>
              </li>
            );
          })}
          
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sonraki
            </button>
          </li>
          {/* Only show "Last" button if we know there are definitely more pages */}
          {totalPages > currentPage + 1 && (
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                Son
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}

function MostActiveLicenses({ token }) {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchMostActive() {
      try {
        setLoading(true);
        const offset = (currentPage - 1) * limit;
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/analytics/licenses/most-active-today?limit=${limit}&offset=${offset}`, {
          headers: getAuthHeaders(token)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error);
        }
        
        console.log('Most active licenses data:', data.data);
        setLicenses(data.data);
        
        // Use the new standardized meta object from backend
        if (data.meta) {
          setTotalCount(data.meta.total || 0);
          setTotalPages(Math.ceil((data.meta.total || 0) / limit));
          console.log('Most active pagination - Total:', data.meta.total, 'Has next:', data.meta.has_next, 'Has prev:', data.meta.has_prev);
        } else {
          // Fallback to old estimation logic if meta is missing
          const currentCount = data.data.length;
          if (currentCount === limit) {
            const estimatedTotal = currentPage * limit + 1;
            setTotalCount(estimatedTotal);
            setTotalPages(currentPage + 1);
          } else {
            const actualTotal = (currentPage - 1) * limit + currentCount;
            setTotalCount(actualTotal);
            setTotalPages(currentPage);
          }
        }
      } catch (error) {
        console.error('Failed to fetch most active licenses:', error);
        setError('En aktif lisanslar yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchMostActive();
  }, [token, limit, currentPage]);

  // Reset to page 1 when limit changes
  useEffect(() => {
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  }, [limit, currentPage]);

  if (loading) return <div className="text-center p-4">Yükleniyor...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="bi bi-lightning-charge me-2 text-warning"></i>
          Bugün En Aktif Lisanslar
        </h5>
        <div className="d-flex align-items-center gap-2">
          <small className="text-muted">Göster:</small>
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
          <small className="text-muted">({totalCount} toplam)</small>
        </div>
      </div>
      <div className="card-body">
        {licenses.length === 0 ? (
          <div className="text-center text-muted">Bugün aktif lisans bulunamadı.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Lisans Kodu</th>
                  <th>Şirket Adı</th>
                  <th>OSGB ID</th>
                  <th>Toplam Deneme</th>
                  <th>Başarı Oranı</th>
                  <th>Aktif Saatler</th>
                  <th>Son Kullanım</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map((license, index) => (
                  <tr key={license.license_code}>
                    <td>
                      <span className="badge bg-primary me-2">{index + 1}</span>
                      <strong>{license.license_code}</strong>
                    </td>
                    <td>{license.company_name}</td>
                    <td>
                      <code>{license.osgb_id}</code>
                    </td>
                    <td>
                      <div>
                        <span className="badge bg-info me-1">{license.total_attempts}</span>
                        <small className="text-muted">toplam</small>
                      </div>
                      {license.expired_attempts > 0 && (
                        <div className="mt-1">
                          <span className="badge bg-danger me-1">{license.expired_attempts}</span>
                          <small className="text-muted">başarısız</small>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${
                        parseFloat(calculateSuccessRate(license.successful_validations, license.total_attempts)) >= 90 
                          ? 'bg-success' 
                          : parseFloat(calculateSuccessRate(license.successful_validations, license.total_attempts)) >= 75 
                          ? 'bg-warning' 
                          : 'bg-danger'
                      }`}>
                        {calculateSuccessRate(license.successful_validations, license.total_attempts)}
                      </span>
                    </td>
                    <td>
                      {formatTime(license.first_time)} → {formatTime(license.last_time)}
                    </td>
                    <td>
                      <div>
                        <small className={license.is_expired ? 'text-danger fw-bold' : 'text-success'}>
                          {formatDate(license.expiration_date)}
                        </small>
                        {license.is_expired === 1 && (
                          <div className="text-danger">
                            <small>⚠️ Süresi Dolmuş</small>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <PaginationControls 
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
          itemName="lisans"
        />
      </div>
    </div>
  );
}

function DailyUsageSummary({ token }) {
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(7);
  const [limit, setLimit] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        const offset = (currentPage - 1) * limit;
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/analytics/usage/daily-summary?days=${days}&limit=${limit}&offset=${offset}`, {
          headers: getAuthHeaders(token)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error);
        }
        
        setSummaryData(data.data);
        // Use the new standardized meta object if available
        if (data.meta) {
          setTotalCount(data.meta.total || 0);
          setTotalPages(Math.ceil((data.meta.total || 0) / limit));
          console.log('Daily summary pagination - Total:', data.meta.total, 'Has next:', data.meta.has_next, 'Has prev:', data.meta.has_prev);
        } else {
          // Fallback for daily summary which might not need pagination
          const currentCount = data.data.length;
          if (currentCount === limit) {
            const estimatedTotal = currentPage * limit + 1;
            setTotalCount(estimatedTotal);
            setTotalPages(currentPage + 1);
          } else {
            const actualTotal = (currentPage - 1) * limit + currentCount;
            setTotalCount(actualTotal);
            setTotalPages(currentPage);
          }
        }
      } catch (error) {
        console.error('Failed to fetch daily summary:', error);
        setError('Günlük özet yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSummary();
  }, [token, days, limit, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  }, [days, limit, currentPage]);

  if (loading) return <div className="text-center p-4">Yükleniyor...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="bi bi-bar-chart me-2 text-primary"></i>
          Günlük Kullanım Özeti
        </h5>
        <div className="d-flex align-items-center gap-2">
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
          >
            <option value={7}>Son 7 Gün</option>
            <option value={14}>Son 14 Gün</option>
            <option value={30}>Son 30 Gün</option>
            <option value={90}>Son 90 Gün</option>
          </select>
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
          >
            <option value={15}>15 gün</option>
            <option value={30}>30 gün</option>
            <option value={60}>60 gün</option>
          </select>
          <small className="text-muted">({totalCount} toplam)</small>
        </div>
      </div>
      <div className="card-body">
        {summaryData.length === 0 ? (
          <div className="text-center text-muted">Veri bulunamadı.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Tarih</th>
                  <th>Gün</th>
                  <th>Aktif Lisans</th>
                  <th>Toplam Deneme</th>
                  <th>Başarılı</th>
                  <th>Başarısız</th>
                  <th>Ortalama/Lisans</th>
                  <th>En Yüksek</th>
                </tr>
              </thead>
              <tbody>
                {summaryData.map((day) => (
                  <tr key={day.date}>
                    <td>{formatDate(day.date)}</td>
                    <td>
                      <span className="badge bg-secondary">{day.day_name}</span>
                    </td>
                    <td>
                      <span className="badge bg-primary">{day.active_licenses}</span>
                    </td>
                    <td>{parseInt(day.total_attempts).toLocaleString('tr-TR')}</td>
                    <td>
                      <span className="text-success fw-bold">{parseInt(day.successful_validations).toLocaleString('tr-TR')}</span>
                    </td>
                    <td>
                      <span className={parseInt(day.expired_attempts) > 0 ? 'text-danger fw-bold' : 'text-muted'}>
                        {parseInt(day.expired_attempts).toLocaleString('tr-TR')}
                      </span>
                    </td>
                    <td>{parseFloat(day.avg_attempts_per_license).toFixed(1)}</td>
                    <td>
                      <span className="badge bg-info">{day.peak_license_attempts}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <PaginationControls 
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
          itemName="gün"
        />
      </div>
    </div>
  );
}

function InactiveLicenses({ token }) {
  const [inactiveLicenses, setInactiveLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inactiveDays, setInactiveDays] = useState(7);
  const [limit, setLimit] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchInactive() {
      try {
        setLoading(true);
        const offset = (currentPage - 1) * limit;
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/analytics/licenses/inactive?days=${inactiveDays}&limit=${limit}&offset=${offset}`, {
          headers: getAuthHeaders(token)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error);
        }
        
        setInactiveLicenses(data.data);
        // Use the new standardized meta object (inactive endpoint already has pagination)
        if (data.meta) {
          setTotalCount(data.meta.total || 0);
          setTotalPages(Math.ceil((data.meta.total || 0) / limit));
          console.log('Inactive licenses pagination - Total:', data.meta.total, 'Has next:', data.meta.has_next, 'Has prev:', data.meta.has_prev);
        } else {
          // Fallback estimation if meta is missing
          const currentCount = data.data.length;
          if (currentCount === limit) {
            const estimatedTotal = currentPage * limit + 1;
            setTotalCount(estimatedTotal);
            setTotalPages(currentPage + 1);
          } else {
            const actualTotal = (currentPage - 1) * limit + currentCount;
            setTotalCount(actualTotal);
            setTotalPages(currentPage);
          }
        }
      } catch (error) {
        console.error('Failed to fetch inactive licenses:', error);
        setError('Pasif lisanslar yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchInactive();
  }, [token, inactiveDays, limit, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  }, [inactiveDays, limit, currentPage]);

  if (loading) return <div className="text-center p-4">Yükleniyor...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="bi bi-pause-circle me-2 text-secondary"></i>
          Pasif Lisanslar
        </h5>
        <div className="d-flex align-items-center gap-2">
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
            value={inactiveDays}
            onChange={(e) => setInactiveDays(parseInt(e.target.value))}
          >
            <option value={3}>Son 3 Gün</option>
            <option value={7}>Son 7 Gün</option>
            <option value={14}>Son 14 Gün</option>
            <option value={30}>Son 30 Gün</option>
          </select>
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
          <small className="text-muted">({totalCount} toplam)</small>
        </div>
      </div>
      <div className="card-body">
        {inactiveLicenses.length === 0 ? (
          <div className="text-center text-success">
            <h6>🎉 Harika! {inactiveDays} gündür pasif lisans yok.</h6>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Lisans Kodu</th>
                  <th>Şirket Adı</th>
                  <th>OSGB ID</th>
                  <th>Son Kullanım</th>
                  <th>Pasif Gün</th>
                  <th>Son Kullanım Tarihi</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {inactiveLicenses.map((license) => (
                  <tr key={license.license_code}>
                    <td>
                      <strong>{license.license_code}</strong>
                    </td>
                    <td>{license.company_name}</td>
                    <td>
                      <code>{license.osgb_id}</code>
                    </td>
                    <td>{formatDate(license.expiration_date)}</td>
                    <td>
                      <span className={`badge ${
                        license.days_inactive >= 30 ? 'bg-danger' :
                        license.days_inactive >= 14 ? 'bg-warning' :
                        'bg-info'
                      }`}>
                        {license.days_inactive} gün
                      </span>
                    </td>
                    <td>
                      <small>{license.last_validated_at ? formatDate(license.last_validated_at) : 'Hiç kullanılmamış'}</small>
                    </td>
                    <td>
                      <span className={`badge ${license.is_expired ? 'bg-danger' : 'bg-success'}`}>
                        {license.is_expired ? 'Süreli' : 'Aktif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <PaginationControls 
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
          itemName="pasif lisans"
        />
      </div>
    </div>
  );
}

function RenewalCandidates({ token }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [minAttempts, setMinAttempts] = useState(5);
  const [renewalDays, setRenewalDays] = useState(7);
  const [limit, setLimit] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchCandidates() {
      try {
        setLoading(true);
        const offset = (currentPage - 1) * limit;
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/analytics/licenses/renewal-candidates?days=${renewalDays}&min_attempts=${minAttempts}&limit=${limit}&offset=${offset}`, {
          headers: getAuthHeaders(token)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error);
        }
        
        setCandidates(data.data);
        
        // Use the new standardized meta object (renewal candidates now has pagination)
        if (data.meta) {
          setTotalCount(data.meta.total || 0);
          setTotalPages(Math.ceil((data.meta.total || 0) / limit));
          console.log('Renewal candidates pagination - Total:', data.meta.total, 'Activity days:', data.meta.activity_days_checked, 'Min attempts:', data.meta.min_attempts_threshold);
        } else {
          // Fallback estimation if meta is missing
          const currentCount = data.data.length;
          if (currentCount === limit) {
            const estimatedTotal = currentPage * limit + 1;
            setTotalCount(estimatedTotal);
            setTotalPages(currentPage + 1);
          } else {
            const actualTotal = (currentPage - 1) * limit + currentCount;
            setTotalCount(actualTotal);
            setTotalPages(currentPage);
          }
        }
      } catch (error) {
        console.error('Failed to fetch renewal candidates:', error);
        setError('Yenileme adayları yüklenirken hata oluştu.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCandidates();
  }, [token, minAttempts, renewalDays, limit, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  }, [minAttempts, renewalDays, limit, currentPage]);

  if (loading) return <div className="text-center p-4">Yükleniyor...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="bi bi-arrow-clockwise me-2 text-info"></i>
          Yenileme Adayları
        </h5>
        <div className="d-flex align-items-center gap-2">
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
            value={renewalDays}
            onChange={(e) => setRenewalDays(parseInt(e.target.value))}
          >
            <option value={3}>Son 3 Gün</option>
            <option value={7}>Son 7 Gün</option>
            <option value={14}>Son 14 Gün</option>
            <option value={30}>Son 30 Gün</option>
          </select>
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
            value={minAttempts}
            onChange={(e) => setMinAttempts(parseInt(e.target.value))}
          >
            <option value={1}>En Az 1 Deneme</option>
            <option value={5}>En Az 5 Deneme</option>
            <option value={10}>En Az 10 Deneme</option>
            <option value={20}>En Az 20 Deneme</option>
          </select>
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <small className="text-muted">({totalCount} toplam)</small>
        </div>
      </div>
      <div className="card-body">
        {candidates.length === 0 ? (
          <div className="text-center text-muted">
            Belirtilen kriterlere uygun yenileme adayı bulunamadı.
          </div>
        ) : (
          <div className="row">
            {candidates.map((candidate) => (
              <div key={candidate.license_code} className="col-md-6 col-lg-4 mb-3">
                <div className="card border-warning">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0">{candidate.company_name}</h6>
                      <span className="badge bg-warning text-dark">{candidate.license_code}</span>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">OSGB ID: </small>
                      <code className="small">{candidate.osgb_id}</code>
                    </div>
                    <div className="mb-2">
                      <span className="badge bg-info me-2">
                        <i className="bi bi-activity me-1"></i>
                        {candidate.total_expired_attempts} deneme
                      </span>
                      <span className="badge bg-secondary">
                        {candidate.active_days} aktif gün
                      </span>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">Son deneme: </small>
                      <span className="fw-bold">{formatDate(candidate.last_attempt_date)}</span>
                    </div>
                    <div className="mb-3">
                      <small className="text-danger">
                        ⏰ {candidate.days_since_expiry} gün önce süresi doldu
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <PaginationControls 
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setCurrentPage}
          itemName="yenileme adayı"
        />
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div>
      <AdminNavbar onLogout={onLogout} />
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex align-items-center">
                <i className="bi bi-graph-up text-primary me-3" style={{fontSize: '2rem'}}></i>
                <div>
                  <h1 className="h2 mb-0">İstatistikler</h1>
                  <small className="text-muted">Lisans kullanım analiz ve raporları</small>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <ul className="nav nav-tabs mb-4" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                  type="button"
                  style={{
                    color: activeTab === 'overview' ? '#495057' : '#6c757d',
                    backgroundColor: activeTab === 'overview' ? '#fff' : 'transparent',
                    borderColor: activeTab === 'overview' ? '#dee2e6 #dee2e6 #fff' : '#dee2e6',
                    fontWeight: '600'
                  }}
                >
                  <i className="bi bi-pie-chart me-2"></i>
                  Genel Bakış
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
                  onClick={() => setActiveTab('active')}
                  type="button"
                  style={{
                    color: activeTab === 'active' ? '#495057' : '#6c757d',
                    backgroundColor: activeTab === 'active' ? '#fff' : 'transparent',
                    borderColor: activeTab === 'active' ? '#dee2e6 #dee2e6 #fff' : '#dee2e6',
                    fontWeight: '600'
                  }}
                >
                  <i className="bi bi-lightning-charge me-2"></i>
                  En Aktif Lisanslar
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'inactive' ? 'active' : ''}`}
                  onClick={() => setActiveTab('inactive')}
                  type="button"
                  style={{
                    color: activeTab === 'inactive' ? '#495057' : '#6c757d',
                    backgroundColor: activeTab === 'inactive' ? '#fff' : 'transparent',
                    borderColor: activeTab === 'inactive' ? '#dee2e6 #dee2e6 #fff' : '#dee2e6',
                    fontWeight: '600'
                  }}
                >
                  <i className="bi bi-pause-circle me-2"></i>
                  Pasif Lisanslar
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'renewals' ? 'active' : ''}`}
                  onClick={() => setActiveTab('renewals')}
                  type="button"
                  style={{
                    color: activeTab === 'renewals' ? '#495057' : '#6c757d',
                    backgroundColor: activeTab === 'renewals' ? '#fff' : 'transparent',
                    borderColor: activeTab === 'renewals' ? '#dee2e6 #dee2e6 #fff' : '#dee2e6',
                    fontWeight: '600'
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Yenileme Adayları
                </button>
              </li>
            </ul>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'overview' && (
                <div className="row">
                  <div className="col-12 mb-4">
                    <DailyUsageSummary token={token} />
                  </div>
                </div>
              )}

              {activeTab === 'active' && (
                <div className="row">
                  <div className="col-12">
                    <MostActiveLicenses token={token} />
                  </div>
                </div>
              )}

              {activeTab === 'inactive' && (
                <div className="row">
                  <div className="col-12">
                    <InactiveLicenses token={token} />
                  </div>
                </div>
              )}

              {activeTab === 'renewals' && (
                <div className="row">
                  <div className="col-12">
                    <RenewalCandidates token={token} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}