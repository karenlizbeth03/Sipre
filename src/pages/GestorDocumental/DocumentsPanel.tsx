import React from "react";
import type { Document } from "../../types";
import "./DocumentsPanel.css";

interface DocumentsPanelProps {
  documents: Document[];
}

const DocumentsPanel: React.FC<DocumentsPanelProps> = ({ documents }) => {
  if (!documents || documents.length === 0) {
    return <p>No hay documentos para esta sección.</p>;
  }

  return (
    <div className="documents-panel">
      <h2>Documentos</h2>
      <ul>
        {documents.map((doc) => (
          <li key={doc.id} className="doc-item">
            <a href={doc.url} target="_blank" rel="noreferrer">
              📄 {doc.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentsPanel;
