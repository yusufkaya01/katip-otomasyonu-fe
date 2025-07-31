// Base API URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://customers.katipotomasyonu.com/api';

class ContractsApiClient {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  async getAllContracts() {
    const cacheKey = 'all_contracts';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return { success: true, data: cached.data };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/contracts`);
      const data = await response.json();
      
      if (data.success) {
        this.cache.set(cacheKey, {
          data: data.data,
          timestamp: Date.now()
        });
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      // Return fallback/cached data if available
      const fallback = this.getFallbackContracts();
      return { success: true, data: fallback };
    }
  }

  async getMandatoryContracts() {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/mandatory`);
      const data = await response.json();
      
      if (data.success) {
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to fetch mandatory contracts:', error);
      // Return fallback mandatory contracts
      const fallback = this.getFallbackContracts();
      const mandatoryContracts = Object.fromEntries(
        Object.entries(fallback.contracts).filter(([_, contract]) => contract.mandatory)
      );
      return {
        success: true,
        data: {
          contracts: mandatoryContracts,
          metadata: {
            totalContracts: Object.keys(mandatoryContracts).length,
            mandatoryContracts: Object.keys(mandatoryContracts).length,
            optionalContracts: 0,
            lastUpdated: new Date().toISOString()
          }
        }
      };
    }
  }

  async getOptionalContracts() {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/optional`);
      const data = await response.json();
      
      if (data.success) {
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to fetch optional contracts:', error);
      // Return fallback optional contracts
      const fallback = this.getFallbackContracts();
      const optionalContracts = Object.fromEntries(
        Object.entries(fallback.contracts).filter(([_, contract]) => !contract.mandatory)
      );
      return {
        success: true,
        data: {
          contracts: optionalContracts,
          metadata: {
            totalContracts: Object.keys(optionalContracts).length,
            mandatoryContracts: 0,
            optionalContracts: Object.keys(optionalContracts).length,
            lastUpdated: new Date().toISOString()
          }
        }
      };
    }
  }

  async getContract(contractId) {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/${contractId}`);
      const data = await response.json();
      
      if (data.success) {
        return data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error(`Failed to fetch contract ${contractId}:`, error);
      // Return fallback contract
      const fallback = this.getFallbackContracts();
      const contract = fallback.contracts[contractId];
      if (contract) {
        return { success: true, data: contract };
      } else {
        throw error;
      }
    }
  }

  // Fallback contracts based on existing content
  getFallbackContracts() {
    return {
      contracts: {
        terms_of_use: {
          id: 'terms_of_use',
          title: 'Kullanım Koşulları ve Üyelik Sözleşmesi',
          content: `KULLANIM KOŞULLARI VE ÜYELİK SÖZLEŞMESİ

Katip Otomasyonu, yalnızca geçerli bir lisans anahtarı ile kullanılabilir. Kullanıcı, uzantıyı ve web sitesini yalnızca yasal amaçlarla ve isgkatip.csgb.gov.tr platformunda kullanmayı kabul eder. Uzantı ve web sitesi, isgkatip.csgb.gov.tr'nin kullanım koşullarına ve Türk mevzuatına aykırı şekilde kullanılamaz.

Kullanıcı, uzantının ve web sitesinin işlevlerini kötüye kullanmayacağını, başkalarının verilerine izinsiz erişmeyeceğini ve uzantıyı sadece kendi kurumunun işlemleri için kullanacağını taahhüt eder. Geliştirici (Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti.), uzantının yanlış veya izinsiz kullanımından doğacak zararlardan sorumlu değildir.

Lisans anahtarının paylaşılması, çoğaltılması veya izinsiz kullanımı yasaktır. Tespit halinde lisans iptal edilir. Uzantı ve web sitesi, Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. tarafından güncellenebilir veya sonlandırılabilir.

Uygulamayı kullanan veya lisans satın alan kullanıcılar, ilk kayıt sırasında talep edilen telefon numarası, şirket adı ve OSGB-ID bilgilerinin lisans doğrulama ve müşteri kaydı amacıyla saklanmasını kabul etmiş sayılır.

Detaylı bilgi için info@arkaya.com.tr adresine başvurabilirsiniz.`,
          shortDescription: 'Platform kullanım koşulları ve üyelik sözleşmesi',
          mandatory: true,
          version: '1.0.0',
          effectiveDate: '2025-01-01T00:00:00.000Z',
          category: 'legal'
        },
        privacy_policy: {
          id: 'privacy_policy',
          title: 'Gizlilik Politikası ve Kişisel Verilerin Korunması',
          content: `GİZLİLİK POLİTİKASI VE KİŞİSEL VERİLERİN KORUNMASI

Katip Otomasyonu Chrome uzantısı ve web sitesi, Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. tarafından işletilmektedir. Kullanıcıdan yalnızca gerekli minimum veriler (ör. lisans anahtarı, isgkatip oturum anahtarı) toplanır. Lisans doğrulama sırasında sadece lisans anahtarı sunucularımıza gönderilir; isgkatip oturum anahtarı veya başka herhangi bir kişisel bilgi sunucularımıza iletilmez.

Kişisel veriler (ad, soyad, T.C. kimlik no, işyeri bilgileri, sözleşme detayları) sadece kullanıcının kendi hesabı üzerinden, isgkatip.csgb.gov.tr ile iletişimde kullanılır ve uzantı tarafından harici olarak saklanmaz. Lisans doğrulama için yalnızca lisans anahtarı, Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti.'nin kontrolündeki harici bir sunucuya (ör. AWS) gönderilir.

Hiçbir kişisel veri, üçüncü şahıslarla paylaşılmaz, satılmaz veya ticari amaçla kullanılmaz. Kullanıcı verileri, uzantıdan kaldırıldığında veya uzantı silindiğinde, mevzuat gereği yasal saklama ve denetim yükümlülüklerimiz kapsamında pasif hale getirilir ancak silinmez; ilgili bilgiler yalnızca resmi makamların talebi ve denetimi için saklanır.

KVKK kapsamında, kullanıcı verilerinin işlenmesi, saklanması ve silinmesi süreçleri açıkça belirtilir. Katip Otomasyonu, kullanıcıdan açık rıza almadan hiçbir kişisel veriyi işlemez veya saklamaz. Kullanıcı, dilediği zaman verilerinin silinmesini talep edebilir. Bu talepler için info@arkaya.com.tr adresine başvurulabilir.

Katip Otomasyonu'nu ilk kez kullanan veya lisans satın alan müşterilerden; telefon numarası, şirket adı ve OSGB-ID gibi bilgiler alınır ve lisans doğrulama amacıyla güvenli şekilde saklanır. Uygulamayı kullanan veya lisans satın alan herkes, bu bilgilerin alınmasını ve saklanmasını kabul etmiş sayılır.

Veri sorumlusu: Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. | info@arkaya.com.tr

Haklarınızı kullanmak için, taleplerinizi info@arkaya.com.tr adresine iletebilirsiniz. Detaylı bilgi ve diğer sözleşmeler için lütfen ilgili sayfaları ziyaret ediniz.`,
          shortDescription: 'Kişisel verilerinizin işlenmesi ve korunması politikası',
          mandatory: true,
          version: '1.0.0',
          effectiveDate: '2025-01-01T00:00:00.000Z',
          category: 'privacy'
        },
        kvkk_consent: {
          id: 'kvkk_consent',
          title: 'KVKK Açık Rıza Beyanı',
          content: `KVKK AÇIK RIZA BEYANI

Katip Otomasyonu, 6698 sayılı Kişisel Verilerin Korunması Kanunu'na (KVKK) tam uyumlu olarak geliştirilmiştir. Kişisel veriler, yalnızca uzantının ve web sitesinin işlevlerini yerine getirmek için ve kullanıcının açık rızası ile işlenir. Kişisel veriler, uzantı tarafından harici bir sunucuda saklanmaz, sadece geçici olarak kullanılır.

Lisans doğrulama sırasında iletilen lisans anahtarı, lisans kontrolü amacıyla işlenir ve Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. kontrolündeki harici bir sunucuda (ör. AWS) saklanır. Kullanıcı, dilediği zaman verilerinin silinmesini talep edebilir. info@arkaya.com.tr adresine başvurarak bu hakkını kullanabilir. Kişisel veriler, üçüncü şahıslarla paylaşılmaz. Veri güvenliği için gerekli tüm teknik ve idari tedbirler alınır.

Veri sorumlusu: Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. | info@arkaya.com.tr

Kayıt ve lisanslama sürecinde alınan telefon numarası, şirket adı ve OSGB-ID bilgileri, yalnızca lisans doğrulama ve müşteri kaydı amacıyla işlenir ve saklanır.

Haklarınız ve başvuru yöntemleriniz için lütfen Gizlilik Sözleşmesi sayfasını inceleyiniz.`,
          shortDescription: 'KVKK kapsamında açık rıza beyanı',
          mandatory: true,
          version: '1.0.0',
          effectiveDate: '2025-01-01T00:00:00.000Z',
          category: 'legal'
        },
        marketing_consent: {
          id: 'marketing_consent',
          title: 'Ticari Elektronik İleti Onayı',
          content: `TİCARİ ELEKTRONİK İLETİ ONAYI

Kampanya, duyuru ve bilgilendirme amaçlı ticari elektronik iletiler (e-posta, SMS vb.) almak istiyorsanız bu kutucuğu işaretleyebilirsiniz. Onay vermeniz halinde, iletişim bilgileriniz yalnızca Katip Otomasyonu ve Arkaya Arge Yazılım İnşaat Ticaret Ltd.Şti. tarafından kampanya ve bilgilendirme amaçlı kullanılacaktır. Onayınızı dilediğiniz zaman geri alabilirsiniz.

Detaylı bilgi için info@arkaya.com.tr adresine başvurabilirsiniz.`,
          shortDescription: 'Pazarlama iletişimi için onay beyanı',
          mandatory: false,
          version: '1.0.0',
          effectiveDate: '2025-01-01T00:00:00.000Z',
          category: 'marketing'
        },
        dsa_contract: {
          id: 'dsa_contract',
          title: 'Mesafeli Satış Sözleşmesi',
          content: `MESAFELİ SATIŞ SÖZLEŞMESİ

Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve 27.11.2014 tarihli ve 29188 sayılı Resmi Gazete'de yayımlanan Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince düzenlenmiştir.

SATICI BİLGİLERİ:
Unvan: Arkaya Arge Yazılım İnşaat Ticaret Limited Şirketi
Adres: [Satıcı Adresi]
Telefon: [Telefon Numarası]
E-posta: info@arkaya.com.tr

ÜRÜN/HİZMET BİLGİLERİ:
Katip Otomasyonu Lisansı - İşyeri İç Sağlık ve Güvenlik Birimi Otomasyon Yazılımı

Bu sözleşme, yukarıda belirtilen ürün/hizmetin satışı ve teslimi konularında tarafların hak ve yükümlülüklerini düzenler.

Tüketici, bu sözleşmeyi kabul etmekle, mesafeli sözleşmenin kurulması halinde cayma hakkına sahip olduğunu, cayma hakkının kullanılması ve bu hakkın kullanılmasına ilişkin usul ve esasları öğrenmiş olduğunu beyan eder.

CAYMA HAKKI:
Tüketici, hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin 14 (on dört) gün içinde sözleşmeden cayma hakkına sahiptir.

Detaylı bilgi için info@arkaya.com.tr adresine başvurabilirsiniz.`,
          shortDescription: 'Mesafeli satış işlemleri için yasal sözleşme',
          mandatory: true,
          version: '1.0.0',
          effectiveDate: '2025-01-01T00:00:00.000Z',
          category: 'legal'
        }
      },
      metadata: {
        totalContracts: 5,
        mandatoryContracts: 4,
        optionalContracts: 1,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const contractsApi = new ContractsApiClient();
export default contractsApi;
