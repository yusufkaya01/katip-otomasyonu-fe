const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://customers.katipotomasyonu.com/api';
const ENVIRONMENT = process.env.REACT_APP_ENVIRONMENT || 'production';

// Fetches tax offices data from backend
export async function fetchTaxOffices(API_KEY) {
  const res = await fetch(`${API_BASE_URL}/tax-offices`, {
    headers: {
      'x-api-key': API_KEY
    }
  });
  if (!res.ok) throw new Error('Vergi daireleri alınamadı');
  return res.json();
}
