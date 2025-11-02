# Frontend Integration Guide: Yearly License Extensions

## Overview
The backend now supports both **monthly** (32 days) and **yearly** (366 days) license extensions. This document outlines all API changes and new features that the frontend team needs to implement.

## 🆕 New Features

### 1. License Extension Types
- **Monthly**: 32 days - 20.00 TL (existing functionality)
- **Yearly**: 366 days - 160.00 TL (new feature)

### 2. Payment Options
- **Monthly Orders**: Direct payment only (no installments)
- **Yearly Orders**: Installment options available (2-9 installments via Iyzico)

---

## 🔄 API Changes

### Order Creation Endpoint

**Endpoint**: `POST /api/osgb/orders`

#### New Optional Parameter
```json
{
  "extension_type": "yearly"  // Options: "monthly" | "yearly"
}
```

#### Request Examples

**Monthly Order (Default - Backward Compatible)**
```json
POST /api/osgb/orders
{
  // No extension_type needed - defaults to "monthly"
}
```

**Yearly Order (New)**
```json
POST /api/osgb/orders
{
  "extension_type": "yearly"
}
```

#### Response Enhancement
All order responses now include extension information:

```json
{
  "success": true,
  "order": {
    "order_id": "ORD_12345",
    "extension_type": "yearly",
    "amount": 16000,
    "created_at": "2024-01-15T10:30:00Z",
    // ... other existing fields
  }
}
```

#### Error Handling
**Invalid Extension Type**
```json
{
  "success": false,
  "message": "Extension type must be either \"monthly\" or \"yearly\""
}
```

---

## 💳 Payment Integration Changes

### Iyzico Payment Response

#### Monthly Orders (Unchanged)
```json
{
  "success": true,
  "order": {
    "order_id": "ORD_12345",
    "extension_type": "monthly",
    "amount": 2000
  },
  "iyzico": {
    "token": "...",
    "paymentPageUrl": "...",
    // No installment options
  }
}
```

#### Yearly Orders (New)
```json
{
  "success": true,
  "order": {
    "order_id": "ORD_12345", 
    "extension_type": "yearly",
    "amount": 16000
  },
  "iyzico": {
    "token": "...",
    "paymentPageUrl": "...",
    "installmentOptions": [2, 3, 4, 5, 6, 7, 8, 9]
  }
}
```

---

## 📧 Order Status & Display

### Admin Order Endpoints Enhancement

All admin order listing endpoints now return enhanced information:

**Endpoints Affected:**
- `GET /api/admin/orders/pending`
- `GET /api/admin/orders/previous` 
- `GET /api/admin/orders/pending-invoices`
- `GET /api/admin/orders/pending-payments`

#### Enhanced Response Format
```json
{
  "orders": [
    {
      "order_id": "ORD_12345",
      "extension_type": "yearly",
      "extension_type_display": "Yıllık (366 gün)",
      "extension_days": 366,
      "amount": 16000,
      "amount_due": 16000,
      // ... other existing fields
    }
  ]
}
```

#### Display Fields Explanation
- `extension_type`: Raw value ("monthly" | "yearly")
- `extension_type_display`: Human-readable Turkish text
- `extension_days`: Number of days (32 or 366)

---

## 🎨 Frontend UI Recommendations

### 1. Order Creation Form

#### License Type Selection
```html
<div class="license-type-selection">
  <h3>Lisans Türü Seçin</h3>
  
  <div class="license-option" data-type="monthly">
    <input type="radio" name="extension_type" value="monthly" checked>
    <label>
      <strong>Aylık Lisans</strong>
      <div class="details">32 gün - 2000 TL</div>
      <div class="payment-info">Tek ödeme</div>
    </label>
  </div>
  
  <div class="license-option" data-type="yearly">
    <input type="radio" name="extension_type" value="yearly">
    <label>
      <strong>Yıllık Lisans</strong>
      <div class="details">366 gün - 16000 TL</div>
      <div class="payment-info">9'a varan taksit seçeneği</div>
    </label>
  </div>
</div>
```

#### JavaScript Integration
```javascript
// Order creation
async function createOrder(extensionType = 'monthly') {
  const response = await fetch('/api/osgb/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'X-API-Key': apiKey
    },
    body: JSON.stringify({
      extension_type: extensionType
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Handle successful order creation
    displayOrderInfo(result.order);
    
    // Check for installment options
    if (result.iyzico?.installmentOptions) {
      showInstallmentOptions(result.iyzico.installmentOptions);
    }
  } else {
    // Handle errors
    showError(result.message);
  }
}
```

### 2. Order Display Components

#### Order List Item
```javascript
function renderOrderItem(order) {
  return `
    <div class="order-item" data-order-id="${order.order_id}">
      <div class="order-header">
        <span class="order-id">${order.order_id}</span>
        <span class="extension-badge ${order.extension_type}">
          ${order.extension_type_display}
        </span>
      </div>
      <div class="order-details">
        <div class="amount">${(order.amount / 100).toFixed(2)} TL</div>
        <div class="days">${order.extension_days} gün uzatım</div>
        <div class="date">${formatDate(order.created_at)}</div>
      </div>
    </div>
  `;
}
```

#### CSS Styling
```css
.extension-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.extension-badge.monthly {
  background-color: #e3f2fd;
  color: #1976d2;
}

.extension-badge.yearly {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.license-option {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.license-option:hover {
  border-color: #2196f3;
}

.license-option input:checked + label {
  border-color: #2196f3;
  background-color: #f5f5f5;
}

.savings {
  color: #4caf50;
  font-weight: bold;
  font-size: 14px;
}
```

### 3. Payment Flow Updates

#### Installment Selection (Yearly Orders Only)
```javascript
function showInstallmentOptions(installments) {
  const container = document.getElementById('installment-options');
  
  if (!installments || installments.length === 0) {
    container.style.display = 'none';
    return;
  }
  
  container.innerHTML = `
    <h4>Taksit Seçenekleri</h4>
    <div class="installment-grid">
      ${installments.map(count => `
        <button class="installment-option" data-installments="${count}">
          ${count} Taksit
          <small>${(160.00 / count).toFixed(2)} TL/ay</small>
        </button>
      `).join('')}
    </div>
  `;
  
  container.style.display = 'block';
}
```

---

## 🔍 Testing & Validation

### 1. Test Cases for Frontend

#### Order Creation Tests
```javascript
// Test monthly order (default)
await createOrder(); // Should default to monthly

// Test yearly order
await createOrder('yearly');

// Test invalid extension type
await createOrder('invalid'); // Should show error

// Test missing extension type
await createOrder(null); // Should default to monthly
```

#### Display Tests
- Verify order badges show correct extension type
- Check pricing displays correctly (20.00 TL vs 160.00 TL)
- Confirm installment options only show for yearly orders
- Test responsive design with new UI elements

### 2. User Flow Testing

#### Complete Order Flow
1. **Selection**: User selects yearly license option
2. **Creation**: Order created with `extension_type: "yearly"`
3. **Payment**: Iyzico shows installment options (2-9 taksit)
4. **Confirmation**: Order shows as "Yıllık (366 gün)" in admin panel
5. **License Extension**: Customer receives 366 days upon payment

---

## 📱 Mobile Considerations

### Responsive Design
- Ensure license type selection works on mobile
- Make extension badges readable on small screens
- Optimize installment selection for touch interfaces

### Performance
- New API responses are minimal (only a few extra fields)
- No impact on existing API performance
- Backward compatibility maintained

---

## ⚠️ Important Notes

### Backward Compatibility
- **All existing frontend code continues to work**
- Orders without `extension_type` default to "monthly"
- No breaking changes to existing API responses
- Existing payment flows unchanged

### Migration Strategy
1. **Phase 1**: Update order creation form to support extension type selection
2. **Phase 2**: Update order display components to show extension information
3. **Phase 3**: Implement installment selection for yearly orders
4. **Phase 4**: Update admin interfaces with enhanced order information

### Error Handling
- Always handle both monthly and yearly responses
- Graceful fallback for missing extension_type fields
- Proper validation before sending extension_type parameter

---

## 🚀 Deployment Checklist

### Frontend Tasks
- [ ] Update order creation form with license type selection
- [ ] Add extension type display in order lists
- [ ] Implement installment options for yearly orders
- [ ] Update admin order management interfaces
- [ ] Add appropriate styling for new UI elements
- [ ] Test all user flows with both license types
- [ ] Verify mobile responsiveness
- [ ] Update any hardcoded "32 gün" text to be dynamic

### Backend Dependencies
- [ ] Database migration applied (extension_type column)
- [ ] Environment variables updated (.env file)
- [ ] Application restarted with new code

---

## 📞 Support

### Questions or Issues?
- **Backend API**: Check the main implementation guide (`YEARLY_LICENSE_IMPLEMENTATION.md`)
- **Testing**: Use the provided test script (`test_yearly_license.js`)
- **Integration**: Refer to this document and test with Postman/curl

### API Testing Examples

**Create Monthly Order**
```bash
curl -X POST "https://your-api.com/api/osgb/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{"extension_type": "monthly"}'
```

**Create Yearly Order**
```bash
curl -X POST "https://your-api.com/api/osgb/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{"extension_type": "yearly"}'
```

---

*This document covers all frontend integration requirements for the yearly license feature. The implementation maintains full backward compatibility while adding powerful new functionality for customers and administrators.*