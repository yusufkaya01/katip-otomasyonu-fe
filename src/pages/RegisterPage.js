import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { fetchTaxOffices } from '../api/taxOffices';

function RegisterPage() {
  const [form, setForm] = useState({
    company_name: '',
    tax_number: '',
    tax_office: '',
    address: '',
    phone: '',
    email: '',
    osgb_id: '',
    password: '',
    password_confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [taxData, setTaxData] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districts, setDistricts] = useState([]);
  const [taxOffices, setTaxOffices] = useState([]);

  // Agreement modal state
  const [agreementModal, setAgreementModal] = useState({ open: false, type: null });
  const [agreements, setAgreements] = useState({
    terms: false, // Kullanım Koşulları
    privacy: false, // Gizlilik Sözleşmesi
    kvkk: false, // KVKK Açık Rıza
    commercial: false // Ticari Elektronik İleti Onayı (optional)
  });
  const [showAgreementWarning, setShowAgreementWarning] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const fieldRefs = {
    company_name: useRef(),
    city: useRef(),
    district: useRef(),
    tax_office: useRef(),
    tax_number: useRef(),
    osgb_id: useRef(),
    email: useRef(),
    password: useRef(),
    password_confirm: useRef(),
    phone: useRef(),
    address: useRef(),
    terms: useRef(),
    privacy: useRef(),
    kvkk: useRef(),
  };

  const API_KEY = process.env.REACT_APP_USER_API_KEY;
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://customers.katipotomasyonu.com/api';

  useEffect(() => {
    fetchTaxOffices(API_KEY)
      .then(data => setTaxData(data.cities || []))
      .catch(() => setTaxData([]));
  }, [API_KEY]);

  useEffect(() => {
    if (selectedCity) {
      const city = taxData.find(c => c.name === selectedCity);
      setDistricts(city ? city.districts : []);
      setSelectedDistrict('');
      setTaxOffices([]);
      setForm(f => ({ ...f, tax_office: '' }));
    } else {
      setDistricts([]);
      setTaxOffices([]);
      setForm(f => ({ ...f, tax_office: '' }));
    }
  }, [selectedCity, taxData]);

  useEffect(() => {
    if (selectedDistrict) {
      const city = taxData.find(c => c.name === selectedCity);
      const district = city?.districts.find(d => d.name === selectedDistrict);
      setTaxOffices(district ? district.taxOffices : []);
      setForm(f => ({ ...f, tax_office: '' }));
    } else {
      setTaxOffices([]);
      setForm(f => ({ ...f, tax_office: '' }));
    }
  }, [selectedDistrict, selectedCity, taxData]);

  const handleChange = (e) => {
    if (e.target.name === 'phone') {
      let value = e.target.value.replace(/\D/g, '');
      if (value.startsWith('0')) value = value.slice(1);
      if (value.length > 10) value = value.slice(0, 10);
      setForm({ ...form, phone: value });
    } else if (e.target.name === 'osgb_id') {
      let value = e.target.value.replace(/\D/g, '');
      setForm({ ...form, osgb_id: value });
    } else if (e.target.name === 'tax_office') {
      setForm({ ...form, tax_office: e.target.value });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation: password match
    if (form.password !== form.password_confirm) {
      setError('Şifreler eşleşmiyor.');
      setLoading(false);
      return;
    }

    // Prepare payload for API
    const payload = {
      company_name: form.company_name.trim(),
      tax_number: form.tax_number,
      tax_office: form.tax_office.trim(),
      address: form.address.trim(),
      phone: `+90${form.phone}`,
      email: form.email.trim(),
      osgb_id: `OSGB-${form.osgb_id}`,
      password: form.password,
      city: selectedCity,
      district: selectedDistrict
    };

    try {
      const res = await fetch(`${API_BASE_URL}/osgb/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify(payload)
      });
      if (res.status === 201) {
        // Registration successful, redirect to login
        window.location.href = '/giris';
      } else {
        const data = await res.json();
        if (data && data.details && Array.isArray(data.details)) {
          setError(data.details.map(d => d.msg).join(' '));
        } else if (data && data.error) {
          if (data.error === 'INVALID_CITY') {
            setFieldErrors(prev => ({ ...prev, city: 'Seçilen şehir resmi kayıtlardaki ile eşleşmiyor.' }));
            setGeneralError('Lütfen hatalı veya eksik alanları düzeltiniz.');
            setTimeout(() => {
              if (fieldRefs.city && fieldRefs.city.current) fieldRefs.city.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          } else if (data.error === 'INVALID_DISTRICT') {
            setFieldErrors(prev => ({ ...prev, district: 'Seçilen ilçe resmi kayıtlardaki ile eşleşmiyor.' }));
            setGeneralError('Lütfen hatalı veya eksik alanları düzeltiniz.');
            setTimeout(() => {
              if (fieldRefs.district && fieldRefs.district.current) fieldRefs.district.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          } else if (data.error === 'INVALID_COMPANY_NAME') {
            setError('Şirket ünvanı resmi kayıtlardaki ile eşleşmiyor.');
          } else if (data.error === 'INVALID_OSGB_ID') {
            setError('OSGB Yetki Belgesi No resmi kayıtlarda bulunamadı.');
          } else if (data.error === 'EMAIL_EXISTS') {
            setError('Bu e-posta ile zaten kayıtlı bir kullanıcı var.');
          } else if (data.error === 'OSGB_ID_EXISTS') {
            setError('Bu OSGB Yetki Belgesi No ile zaten kayıtlı bir kullanıcı var.');
          } else if (res.status === 429) {
            setError('Çok fazla hatalı işlem yaptınız, biraz bekleyip yeniden deneyiniz.');
          } else {
            setError('Kayıt sırasında bir hata oluştu.');
          }
        }
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    }
    setLoading(false);
  };

  // Agreement texts (fully readable in modal)
  const agreementTexts = {
    terms: `Kullanım Koşulları\n\nKatip Otomasyonu, yalnızca geçerli bir lisans anahtarı ile kullanılabilir. Kullanıcı, uzantıyı ve web sitesini yalnızca yasal amaçlarla ve isgkatip.csgb.gov.tr platformunda kullanmayı kabul eder. Uzantı ve web sitesi, isgkatip.csgb.gov.tr'nin kullanım koşullarına ve Türk mevzuatına aykırı şekilde kullanılamaz.\n\nKullanıcı, uzantının ve web sitesinin işlevlerini kötüye kullanmayacağını, başkalarının verilerine izinsiz erişmeyeceğini ve uzantıyı sadece kendi kurumunun işlemleri için kullanacağını taahhüt eder. Geliştirici (Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti.), uzantının yanlış veya izinsiz kullanımından doğacak zararlardan sorumlu değildir.\n\nLisans anahtarının paylaşılması, çoğaltılması veya izinsiz kullanımı yasaktır. Tespit halinde lisans iptal edilir. Uzantı ve web sitesi, Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. tarafından güncellenebilir veya sonlandırılabilir.\n\nUygulamayı kullanan veya lisans satın alan kullanıcılar, ilk kayıt sırasında talep edilen telefon numarası, şirket adı ve OSGB-ID bilgilerinin lisans doğrulama ve müşteri kaydı amacıyla saklanmasını kabul etmiş sayılır.\n\nDetaylı bilgi için info@arkaya.com.tr adresine başvurabilirsiniz.`,
    privacy: `Gizlilik Sözleşmesi\n\nKatip Otomasyonu Chrome uzantısı ve web sitesi, Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. tarafından işletilmektedir. Kullanıcıdan yalnızca gerekli minimum veriler (ör. lisans anahtarı, isgkatip oturum anahtarı) toplanır. Lisans doğrulama sırasında sadece lisans anahtarı sunucularımıza gönderilir; isgkatip oturum anahtarı veya başka herhangi bir kişisel bilgi sunucularımıza iletilmez.\n\nKişisel veriler (ad, soyad, T.C. kimlik no, işyeri bilgileri, sözleşme detayları) sadece kullanıcının kendi hesabı üzerinden, isgkatip.csgb.gov.tr ile iletişimde kullanılır ve uzantı tarafından harici olarak saklanmaz. Lisans doğrulama için yalnızca lisans anahtarı, Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti.'nin kontrolündeki harici bir sunucuya (ör. AWS) gönderilir.\n\nHiçbir kişisel veri, üçüncü şahıslarla paylaşılmaz, satılmaz veya ticari amaçla kullanılmaz. Kullanıcı verileri, uzantıdan kaldırıldığında veya uzantı silindiğinde, mevzuat gereği yasal saklama ve denetim yükümlülüklerimiz kapsamında pasif hale getirilir ancak silinmez; ilgili bilgiler yalnızca resmi makamların talebi ve denetimi için saklanır.\n\nKVKK kapsamında, kullanıcı verilerinin işlenmesi, saklanması ve silinmesi süreçleri açıkça belirtilir. Katip Otomasyonu, kullanıcıdan açık rıza almadan hiçbir kişisel veriyi işlemez veya saklamaz. Kullanıcı, dilediği zaman verilerinin silinmesini talep edebilir. Bu talepler için info@arkaya.com.tr adresine başvurulabilir.\n\nKatip Otomasyonu'nu ilk kez kullanan veya lisans satın alan müşterilerden; telefon numarası, şirket adı ve OSGB-ID gibi bilgiler alınır ve lisans doğrulama amacıyla güvenli şekilde saklanır. Uygulamayı kullanan veya lisans satın alan herkes, bu bilgilerin alınmasını ve saklanmasını kabul etmiş sayılır.\n\nVeri sorumlusu: Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. | info@arkaya.com.tr\n\nHaklarınızı kullanmak için, taleplerinizi info@arkaya.com.tr adresine iletebilirsiniz. Detaylı bilgi ve diğer sözleşmeler için lütfen ilgili sayfaları ziyaret ediniz.`,
    kvkk: `Açık Rıza Beyan (KVKK)\n\nKatip Otomasyonu, 6698 sayılı Kişisel Verilerin Korunması Kanunu'na (KVKK) tam uyumlu olarak geliştirilmiştir. Kişisel veriler, yalnızca uzantının ve web sitesinin işlevlerini yerine getirmek için ve kullanıcının açık rızası ile işlenir. Kişisel veriler, uzantı tarafından harici bir sunucuda saklanmaz, sadece geçici olarak kullanılır.\n\nLisans doğrulama sırasında iletilen lisans anahtarı, lisans kontrolü amacıyla işlenir ve Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. kontrolündeki harici bir sunucuda (ör. AWS) saklanır. Kullanıcı, dilediği zaman verilerinin silinmesini talep edebilir. info@arkaya.com.tr adresine başvurarak bu hakkını kullanabilir. Kişisel veriler, üçüncü şahıslarla paylaşılmaz. Veri güvenliği için gerekli tüm teknik ve idari tedbirler alınır.\n\nVeri sorumlusu: Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. | info@arkaya.com.tr\n\nKayıt ve lisanslama sürecinde alınan telefon numarası, şirket adı ve OSGB-ID bilgileri, yalnızca lisans doğrulama ve müşteri kaydı amacıyla işlenir ve saklanır.\n\nHaklarınız ve başvuru yöntemleriniz için lütfen Gizlilik Sözleşmesi sayfasını inceleyiniz.`,
    commercial: `Ticari Elektronik İleti Onayı\n\nKampanya, duyuru ve bilgilendirme amaçlı ticari elektronik iletiler (e-posta, SMS vb.) almak istiyorsanız bu kutucuğu işaretleyebilirsiniz. Onay vermeniz halinde, iletişim bilgileriniz yalnızca Katip Otomasyonu ve Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. tarafından kampanya ve bilgilendirme amaçlı kullanılacaktır. Onayınızı dilediğiniz zaman geri alabilirsiniz.\n\nDetaylı bilgi için info@arkaya.com.tr adresine başvurabilirsiniz.`
  };

  const openAgreementModal = (type) => setAgreementModal({ open: true, type });
  const closeAgreementModal = () => setAgreementModal({ open: false, type: null });
  const approveAgreement = () => {
    if (agreementModal.type) {
      setAgreements(a => {
        const updated = { ...a, [agreementModal.type]: true };
        // Do NOT setShowAgreementWarning here; only set it on Kayıt Ol button click
        return updated;
      });
      closeAgreementModal();
    }
  };

  // Validation function
  const validateFields = () => {
    const errors = {};
    // Şirket Ünvanı
    if (!form.company_name.trim()) errors.company_name = 'Şirket ünvanı zorunludur.';
    // Şehir
    if (!selectedCity) errors.city = 'Şehir seçilmelidir.';
    // İlçe
    if (!selectedDistrict) errors.district = 'İlçe seçilmelidir.';
    // Vergi Dairesi
    if (selectedCity && selectedDistrict && (!form.tax_office || form.tax_office === '')) {
      errors.tax_office = 'Vergi Dairesi seçilmelidir.';
    }
    // Vergi Kimlik No
    if (!form.tax_number) {
      errors.tax_number = 'Vergi Kimlik No zorunludur.';
    } else if (!/^\d{10}$/.test(form.tax_number)) {
      errors.tax_number = 'Vergi Kimlik No 10 haneli olmalıdır.';
    }
    // OSGB Yetki Belgesi No
    if (!form.osgb_id) {
      errors.osgb_id = 'OSGB Yetki Belgesi No zorunludur.';
    } else if (!/^\d+$/.test(form.osgb_id)) {
      errors.osgb_id = 'OSGB Yetki Belgesi No sadece rakam olmalıdır.';
    }
    // E-posta
    if (!form.email) {
      errors.email = 'E-posta zorunludur.';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errors.email = 'Geçerli bir e-posta adresi giriniz.';
    }
    // Şifre
    if (!form.password) {
      errors.password = 'Şifre zorunludur.';
    } else if (form.password.length < 8 || form.password.length > 16) {
      errors.password = 'Şifre 8-16 karakter olmalıdır.';
    }
    // Şifre tekrar
    if (!form.password_confirm) {
      errors.password_confirm = 'Şifre (Tekrar) zorunludur.';
    } else if (form.password !== form.password_confirm) {
      errors.password_confirm = 'Şifreler eşleşmiyor.';
    }
    // Telefon
    if (!form.phone) {
      errors.phone = 'Telefon numarası zorunludur.';
    } else if (!/^\d{10}$/.test(form.phone)) {
      errors.phone = 'Telefon numarası 10 haneli olmalıdır.';
    }
    // Adres
    if (!form.address.trim()) errors.address = 'Adres zorunludur.';
    // Sözleşmeler
    if (!agreements.terms) errors.terms = 'Kullanım Koşulları onaylanmalıdır.';
    if (!agreements.privacy) errors.privacy = 'Gizlilik Sözleşmesi onaylanmalıdır.';
    if (!agreements.kvkk) errors.kvkk = 'KVKK Açık Rıza onaylanmalıdır.';
    return errors;
  };

  // Scroll to first error
  const scrollToFirstError = (errors) => {
    const order = [
      'company_name','city','district','tax_office','tax_number','osgb_id','email','password','password_confirm','phone','address','terms','privacy','kvkk'
    ];
    for (let key of order) {
      if (errors[key] && fieldRefs[key] && fieldRefs[key].current) {
        fieldRefs[key].current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
    }
  };

  // Modified onClick for Kayıt Ol
  const handleValidateAndSubmit = (e) => {
    const errors = validateFields();
    setFieldErrors(errors);
    setGeneralError('');
    setShowAgreementWarning(false);
    if (Object.keys(errors).length > 0) {
      e.preventDefault();
      setGeneralError('Lütfen hatalı veya eksik alanları düzeltiniz.');
      scrollToFirstError(errors);
    } else {
      setGeneralError('');
      setFieldErrors({});
      setShowAgreementWarning(false);
      // Let form submit
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto' }}>
      <div className="alert alert-warning d-flex align-items-center mb-4" style={{background:'#fffbe6', color:'#664d03', borderColor:'#ffe066'}}>
        <i className="bi bi-exclamation-triangle-fill" style={{fontSize: '2rem', color: '#fd7e14', marginRight: 12}}></i>
        Lütfen faturalama için vergi levhanızdaki şirket ünvanını eksiksiz yazdığınızdan ve vergi dairenizi doğru seçtiğinizden emin olunuz.
      </div>
      <div className="row g-3">
        <div className="col-12">
          <div className="mb-3">
            <label htmlFor="company_name" className="form-label">Şirket Ünvanı</label>
            <input
              type="text"
              className={`form-control${fieldErrors.company_name ? ' is-invalid' : ''}`}
              id="company_name"
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              required
              maxLength={100}
              ref={fieldRefs.company_name}
            />
            {fieldErrors.company_name && <div className="invalid-feedback">{fieldErrors.company_name}</div>}
          </div>
        </div>
        <div className="col-6">
          <div className="mb-3">
            <label htmlFor="city" className="form-label">Şehir</label>
            <select
              className={`form-select${fieldErrors.city ? ' is-invalid' : ''}`}
              id="city"
              name="city"
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              required
              ref={fieldRefs.city}
            >
              <option value="">Şehir seçiniz</option>
              {taxData.map(city => (
                <option key={city.name} value={city.name}>{city.name}</option>
              ))}
            </select>
            {fieldErrors.city && <div className="invalid-feedback">{fieldErrors.city}</div>}
          </div>
        </div>
        <div className="col-6">
          <div className="mb-3">
            <label htmlFor="district" className="form-label">İlçe</label>
            <select
              className={`form-select${fieldErrors.district ? ' is-invalid' : ''}`}
              id="district"
              name="district"
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              required
              disabled={!selectedCity}
              ref={fieldRefs.district}
            >
              <option value="">İlçe seçiniz</option>
              {districts.map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
            {fieldErrors.district && <div className="invalid-feedback">{fieldErrors.district}</div>}
          </div>
        </div>
        <div className="col-6">
          <div className="mb-3">
            <label htmlFor="tax_office" className="form-label">Vergi Dairesi</label>
            <select
              className={`form-select${fieldErrors.tax_office ? ' is-invalid' : ''}`}
              id="tax_office"
              name="tax_office"
              value={form.tax_office}
              onChange={handleChange}
              required
              disabled={!selectedDistrict}
              ref={fieldRefs.tax_office}
            >
              <option value="">Vergi Dairesi seçiniz</option>
              {taxOffices.map(office => (
                <option key={office} value={office}>{office}</option>
              ))}
            </select>
            {fieldErrors.tax_office && <div className="invalid-feedback">{fieldErrors.tax_office}</div>}
          </div>
        </div>
        <div className="col-6">
          <div className="mb-3">
            <label htmlFor="tax_number" className="form-label">Vergi Kimlik No</label>
            <input
              type="text"
              className={`form-control${fieldErrors.tax_number ? ' is-invalid' : ''}`}
              id="tax_number"
              name="tax_number"
              value={form.tax_number}
              onChange={e => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 10) value = value.slice(0, 10);
                setForm({ ...form, tax_number: value });
              }}
              required
              maxLength={10}
              minLength={10}
              pattern="[0-9]{10}"
              inputMode="numeric"
              autoComplete="off"
              ref={fieldRefs.tax_number}
            />
            {fieldErrors.tax_number && <div className="invalid-feedback">{fieldErrors.tax_number}</div>}
          </div>
        </div>
        <div className="col-6">
          <div className="mb-3">
            <label htmlFor="osgb_id" className="form-label">OSGB Yetki Belgesi No</label>
            <div className="input-group">
              <span className="input-group-text">OSGB-</span>
              <input type="text" className={`form-control${fieldErrors.osgb_id ? ' is-invalid' : ''}`} id="osgb_id" name="osgb_id" value={form.osgb_id} onChange={handleChange} required maxLength={10} pattern="[0-9]+" placeholder="123456" ref={fieldRefs.osgb_id} />
            </div>
            {fieldErrors.osgb_id && <div className="invalid-feedback">{fieldErrors.osgb_id}</div>}
            <div className="form-text">Sadece rakam giriniz. Örn: 123456</div>
          </div>
        </div>
        {/* New order: email, password, password_confirm, phone, address */}
        <div className="col-6">
          <div className="mb-3">
            <label htmlFor="email" className="form-label">E-posta</label>
            <input type="email" className={`form-control${fieldErrors.email ? ' is-invalid' : ''}`} id="email" name="email" value={form.email} onChange={handleChange} required maxLength={60} ref={fieldRefs.email} />
            {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
          </div>
        </div>
        <div className="col-6">
          <div className="mb-3 position-relative">
            <label htmlFor="password" className="form-label">Şifre</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control${fieldErrors.password ? ' is-invalid' : ''}`}
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                maxLength={16}
                ref={fieldRefs.password}
              />
              <span className="input-group-text" style={{cursor:'pointer'}} onClick={() => setShowPassword(v => !v)}>
                <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
              </span>
            </div>
            {fieldErrors.password && <div className="invalid-feedback">{fieldErrors.password}</div>}
          </div>
        </div>
        <div className="col-6">
          <div className="mb-3 position-relative">
            <label htmlFor="password_confirm" className="form-label">Şifre (Tekrar)</label>
            <div className="input-group">
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                className={`form-control${fieldErrors.password_confirm ? ' is-invalid' : ''}`}
                id="password_confirm"
                name="password_confirm"
                value={form.password_confirm}
                onChange={handleChange}
                required
                minLength={8}
                maxLength={16}
                ref={fieldRefs.password_confirm}
              />
              <span className="input-group-text" style={{cursor:'pointer'}} onClick={() => setShowPasswordConfirm(v => !v)}>
                <i className={`bi bi-eye${showPasswordConfirm ? '-slash' : ''}`}></i>
              </span>
            </div>
            {fieldErrors.password_confirm && <div className="invalid-feedback">{fieldErrors.password_confirm}</div>}
          </div>
        </div>
        <div className="col-6">
          <div className="mb-3">
            <label htmlFor="phone" className="form-label">Telefon Numarası</label>
            <div className="input-group">
              <span className="input-group-text">+90</span>
              <input type="tel" className={`form-control${fieldErrors.phone ? ' is-invalid' : ''}`} id="phone" name="phone" value={form.phone} onChange={handleChange} required maxLength={10} minLength={10} pattern="[0-9]{10}" placeholder="5XXXXXXXXX" ref={fieldRefs.phone} />
            </div>
            {fieldErrors.phone && <div className="invalid-feedback">{fieldErrors.phone}</div>}
            <div className="form-text">Başında 0 olmadan, 10 haneli giriniz. Örn: 5XXXXXXXXX</div>
          </div>
        </div>
        <div className="col-12">
          <div className="mb-3">
            <label htmlFor="address" className="form-label">Adres</label>
            <textarea className={`form-control${fieldErrors.address ? ' is-invalid' : ''}`} id="address" name="address" value={form.address} onChange={handleChange} required rows={3} maxLength={200} style={{resize:'vertical'}} ref={fieldRefs.address} />
            {fieldErrors.address && <div className="invalid-feedback">{fieldErrors.address}</div>}
          </div>
        </div>
      </div>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="mt-4 mb-2">
        {/* Kullanım Koşulları */}
        <div className={`form-check mb-2${fieldErrors.terms ? ' border border-danger rounded p-2' : ''}`} ref={fieldRefs.terms}>
          <input
            className="form-check-input"
            type="checkbox"
            id="terms"
            checked={agreements.terms}
            readOnly
            onClick={e => {
              if (!agreements.terms) {
                e.preventDefault();
                openAgreementModal('terms');
              } else {
                // Allow unchecking directly
                setAgreements(a => ({ ...a, terms: false }));
              }
            }}
            aria-required="true"
          />
          <label className="form-check-label" htmlFor="terms">
            <span className="fw-bold">Kullanım Koşulları</span> (
              <button type="button" className="btn btn-link p-0 align-baseline" style={{textDecoration:'underline'}} onClick={() => openAgreementModal('terms')}>Sözleşmeyi Oku</button>
            ) <span className="text-danger">*</span>
          </label>
          {fieldErrors.terms && <div className="text-danger mt-1">{fieldErrors.terms}</div>}
        </div>
        {/* Gizlilik Sözleşmesi */}
        <div className={`form-check mb-2${fieldErrors.privacy ? ' border border-danger rounded p-2' : ''}`} ref={fieldRefs.privacy}>
          <input
            className="form-check-input"
            type="checkbox"
            id="privacy"
            checked={agreements.privacy}
            readOnly
            onClick={e => {
              if (!agreements.privacy) {
                e.preventDefault();
                openAgreementModal('privacy');
              } else {
                setAgreements(a => ({ ...a, privacy: false }));
              }
            }}
            aria-required="true"
          />
          <label className="form-check-label" htmlFor="privacy">
            <span className="fw-bold">Gizlilik Sözleşmesi</span> (
              <button type="button" className="btn btn-link p-0 align-baseline" style={{textDecoration:'underline'}} onClick={() => openAgreementModal('privacy')}>Sözleşmeyi Oku</button>
            ) <span className="text-danger">*</span>
          </label>
          {fieldErrors.privacy && <div className="text-danger mt-1">{fieldErrors.privacy}</div>}
        </div>
        {/* KVKK Açık Rıza */}
        <div className={`form-check mb-2${fieldErrors.kvkk ? ' border border-danger rounded p-2' : ''}`} ref={fieldRefs.kvkk}>
          <input
            className="form-check-input"
            type="checkbox"
            id="kvkk"
            checked={agreements.kvkk}
            readOnly
            onClick={e => {
              if (!agreements.kvkk) {
                e.preventDefault();
                openAgreementModal('kvkk');
              } else {
                setAgreements(a => ({ ...a, kvkk: false }));
              }
            }}
            aria-required="true"
          />
          <label className="form-check-label" htmlFor="kvkk">
            <span className="fw-bold">Açık Rıza Beyan (KVKK)</span> (
              <button type="button" className="btn btn-link p-0 align-baseline" style={{textDecoration:'underline'}} onClick={() => openAgreementModal('kvkk')}>Sözleşmeyi Oku</button>
            ) <span className="text-danger">*</span>
          </label>
          {fieldErrors.kvkk && <div className="text-danger mt-1">{fieldErrors.kvkk}</div>}
        </div>
        {/* Ticari Elektronik İleti Onayı (optional) */}
        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="commercial"
            checked={agreements.commercial}
            onChange={() => setAgreements(a => ({ ...a, commercial: !a.commercial }))}
          />
          <label className="form-check-label" htmlFor="commercial">
            <span className="fw-bold">Ticari Elektronik İleti Onayı</span> (
              <button type="button" className="btn btn-link p-0 align-baseline" style={{textDecoration:'underline'}} onClick={() => openAgreementModal('commercial')}>Metni Oku</button>
            ) <span className="text-secondary">(isteğe bağlı)</span>
          </label>
        </div>
        {showAgreementWarning && (
          <div className="alert alert-warning py-2 mt-2">
            Kayıt olabilmek için tüm zorunlu sözleşmeleri okuduğunuzu ve onayladığınızı belirtmelisiniz.
          </div>
        )}
      </div>
      {/* Agreement Modal */}
      {agreementModal.open && (
        <div className="modal fade show" style={{display:'block', background:'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {agreementModal.type === 'terms' && 'Kullanım Koşulları'}
                  {agreementModal.type === 'privacy' && 'Gizlilik Sözleşmesi'}
                  {agreementModal.type === 'kvkk' && 'Açık Rıza Beyan (KVKK)'}
                  {agreementModal.type === 'commercial' && 'Ticari Elektronik İleti Onayı'}
                </h5>
                <button type="button" className="btn-close" onClick={closeAgreementModal}></button>
              </div>
              <div className="modal-body" style={{maxHeight: '60vh', overflowY: 'auto'}}>
                <div style={{whiteSpace:'pre-line'}}>{agreementTexts[agreementModal.type]}</div>
              </div>
              <div className="modal-footer">
                {agreementModal.type !== 'commercial' ? (
                  <button type="button" className="btn btn-danger" onClick={approveAgreement}>Okudum, onaylıyorum</button>
                ) : null}
                <button type="button" className="btn btn-secondary" onClick={closeAgreementModal}>Kapat</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* General error message */}
      {generalError && <div className="alert alert-danger py-2 mt-3">{generalError}</div>}
      <button type="submit" className="btn btn-danger w-100 mt-2" disabled={loading} onClick={handleValidateAndSubmit}>
        {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
      </button>
    </form>
  );
}

export default RegisterPage;