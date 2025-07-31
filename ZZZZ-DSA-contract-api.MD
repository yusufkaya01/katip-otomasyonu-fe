# DSA (Distance Sales Agreement) Integration Guide for Frontend Developers

## 📋 Overview

This document outlines the implementation of DSA (Mesafeli Satış Sözleşmesi) functionality for order emails and the new API endpoint for serving personalized contracts to the frontend.

## 🆕 New API Endpoint

### Get Personalized DSA Contract

**Endpoint:** `GET /api/osgb/dsa`

**Purpose:** Retrieve a personalized Distance Sales Agreement for the logged-in customer before order creation.

**Authentication:** Required
- `Authorization: Bearer <jwt_token>`
- `x-api-key: <api_key>`

**Request Example:**
```javascript
const response = await fetch('/api/osgb/dsa', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'x-api-key': process.env.REACT_APP_API_KEY,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

**Success Response (200):**
```json
{
  "success": true,
  "dsa": {
    "title": "MESAFELI SATIŞ SÖZLEŞMESİ",
    "content": "SATIŞ SÖZLEŞMESİ\n\n1. KONU\nİşbu sözleşmenin konusu...",
    "filename": "Mesafeli-Satış-Sözleşmesi.pdf"
  }
}
```

**Error Responses:**
```json
// 404 - Customer not found
{
  "success": false,
  "message": "Müşteri bilgileri bulunamadı."
}

// 500 - Server error
{
  "success": false,
  "message": "Mesafeli Satış Sözleşmesi yüklenemedi."
}
```

## 🎯 Frontend Implementation Recommendations

### 1. Pre-Order DSA Display

Display the DSA contract to users **before** they create an order:

```javascript
// Example React component
const DSAModal = ({ isOpen, onClose, onAccept }) => {
  const [dsa, setDsa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDSA();
    }
  }, [isOpen]);

  const fetchDSA = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/osgb/dsa', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'x-api-key': process.env.REACT_APP_API_KEY
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setDsa(data.dsa);
      } else {
        console.error('Failed to load DSA:', data.message);
      }
    } catch (error) {
      console.error('Error fetching DSA:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (accepted) {
      onAccept();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="dsa-modal">
        <h2>{dsa?.title}</h2>
        
        {loading && <div>DSA yükleniyor...</div>}
        
        {dsa && (
          <>
            <div className="dsa-content">
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Arial, sans-serif' }}>
                {dsa.content}
              </pre>
            </div>
            
            <div className="dsa-acceptance">
              <label>
                <input 
                  type="checkbox" 
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                />
                Mesafeli Satış Sözleşmesi'ni okudum ve kabul ediyorum.
              </label>
            </div>
            
            <div className="dsa-actions">
              <button onClick={onClose}>İptal</button>
              <button 
                onClick={handleAccept}
                disabled={!accepted}
                className={!accepted ? 'disabled' : 'primary'}
              >
                Kabul Et ve Devam Et
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
```

### 2. Order Creation Flow

Update your order creation flow to include DSA acceptance:

```javascript
const OrderCreationFlow = () => {
  const [showDSA, setShowDSA] = useState(false);
  const [dsaAccepted, setDsaAccepted] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const initiateOrder = (paymentMethod) => {
    setOrderData({ payment_method: paymentMethod });
    setShowDSA(true);
  };

  const handleDSAAccepted = async () => {
    setDsaAccepted(true);
    
    // Proceed with order creation
    try {
      const response = await fetch('/api/osgb/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'x-api-key': process.env.REACT_APP_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Handle successful order creation
        if (orderData.payment_method === 'card' && result.iyzico) {
          // Redirect to Iyzico payment page
          window.location.href = result.iyzico.paymentPageUrl;
        } else {
          // Show success message for EFT/Havale
          showSuccessMessage('Sipariş oluşturuldu! Ödeme bilgileri e-posta ile gönderilecektir.');
        }
      }
    } catch (error) {
      console.error('Order creation failed:', error);
    }
  };

  return (
    <div className="order-creation">
      <div className="payment-methods">
        <button onClick={() => initiateOrder('card')}>
          💳 Kredi Kartı ile Öde
        </button>
        <button onClick={() => initiateOrder('cash')}>
          🏦 EFT/Havale ile Öde
        </button>
      </div>

      <DSAModal 
        isOpen={showDSA}
        onClose={() => setShowDSA(false)}
        onAccept={handleDSAAccepted}
      />
    </div>
  );
};
```

## 📧 Email System Changes

### What Changed for Users

1. **EFT/Havale Orders**: Users now receive emails with DSA immediately after order creation
2. **Card Payments**: Users receive emails with DSA only after successful payment
3. **Payment Failures**: Users receive error emails without DSA
4. **Admin Updates**: Users receive notification emails when admins update their orders

### Email Types Users Will Receive

| Scenario | Email Subject | DSA Included | When Sent |
|----------|---------------|--------------|-----------|
| EFT Order Created | `Sipariş Oluşturuldu - ORDER_ID` | ✅ Yes | Immediately after order creation |
| Card Payment Success | `Ödeme Onaylandı - ORDER_ID` | ✅ Yes | After Iyzico confirms payment |
| Card Payment Failed | `Ödeme Başarısız - ORDER_ID` | ❌ No | After Iyzico reports failure |
| Admin Payment Update | `Ödeme Onaylandı - ORDER_ID` | ❌ No | When admin marks payment as received |
| Admin Discount Applied | `Sipariş Güncellendi - ORDER_ID` | ❌ No | When admin applies discount |

## 🔧 Technical Implementation Notes

### DSA Contract Data Structure

The DSA contract contains the following personalized fields:
- Customer company name
- Tax office (or '-' if not provided)
- Tax number (or '11111111111' as fallback)
- Customer address
- Customer email
- Customer phone
- License price
- Contract date (in Turkish format)

### Error Handling

Always implement proper error handling for the DSA API:

```javascript
const fetchDSAWithErrorHandling = async () => {
  try {
    const response = await fetch('/api/osgb/dsa', {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'x-api-key': process.env.REACT_APP_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'DSA yüklenemedi');
    }

    return data.dsa;
  } catch (error) {
    console.error('DSA fetch error:', error);
    
    // Show user-friendly error message
    showErrorMessage('Sözleşme bilgileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
    
    return null;
  }
};
```

### Performance Considerations

1. **Caching**: Consider caching the DSA content for the session to avoid repeated API calls
2. **Loading States**: Always show loading indicators when fetching DSA
3. **Lazy Loading**: Only fetch DSA when the user initiates order creation

### User Experience Best Practices

1. **Mandatory Acceptance**: Users must explicitly accept the DSA before proceeding
2. **Readable Format**: Display the contract in a scrollable, readable format
3. **Clear Actions**: Provide clear "Accept" and "Cancel" buttons
4. **Progress Indication**: Show users where they are in the order process
5. **Mobile Friendly**: Ensure the DSA modal works well on mobile devices

##  Support

For any questions about the DSA implementation, please contact the backend development team or refer to the complete API documentation.
