import React, { useState } from 'react';

const TIERS = Array.from({ length: 9 }, (_, i) => {
  const tier = i + 1;
  const limit = tier < 9 ? (tier * 500).toString() : 'Sınırsız';
  const monthly = 1000 * tier;
  // New yearly: 65% of (monthly * 6)
  const yearly = Math.round(monthly * 6 * 0.6) + '₺';
  return { tier, limit, monthly: monthly + '₺', yearly };
});

function InfoIcon({ text, bold }) {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ marginLeft: 4, cursor: 'pointer', verticalAlign: 'middle', position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      tabIndex={0}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#0d6efd" viewBox="0 0 16 16">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12z"/>
        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 .877-.252 1.02-.797l.088-.416c.066-.308.118-.438.288-.438.145 0 .176.105.145.288l-.088.416c-.194.897-.105 1.319.808 1.319.545 0 .877-.252 1.02-.797l.738-3.468c.194-.897-.105-1.319-.808-1.319-.545 0-.877.252-1.02.797l-.088.416c-.066.308-.118.438-.288.438-.145 0-.176-.105-.145-.288l.088-.416c.194-.897.105-1.319-.808-1.319zM8 5.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1z"/>
      </svg>
      {show && (
        <span style={{
          position: 'absolute',
          left: '50%',
          top: '140%',
          transform: 'translateX(-50%)',
          background: '#0d6efd',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '12px 20px',
          fontSize: 16,
          minWidth: 220,
          boxShadow: '0 4px 16px rgba(13,110,253,0.15)',
          zIndex: 10,
          whiteSpace: 'normal',
          fontWeight: 500,
        }}>
          {bold ? <span>isg katip'te '<b>Devam Eden Toplam Sözleşme Sayısı</b>' baz alınır</span> : text}
        </span>
      )}
    </span>
  );
}

function PricingPage() {
  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center">Fiyat Listesi</h2>
      <div className="table-responsive mb-3">
        <table className="table table-bordered table-striped align-middle text-center bg-white">
          <thead className="table-danger">
            <tr>
              <th>Kademe</th>
              <th>
                Sözleşme Limiti
                <InfoIcon bold text={"isg katip'te 'Devam Eden Toplam Sözleşme Sayısı' baz alınır"} />
              </th>
              <th>Aylık Fiyat</th>
              <th style={{ position: 'relative' }}>
                Yıllık Fiyat <span style={{ fontWeight: 400, fontSize: 13 }}>(31 Aralık 2025 tarihine kadar)</span>
                <InfoIcon text={"31 Aralık 2025 tarihine kadar kullanım sunar: Yeni yılda İSG-Katip sisteminde yapılacak değişikliklere göre sistemimiz güncellenecek olup, yeni yıl için yeniden lisans almanız gerekecektir."} />
                <div style={{
                  fontSize: 13,
                  color: '#fd7e14',
                  fontWeight: 600,
                  marginTop: 2,
                  letterSpacing: 0.2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#fd7e14" viewBox="0 0 16 16" style={{marginRight: 2}}><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 14.5A6.5 6.5 0 1 1 8 1.5a6.5 6.5 0 0 1 0 13zm0-10a.75.75 0 1 1 0 1.5A.75.75 0 0 1 8 4.5zm1 7.25c0 .414-.336.75-.75.75s-.75-.336-.75-.75V7.75c0-.414.336-.75.75-.75s.75.336.75.75v4z"/></svg>
                  Yıllık ödemede %40 indirim
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {TIERS.map(tier => (
              <tr key={tier.tier}>
                <td>{tier.tier}</td>
                <td>{tier.limit}</td>
                <td>{tier.monthly}</td>
                <td>
                  <span style={{ textDecoration: 'line-through', color: '#678', marginRight: 8 }}>
                    {parseInt(tier.monthly) * 6}₺
                  </span>
                  <span style={{ color: '#fd7e14', fontWeight: 600 }}>{tier.yearly}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="alert alert-info text-center my-3" style={{background: '#e7f1ff', color: '#084298', borderColor: '#b6d4fe'}}>
        Demo paketi 3 gün boyunca ücretsizdir. Aylık ve yıllık lisanslar için uygun paketi devam eden sözleşme sayınıza göre seçebilirsiniz.
      </div>
      <div className="alert alert-warning text-center my-3" style={{background: '#fffbe6', color: '#664d03', borderColor: '#ffe066'}}>
        Lisans anahtarınızı satın alırken İSG Katip'teki '<b>Devam Eden Toplam Sözleşme Sayısı</b>'nı kontrol edip uygun kademede lisans anahtarı satın almanız gerekmektedir. Aksi halde, eğer devam eden sözleşme sayınız lisansınıza tanımlı olan sözleşme limitinden fazla ise eklentiyi kullanamaz ve 'Lisans anahtarı geçersizdir.' uyarısı alırsınız.
      </div>
      <div className="alert alert-warning mt-4 text-center" style={{background: '#fffbe6', color: '#664d03', borderColor: '#ffe066'}}>
        <b>Yıllık lisans:</b> 31 Aralık 2025 tarihine kadar kullanım sunar. Yeni yılda İSG-Katip sisteminde yapılacak değişikliklere göre sistemimiz güncellenecek olup, yeni yıl için yeniden lisans almanız gerekecektir.
      </div>
    </div>
  );
}

export default PricingPage;
