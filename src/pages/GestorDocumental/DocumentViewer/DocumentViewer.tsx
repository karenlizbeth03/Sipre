import React, { useEffect, useRef } from 'react';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';
import './DocumentViewer.css';

// Renombramos la interfaz para evitar conflictos con el DOM
export interface AppDocument {
  name: string;
  url: string;
  type: string;
}

interface DocumentViewerProps {
  document: AppDocument;
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
          const docxDiv = window.document.createElement('div');
          docxDiv.className = 'docx-container';
          docxDiv.style.width = '100%';
          docxDiv.style.height = '100%';
          container.appendChild(docxDiv);
          renderAsync(data, docxDiv);
        });
    } else if (ext === 'xlsx') {
      fetch(document.url)
        .then(res => res.arrayBuffer())
        .then(data => {
          const wb = XLSX.read(data, { type: 'array' });
          const html = XLSX.utils.sheet_to_html(wb.Sheets[wb.SheetNames[0]]);
          container.innerHTML = `
            <div class="excel-container">${html}</div>
          `;
        });
    } else if (document.type.includes('image')) {
      container.innerHTML = `
        <img src="${document.url}" 
             alt="${document.name}" 
             style="width:100%;height:100%;object-fit:contain"/>
      `;
    } else {
  // PDF y otros tipos → iframe en tamaño completo
  container.innerHTML = `
    <iframe 
      src="${document.url}#zoom=1500" 
      class="pdf-frame">
    </iframe>
  `;
}

  }, [document]);

  return (
    <div className="document-viewer">
      <div className="viewer-header">
        <h3>{document.name}</h3>
      </div>
      <div className="viewer-content" ref={previewRef}>
        {/* El contenido dinámico se renderiza aquí */}
      </div>
    </div>
  );
};

export default DocumentViewer;
