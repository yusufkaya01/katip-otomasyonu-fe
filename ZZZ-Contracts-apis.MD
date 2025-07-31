# 📄 Contracts System - Frontend Integration Guide

## 🎯 Overview

This guide provides comprehensive instructions for integrating the new **Legal Contracts System** into the frontend application. The system manages all legal agreements including Terms of Use, Privacy Policy, KVKK Consent, and Marketing Consent.

## 🗂️ Contract Structure

### Available Contracts

| Contract ID | Title | Type | Required |
|-------------|-------|------|----------|
| `terms_of_use` | Kullanım Koşulları ve Üyelik Sözleşmesi | Legal | ✅ Mandatory |
| `privacy_policy` | Gizlilik Politikası ve Kişisel Verilerin Korunması | Privacy | ✅ Mandatory |
| `kvkk_consent` | KVKK Açık Rıza Beyanı | Legal | ✅ Mandatory |
| `marketing_consent` | Ticari Elektronik İleti Onayı | Marketing | ⚪ Optional |

### Contract Data Structure

```typescript
interface Contract {
  id: string;                    // Unique identifier
  title: string;                 // Display title
  content: string;               // Full contract text
  shortDescription: string;      // Brief description
  mandatory: boolean;            // Is acceptance required
  version: string;               // Contract version (e.g., "1.0.0")
  effectiveDate: string;         // ISO date string
  category: 'legal' | 'privacy' | 'marketing';
}

interface ContractsResponse {
  success: boolean;
  data: {
    contracts: Record<string, Contract>;
    metadata: {
      totalContracts: number;
      mandatoryContracts: number;
      optionalContracts: number;
      lastUpdated: string;
    };
  };
  message: string;
}
```

## 🔌 API Integration

### Base Endpoint
```
GET /api/contracts
```

### Available Endpoints

#### 1. Get All Contracts
```typescript
// Fetch all contracts
const response = await fetch('/api/contracts');
const data: ContractsResponse = await response.json();

if (data.success) {
  const { contracts, metadata } = data.data;
  console.log(`Loaded ${metadata.totalContracts} contracts`);
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "contracts": {
      "terms_of_use": {
        "id": "terms_of_use",
        "title": "Kullanım Koşulları ve Üyelik Sözleşmesi",
        "content": "KULLANIM KOŞULLARI VE ÜYELİK SÖZLEŞMESİ\n\n1. TARAFLAR\nİşbu sözleşme, bir taraftan Otomasyon Katibi Limited Şirketi (bundan sonra \"Şirket\" olarak anılacaktır) ile diğer taraftan...",
        "shortDescription": "Platform kullanım koşulları ve üyelik sözleşmesi",
        "mandatory": true,
        "version": "1.0.0",
        "effectiveDate": "2025-01-01T00:00:00.000Z",
        "category": "legal"
      },
      "privacy_policy": {
        "id": "privacy_policy",
        "title": "Gizlilik Politikası ve Kişisel Verilerin Korunması",
        "content": "GİZLİLİK POLİTİKASI VE KİŞİSEL VERİLERİN KORUNMASI\n\n1. VERİ SORUMLUSU\nOtomasyon Katibi Limited Şirketi, 6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca veri sorumlusu sıfatıyla...",
        "shortDescription": "Kişisel verilerinizin işlenmesi ve korunması politikası",
        "mandatory": true,
        "version": "1.0.0",
        "effectiveDate": "2025-01-01T00:00:00.000Z",
        "category": "privacy"
      },
      "kvkk_consent": {
        "id": "kvkk_consent",
        "title": "KVKK Açık Rıza Beyanı",
        "content": "KVKK AÇIK RIZA BEYANI\n\n6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 3. maddesinde tanımlanan kişisel verilerimin...",
        "shortDescription": "KVKK kapsamında açık rıza beyanı",
        "mandatory": true,
        "version": "1.0.0",
        "effectiveDate": "2025-01-01T00:00:00.000Z",
        "category": "legal"
      },
      "marketing_consent": {
        "id": "marketing_consent",
        "title": "Ticari Elektronik İleti Onayı",
        "content": "TİCARİ ELEKTRONİK İLETİ ONAYI\n\n6563 sayılı Elektronik Ticaret Kanunu'nun 6. maddesi ve İlgili Yönetmelik hükümleri gereğince...",
        "shortDescription": "Pazarlama iletişimi için onay beyanı",
        "mandatory": false,
        "version": "1.0.0",
        "effectiveDate": "2025-01-01T00:00:00.000Z",
        "category": "marketing"
      }
    },
    "metadata": {
      "totalContracts": 4,
      "mandatoryContracts": 3,
      "optionalContracts": 1,
      "lastUpdated": "2025-07-31T12:00:00.000Z"
    }
  },
  "message": "Contracts retrieved successfully"
}
```

#### 2. Get Mandatory Contracts Only
```typescript
// For registration forms - only mandatory contracts
const response = await fetch('/api/contracts/mandatory');
const data = await response.json();

if (data.success) {
  const mandatoryContracts = data.data.contracts;
  // These must be accepted for registration
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "contracts": {
      "terms_of_use": {
        "id": "terms_of_use",
        "title": "Kullanım Koşulları ve Üyelik Sözleşmesi",
        "content": "KULLANIM KOŞULLARI VE ÜYELİK SÖZLEŞMESİ\n\n1. TARAFLAR...",
        "shortDescription": "Platform kullanım koşulları ve üyelik sözleşmesi",
        "mandatory": true,
        "version": "1.0.0",
        "effectiveDate": "2025-01-01T00:00:00.000Z",
        "category": "legal"
      },
      "privacy_policy": {
        "id": "privacy_policy",
        "title": "Gizlilik Politikası ve Kişisel Verilerin Korunması",
        "content": "GİZLİLİK POLİTİKASI VE KİŞİSEL VERİLERİN KORUNMASI\n\n1. VERİ SORUMLUSU...",
        "shortDescription": "Kişisel verilerinizin işlenmesi ve korunması politikası",
        "mandatory": true,
        "version": "1.0.0",
        "effectiveDate": "2025-01-01T00:00:00.000Z",
        "category": "privacy"
      },
      "kvkk_consent": {
        "id": "kvkk_consent",
        "title": "KVKK Açık Rıza Beyanı",
        "content": "KVKK AÇIK RIZA BEYANI\n\n6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 3. maddesinde...",
        "shortDescription": "KVKK kapsamında açık rıza beyanı",
        "mandatory": true,
        "version": "1.0.0",
        "effectiveDate": "2025-01-01T00:00:00.000Z",
        "category": "legal"
      }
    },
    "metadata": {
      "totalContracts": 3,
      "mandatoryContracts": 3,
      "optionalContracts": 0,
      "lastUpdated": "2025-07-31T12:00:00.000Z"
    }
  },
  "message": "Mandatory contracts retrieved successfully"
}
```

#### 3. Get Optional Contracts Only
```typescript
// For preferences/settings - optional contracts
const response = await fetch('/api/contracts/optional');
const data = await response.json();

if (data.success) {
  const optionalContracts = data.data.contracts;
  // These can be accepted/declined by user choice
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "contracts": {
      "marketing_consent": {
        "id": "marketing_consent",
        "title": "Ticari Elektronik İleti Onayı",
        "content": "TİCARİ ELEKTRONİK İLETİ ONAYI\n\n6563 sayılı Elektronik Ticaret Kanunu'nun 6. maddesi ve İlgili Yönetmelik hükümleri gereğince...",
        "shortDescription": "Pazarlama iletişimi için onay beyanı",
        "mandatory": false,
        "version": "1.0.0",
        "effectiveDate": "2025-01-01T00:00:00.000Z",
        "category": "marketing"
      }
    },
    "metadata": {
      "totalContracts": 1,
      "mandatoryContracts": 0,
      "optionalContracts": 1,
      "lastUpdated": "2025-07-31T12:00:00.000Z"
    }
  },
  "message": "Optional contracts retrieved successfully"
}
```

#### 4. Get Specific Contract
```typescript
// Get individual contract
const contractId = 'terms_of_use';
const response = await fetch(`/api/contracts/${contractId}`);
const data = await response.json();

if (data.success) {
  const contract = data.data;
  console.log(contract.title, contract.content);
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "terms_of_use",
    "title": "Kullanım Koşulları ve Üyelik Sözleşmesi",
    "content": "KULLANIM KOŞULLARI VE ÜYELİK SÖZLEŞMESİ\n\n1. TARAFLAR\nİşbu sözleşme, bir taraftan Otomasyon Katibi Limited Şirketi (bundan sonra \"Şirket\" olarak anılacaktır) ile diğer taraftan...",
    "shortDescription": "Platform kullanım koşulları ve üyelik sözleşmesi",
    "mandatory": true,
    "version": "1.0.0",
    "effectiveDate": "2025-01-01T00:00:00.000Z",
    "category": "legal"
  },
  "message": "Contract retrieved successfully"
}
```

#### 5. Get Contracts Metadata
```typescript
// Get metadata about contracts without full content
const response = await fetch('/api/contracts/metadata');
const data = await response.json();

if (data.success) {
  const metadata = data.data;
  console.log(`Total: ${metadata.totalContracts}, Mandatory: ${metadata.mandatoryContracts}`);
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "totalContracts": 4,
    "mandatoryContracts": 3,
    "optionalContracts": 1,
    "lastUpdated": "2025-07-31T12:00:00.000Z",
    "contracts": {
      "terms_of_use": {
        "id": "terms_of_use",
        "title": "Kullanım Koşulları ve Üyelik Sözleşmesi",
        "mandatory": true,
        "version": "1.0.0",
        "category": "legal"
      },
      "privacy_policy": {
        "id": "privacy_policy",
        "title": "Gizlilik Politikası ve Kişisel Verilerin Korunması",
        "mandatory": true,
        "version": "1.0.0",
        "category": "privacy"
      },
      "kvkk_consent": {
        "id": "kvkk_consent",
        "title": "KVKK Açık Rıza Beyanı",
        "mandatory": true,
        "version": "1.0.0",
        "category": "legal"
      },
      "marketing_consent": {
        "id": "marketing_consent",
        "title": "Ticari Elektronik İleti Onayı",
        "mandatory": false,
        "version": "1.0.0",
        "category": "marketing"
      }
    }
  },
  "message": "Contracts metadata retrieved successfully"
}
```

#### 6. Health Check
```typescript
// Check system health and contract status
const response = await fetch('/api/contracts/health');
const data = await response.json();

if (data.success) {
  console.log('Contracts system is healthy');
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "contractsCount": 4,
    "mandatoryCount": 3,
    "optionalCount": 1,
    "validationErrors": []
  },
  "message": "System is healthy"
}
```

#### 7. Validate Contracts
```typescript
// Validate all contracts structure
const response = await fetch('/api/contracts/validate');
const data = await response.json();

if (data.success) {
  console.log('All contracts are valid');
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": []
  },
  "message": "All contracts are valid"
}
```

### Error Response Examples

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Invalid contract ID",
  "error": "Contract ID must be a non-empty string"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Contract not found",
  "error": "Contract with ID 'invalid_contract' does not exist"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to load contracts",
  "error": "Internal server error"
}
```

## 🎨 Frontend Implementation Examples

### API Client Service with Error Handling

```typescript
// services/contractsApiClient.ts
class ContractsApiClient {
  private baseUrl = '/api/contracts';

  async getAllContracts(): Promise<ContractsResponse> {
    try {
      const response = await fetch(this.baseUrl);
      return await this.handleResponse(response);
    } catch (error) {
      throw new Error(`Failed to fetch contracts: ${error.message}`);
    }
  }

  async getMandatoryContracts(): Promise<ContractsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/mandatory`);
      return await this.handleResponse(response);
    } catch (error) {
      throw new Error(`Failed to fetch mandatory contracts: ${error.message}`);
    }
  }

  async getContract(contractId: string): Promise<{ success: boolean; data: Contract; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${contractId}`);
      return await this.handleResponse(response);
    } catch (error) {
      throw new Error(`Failed to fetch contract ${contractId}: ${error.message}`);
    }
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  }
}

export const contractsApi = new ContractsApiClient();
```

### Complete Registration Form Example with JSON Payloads

```typescript
// components/RegistrationFormWithContracts.tsx
import React, { useState, useEffect } from 'react';
import { contractsApi } from '../services/contractsApiClient';

interface RegistrationData {
  companyName: string;
  email: string;
  phone: string;
  taxNumber?: string;
  taxOffice?: string;
  // Contract acceptance tracking
  acceptedContracts: Record<string, {
    accepted: boolean;
    acceptedAt: string;
    version: string;
  }>;
}

export const RegistrationFormWithContracts: React.FC = () => {
  const [contracts, setContracts] = useState<Record<string, Contract> | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<RegistrationData>({
    companyName: '',
    email: '',
    phone: '',
    acceptedContracts: {}
  });

  useEffect(() => {
    loadMandatoryContracts();
  }, []);

  const loadMandatoryContracts = async () => {
    try {
      setLoading(true);
      const response = await contractsApi.getMandatoryContracts();
      
      if (response.success) {
        setContracts(response.data.contracts);
        
        // Initialize acceptance tracking
        const initialAcceptance: Record<string, any> = {};
        Object.keys(response.data.contracts).forEach(contractId => {
          initialAcceptance[contractId] = {
            accepted: false,
            acceptedAt: '',
            version: response.data.contracts[contractId].version
          };
        });
        
        setFormData(prev => ({
          ...prev,
          acceptedContracts: initialAcceptance
        }));
      }
    } catch (error) {
      console.error('Failed to load contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContractAcceptance = (contractId: string, accepted: boolean) => {
    setFormData(prev => ({
      ...prev,
      acceptedContracts: {
        ...prev.acceptedContracts,
        [contractId]: {
          accepted,
          acceptedAt: accepted ? new Date().toISOString() : '',
          version: contracts![contractId].version
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate mandatory contracts
    const mandatoryAccepted = Object.entries(formData.acceptedContracts)
      .every(([contractId, acceptance]) => {
        const contract = contracts![contractId];
        return !contract.mandatory || acceptance.accepted;
      });

    if (!mandatoryAccepted) {
      alert('Lütfen tüm zorunlu sözleşmeleri kabul edin.');
      return;
    }

    // Prepare registration payload
    const registrationPayload = {
      companyName: formData.companyName,
      email: formData.email,
      phone: formData.phone,
      taxNumber: formData.taxNumber,
      taxOffice: formData.taxOffice,
      // Contract acceptance data
      contractAcceptances: formData.acceptedContracts,
      registrationDate: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ipAddress: 'client-side-placeholder' // This would be filled by backend
    };

    console.log('Registration payload:', JSON.stringify(registrationPayload, null, 2));

    try {
      const response = await fetch('/api/osgb/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(registrationPayload)
      });

      const result = await response.json();
      console.log('Registration response:', result);

      if (result.success) {
        alert('Kayıt başarılı!');
        // Redirect or show success message
      } else {
        alert(`Kayıt başarısız: ${result.message}`);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Kayıt sırasında bir hata oluştu.');
    }
  };

  if (loading) {
    return <div>Sözleşmeler yükleniyor...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="registration-form">
      <h2>Kayıt Formu</h2>
      
      {/* Form fields */}
      <div className="form-section">
        <input
          type="text"
          placeholder="Şirket Adı *"
          value={formData.companyName}
          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
          required
        />
        <input
          type="email"
          placeholder="E-posta *"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
        <input
          type="tel"
          placeholder="Telefon *"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          required
        />
      </div>

      {/* Contracts section */}
      <div className="contracts-section">
        <h3>Sözleşmeler ve Onaylar</h3>
        {contracts && Object.entries(contracts).map(([contractId, contract]) => (
          <div key={contractId} className="contract-item">
            <label>
              <input
                type="checkbox"
                checked={formData.acceptedContracts[contractId]?.accepted || false}
                onChange={(e) => handleContractAcceptance(contractId, e.target.checked)}
                required={contract.mandatory}
              />
              {contract.title}
              {contract.mandatory && <span className="required"> *</span>}
            </label>
            <button
              type="button"
              onClick={() => {
                // Show contract modal with full content
                alert(`Contract: ${contract.title}\n\nContent: ${contract.content.substring(0, 200)}...`);
              }}
            >
              Oku
            </button>
          </div>
        ))}
      </div>

      <button type="submit">Kayıt Ol</button>
      
      {/* Debug: Show current form state */}
      <details style={{ marginTop: '20px', fontSize: '12px' }}>
        <summary>Debug: Form State</summary>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </details>
    </form>
  );
};
```

### User Preferences/Settings with Optional Contracts

```typescript
// components/UserPreferences.tsx
import React, { useState, useEffect } from 'react';
import { contractsApi } from '../services/contractsApiClient';

interface UserPreferences {
  userId: string;
  contractPreferences: Record<string, {
    accepted: boolean;
    acceptedAt: string;
    version: string;
  }>;
  lastUpdated: string;
}

export const UserPreferences: React.FC<{ userId: string }> = ({ userId }) => {
  const [optionalContracts, setOptionalContracts] = useState<Record<string, Contract> | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    userId,
    contractPreferences: {},
    lastUpdated: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPreferences();
  }, [userId]);

  const loadUserPreferences = async () => {
    try {
      setLoading(true);
      
      // Load optional contracts
      const contractsResponse = await contractsApi.getAllContracts();
      if (contractsResponse.success) {
        const optional = Object.fromEntries(
          Object.entries(contractsResponse.data.contracts)
            .filter(([_, contract]) => !contract.mandatory)
        );
        setOptionalContracts(optional);
      }

      // Load user's current preferences
      const prefsResponse = await fetch(`/api/users/${userId}/preferences`);
      if (prefsResponse.ok) {
        const prefsData = await prefsResponse.json();
        setPreferences(prefsData);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (contractId: string, accepted: boolean) => {
    const updatedPrefs = {
      ...preferences,
      contractPreferences: {
        ...preferences.contractPreferences,
        [contractId]: {
          accepted,
          acceptedAt: accepted ? new Date().toISOString() : '',
          version: optionalContracts![contractId].version
        }
      },
      lastUpdated: new Date().toISOString()
    };

    // Update local state
    setPreferences(updatedPrefs);

    // Save to backend
    try {
      const response = await fetch(`/api/users/${userId}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contractId,
          accepted,
          version: optionalContracts![contractId].version,
          updatedAt: new Date().toISOString()
        })
      });

      const result = await response.json();
      console.log('Preference update response:', result);

      if (!result.success) {
        // Revert on failure
        loadUserPreferences();
        alert('Ayar kaydedilemedi, lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Failed to save preference:', error);
      // Revert on failure
      loadUserPreferences();
    }
  };

  if (loading) {
    return <div>Tercihler yükleniyor...</div>;
  }

  return (
    <div className="user-preferences">
      <h3>İletişim Tercihleri</h3>
      <p>Aşağıdaki tercihlerinizi istediğiniz zaman değiştirebilirsiniz.</p>
      
      {optionalContracts && Object.entries(optionalContracts).map(([contractId, contract]) => {
        const currentPref = preferences.contractPreferences[contractId];
        
        return (
          <div key={contractId} className="preference-item">
            <div className="preference-header">
              <h4>{contract.title}</h4>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={currentPref?.accepted || false}
                  onChange={(e) => updatePreference(contractId, e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
            
            <p className="preference-description">
              {contract.shortDescription}
            </p>
            
            {currentPref?.acceptedAt && (
              <small className="preference-meta">
                {currentPref.accepted ? 'Kabul edildi' : 'Reddedildi'}: {' '}
                {new Date(currentPref.acceptedAt).toLocaleDateString('tr-TR')}
                {' '} (v{currentPref.version})
              </small>
            )}
            
            <button
              type="button"
              className="view-contract-btn"
              onClick={() => {
                // Show full contract
                alert(`${contract.title}\n\n${contract.content}`);
              }}
            >
              Sözleşmeyi Görüntüle
            </button>
          </div>
        );
      })}
      
      {/* Debug: Show preferences state */}
      <details style={{ marginTop: '20px', fontSize: '12px' }}>
        <summary>Debug: Preferences State</summary>
        <pre>{JSON.stringify(preferences, null, 2)}</pre>
      </details>
    </div>
  );
};
```

## 🔧 Advanced Implementation Patterns

### Contract Service Class

```typescript
// services/ContractsService.ts
class ContractsService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  async getAllContracts(): Promise<Record<string, Contract>> {
    const cacheKey = 'all_contracts';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const response = await fetch('/api/contracts');
      const data = await response.json();
      
      if (data.success) {
        this.cache.set(cacheKey, {
          data: data.data.contracts,
          timestamp: Date.now()
        });
        return data.data.contracts;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      throw error;
    }
  }

  async getMandatoryContracts(): Promise<Record<string, Contract>> {
    const response = await fetch('/api/contracts/mandatory');
    const data = await response.json();
    
    if (data.success) {
      return data.data.contracts;
    } else {
      throw new Error(data.message);
    }
  }

  async getContract(contractId: string): Promise<Contract> {
    const response = await fetch(`/api/contracts/${contractId}`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const contractsService = new ContractsService();
```

## 🚀 Best Practices

### 1. Error Handling
```typescript
// Always handle API errors gracefully
const { contracts, loading, error } = useContracts();

if (error) {
  return (
    <div className="error-state">
      <h3>Sözleşmeler yüklenemedi</h3>
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>
        Tekrar Dene
      </button>
    </div>
  );
}
```

### 2. Loading States
```typescript
// Provide meaningful loading feedback
if (loading) {
  return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>Sözleşmeler yükleniyor...</p>
    </div>
  );
}
```

### 3. Performance Optimization
- Use caching for contract data (5-minute expiry recommended)
- Implement lazy loading for contract content
- Consider pagination for large contract lists
- Use React.memo for components to prevent unnecessary re-renders

### 4. User Experience
- Always show contract version and effective date
- Provide clear visual distinction between mandatory and optional contracts
- Use progressive disclosure (summary → full text)
- Include search/filter functionality for long contract lists
- Implement smooth animations for modal transitions

This guide provides comprehensive API examples and patterns for integrating the contracts system into your frontend application. The modular design ensures easy maintenance and scalability as your legal requirements evolve.
