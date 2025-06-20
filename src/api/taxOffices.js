// Fetches tax offices data from backend
export async function fetchTaxOffices(API_KEY) {
  const res = await fetch('https://customers.katipotomasyonu.com/api/tax-offices', {
    headers: {
      'x-api-key': API_KEY
    }
  });
  if (!res.ok) throw new Error('Vergi daireleri alınamadı');
  return res.json();
}
