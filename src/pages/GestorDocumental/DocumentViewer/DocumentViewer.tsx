import React, { useEffect, useRef, useState } from 'react';
import * as renderDocx from 'docx-preview';
import * as XLSX from 'xlsx';
import './DocumentViewer.css';

export interface AppDocument {
  name: string;
  url: string;      
  type: string;
  urlPdf?: string;  
}

interface DocumentViewerProps {
  document: AppDocument;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [pdfUrl, setPdfUrl] = useState(document.urlPdf);

  useEffect(() => {
    if (!document || !previewRef.current) return;

    const ext = document.name.split('.').pop()?.toLowerCase();
    const container = previewRef.current;
    container.innerHTML = 'Cargando...';
    const dom = window.document;

    // ---------------- DOCX ----------------
    if (ext === 'docx') {
      fetch(document.url)
        .then(res => res.arrayBuffer())
        .then(data => {
          container.innerHTML = '';
          const docxDiv = dom.createElement('div');
          docxDiv.className = 'docx-container';
          docxDiv.style.width = '100%';
          docxDiv.style.height = '100%';
          container.appendChild(docxDiv);
          renderDocx.renderAsync(data, docxDiv);
        });

    // ---------------- PPTX ----------------
    } else if (ext === 'pptx') {
      if (pdfUrl) {
        container.innerHTML = `<iframe src="${pdfUrl}#zoom=1500" class="pdf-frame"></iframe>`;
      } else {
        // Llamar al backend para convertir el PPTX a PDF
        const formData = new FormData();
        fetch(document.url)
          .then(res => res.blob())
          .then(blob => {
            formData.append('file', blob, document.name);

            return fetch('http://localhost:3000/upload', {
              method: 'POST',
              body: formData
            });
          })
          .then(res => res.json())
          .then(data => {
            if (data.pdfUrl) {
              setPdfUrl(data.pdfUrl);
              container.innerHTML = `<iframe src="${data.pdfUrl}#zoom=1500" class="pdf-frame"></iframe>`;
            } else {
              container.innerHTML = 'Error al convertir el PPTX a PDF';
            }
          })
          .catch(() => {
            container.innerHTML = 'Error al convertir el PPTX a PDF';
          });
      }

    // ---------------- XLSX ----------------
    } else if (ext === 'xlsx') {
      fetch(document.url)
        .then(res => res.arrayBuffer())
        .then(data => {
          const wb = XLSX.read(data, { type: 'array' });
          const html = XLSX.utils.sheet_to_html(wb.Sheets[wb.SheetNames[0]]);
          container.innerHTML = `<div class="excel-container">${html}</div>`;
        });

    // ---------------- Imagen ----------------
    } else if (document.type.includes('image')) {
      container.innerHTML = `<img src="${document.url}" alt="${document.name}" style="width:100%;height:100%;object-fit:contain"/>`;

    // ---------------- PDF y otros ----------------
    } else {
      container.innerHTML = `<iframe src="${document.url}#zoom=100" class="pdf-frame"></iframe>`;
    }
  }, [document, pdfUrl]);

  return (
    <div className="document-viewer">
      <div className="viewer-header">
        <h3>{document.name}</h3>
      </div>
      <div className="viewer-content" ref={previewRef}></div>
    </div>
  );
};

export default DocumentViewer;
