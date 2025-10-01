import React, { useState } from "react";
import galaImg from '../../assets/gala.jpg';
import type { Document } from "../../types";
import {
  AiOutlineFileExcel,
  AiOutlineEye,
  AiOutlineDownload,
} from "react-icons/ai";
import "./DocumentsPanel.css";

interface DocumentsPanelProps {
  documents: Document[];
}

const DocumentsPanel: React.FC<DocumentsPanelProps> = ({ documents }) => {
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  if (!documents || documents.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '32px' }}>
        <img src={galaImg} alt="Sin documentos" style={{ maxWidth: '320px', width: '100%', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.10)' }} />
        <span style={{ marginTop: '18px', color: '#888', fontSize: '1.1rem' }}>No hay documentos para esta sección.</span>
      </div>
    );
  }

  return (
    <div className="documents-panel">
      <h2>Documentos</h2>
      <div className="doc-grid">
        {documents.map((doc) => (
          <div key={doc.id} className="doc-card">
            <div className="doc-icon">
              <AiOutlineFileExcel size={40} color="#2e7d32" />
            </div>
            <div className="doc-info">
              <p className="doc-name">{doc.name}</p>
              <div className="doc-actions">
                <button
                  className="icon-btn"
                  onClick={() => setPreviewDoc(doc)}
                  title="Ver"
                >
                  <AiOutlineEye />
                </button>
                <a
                  href={doc.url}
                  download={doc.name}
                  className="icon-btn"
                  title="Descargar"
                >
                  <AiOutlineDownload />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {previewDoc && (
        <div className="preview-modal">
          <div className="preview-content">
            <h3>{previewDoc.name}</h3>
            {previewDoc.type.includes("pdf") ? (
              <iframe
                src={previewDoc.url}
                title={previewDoc.name}
                className="doc-preview"
              />
            ) : (
              <p> Este tipo de archivo no se puede previsualizar aquí.</p>
            )}
            <button
              className="close-btn"
              onClick={() => setPreviewDoc(null)}
              title="Cerrar"
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPanel;
