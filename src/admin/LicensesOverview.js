import React, { useState, useEffect, useCallback } from 'react';
import LicenseDetailModal from './LicenseDetailModal';
import './LicenseDetailModal.css';

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
    
    const date = new Date(dateString);
    const adjustedDate = new Date(date.getTime() + (2 * 60 * 60 * 1000));
    
    if (isNaN(adjustedDate.getTime())) {
      return 'Geçersiz tarih';
    }
    
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

function PaginationControls({ currentPage, totalPages, totalCount, onPageChange, itemName = 'kayıt' }) {
  if (totalPages <= 1) {
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

// Custom hook for licenses overview
const useLicensesOverview = (token) => {
  const [allLicenses, setAllLicenses] = useState([]); // Full dataset
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const fetchLicenses = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const defaultFilters = {
        limit: 'all',
        days: 30,
        include_inactive: false
      };
      
      const mergedFilters = { ...defaultFilters, ...filters };
      
      const params = new URLSearchParams();
      Object.entries(mergedFilters).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/admin/licenses/usage-overview?${params.toString()}`;
      console.log('API call URL:', apiUrl); // Debug log
      console.log('API call params:', params.toString()); // Debug log
      
      const response = await fetch(apiUrl, {
        headers: getAuthHeaders(token)
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else if (response.status === 404) {
          throw new Error('API endpoint not found.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Request failed with status: ${response.status}`);
        }
      }
      
      const data = await response.json();
      
      console.log('API Response meta:', data.meta); // Debug log to see what backend returns
      
      if (!data.success) {
        throw new Error(data.message || 'Request failed');
      }
      
      setAllLicenses(data.data);
      setMeta(data.meta);
      setCurrentPage(1); // Reset to page 1 when data changes
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);
  
  const refresh = (currentFilters = {}) => {
    fetchLicenses(currentFilters);
  };
  
  const changePage = (page) => {
    setCurrentPage(page);
  };
  
  const applyFilters = (newFilters) => {
    console.log('Applying filters:', newFilters); // Debug log
    fetchLicenses(newFilters);
  };
  
  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);
  
  return {
    allLicenses,
    meta,
    loading,
    error,
    currentPage,
    itemsPerPage,
    refresh,
    changePage,
    applyFilters
  };
};

export default function LicensesOverview({ token }) {
  const [filters, setFilters] = useState({
    days: 30,
    include_inactive: false,
    include_daily: false
  });
  
  const [selectedLicenseOsgbId, setSelectedLicenseOsgbId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    allLicenses,
    meta,
    loading,
    error,
    currentPage,
    itemsPerPage,
    changePage,
    applyFilters
  } = useLicensesOverview(token);

  // Apply initial filters on component mount
  useEffect(() => {
    applyFilters(filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleRowClick = (osgbId) => {
    setSelectedLicenseOsgbId(osgbId);
  };

  // Handle page change with client-side pagination
  const handlePageChange = (page) => {
    // Don't paginate when searching
    if (searchQuery) return;
    changePage(page);
  };

  const handleModalClose = () => {
    setSelectedLicenseOsgbId(null);
  };

  // Simplified Turkish-aware search function
  const turkishSearch = (text, query) => {
    if (!text || !query) return false;
    
    // Convert to string and trim whitespace
    const textStr = String(text).trim();
    const queryStr = String(query).trim();
    
    // Use Turkish locale for proper case conversion
    const normalizedText = textStr.toLocaleLowerCase('tr-TR');
    const normalizedQuery = queryStr.toLocaleLowerCase('tr-TR');
    
    return normalizedText.includes(normalizedQuery);
  };

  // Filter licenses based on search query (from full dataset)
  const filteredLicenses = allLicenses.filter(license => {
    if (!searchQuery) return true;
    
    const query = searchQuery.trim();
    if (!query) return true;
    
    const matches = (
      turkishSearch(license.license_code, query) ||
      turkishSearch(license.osgb_id, query) ||
      turkishSearch(license.company_name, query)
    );
    
    // Debug logging for first few matches when searching
    if (searchQuery && allLicenses.indexOf(license) < 3) {
      console.log('Search Debug:', {
        query: query,
        license_code: license.license_code,
        osgb_id: license.osgb_id,
        company_name: license.company_name,
        matches: matches
      });
    }
    
    return matches;
  });

  // Calculate pagination for filtered results
  const totalFilteredCount = filteredLicenses.length;
  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage);
  
  // Debug: Log dataset size
  console.log('Dataset Info:', {
    allLicensesCount: allLicenses.length,
    searchQuery: searchQuery,
    filteredCount: totalFilteredCount,
    metaTotal: meta.total,
    isFullDataset: meta.is_full_dataset
  });
  
  // Get current page's licenses (client-side pagination)
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLicenses = searchQuery 
    ? filteredLicenses // Show all search results without pagination
    : filteredLicenses.slice(startIndex, endIndex); // Paginate when not searching

  if (loading && allLicenses.length === 0) {
    return <div className="text-center p-4">Yükleniyor...</div>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-clipboard-data me-2 text-info"></i>
            Lisans Kullanım Genel Bakışı
          </h5>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <small className="text-muted">Analiz Süresi:</small>
              <select 
                className="form-select form-select-sm" 
                style={{ width: 'auto' }}
                value={filters.days}
                onChange={(e) => handleFilterChange('days', parseInt(e.target.value))}
              >
                <option value={7}>7 gün</option>
                <option value={14}>14 gün</option>
                <option value={30}>30 gün</option>
                <option value={60}>60 gün</option>
                <option value={90}>90 gün</option>
              </select>
            </div>
            <div className="form-check form-switch">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="includeInactive"
                checked={filters.include_inactive}
                onChange={(e) => handleFilterChange('include_inactive', e.target.checked)}
              />
              <label className="form-check-label" htmlFor="includeInactive">
                <small>Süresi Dolmuş Lisanslar</small>
              </label>
            </div>
          </div>
        </div>
        
        {meta.analysis_period && (
          <div className="mt-2 d-flex justify-content-between align-items-center">
            <small className="text-muted">
              <i className="bi bi-calendar-range me-1"></i>
              Analiz Dönemi: {formatDate(meta.analysis_period.start_date)} - {formatDate(meta.analysis_period.end_date)}
            </small>
            {meta.is_full_dataset && (
              <small className="badge bg-success-subtle text-success">
                <i className="bi bi-check-circle me-1"></i>
                Tüm veri yüklendi ({meta.total?.toLocaleString()} lisans)
              </small>
            )}
            {!meta.is_full_dataset && meta.total > (meta.count || 0) && (
              <small className="badge bg-warning-subtle text-warning">
                <i className="bi bi-exclamation-triangle me-1"></i>
                Kısmi veri ({meta.count || 0}/{meta.total?.toLocaleString()}) - Arama sınırlı
              </small>
            )}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="card-body border-bottom">
        {/* Warning when full dataset is not loaded */}
        {!meta.is_full_dataset && meta.total > (meta.count || 0) && (
          <div className="alert alert-warning mb-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Uyarı:</strong> Sadece {meta.count || 0} lisans yüklendi (Toplam: {meta.total?.toLocaleString()}). 
            Arama ve filtreleme tüm kayıtlarda çalışmayacak. Backend API <code>limit=all</code> parametresini desteklemiyor.
          </div>
        )}
        
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="position-relative">
              <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input
                type="text"
                className="form-control ps-5"
                placeholder="Lisans kodu, şirket adı veya OSGB ID ile ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {searchQuery && (
            <div className="col-md-6 text-end">
              <small className="text-muted">
                {filteredLicenses.length} sonuç bulundu
                <button 
                  className="btn btn-sm btn-outline-secondary ms-2"
                  onClick={() => setSearchQuery('')}
                >
                  <i className="bi bi-x"></i> Temizle
                </button>
              </small>
            </div>
          )}
        </div>
      </div>

      <div className="card-body">
        {error && (
          <div className="alert alert-danger mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {paginatedLicenses.length === 0 && !loading ? (
          <div className="text-center text-muted py-4">
            <i className="bi bi-inbox display-4 mb-3"></i>
            {searchQuery ? (
              <>
                <p>"<strong>{searchQuery}</strong>" araması için lisans bulunamadı.</p>
                <small>Farklı bir arama terimi deneyin.</small>
              </>
            ) : (
              <p>Belirtilen kriterlere uygun lisans bulunamadı.</p>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Lisans Kodu</th>
                  <th>OSGB ID</th>
                  <th>Şirket Adı</th>
                  <th>Lisans Bitiş Tarihi</th>
                  <th>Toplam Lisans Kullanımı</th>
                  <th>Toplam Kullanım</th>
                  <th>Başarısız Denemeler</th>
                  <th>Aktif Gün</th>
                  <th>Günlük Ort.</th>
                  <th>İlk/Son Kullanım</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLicenses.map((license) => (
                  <tr 
                    key={license.license_code} 
                    style={{ cursor: 'pointer' }}
                    className="table-row-hover"
                    onClick={() => handleRowClick(license.osgb_id)}
                    title="Detayları görmek için tıklayın"
                  >
                    <td>
                      <strong className="text-primary">{license.license_code}</strong>
                    </td>
                    <td>
                      <code className="bg-light px-2 py-1 rounded">{license.osgb_id}</code>
                    </td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '200px' }} title={license.company_name}>
                        {license.company_name}
                      </div>
                    </td>
                    <td>
                      <small>{formatDate(license.expiration_date)}</small>
                    </td>
                    <td>
                      <span className="badge bg-warning">{license.total_validation_requests?.toLocaleString() || '0'}</span>
                    </td>
                    <td>
                      <span className="badge bg-info">{license.total_usage_count}</span>
                    </td>
                    <td>
                      <span className="badge bg-danger">
                        {license.unsuccessful_validations?.toLocaleString() || license.expired_attempts?.toLocaleString() || '0'}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-secondary">{license.days_used}</span>
                    </td>
                    <td>
                      <span className="badge bg-primary">
                        {license.avg_daily_usage && typeof license.avg_daily_usage === 'number' 
                          ? license.avg_daily_usage.toFixed(1) 
                          : typeof license.avg_daily_usage === 'string' && license.avg_daily_usage !== '' 
                          ? parseFloat(license.avg_daily_usage).toFixed(1)
                          : '0.0'}
                      </span>
                    </td>
                    <td>
                      <div>
                        {license.first_used && (
                          <div>
                            <small className="text-success">
                              <i className="bi bi-play-fill me-1"></i>
                              {formatDate(license.first_used)}
                            </small>
                          </div>
                        )}
                        {license.last_used && (
                          <div>
                            <small className="text-warning">
                              <i className="bi bi-stop-fill me-1"></i>
                              {formatDate(license.last_used)}
                            </small>
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

        {loading && allLicenses.length > 0 && (
          <div className="text-center py-2">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
          </div>
        )}
      </div>

      {totalPages > 1 && !searchQuery && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalFilteredCount}
          onPageChange={handlePageChange}
          itemName="lisans"
        />
      )}

      {/* License Detail Modal */}
      {selectedLicenseOsgbId && (
        <LicenseDetailModal
          token={token}
          osgbId={selectedLicenseOsgbId}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}