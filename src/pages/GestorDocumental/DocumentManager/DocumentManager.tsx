import React, { useState, useRef } from "react";
import DocumentUpload from "../DocumentUpload/DocumentUpload";
import DocumentListPage from "../DocumentListPage";
import "./DocumentManager.css";
import DocumentViewer from "../DocumentViewer/DocumentViewer";

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  url: string;
}

const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const uploadRef = useRef<{ triggerUpload: () => void }>(null);

  const handleUpload = (files: FileList) => {
    const fileArray = Array.from(files);

    Promise.all(
      fileArray.map((file) => {
        return new Promise<Document>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              id: Math.random().toString(36).substr(2, 9),
              name: file.name,
              type: file.type,
              size: file.size,
              uploadDate: new Date(),
              url: e.target?.result as string,
            });
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
      })
    )
      .then((newDocuments) => {
        setDocuments((prev) => [...prev, ...newDocuments]);
      })
      .catch((err) => {
        console.error("Error leyendo archivos:", err);
      });
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleDownload = (doc: Document) => {
    const link = document.createElement("a");
    link.href = doc.url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = (doc: Document) => {
    const newName = prompt("Nuevo nombre para el documento:", doc.name);
    if (newName) {
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, name: newName } : d))
      );
    }
  };

  const handleView = (doc: Document) => {
    setSelectedDocument(doc); // ✅ abre el modal
  };

  return (
    <div className="document-manager">
      <div className="document-header">
        <h2>Gestión de Documentos</h2>
        <button
          className="subirdocs-btn"
          onClick={() => uploadRef.current?.triggerUpload()}
        >
          Subir Documentos
        </button>
      </div>

      <DocumentListPage
        documents={documents}
        onDelete={handleDelete}
        onDownload={handleDownload}
        onEdit={handleEdit}
        onView={handleView}
      />

      <DocumentUpload ref={uploadRef} onUpload={handleUpload} />

      {/* ✅ Modal para ver documentos */}
      {selectedDocument && (
  <div className="modal-overlay" onClick={() => setSelectedDocument(null)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button
        className="close-btn"
        onClick={() => setSelectedDocument(null)}
      >
        ✖
      </button>

      {/* 👇 Aquí usamos DocumentViewer */}
      <DocumentViewer document={selectedDocument} />
    </div>
  </div>
)}
    </div>
  );
};

export default DocumentManager;
