import React from 'react';
import { useContracts, useContract } from '../hooks/useContracts';
import ContractModal from '../components/ContractModal';

// Example page demonstrating contracts API usage
function ContractsExamplePage() {
  const { contracts, loading, error, refetch } = useContracts('all');
  const { contract: termsContract } = useContract('terms_of_use');
  const [modalState, setModalState] = React.useState({ open: false, contract: null });

  const openContractModal = (contract) => {
    setModalState({ open: true, contract });
  };

  const closeContractModal = () => {
    setModalState({ open: false, contract: null });
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
          <p className="mt-2">Sözleşmeler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h5>Hata</h5>
          <p>{error}</p>
          <button className="btn btn-outline-danger" onClick={refetch}>
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">Sözleşmeler ve Politikalar</h2>
      
      <div className="row">
        <div className="col-md-8">
          <h4>Tüm Sözleşmeler</h4>
          <div className="list-group">
            {contracts && Object.entries(contracts).map(([contractId, contract]) => (
              <div key={contractId} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">
                      {contract.title}
                      {contract.mandatory && <span className="badge bg-danger ms-2">Zorunlu</span>}
                      {!contract.mandatory && <span className="badge bg-secondary ms-2">İsteğe Bağlı</span>}
                    </h6>
                    <p className="mb-1 text-muted">{contract.shortDescription}</p>
                    <small className="text-muted">
                      Versiyon: {contract.version} | 
                      Kategori: {contract.category} |
                      Yürürlük: {new Date(contract.effectiveDate).toLocaleDateString('tr-TR')}
                    </small>
                  </div>
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => openContractModal(contract)}
                  >
                    Görüntüle
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h4 className="mt-5">API Kullanım Örnekleri</h4>
          <div className="bg-light p-3 rounded">
            <h6>Hook Kullanımı:</h6>
            <pre className="mb-3">
{`// Tüm sözleşmeler
const { contracts, loading, error } = useContracts('all');

// Sadece zorunlu sözleşmeler
const { contracts } = useContracts('mandatory');

// Tek bir sözleşme
const { contract } = useContract('terms_of_use');

// Sözleşme kabulleri yönetimi
const { acceptances, updateAcceptance, validateMandatoryAcceptances } = 
  useContractAcceptances(['terms_of_use', 'privacy_policy']);`}
            </pre>

            <h6>API Client Kullanımı:</h6>
            <pre>
{`import { contractsApi } from '../api/contractsApi';

// Tüm sözleşmeler
const response = await contractsApi.getAllContracts();

// Zorunlu sözleşmeler
const mandatory = await contractsApi.getMandatoryContracts();

// Tek sözleşme
const contract = await contractsApi.getContract('terms_of_use');`}
            </pre>
          </div>
        </div>

        <div className="col-md-4">
          <h4>Özet</h4>
          <div className="card">
            <div className="card-body">
              <p><strong>Toplam Sözleşme:</strong> {contracts ? Object.keys(contracts).length : 0}</p>
              <p><strong>Zorunlu:</strong> {contracts ? Object.values(contracts).filter(c => c.mandatory).length : 0}</p>
              <p><strong>İsteğe Bağlı:</strong> {contracts ? Object.values(contracts).filter(c => !c.mandatory).length : 0}</p>
              
              <hr />
              
              <h6>Örnek Sözleşme (Terms):</h6>
              {termsContract ? (
                <div>
                  <p><strong>Başlık:</strong> {termsContract.title}</p>
                  <p><strong>Versiyon:</strong> {termsContract.version}</p>
                  <p><strong>Zorunlu:</strong> {termsContract.mandatory ? 'Evet' : 'Hayır'}</p>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => openContractModal(termsContract)}
                  >
                    Görüntüle
                  </button>
                </div>
              ) : (
                <p className="text-muted">Yükleniyor...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contract Modal */}
      <ContractModal
        contract={modalState.contract}
        isOpen={modalState.open}
        onClose={closeContractModal}
        showAcceptButton={false}
      />
    </div>
  );
}

export default ContractsExamplePage;
