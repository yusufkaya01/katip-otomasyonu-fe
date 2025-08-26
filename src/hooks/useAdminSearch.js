import { useState, useMemo } from 'react';

/**
 * Custom hook for dynamic search functionality
 * @param {Object} config - Configuration object
 * @param {Array} config.data - The array of items to search through
 * @param {Array} config.searchFields - Array of field names to search in
 * @param {Function} config.onSearchChange - Optional callback when search changes
 * @param {Function} config.customFilter - Optional custom filter function
 * @returns {Object} - { searchTerm, setSearchTerm, filteredData, searchProps }
 */
export function useAdminSearch({ data = [], searchFields = [], onSearchChange = null, customFilter = null }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    // If no search term, return original data
    if (!searchTerm || searchTerm.trim() === '') {
      return data || [];
    }

    // If no data to search through, return empty array
    if (!data || data.length === 0) {
      return [];
    }

    const normalizedSearchTerm = normalizeTurkishText(searchTerm.trim());
    
    if (customFilter) {
      return data.filter(item => customFilter(item, normalizedSearchTerm));
    }

    return data.filter(item => {
      return searchFields.some(field => {
        const value = getNestedValue(item, field);
        if (value === null || value === undefined) return false;
        
        const originalValue = String(value);
        const normalizedValue = normalizeTurkishText(originalValue);
        
        // Debug logging - you can remove this after testing
        if (searchTerm.includes('iş') || searchTerm.includes('İş') || searchTerm.includes('İŞ') || originalValue.includes('İŞ')) {
          console.log('Turkish Search Debug:', {
            searchTerm: `"${searchTerm}"`,
            normalizedSearchTerm: `"${normalizedSearchTerm}"`,
            originalValue: `"${originalValue}"`,
            normalizedValue: `"${normalizedValue}"`,
            includes: normalizedValue.includes(normalizedSearchTerm),
            field: field
          });
        }
        
        // Check if normalized search term matches normalized value
        return normalizedValue.includes(normalizedSearchTerm);
      });
    });
  }, [data, searchTerm, searchFields, customFilter]);

  // Call onSearchChange callback when search term changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  // Helper function to normalize Turkish characters for search
  function normalizeTurkishText(text) {
    if (!text) return '';
    
    let normalized = String(text);
    
    // First handle uppercase Turkish characters, then lowercase
    normalized = normalized.replace(/İ/g, 'i');   // Turkish İ -> i
    normalized = normalized.replace(/I/g, 'i');   // Regular I -> i  
    normalized = normalized.replace(/ı/g, 'i');   // Turkish ı -> i
    normalized = normalized.replace(/Ğ/g, 'g');   // Turkish Ğ -> g
    normalized = normalized.replace(/ğ/g, 'g');   // Turkish ğ -> g
    normalized = normalized.replace(/Ü/g, 'u');   // Turkish Ü -> u
    normalized = normalized.replace(/ü/g, 'u');   // Turkish ü -> u
    normalized = normalized.replace(/Ş/g, 's');   // Turkish Ş -> s
    normalized = normalized.replace(/ş/g, 's');   // Turkish ş -> s
    normalized = normalized.replace(/Ö/g, 'o');   // Turkish Ö -> o
    normalized = normalized.replace(/ö/g, 'o');   // Turkish ö -> o
    normalized = normalized.replace(/Ç/g, 'c');   // Turkish Ç -> c
    normalized = normalized.replace(/ç/g, 'c');   // Turkish ç -> c
    
    // Finally convert to lowercase
    normalized = normalized.toLowerCase();
    
    return normalized;
  }

  // Helper function to get nested object values (e.g., 'user.name')
  function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Props to spread on the search input
  const searchProps = {
    type: 'text',
    className: 'form-control',
    placeholder: 'Ara...',
    value: searchTerm,
    onChange: handleSearchChange
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
    searchProps
  };
}

/**
 * Search Input Component
 */
export function AdminSearchInput({ searchProps, className = '', ...props }) {
  return (
    <div className={`mb-3 ${className}`}>
      <div className="input-group">
        <span className="input-group-text">
          <i className="bi bi-search"></i>
        </span>
        <input {...searchProps} {...props} />
        {searchProps.value && (
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => searchProps.onChange({ target: { value: '' } })}
            title="Temizle"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </div>
    </div>
  );
}
