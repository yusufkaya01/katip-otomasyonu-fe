import React, { useState, useEffect } from 'react';
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

const fetchLicenseDailyUsage = async (token, osgbId, days = 30) => {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/admin/licenses/usage-overview?osgb_id=${encodeURIComponent(osgbId)}&include_daily=true&include_hourly=true&days=${days}`,
      {
        headers: getAuthHeaders(token)
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data.length > 0) {
      const license = data.data[0];
      return {
        success: true,
        license: {
          id: license.id,
          osgb_id: license.osgb_id,
          company_name: license.company_name,
          license_code: license.license_code,
          status: license.status,
          created_at: license.created_at,
          expiration_date: license.expiration_date,
          is_expired: license.is_expired,
          
          // Usage Summary
          total_usage_count: parseInt(license.total_usage_count) || 0,
          days_used: license.days_used || 0,
          avg_daily_usage: parseFloat(license.avg_daily_usage) || 0,
          successful_validations: parseInt(license.successful_validations) || 0,
          expired_attempts: parseInt(license.expired_attempts) || 0,
          first_used: license.first_used,
          last_used: license.last_used,
          usage_streak: license.usage_streak || 0
        },
        dailyUsage: license.daily_usage || [],
        analysisConfig: {
          days: days,
          period_start: data.meta?.analysis_period?.start_date,
          period_end: data.meta?.analysis_period?.end_date
        }
      };
    } else {
      return {
        success: false,
        error: 'Lisans bulunamadı',
        license: null,
        dailyUsage: []
      };
    }
    
  } catch (error) {
    console.error('Error fetching license daily usage:', error);
    return {
      success: false,
      error: error.message,
      license: null,
      dailyUsage: {}
    };
  }
};

const DailyUsageChart = ({ dailyUsage, days }) => {
  const containerRef = React.useRef(null);

  // Process daily usage to create hourly distribution
  const processHourlyData = (day) => {
    if (!day.first_attempt_time || !day.last_attempt_time) return null;
    
    // Parse times (format: "HH:MM")
    const firstHour = parseInt(day.first_attempt_time.split(':')[0]);
    const lastHour = parseInt(day.last_attempt_time.split(':')[0]);
    
    // Create 24-hour array
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      total_attempts: 0,
      successful_validations: 0,
      unsuccessful_validations: 0
    }));
    
    // If first and last hour are same, put all attempts in that hour
    if (firstHour === lastHour) {
      hourlyData[firstHour] = {
        hour: firstHour,
        total_attempts: day.total_attempts || 0,
        successful_validations: day.successful_validations || 0,
        unsuccessful_validations: day.expired_attempts || 0
      };
    } else {
      // Distribute attempts across the active hours
      const activeHours = lastHour - firstHour + 1;
      const totalAttempts = day.total_attempts || 0;
      const totalSuccessful = day.successful_validations || 0;
      const totalUnsuccessful = day.expired_attempts || 0;
      
      const attemptsPerHour = Math.floor(totalAttempts / activeHours);
      const successfulPerHour = Math.floor(totalSuccessful / activeHours);
      const unsuccessfulPerHour = Math.floor(totalUnsuccessful / activeHours);
      
      const attemptsRemainder = totalAttempts % activeHours;
      const successfulRemainder = totalSuccessful % activeHours;
      const unsuccessfulRemainder = totalUnsuccessful % activeHours;
      
      for (let h = firstHour; h <= lastHour; h++) {
        const hourIndex = h - firstHour;
        const extraAttempt = hourIndex < attemptsRemainder ? 1 : 0;
        const extraSuccessful = hourIndex < successfulRemainder ? 1 : 0;
        const extraUnsuccessful = hourIndex < unsuccessfulRemainder ? 1 : 0;
        
        hourlyData[h] = {
          hour: h,
          total_attempts: attemptsPerHour + extraAttempt,
          successful_validations: successfulPerHour + extraSuccessful,
          unsuccessful_validations: unsuccessfulPerHour + extraUnsuccessful
        };
      }
    }
    
    return hourlyData;
  };

  // Sort by date and add processed hourly data
  const sortedUsage = dailyUsage && Array.isArray(dailyUsage) 
    ? [...dailyUsage].sort((a, b) => new Date(a.date) - new Date(b.date)).map(day => ({
        ...day,
        hourly_usage: processHourlyData(day)
      }))
    : [];
  
  // Calculate max for scaling - check both daily and hourly
  const allValues = sortedUsage.flatMap(day => {
    const values = [day.total_attempts || 0];
    if (day.hourly_usage?.length > 0) {
      values.push(...day.hourly_usage.map(h => h.total_attempts || 0));
    }
    return values;
  });
  const maxUsage = Math.max(...allValues, 1);

  // Scroll to show last 3 days on mount
  React.useEffect(() => {
    if (containerRef.current && sortedUsage.length > 0) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [sortedUsage.length]);

  if (!dailyUsage || !Array.isArray(dailyUsage) || dailyUsage.length === 0) {
    return (
      <div className="text-center p-4 text-muted">
        <i className="bi bi-bar-chart display-4 mb-3"></i>
        <p>Bu dönem için kullanım verisi bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="daily-usage-chart">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Saatlik Kullanım Grafiği</h6>
        <div>
          <small className="text-muted me-3">Maksimum: {maxUsage} kullanım</small>
          <small className="text-info"><i className="bi bi-arrow-left me-1"></i>Eski günler için sola kaydırın</small>
        </div>
      </div>
      
      <div ref={containerRef} className="chart-timeline-container" style={{ overflowX: 'auto', overflowY: 'hidden', border: '1px solid #e9ecef', borderRadius: '6px', background: '#f8f9fa', padding: '15px' }}>
        <div className="d-flex align-items-end" style={{ minWidth: 'max-content', height: '250px', gap: '16px' }}>
          {sortedUsage.map((day) => {
            const hasHourly = day.hourly_usage?.length > 0;
            
            return (
              <div key={day.date} className="day-column" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%' }}>
                {/* Chart Area */}
                <div style={{ height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minWidth: hasHourly ? '200px' : '50px' }}>
                  {hasHourly ? (
                    // Show hourly bars
                    <div className="hourly-bars-group" style={{ display: 'flex', gap: '1px', flexDirection: 'column', height: '100%', background: 'rgba(200,200,255,0.2)', padding: '4px', borderRadius: '4px' }}>
                      {/* Bars */}
                      <div style={{ display: 'flex', gap: '1px', alignItems: 'flex-end', flex: 1 }}>
                        {day.hourly_usage.map((hour) => {
                          const totalBarHeight = maxUsage > 0 ? (hour.total_attempts / maxUsage) * 100 : 0;
                          const successfulHeight = maxUsage > 0 ? (hour.successful_validations / maxUsage) * 100 : 0;
                          const unsuccessfulHeight = maxUsage > 0 ? ((hour.unsuccessful_validations || 0) / maxUsage) * 100 : 0;
                          
                          return (
                            <div 
                              key={hour.hour} 
                              style={{ 
                                flex: 1, 
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: 'flex-end',
                                minWidth: '6px',
                                height: '100%'
                              }}
                              title={`Saat ${hour.hour}:00\n${hour.total_attempts} toplam kullanım\n✓ Başarılı: ${hour.successful_validations}\n✗ Başarısız: ${hour.unsuccessful_validations || 0}`}
                            >
                              {/* Stacked bar chart: unsuccessful on top, successful on bottom */}
                              {hour.total_attempts > 0 ? (
                                <div 
                                  style={{ 
                                    height: `${totalBarHeight}%`,
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: '2px 2px 0 0',
                                    overflow: 'hidden',
                                    minHeight: '5px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {/* Unsuccessful validations (top, red) */}
                                  {unsuccessfulHeight > 0 && (
                                    <div
                                      style={{
                                        height: `${(unsuccessfulHeight / totalBarHeight) * 100}%`,
                                        width: '100%',
                                        backgroundColor: '#dc3545',
                                        opacity: 0.85,
                                        transition: 'opacity 0.2s'
                                      }}
                                    ></div>
                                  )}
                                  {/* Successful validations (bottom, green) */}
                                  {successfulHeight > 0 && (
                                    <div
                                      style={{
                                        height: `${(successfulHeight / totalBarHeight) * 100}%`,
                                        width: '100%',
                                        backgroundColor: '#198754',
                                        opacity: 0.85,
                                        transition: 'opacity 0.2s'
                                      }}
                                    ></div>
                                  )}
                                </div>
                              ) : (
                                <div
                                  style={{
                                    height: '2px',
                                    width: '100%',
                                    backgroundColor: '#e9ecef',
                                    opacity: 0.4
                                  }}
                                ></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {/* Hour labels */}
                      <div style={{ display: 'flex', marginTop: '4px' }}>
                        {day.hourly_usage.map((hour) => (
                          <div 
                            key={`label-${hour.hour}`}
                            style={{ 
                              flex: 1, 
                              textAlign: 'center',
                              fontSize: '9px',
                              color: hour.total_attempts > 0 ? '#495057' : '#adb5bd',
                              fontWeight: hour.total_attempts > 0 ? '600' : '400',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {hour.hour % 3 === 0 ? hour.hour : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Show single daily bar if no hourly data
                    <div
                      className="daily-bar"
                      style={{
                        width: '50px',
                        height: `${maxUsage > 0 ? (day.total_attempts / maxUsage) * 100 : 0}%`,
                        backgroundColor: day.total_attempts > 0 ? '#0d6efd' : '#e9ecef',
                        borderRadius: '6px 6px 0 0',
                        minHeight: day.total_attempts > 0 ? '8px' : '3px',
                        cursor: 'pointer'
                      }}
                      title={`${formatDate(day.date)}: ${day.total_attempts} kullanım`}
                    ></div>
                  )}
                </div>
                
                {/* Daily Total Badge */}
                <div className="badge bg-primary fw-bold" style={{ fontSize: '12px', minWidth: '40px', textAlign: 'center', padding: '4px 8px' }}>
                  {day.total_attempts}
                </div>
                
                {/* Date Label */}
                <small className="text-dark fw-semibold" style={{ fontSize: '11px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {new Date(day.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                </small>
                
                {/* Day Name */}
                <small className="text-muted" style={{ fontSize: '10px', textAlign: 'center' }}>
                  {new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' })}
                </small>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-3 text-center">
        <small className="text-muted">
          <span className="text-info"><i className="bi bi-arrow-left-right"></i> Yatay kaydırılabilir</span>
        </small>
      </div>
    </div>
  );
};

export default function LicenseDetailModal({ token, osgbId, onClose }) {
  const [licenseData, setLicenseData] = useState(null);
  const [dailyUsage, setDailyUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    loadLicenseUsage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [osgbId, selectedPeriod]);

  const loadLicenseUsage = async () => {
    setLoading(true);
    setError(null);
    
    const result = await fetchLicenseDailyUsage(token, osgbId, selectedPeriod);
    
    if (result.success) {
      setLicenseData(result.license);
      setDailyUsage(result.dailyUsage);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const calculateSuccessRate = (license) => {
    if (!license || license.total_usage_count === 0) return '0.0';
    const successRate = (license.successful_validations / license.total_usage_count) * 100;
    return successRate.toFixed(1);
  };

  if (loading) {
    return (
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-body text-center p-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Yükleniyor...</span>
              </div>
              <p>Lisans detayları yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Hata</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body text-center p-4">
              <i className="bi bi-exclamation-triangle text-danger display-1 mb-3"></i>
              <h4>Lisans Yüklenemedi</h4>
              <p className="text-muted">{error}</p>
              <div className="mt-4">
                <button className="btn btn-primary me-2" onClick={loadLicenseUsage}>
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Tekrar Dene
                </button>
                <button className="btn btn-secondary" onClick={onClose}>Kapat</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!licenseData) {
    return (
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Lisans Bulunamadı</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body text-center p-4">
              <i className="bi bi-search text-muted display-1 mb-3"></i>
              <h4>Lisans Bulunamadı</h4>
              <p className="text-muted">OSGB ID: <code>{osgbId}</code> ile lisans bulunamadı.</p>
              <button className="btn btn-secondary" onClick={onClose}>Kapat</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <div className="d-flex align-items-center">
              <i className="bi bi-clipboard-data text-primary me-2"></i>
              <div>
                <h5 className="modal-title mb-0">Lisans Detayları</h5>
                <small className="text-muted">{licenseData.osgb_id}</small>
              </div>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* License Summary Card */}
            <div className="card bg-light mb-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-8">
                    <h4 className="text-primary mb-2">{licenseData.company_name}</h4>
                    <div className="mb-3">
                      <span className="badge bg-secondary me-2">OSGB: {licenseData.osgb_id}</span>
                      <span className="badge bg-info me-2">Kod: {licenseData.license_code}</span>
                      <span className={`badge ${licenseData.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                        {licenseData.status === 'active' ? 'Aktif' : 'Süresi Doldu'}
                      </span>
                    </div>
                    
                    <div className="row text-center g-0">
                      <div className="col-3">
                        <div className="border-end px-2">
                          <div className="h4 text-primary mb-0">{licenseData.total_usage_count.toLocaleString()}</div>
                          <small className="text-muted d-block">Toplam Kullanım</small>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="border-end px-2">
                          <div className="h4 text-success mb-0">{licenseData.successful_validations.toLocaleString()}</div>
                          <small className="text-muted d-block">Başarılı</small>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="border-end px-2">
                          <div className="h4 text-danger mb-0">{licenseData.expired_attempts.toLocaleString()}</div>
                          <small className="text-muted d-block">Başarısız</small>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="px-2">
                          <div className="h4 text-warning mb-0">{calculateSuccessRate(licenseData)}%</div>
                          <small className="text-muted d-block">Başarı Oranı</small>
                        </div>
                      </div>
                    </div>
                    <div className="row text-center g-0 mt-3 pt-3 border-top">
                      <div className="col-4">
                        <div className="border-end px-2">
                          <div className="h5 text-info mb-0">{licenseData.days_used}</div>
                          <small className="text-muted d-block">Aktif Gün</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="border-end px-2">
                          <div className="h5 text-info mb-0">
                            {licenseData.avg_daily_usage && typeof licenseData.avg_daily_usage === 'number' 
                              ? licenseData.avg_daily_usage.toFixed(1) 
                              : '0.0'}
                          </div>
                          <small className="text-muted d-block">Günlük Ortalama</small>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="px-2">
                          <div className="h5 text-secondary mb-0">{licenseData.usage_streak || 0}</div>
                          <small className="text-muted d-block">Kullanım Serisi</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="timeline-info">
                      <div className="mb-2">
                        <small className="text-muted d-block">Oluşturulma Tarihi:</small>
                        <strong>{formatDate(licenseData.created_at)}</strong>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted d-block">Bitiş Tarihi:</small>
                        <strong>{formatDate(licenseData.expiration_date)}</strong>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted d-block">İlk Kullanım:</small>
                        <strong>
                          {licenseData.first_used 
                            ? formatDate(licenseData.first_used)
                            : 'Henüz kullanılmadı'}
                        </strong>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted d-block">Son Kullanım:</small>
                        <strong>
                          {licenseData.last_used 
                            ? formatDate(licenseData.last_used)
                            : 'Henüz kullanılmadı'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Period Selector */}
            <div className="row align-items-center mb-4">
              <div className="col-md-6">
                <h5 className="mb-0">
                  <i className="bi bi-calendar-range me-2 text-primary"></i>
                  Günlük Kullanım Analizi
                </h5>
              </div>
              <div className="col-md-6 text-end">
                <div className="d-flex align-items-center justify-content-end gap-2">
                  <small className="text-muted">Analiz Süresi:</small>
                  <select 
                    className="form-select form-select-sm" 
                    style={{ width: 'auto' }}
                    value={selectedPeriod} 
                    onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                  >
                    <option value={7}>Son 7 gün</option>
                    <option value={30}>Son 30 gün</option>
                    <option value={90}>Son 90 gün</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Daily Usage Section */}
            <div className="card">
              <div className="card-body">
                <DailyUsageChart dailyUsage={dailyUsage} days={selectedPeriod} />

                {dailyUsage.length > 0 && (
                  <div className="mt-4">
                    <h6>Günlük Detay Listesi</h6>
                    <div className="table-responsive" style={{ maxHeight: '300px' }}>
                      <table className="table table-sm table-hover">
                        <thead className="table-dark sticky-top">
                          <tr>
                            <th>Tarih</th>
                            <th>Gün</th>
                            <th className="text-end">Toplam Kullanım</th>
                            <th className="text-end">Başarılı</th>
                            <th className="text-end">Başarısız</th>
                            <th>İlk Kullanım</th>
                            <th>Son Kullanım</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyUsage
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((day) => (
                            <tr key={day.date}>
                              <td>{formatDate(day.date)}</td>
                              <td>
                                <small className="text-muted">
                                  {day.day_name || new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'long' })}
                                </small>
                              </td>
                              <td className="text-end">
                                <span className={`badge ${day.total_attempts > 0 ? 'bg-primary' : 'bg-light text-dark'}`}>
                                  {day.total_attempts}
                                </span>
                              </td>
                              <td className="text-end">
                                <span className={`badge ${day.successful_validations > 0 ? 'bg-success' : 'bg-light text-dark'}`}>
                                  {day.successful_validations}
                                </span>
                              </td>
                              <td className="text-end">
                                <span className={`badge ${day.expired_attempts > 0 ? 'bg-danger' : 'bg-light text-dark'}`}>
                                  {day.expired_attempts}
                                </span>
                              </td>
                              <td>
                                <small>{day.first_attempt_time || '-'}</small>
                              </td>
                              <td>
                                <small>{day.last_attempt_time || '-'}</small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline-primary" onClick={loadLicenseUsage}>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Yenile
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}