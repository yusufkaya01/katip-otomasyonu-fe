import React from 'react';

export default function AdminPagination({ page, perPage, total, onPageChange, onPerPageChange }) {
  const totalPages = Math.ceil(total / perPage);
  return (
    <div className="d-flex flex-column align-items-center my-3">
      <nav aria-label="Sayfalar">
        <ul className="pagination mb-2">
          <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
            <button className="page-link" onClick={() => onPageChange(page - 1)} disabled={page === 1}>Önceki</button>
          </li>
          <li className="page-item disabled"><span className="page-link">{page} / {totalPages || 1}</span></li>
          <li className={`page-item${page === totalPages || totalPages === 0 ? ' disabled' : ''}`}>
            <button className="page-link" onClick={() => onPageChange(page + 1)} disabled={page === totalPages || totalPages === 0}>Sonraki</button>
          </li>
        </ul>
      </nav>
      <div className="d-flex align-items-center">
        <label className="me-2">Sayfa başı:</label>
        <select value={perPage} onChange={e => onPerPageChange(Number(e.target.value))} className="form-select w-auto">
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="ms-3">Toplam: {total}</span>
      </div>
    </div>
  );
}
