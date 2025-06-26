import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchTaxOffices } from '../api/taxOffices';

const TaxOfficesContext = createContext();

export function TaxOfficesProvider({ children }) {
  const [taxOffices, setTaxOffices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchTaxOffices(process.env.REACT_APP_USER_API_KEY);
        setTaxOffices(data);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <TaxOfficesContext.Provider value={{ taxOffices, loading, error }}>
      {children}
    </TaxOfficesContext.Provider>
  );
}

export function useTaxOffices() {
  return useContext(TaxOfficesContext);
}
