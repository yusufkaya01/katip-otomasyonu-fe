import React, { useState, useRef } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import PageLoadingSpinner from '../components/PageLoadingSpinner';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const { login } = useAuth();
  // Stepper/modal state
  const [step, setStep] = useState(1);
  // Step 1 state
  const [licenseKey, setLicenseKey] = useState('');
  const [vergiLevhasi, setVergiLevhasi] = useState(null);
  const [yetkiBelgesi, setYetkiBelgesi] = useState(null);
  const [step1Error, setStep1Error] = useState({});
  const [step1GeneralError, setStep1GeneralError] = useState('');
  const [companyInfo, setCompanyInfo] = useState(null);
  const [step1Token, setStep1Token] = useState('');
  // Step 2 state
  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [step2Error, setStep2Error] = useState({});
  const [step2GeneralError, setStep2GeneralError] = useState('');
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [registering, setRegistering] = useState(false);
  // Agreements
  const [agreements, setAgreements] = useState({ terms: false, privacy: false, kvkk: false, commercial: false });
  const [agreementModal, setAgreementModal] = useState({ open: false, type: null });
  const [showAgreementWarning, setShowAgreementWarning] = useState(false);
  // Refs for scroll-to-error
  const fieldRefs = {
    licenseKey: useRef(),
    vergiLevhasi: useRef(),
    yetkiBelgesi: useRef(),
    email: useRef(),
    emailCode: useRef(),
    password: useRef(),
    passwordConfirm: useRef(),
    phone: useRef(),
    terms: useRef(),
    privacy: useRef(),
    kvkk: useRef(),
  };
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://customers.katipotomasyonu.com/api';
  const API_KEY = process.env.REACT_APP_USER_API_KEY;

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  // Step 1 submit
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleVergiLevhasiChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > MAX_FILE_SIZE) {
      setVergiLevhasi(null);
      setStep1Error(prev => ({ ...prev, vergiLevhasi: 'Dosya boyutu çok büyük. Maksimum izin verilen boyut: 10 MB.' }));
      e.target.value = '';
    } else {
      setVergiLevhasi(file || null);
      setStep1Error(prev => ({ ...prev, vergiLevhasi: undefined }));
    }
  };

  const handleYetkiBelgesiChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > MAX_FILE_SIZE) {
      setYetkiBelgesi(null);
      setStep1Error(prev => ({ ...prev, yetkiBelgesi: 'Dosya boyutu çok büyük. Maksimum izin verilen boyut: 10 MB.' }));
      e.target.value = '';
    } else {
      setYetkiBelgesi(file || null);
      setStep1Error(prev => ({ ...prev, yetkiBelgesi: undefined }));
    }
  };

  const handleStep1 = async (e) => {
    e.preventDefault();
    setStep1Error({});
    setStep1GeneralError('');
    let errors = {};
    
    // Comprehensive validation
    if (!licenseKey || licenseKey.trim() === '') {
      errors.licenseKey = 'Lisans anahtarı zorunludur.';
    } else if (licenseKey.length !== 10) {
      errors.licenseKey = 'Lisans anahtarı 10 karakter olmalıdır.';
    }
    
    if (!vergiLevhasi) errors.vergiLevhasi = 'Vergi levhası zorunludur.';
    if (!yetkiBelgesi) errors.yetkiBelgesi = 'OSGB yetki belgesi zorunludur.';
    
    if (Object.keys(errors).length > 0) {
      setStep1Error(errors);
      scrollToFirstError(errors, fieldRefs);
      return;
    }
    
    setPageLoading(true);
    const formData = new FormData();
    formData.append('licenseKey', licenseKey);
    formData.append('vergiLevhasi', vergiLevhasi);
    formData.append('yetkiBelgesi', yetkiBelgesi);
    try {
      const res = await fetch(`${API_BASE_URL}/osgb/register-step1`, { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.success) {
        setCompanyInfo(data.companyInfo);
        setStep1Token(data.step1Token);
        setStep(2);
      } else {
        let msg = data.message || data.error || 'Bir hata oluştu.';
        if (msg.includes('required')) msg = 'Tüm alanlar zorunludur.';
        if (msg.includes('not found')) msg = 'Lisans anahtarı bulunamadı.';
        if (msg.includes('not active')) msg = 'Lisans anahtarı aktif değil.';
        if (msg.includes('Vergi levhası')) msg = 'Vergi levhası okunamadı veya geçersiz.';
        if (msg.includes('Yetki belgesi')) msg = 'Yetki belgesi okunamadı veya geçersiz.';
        if (msg.includes('already used')) msg = 'Bu lisans anahtarı ile daha önce kayıt yapılmış.';
        setStep1GeneralError(msg);
      }
    } catch {
      setStep1GeneralError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    }
    setPageLoading(false);
  };

  // Step 2: send email code
  const handleSendEmailCode = async () => {
    setSendingCode(true);
    setStep2Error({});
    setStep2GeneralError('');
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setStep2Error({ email: 'Geçerli bir e-posta adresi giriniz.' });
      setSendingCode(false);
      fieldRefs.email.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/osgb/send-email-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-registration-step1-token': step1Token, // Always include the token from step 1
          ...(API_KEY ? { 'x-api-key': API_KEY } : {})
        },
        body: JSON.stringify({ email, licenseKey })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailCodeSent(true);
        setCountdown(30); // Start 30 second countdown
      } else {
        let msg = data.message || data.error || 'Bir hata oluştu.';
        if (msg.includes('already registered')) msg = 'Bu e-posta ile zaten kayıtlı bir kullanıcı var.';
        if (msg.includes('too many attempts')) msg = 'Çok fazla deneme yapıldı, lütfen daha sonra tekrar deneyin.';
        if (msg.includes('Step 1 must be completed')) msg = 'Kayıt işleminin ilk adımı tamamlanmadan e-posta kodu gönderilemez.';
        if (msg.includes('token does not match license key')) msg = 'Lisans anahtarı ile doğrulama tokenı eşleşmiyor.';
        setStep2GeneralError(msg);
      }
    } catch {
      setStep2GeneralError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    }
    setSendingCode(false);
  };

  // Step 2 submit
  const handleStep2 = async (e) => {
    e.preventDefault();
    setStep2Error({});
    setStep2GeneralError('');
    setShowAgreementWarning(false);
    let errors = {};
    
    // Comprehensive validation - check all required fields
    if (!email || email.trim() === '') {
      errors.email = 'E-posta adresi zorunludur.';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      errors.email = 'Geçerli bir e-posta adresi giriniz.';
    }
    
    if (!emailCode || emailCode.trim() === '') {
      errors.emailCode = 'E-posta onay kodu zorunludur.';
    } else if (!/^\d{6}$/.test(emailCode)) {
      errors.emailCode = 'E-posta kodu 6 haneli olmalıdır.';
    }
    
    if (!password || password.trim() === '') {
      errors.password = 'Şifre zorunludur.';
    } else if (password.length < 8 || password.length > 16) {
      errors.password = 'Şifre 8-16 karakter aralığından oluşmalıdır.';
    }
    
    if (!passwordConfirm || passwordConfirm.trim() === '') {
      errors.passwordConfirm = 'Şifre (Tekrar) zorunludur.';
    } else if (password !== passwordConfirm) {
      errors.passwordConfirm = 'Şifreler eşleşmiyor.';
    }
    
    if (!phone || phone.trim() === '') {
      errors.phone = 'Telefon numarası zorunludur.';
    } else if (!/^\d{10}$/.test(phone)) {
      errors.phone = 'Telefon numarası 10 haneli olmalıdır.';
    }
    
    if (!agreements.terms) errors.terms = 'Kullanım Koşulları onaylanmalıdır.';
    if (!agreements.privacy) errors.privacy = 'Gizlilik Sözleşmesi onaylanmalıdır.';
    if (!agreements.kvkk) errors.kvkk = 'KVKK Açık Rıza onaylanmalıdır.';
    
    if (Object.keys(errors).length > 0) {
      setStep2Error(errors);
      setShowAgreementWarning(true);
      scrollToFirstError(errors, fieldRefs);
      return;
    }
    
    setRegistering(true);
    try {
      const res = await fetch(`${API_BASE_URL}/osgb/register-step2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-registration-step1-token': step1Token, // Always include the token from step 1
          ...(API_KEY ? { 'x-api-key': API_KEY } : {})
        },
        body: JSON.stringify({ licenseKey, email, password, phone, emailCode, marketingEmailsConsent: agreements.commercial })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        console.log('Registration successful! Attempting auto-login...');
        
        // Add a small delay to ensure registration is fully processed
        setTimeout(async () => {
          try {
            const loginRes = await fetch(`${API_BASE_URL}/osgb/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.REACT_APP_USER_API_KEY
              },
              body: JSON.stringify({ email, password })
            });
            
            console.log('Auto-login response status:', loginRes.status);
            
            if (loginRes.status === 200) {
              const loginData = await loginRes.json();
              console.log('Auto-login successful, logging in user');
              
              // Store licenseKey in user if present (same as LoginPage)
              const userWithLicense = loginData.licenseKey ? 
                { ...loginData.user, licenseKey: loginData.licenseKey } : 
                loginData.user;
              
              login({ 
                user: userWithLicense, 
                accessToken: loginData.accessToken, 
                refreshToken: loginData.refreshToken 
              });
              
              // Redirect to user dashboard
              console.log('Redirecting to /isletmem');
              window.location.href = '/isletmem';
            } else {
              console.log('Auto-login failed, redirecting to login page');
              const loginError = await loginRes.json();
              console.log('Login error:', loginError);
              window.location.href = '/giris';
            }
          } catch (error) {
            console.log('Auto-login error:', error);
            window.location.href = '/giris';
          }
        }, 1000); // Wait 1 second before attempting login
      } else {
        let msg = data.message || data.error || 'Bir hata oluştu.';
        if (data.details && Array.isArray(data.details)) {
          const fieldErrs = {};
          data.details.forEach(d => {
            if (d.param === 'email') fieldErrs.email = 'Geçerli bir e-posta adresi giriniz.';
            if (d.param === 'password') fieldErrs.password = 'Şifre 8-16 karakter aralığından oluşmalıdır.';
            if (d.param === 'phone') fieldErrs.phone = 'Telefon numarası 10 haneli olmalıdır.';
            if (d.param === 'emailCode') fieldErrs.emailCode = 'E-posta kodu 6 haneli olmalıdır.';
          });
          setStep2Error(fieldErrs);
          scrollToFirstError(fieldErrs, fieldRefs);
        } else {
          if (msg.includes('expired email confirmation code') || msg.includes('Invalid or expired email confirmation code')) msg = 'E-posta kodu hatalı veya süresi dolmuş.';
          if (msg.includes('already registered')) msg = 'Bu e-posta ile zaten kayıtlı bir kullanıcı var.';
          if (msg.includes('Step 1 must be completed')) msg = 'Kayıt işleminin ilk adımı tamamlanmadan kayıt olunamaz.';
          if (msg.includes('token does not match license key')) msg = 'Lisans anahtarı ile doğrulama tokenı eşleşmiyor.';
          setStep2GeneralError(msg);
        }
      }
    } catch {
      setStep2GeneralError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    }
    setRegistering(false);
  };

  // Dynamic password match check
  React.useEffect(() => {
    if (passwordConfirm && password !== passwordConfirm) {
      setStep2Error(prev => ({ ...prev, passwordConfirm: 'Şifreler eşleşmiyor.' }));
    } else if (step2Error.passwordConfirm === 'Şifreler eşleşmiyor.') {
      setStep2Error(prev => {
        const { passwordConfirm, ...rest } = prev;
        return rest;
      });
    }
  }, [password, passwordConfirm, step2Error.passwordConfirm]);

  // Dynamic password length check
  React.useEffect(() => {
    if (password && (password.length < 8 || password.length > 16)) {
      setStep2Error(prev => ({ ...prev, password: 'Şifre 8-16 karakter aralığından oluşmalıdır.' }));
    } else if (step2Error.password === 'Şifre 8-16 karakter aralığından oluşmalıdır.') {
      setStep2Error(prev => {
        const { password, ...rest } = prev;
        return rest;
      });
    }
  }, [password, step2Error.password]);

  // Countdown effect for email code button
  React.useEffect(() => {
    let interval = null;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown => countdown - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown]);

  // Scroll to first error helper
  function scrollToFirstError(errors, refs) {
    const order = [
      'licenseKey', 'vergiLevhasi', 'yetkiBelgesi', 'email', 'emailCode', 'password', 'passwordConfirm', 'phone', 'terms', 'privacy', 'kvkk'
    ];
    for (let key of order) {
      if (errors[key] && refs[key] && refs[key].current) {
        refs[key].current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
    }
  }

  // Agreement modal logic
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
      setAgreements(a => ({ ...a, [agreementModal.type]: true }));
      closeAgreementModal();
    }
  };

  // UI
  return (
    <>
      <PageLoadingSpinner show={pageLoading} fullscreen />
      {/* Registration form width - easily adjustable */}
      <div className="container py-5" style={{maxWidth: 640}}>
        <div className="mb-4 text-center">
          <h2>Kayıt Ol</h2>
        </div>
        {step === 1 && (
          <div style={{backgroundColor: '#fdf2f2', padding: '2rem', borderRadius: '8px', border: '1px solid #fecaca'}}>
            <form onSubmit={handleStep1} className="mb-4">
              <div className="mb-3">
                <label className="form-label">Lütfen sizinle paylaşılmış olan lisans anahtarını giriniz</label>
                <input
                  type="text"
                  className={`form-control${step1Error.licenseKey ? ' is-invalid' : ''}`}
                  value={licenseKey}
                  onChange={e => setLicenseKey(e.target.value.slice(0, 10))}
                  maxLength={10}
                  ref={fieldRefs.licenseKey}
                  autoFocus
                  title="Lütfen bu alanı doldurun."
                  onInvalid={e => e.target.setCustomValidity('Lütfen lisans anahtarını giriniz.')}
                  onInput={e => e.target.setCustomValidity('')}
                />
                {step1Error.licenseKey && <div className="invalid-feedback">{step1Error.licenseKey}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Vergi levhanızı yükleyiniz</label>
                <div className="input-group">
                  <label className="input-group-text" htmlFor="vergiLevhasiInput">Dosya Seç</label>
                  <input
                    type="file"
                    className={`form-control${step1Error.vergiLevhasi ? ' is-invalid' : ''}`}
                    accept=".pdf,.jpg,.jpeg,.png"
                    id="vergiLevhasiInput"
                    style={{display:'none'}}
                    onChange={handleVergiLevhasiChange}
                    ref={fieldRefs.vergiLevhasi}
                    title="Lütfen dosya seçiniz."
                    onInvalid={e => e.target.setCustomValidity('Lütfen vergi levhası dosyasını seçiniz.')}
                    onInput={e => e.target.setCustomValidity('')}
                  />
                  <input
                    type="text"
                    className="form-control bg-white"
                    value={vergiLevhasi ? vergiLevhasi.name : 'Dosya seçilmedi'}
                    readOnly
                    tabIndex={-1}
                    style={{cursor:'default'}}
                  />
                </div>
                <div className="form-text">Maksimum dosya boyutu: 10 MB</div>
                {step1Error.vergiLevhasi && <div className="invalid-feedback d-block">{step1Error.vergiLevhasi}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">OSGB yetki belgenizi yükleyiniz</label>
                <div className="input-group">
                  <label className="input-group-text" htmlFor="yetkiBelgesiInput">Dosya Seç</label>
                  <input
                    type="file"
                    className={`form-control${step1Error.yetkiBelgesi ? ' is-invalid' : ''}`}
                    accept=".pdf,.jpg,.jpeg,.png"
                    id="yetkiBelgesiInput"
                    style={{display:'none'}}
                    onChange={handleYetkiBelgesiChange}
                    ref={fieldRefs.yetkiBelgesi}
                    title="Lütfen dosya seçiniz."
                    onInvalid={e => e.target.setCustomValidity('Lütfen OSGB yetki belgesi dosyasını seçiniz.')}
                    onInput={e => e.target.setCustomValidity('')}
                  />
                  <input
                    type="text"
                    className="form-control bg-white"
                    value={yetkiBelgesi ? yetkiBelgesi.name : 'Dosya seçilmedi'}
                    readOnly
                    tabIndex={-1}
                    style={{cursor:'default'}}
                  />
                </div>
                <div className="form-text">Maksimum dosya boyutu: 10 MB</div>
                {step1Error.yetkiBelgesi && <div className="invalid-feedback d-block">{step1Error.yetkiBelgesi}</div>}
              </div>
              {step1GeneralError && <div className="alert alert-danger py-2">{step1GeneralError}</div>}
              <button type="submit" className="btn btn-danger w-100">Devam Et</button>
            </form>
          </div>
        )}
        {step === 2 && companyInfo && (
          <div style={{backgroundColor: '#fdf2f2', padding: '2rem', borderRadius: '8px', border: '1px solid #fecaca'}}>
            <form onSubmit={handleStep2}>
              <div className="mb-3">
                <div className="alert" style={{background:'#e6f0fa', border:'1px solid #b3d1f2', color:'#174a7c', borderRadius:8}}>
                  <div style={{fontWeight:'bold', fontSize:'1.1rem', letterSpacing:'0.5px', textTransform:'uppercase', marginBottom:8, textAlign:'center'}}>
                    Şirket Bilgileriniz
                  </div>
                  <div style={{marginBottom:10}}>
                    <div style={{fontWeight:'bold'}}>Şirket Adı</div>
                    <div style={{borderBottom:'1px solid #b3d1f2', paddingBottom:6, marginBottom:6}}>{companyInfo.company_name}</div>
                  </div>
                  <div style={{marginBottom:10}}>
                    <div style={{fontWeight:'bold'}}>OSGB Yetki Belgesi Numaranız</div>
                    <div style={{borderBottom:'1px solid #b3d1f2', paddingBottom:6, marginBottom:6}}>{companyInfo.osgb_id}</div>
                  </div>
                  <div style={{marginBottom:10}}>
                    <div style={{fontWeight:'bold'}}>İl / İlçe</div>
                    <div style={{borderBottom:'1px solid #b3d1f2', paddingBottom:6, marginBottom:6}}>{companyInfo.city} / {companyInfo.district}</div>
                  </div>
                  <div>
                    <div style={{fontWeight:'bold'}}>Adres</div>
                    <div>{companyInfo.address}</div>
                  </div>
                </div>
              </div>
            {/* E-posta field */}
            <div className="mb-3">
              <label className="form-label mb-1">E-posta</label>
              <input
                type="email"
                className={`form-control${step2Error.email ? ' is-invalid' : ''}`}
                value={email}
                onChange={e => setEmail(e.target.value)}
                ref={fieldRefs.email}
                maxLength={60}
                style={{marginBottom: step2Error.email ? 0 : undefined}}
                title="Lütfen bu alanı doldurun."
                onInvalid={e => {
                  if (e.target.validity.valueMissing) {
                    e.target.setCustomValidity('Lütfen e-posta adresinizi giriniz.');
                  } else if (e.target.validity.typeMismatch) {
                    e.target.setCustomValidity('Lütfen geçerli bir e-posta adresi giriniz (örn: kullanici@email.com).');
                  } else {
                    e.target.setCustomValidity('Lütfen geçerli bir e-posta adresi giriniz.');
                  }
                }}
                onInput={e => e.target.setCustomValidity('')}
              />
              {/* Reserve space for error to prevent layout shift */}
              <div style={{height: 22}}>
                {step2Error.email && <div className="invalid-feedback d-block" style={{position:'static', padding:0, margin:0}}>{step2Error.email}</div>}
              </div>
            </div>

            {/* E-posta Onay Kodu field with responsive button positioning */}
            <div className="mb-3">
              {/* Button above text on small screens */}
              <div className="d-block d-md-none mb-2">
                <button type="button" className="btn btn-onay-gonder w-100" onClick={handleSendEmailCode} disabled={sendingCode || countdown > 0}>
                  {sendingCode ? 'Gönderiliyor...' : 
                   countdown > 0 ? `Tekrar Onay Kodu Gönder (${countdown}s)` :
                   emailCodeSent ? 'Tekrar Onay Kodu Gönder' : 'E-Posta Onay Kodu Gönder'}
                </button>
              </div>

              {/* Label and button on same line for larger screens */}
              <div className="d-none d-md-flex align-items-center gap-3 mb-1">
                <label className="form-label mb-0">E-posta Onay Kodu</label>
                <button type="button" className="btn btn-onay-gonder" onClick={handleSendEmailCode} disabled={sendingCode || countdown > 0}>
                  {sendingCode ? 'Gönderiliyor...' : 
                   countdown > 0 ? `Tekrar Onay Kodu Gönder (${countdown}s)` :
                   emailCodeSent ? 'Tekrar Onay Kodu Gönder' : 'E-Posta Onay Kodu Gönder'}
                </button>
              </div>

              {/* Label only for small screens */}
              <div className="d-block d-md-none">
                <label className="form-label mb-1">E-posta Onay Kodu</label>
              </div>

              {/* Input field */}
              <input
                type="text"
                className={`form-control${step2Error.emailCode ? ' is-invalid' : ''}`}
                value={emailCode}
                onChange={e => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                ref={fieldRefs.emailCode}
                maxLength={6}
                inputMode="numeric"
                autoComplete="off"
                title="Lütfen bu alanı doldurun."
                onInvalid={e => e.target.setCustomValidity('Lütfen e-posta onay kodunu giriniz.')}
                onInput={e => e.target.setCustomValidity('')}
              />
              
              {/* Error and success messages */}
              <div style={{height: 22}}>
                {step2Error.emailCode && <div className="invalid-feedback d-block" style={{position:'static', padding:0, margin:0}}>{step2Error.emailCode}</div>}
                {emailCodeSent && !step2Error.emailCode && <div className="form-text text-success" style={{padding:0, margin:0, fontWeight: 900}} >Kod e-posta adresinize gönderildi.</div>}
              </div>
            </div>
            <div className="row">
              <div className="col-12 col-md-6">
                <label className="form-label">Şifre</label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control${step2Error.password ? ' is-invalid' : ''}`}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    ref={fieldRefs.password}
                    minLength={8}
                    maxLength={16}
                    autoComplete="new-password"
                    title="Lütfen bu alanı doldurun."
                    onInvalid={e => e.target.setCustomValidity('Lütfen şifrenizi giriniz.')}
                    onInput={e => e.target.setCustomValidity('')}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    tabIndex="-1"
                    onClick={() => setShowPassword(v => !v)}
                    style={{borderTopLeftRadius:0, borderBottomLeftRadius:0}}
                    aria-label={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
                {step2Error.password && <div className="invalid-feedback d-block">{step2Error.password}</div>}
              </div>
              <div className="col-12 col-md-6 mt-3 mt-md-0">
                <label className="form-label">Şifre (Tekrar)</label>
                <div className="input-group">
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    className={`form-control${step2Error.passwordConfirm ? ' is-invalid' : ''}`}
                    value={passwordConfirm}
                    onChange={e => setPasswordConfirm(e.target.value)}
                    ref={fieldRefs.passwordConfirm}
                    minLength={8}
                    maxLength={16}
                    autoComplete="new-password"
                    title="Lütfen bu alanı doldurun."
                    onInvalid={e => e.target.setCustomValidity('Lütfen şifrenizi tekrar giriniz.')}
                    onInput={e => e.target.setCustomValidity('')}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    tabIndex="-1"
                    onClick={() => setShowPasswordConfirm(v => !v)}
                    style={{borderTopLeftRadius:0, borderBottomLeftRadius:0}}
                    aria-label={showPasswordConfirm ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                  >
                    <i className={`bi ${showPasswordConfirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
                {step2Error.passwordConfirm && <div className="invalid-feedback d-block">{step2Error.passwordConfirm}</div>}
              </div>
            </div>
            <div className="mb-3 mt-3">
              <label className="form-label">Telefon Numarası</label>
              <div className="input-group">
                <span className="input-group-text">+90</span>
                <input
                  type="tel"
                  className={`form-control${step2Error.phone ? ' is-invalid' : ''}`}
                  value={phone}
                  onChange={e => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.startsWith('0')) value = value.slice(1);
                    if (value.length > 10) value = value.slice(0, 10);
                    setPhone(value);
                  }}
                  ref={fieldRefs.phone}
                  maxLength={10}
                  minLength={10}
                  placeholder="5XXXXXXXXX"
                  title="Lütfen bu alanı doldurun."
                  onInvalid={e => e.target.setCustomValidity('Lütfen telefon numaranızı giriniz.')}
                  onInput={e => e.target.setCustomValidity('')}
                />
              </div>
              {step2Error.phone && <div className="invalid-feedback d-block">{step2Error.phone}</div>}
              <div className="form-text">Başında 0 olmadan, 10 haneli giriniz. Örn: 5XXXXXXXXX</div>
            </div>
            {/* Agreements */}
            <div className="mt-4 mb-2">
              {/* Kullanım Koşulları */}
              <div className={`form-check mb-2${step2Error.terms ? ' border border-danger rounded p-2' : ''}`} ref={fieldRefs.terms} style={{marginLeft: '0.5rem'}}>
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
                {step2Error.terms && <div className="text-danger mt-1">{step2Error.terms}</div>}
              </div>
              {/* Gizlilik Sözleşmesi */}
              <div className={`form-check mb-2${step2Error.privacy ? ' border border-danger rounded p-2' : ''}`} ref={fieldRefs.privacy} style={{marginLeft: '0.5rem'}}>
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
                {step2Error.privacy && <div className="text-danger mt-1">{step2Error.privacy}</div>}
              </div>
              {/* KVKK Açık Rıza */}
              <div className={`form-check mb-2${step2Error.kvkk ? ' border border-danger rounded p-2' : ''}`} ref={fieldRefs.kvkk} style={{marginLeft: '0.5rem'}}>
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
                {step2Error.kvkk && <div className="text-danger mt-1">{step2Error.kvkk}</div>}
              </div>
              {/* Ticari Elektronik İleti Onayı (optional) */}
              <div className="form-check mb-2" style={{marginLeft: '0.5rem'}}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="commercial"
                  checked={agreements.commercial}
                  onChange={() => setAgreements(a => ({ ...a, commercial: !a.commercial }))}
                />
                <label className="form-check-label" htmlFor="commercial">
                  <span className="fw-bold">Ticari Elektronik İleti Onayı</span> (
                    <button type="button" className="btn btn-link p-0 align-baseline" style={{textDecoration:'underline'}} onClick={() => openAgreementModal('commercial')}>Sözleşmeyi Oku</button>
                  ) <span className="text-secondary">(isteğe bağlı)</span>
                </label>
              </div>
              {showAgreementWarning && (
                <div className="alert alert-warning py-2 mt-2">
                  Kayıt olabilmek için tüm zorunlu sözleşmeleri okuduğunuzu ve onayladığınızı belirtmelisiniz.
                </div>
              )}
            </div>
            {step2GeneralError && <div className="alert alert-danger py-2 mt-2">{step2GeneralError}</div>}
            <button type="submit" className="btn btn-danger w-100 mt-2" disabled={registering}>
              {registering ? 'Kayıt Olunuyor...' : 'Kaydı Tamamla'}
            </button>
          </form>
        </div>
        )}
        
        {/* Demo request info section */}
        <div className="mt-4 p-3 text-center" style={{
          backgroundColor: '#e7f3ff', 
          border: '1px solid #b3d9ff', 
          borderRadius: '8px',
          color: '#0c5aa6'
        }}>
          <div className="mb-2">
            <i className="bi bi-info-circle-fill me-2" style={{fontSize: '16px', color: '#0c5aa6'}}></i>
            <strong>Demo Talebi</strong>
          </div>
          <p className="mb-2">
            Demo talebinde bulunmak için bizimle iletişim kurabilirsiniz.
          </p>
          <button 
            type="button" 
            className="btn btn-success d-flex align-items-center justify-content-center mx-auto"
            style={{
              backgroundColor: '#25d366',
              borderColor: '#25d366',
              fontWeight: '500',
              borderRadius: '20px',
              padding: '8px 20px'
            }}
            onClick={() => {
              const message = "Merhaba, Katip Otomasyonu için demo talebinde bulunmak istiyorum. Bilgi verebilir misiniz?";
              const phoneNumber = "905555555555"; // Replace with actual WhatsApp number
              const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 16 16" className="me-2">
              <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.777-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.336-.445-.342-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
            </svg>
            WhatsApp ile İletişim
          </button>
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
        <style>{`
          .btn-onay-gonder {
            background: #6c757d !important;
            color: #fff !important;
            font-weight: 500;
            border: none;
            font-size: 0.85rem;
            padding: 0.375rem 0.5rem;
            transition: background 0.2s, color 0.2s;
            white-space: nowrap;
          }
          .btn-onay-gonder:hover, .btn-onay-gonder:focus {
            background: #5a6268 !important;
            color: #fff !important;
          }
          .btn-onay-gonder:disabled {
            background: #6c757d !important;
            opacity: 0.65;
          }
          .input-group-text {
            background-color: #dc3545 !important;
            color: white !important;
            border-color: #dc3545 !important;
            font-weight: 500;
            transition: background-color 0.2s, border-color 0.2s;
          }
          .input-group-text:hover {
            background-color: #bb2d3b !important;
            border-color: #bb2d3b !important;
            color: white !important;
            cursor: pointer;
          }
        `}</style>
      </div>
    </>
  );
}

export default RegisterPage;