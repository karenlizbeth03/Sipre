import React from "react";
import "./DocumentViewer.css";

interface Document {
  id: string;
  name: string;
  url: string;
}

interface Props {
  document: Document;
  onClose?: () => void; // opcional, para cerrar modal
}

const DocumentViewer: React.FC<Props> = ({ document, onClose }) => {
  if (!document) return <p>No hay documento seleccionado.</p>;

  return (
    <div className="document-viewer">
      <div className="viewer-header">
        <h3>{document.name}</h3>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ✖
          </button>
        )}
      </div>
      <div className="viewer-content">
        <iframe
          src={document.url}
          title={document.name}
          className="pdf-frame"
          width="100%"
          height="600px" 
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
};

export default DocumentViewer;
