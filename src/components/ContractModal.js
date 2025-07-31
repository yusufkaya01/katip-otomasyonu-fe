import React from 'react';

const ContractModal = ({ contract, isOpen, onClose, onAccept, showAcceptButton = true }) => {
  if (!isOpen || !contract) return null;

  const handleAccept = () => {
    if (onAccept) {
      onAccept(contract.id);
    }
    onClose();
  };

  return (
    <div className="modal fade show" style={{display:'block', background:'rgba(0,0,0,0.5)'}} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{contract.title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body" style={{maxHeight: '60vh', overflowY: 'auto'}}>
            <div className="contract-content" style={{whiteSpace:'pre-line'}}>
              {contract.content}
            </div>
            {contract.version && contract.effectiveDate && (
              <div className="contract-meta mt-3 pt-3 border-top">
                <small className="text-muted">
                  <strong>Versiyon:</strong> {contract.version} | {' '}
                  <strong>Yürürlük Tarihi:</strong> {new Date(contract.effectiveDate).toLocaleDateString('tr-TR')}
                </small>
              </div>
            )}
          </div>
          <div className="modal-footer">
            {showAcceptButton && contract.mandatory && (
              <button type="button" className="btn btn-danger" onClick={handleAccept}>
                Okudum, onaylıyorum
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractModal;
