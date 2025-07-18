# Frontend Payment Status Polling Report

## Overview
This document describes how the frontend (FE) polls the backend (BE) for payment status after a card payment is initiated via iyzico. It is intended for review with the backend team to ensure both sides are aligned and to identify any missing or mismatched logic.

---

## 1. When Does Polling Start?
- **Polling starts immediately after the FE opens the iyzico payment page in a new tab.**
- The FE does **not** wait for the user to return or for the callback/returnUrl to be hit.
- The FE shows a modal dialog indicating that payment is being processed.

## 2. How is Polling Triggered?
- When the user chooses "Kredi Kartı" and confirms the order:
  - The FE sends a POST to `/osgb/orders` with `{ payment_method: 'card', returnUrl: ... }`.
  - On success, the FE receives an `orderId` and `paymentPageUrl` from the BE.
  - The FE opens `paymentPageUrl` in a new tab.
  - The FE starts polling the BE for the payment status of the given `orderId`.

## 3. Polling Logic
- The FE sends a GET request to `/osgb/orders/{orderId}` every 3 seconds (up to 2 minutes or 40 attempts).
- Each request includes:
  - `x-api-key` header
  - `Authorization: Bearer <user.accessToken>` header
- The FE expects a response with an `order` object containing an `is_paid` field.
- If `order.is_paid` is `true`, the FE shows a success message and stops polling.
- If the order is not paid after 2 minutes, the FE shows a timeout/error message.
- If the BE returns 404, the FE shows an error message.

## 4. User Experience
- The FE modal remains open and updates in real time as the BE status changes.
- The user does not need to return to the FE tab or wait for a redirect.
- There is also a manual "Ödeme Durumunu Kontrol Et" button for the user to check status on demand.

## 5. Example Polling Request
```
GET /osgb/orders/{orderId}
Headers:
  Content-Type: application/json
  x-api-key: <API_KEY>
  Authorization: Bearer <user.accessToken>
```

## 6. Example BE Response (Success)
```
{
  "order": {
    "order_id": "...",
    "is_paid": true,
    ...
  }
}
```

## 7. What Could Go Wrong?
- If the BE does not update `is_paid` promptly after payment, the FE will not show success.
- If the BE does not return the correct `orderId` or the FE uses the wrong one, polling will fail.
- If the BE endpoint is not reachable or returns an unexpected structure, the FE will show an error.

## 8. What to Check with BE
- Is the BE updating `is_paid` as soon as payment is confirmed by iyzico?
- Is the BE endpoint `/osgb/orders/{orderId}` returning the correct structure and status?
- Is the BE handling the callback/returnUrl from iyzico and updating the order status?
- Are there any race conditions or delays in BE processing?

---

## Conclusion
The FE is designed to poll the BE for payment status in real time, independent of the callback/returnUrl. Please review the above logic and ensure the BE is compatible. If any changes are needed on either side, coordinate accordingly.
