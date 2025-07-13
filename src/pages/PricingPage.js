import React, { useState } from 'react';

const TIERS = Array.from({ length: 10 }, (_, i) => {
  const tier = i + 1;
  const limit = tier < 10 ? (tier * 500).toString() : 'Sınırsız';
  // Prices: start at 8000, increment by 2000 each tier
  const yearly = (8000 + (i * 2000)) + '₺';
  return { tier, limit, yearly };
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
          {bold ? <span>İSG Katip'te '<b>Devam Eden Toplam Sözleşme Sayısı</b>' baz alınır</span> : text}
        </span>
      )}
    </span>
  );
}

function PricingPage() {
  return (
    <>
      {/* Animated sticky catch phrase for installment info */}
      <div style={{
        position: 'fixed',
        top: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(90deg, #e6ffed 0%, #b6f0c2 100%)',
        color: '#146c43',
        borderRadius: 32,
        boxShadow: '0 4px 24px rgba(22,160,133,0.12)',
        padding: '14px 36px',
        fontWeight: 700,
        fontSize: 20,
        zIndex: 9999,
        animation: 'bounce 1.2s infinite',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#146c43" viewBox="0 0 16 16"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 14.5A6.5 6.5 0 1 1 8 1.5a6.5 6.5 0 0 1 0 13zm0-10a.75.75 0 1 1 0 1.5A.75.75 0 0 1 8 4.5zm1 7.25c0 .414-.336.75-.75.75s-.75-.336-.75-.75V7.75c0-.414.336-.75.75-.75s.75.336.75.75v4z"/></svg>
        3 taksite kadar <span style={{color:'#198754'}}>vade farkı yok!</span>
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            20% { transform: translateX(-50%) translateY(-10px); }
            40% { transform: translateX(-50%) translateY(-20px); }
            60% { transform: translateX(-50%) translateY(-10px); }
            80% { transform: translateX(-50%) translateY(0); }
          }
        `}</style>
      </div>
      <div className="container py-5">
        <h2 className="mb-4 text-center">Fiyat Listesi</h2>
        <div className="table-responsive mb-3">
          <table className="table table-bordered table-striped align-middle text-center bg-white">
            <thead className="table-danger">
              <tr>
                <th>Kademe</th>
                <th>
                  Sözleşme Limiti
                  <InfoIcon bold text={"İSG Katip'te 'Devam Eden Toplam Sözleşme Sayısı' baz alınır"} />
                </th>
                <th style={{ position: 'relative' }}>
                  Yıllık Fiyat <span style={{ fontWeight: 400, fontSize: 13 }}>(366 Gün)</span>
                  <InfoIcon text={"Satın alımdan itibaren 366 gün kullanım sunar. Süre bitiminde lisansın süresi uzatılmalıdır."} />
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
                    Satın alım tarihinden itibaren 366 gün geçerlidir
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {TIERS.map(tier => (
                <tr key={tier.tier}>
                  <td>{tier.tier}</td>
                  <td>{tier.limit}</td>
                  <td>
                    <span style={{ color: '#fd7e14', fontWeight: 600 }}>{tier.yearly}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="alert alert-info text-center my-3" style={{background: '#e7f1ff', color: '#084298', borderColor: '#b6d4fe'}}>
          Demo paketi 7 gün boyunca ücretsizdir. Demo süresi sona erdikten sonra, lisansınızın süresini sitemize kayıt olarak uzatabilirsiniz.
        </div>
        <div className="alert alert-warning text-center my-3" style={{background: '#fffbe6', color: '#664d03', borderColor: '#ffe066'}}>
          Lisans anahtarınızın <b>süresini uzatırken veya kademenizi güncellerken</b> <b>İSG Katip'teki 'Devam Eden Toplam Sözleşme Sayısı'</b>nı kontrol edip <b>uygun kademede</b> satın alım yapmanız gerekmektedir. Aksi halde, devam eden sözleşme sayınız lisansınıza tanımlı olan sözleşme limitinden fazla ise eklentiyi kullanamaz ve 'Lisans anahtarı geçersizdir.' uyarısı alırsınız.
        </div>
        <div className="alert alert-warning mt-4 text-center" style={{background: '#fffbe6', color: '#664d03', borderColor: '#ffe066'}}>
          <b>Yıllık lisans:</b> Satın alımdan itibaren 366 gün kullanım sunar. Süre bitiminde lisansın süresi uzatılmalıdır.
        </div>
      </div>
    </>
  );
}

export default PricingPage;
