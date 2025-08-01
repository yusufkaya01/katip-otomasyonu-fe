import { useState, useEffect, useCallback } from 'react';
import { contractsApi } from '../api/contractsApi';

// Custom hook for loading and managing contracts
export const useContracts = (type = 'all') => {
  const [contracts, setContracts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      switch (type) {
        case 'mandatory':
          response = await contractsApi.getMandatoryContracts();
          break;
        case 'optional':
          response = await contractsApi.getOptionalContracts();
          break;
        default:
          response = await contractsApi.getAllContracts();
      }
      
      if (response.success) {
        setContracts(response.data.contracts);
      } else {
        throw new Error(response.message || 'Failed to load contracts');
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  const refetch = () => {
    contractsApi.clearCache();
    loadContracts();
  };

  return {
    contracts,
    loading,
    error,
    refetch
  };
};

// Custom hook for a single contract
export const useContract = (contractId) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadContract = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await contractsApi.getContract(contractId);
      
      if (response.success) {
        setContract(response.data);
      } else {
        throw new Error(response.message || 'Failed to load contract');
      }
    } catch (error) {
      console.error(`Error loading contract ${contractId}:`, error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    if (contractId) {
      loadContract();
    }
  }, [contractId, loadContract]);

  const refetch = () => {
    contractsApi.clearCache();
    loadContract();
  };

  return {
    contract,
    loading,
    error,
    refetch
  };
};

// Hook for managing contract acceptances (for forms)
export const useContractAcceptances = (contractIds = []) => {
  const [acceptances, setAcceptances] = useState({});
  const { contracts, loading, error } = useContracts('all');

  useEffect(() => {
    if (contracts && contractIds.length > 0) {
      let needsInit = false;
      for (const contractId of contractIds) {
        const contract = contracts[contractId];
        if (!contract) continue;
        if (!acceptances[contractId] || acceptances[contractId].version !== contract.version) {
          needsInit = true;
          break;
        }
      }
      if (needsInit) {
        const initialAcceptances = { ...acceptances };
        contractIds.forEach(contractId => {
          const contract = contracts[contractId];
          if (contract) {
            initialAcceptances[contractId] = {
              accepted: false,
              acceptedAt: '',
              version: contract.version,
              mandatory: contract.mandatory
            };
          }
        });
        setAcceptances(initialAcceptances);
      }
    }
  }, [contracts, contractIds, acceptances]);

  const updateAcceptance = (contractId, accepted) => {
    setAcceptances(prev => ({
      ...prev,
      [contractId]: {
        ...prev[contractId],
        accepted,
        acceptedAt: accepted ? new Date().toISOString() : ''
      }
    }));
  };

  const validateMandatoryAcceptances = () => {
    const errors = {};
    Object.entries(acceptances).forEach(([contractId, acceptance]) => {
      if (acceptance.mandatory && !acceptance.accepted) {
        const contract = contracts[contractId];
        errors[contractId] = `${contract.title} onaylanmalıdır.`;
      }
    });
    return errors;
  };

  const getAcceptancePayload = () => {
    const payload = {};
    Object.entries(acceptances).forEach(([contractId, acceptance]) => {
      if (acceptance.accepted) {
        payload[contractId] = {
          accepted: true,
          acceptedAt: acceptance.acceptedAt,
          version: acceptance.version
        };
      }
    });
    return payload;
  };

  return {
    contracts,
    acceptances,
    updateAcceptance,
    validateMandatoryAcceptances,
    getAcceptancePayload,
    loading,
    error
  };
};
