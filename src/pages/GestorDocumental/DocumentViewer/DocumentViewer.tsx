
import React, { useEffect, useRef } from 'react';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';
import './DocumentViewer.css';

export interface Document {
  name: string;
  url: string;
  type: string;
}

interface DocumentViewerProps {
  document: Document;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!document || !previewRef.current) return;

    const ext = document.name.split('.').pop()?.toLowerCase();
    const container = previewRef.current;

    container.innerHTML = 'Cargando...';

    if (ext === 'docx') {
      fetch(document.url)
        .then(res => res.arrayBuffer())
        .then(data => {
          container.innerHTML = '';
          renderAsync(data, container);
        });
    } else if (ext === 'xlsx') {
  fetch(document.url)
    .then(res => res.arrayBuffer())
    .then(data => {
      const wb = XLSX.read(data, { type: 'array' });
      const html = XLSX.utils.sheet_to_html(wb.Sheets[wb.SheetNames[0]]);
      container.innerHTML = `<div class="excel-container">${html}</div>`;
    });
}
 else if (document.type.includes('image')) {
      container.innerHTML = `<img src="${document.url}" alt="${document.name}" style="max-width:100%;"/>`;
    } else {
      container.innerHTML = `
        <iframe src="${document.url}" width="100%" height="600px" style="border:none;"></iframe>
      `;
    }
  }, [document]);

  return (
    <div className="document-viewer">
      <div className="viewer-header">
        <h3>{document.name}</h3>
      </div>
      <div
        className="viewer-content"
        ref={previewRef}
        style={{ minHeight: '600px', border: '1px solid #ccc', padding: 10 }}
      >
        {/* El contenido dinámico se renderiza dentro de previewRef */}
      </div>
    </div>
  );
};

export default DocumentViewer;
