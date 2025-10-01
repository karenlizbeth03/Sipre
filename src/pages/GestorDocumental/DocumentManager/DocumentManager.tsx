// DocumentManager.tsx
import React, { useState, useEffect, useRef } from "react";
import DocumentUpload from "../DocumentUpload/DocumentUpload";
import DocumentListPage from "../DocumentListPage";
import "./DocumentManager.css";
import DocumentViewer from "../DocumentViewer/DocumentViewer";
import { useMenu } from "../../../hooks/useMenu";

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  url: string;
  menuId?: string;
}

const API_URL = "http://localhost:4000";

const DocumentManager: React.FC = () => {
  const { sections } = useMenu();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [modalDoc, setModalDoc] = useState<Document | null>(null);
  const [modalType, setModalType] = useState<"edit" | "delete" | null>(null);
  const [tempName, setTempName] = useState("");
  const [tempMenuId, setTempMenuId] = useState("");
  const [tempFile, setTempFile] = useState<File | null>(null);

  const uploadRef = useRef<{ triggerUpload: () => void }>(null);

  useEffect(() => {
    fetch(`${API_URL}/documents`)
      .then((res) => res.json())
      .then((data) => setDocuments(data))
      .catch((err) => console.error("Error cargando docs:", err));
  }, []);

const handleUpload = async (files: FileList, menuId: string) => {
  const fileArray = Array.from(files);

  for (const file of fileArray) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("menuId", String(menuId)); 

    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    const newDoc = await res.json();
    // Ensure menuId is string in frontend state
    setDocuments((prev) => [...prev, { ...newDoc, menuId: String(newDoc.menuId) }]);
  }
};



  const handleDelete = (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;
    setModalType("delete");
    setModalDoc(doc);
  };

  const confirmDelete = async () => {
    if (!modalDoc) return;

    await fetch(`${API_URL}/documents/${modalDoc.id}`, {
      method: "DELETE",
    });

    setDocuments((prev) => prev.filter((d) => d.id !== modalDoc.id));
    setModalType(null);
    setModalDoc(null);
  };

  const handleDownload = (doc: Document) => {
    window.open(doc.url, "_blank");
  };

  const handleEdit = (doc: Document) => {
    setModalType("edit");
    setModalDoc(doc);
    setTempName(doc.name);
    setTempMenuId(doc.menuId || "");
    setTempFile(null);
  };

  const saveModalChanges = async () => {
    if (!modalDoc) return;

    const formData = new FormData();
    formData.append("name", tempName);
    formData.append("menuId", tempMenuId);
    if (tempFile) {
      formData.append("file", tempFile);
    }

    const res = await fetch(`${API_URL}/documents/${modalDoc.id}`, {
      method: "PUT",
      body: formData,
    });

    const updatedDoc = await res.json();

    setDocuments((prev) =>
      prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
    );

    setModalType(null);
    setModalDoc(null);
  };

  const handleView = (doc: Document) => {
    setSelectedDocument(doc);
  };
  const handleSectionChange = (docId: string, sectionId: string) => {
  const updatedDocs = documents.map((doc) =>
    doc.id === docId ? { ...doc, menuId: sectionId } : doc
  );
   setDocuments(updatedDocs);

  localStorage.setItem("documents", JSON.stringify(updatedDocs));

  fetch(`http://localhost:4000/documents/${docId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ menuId: sectionId }),
  }).catch((err) => console.error("❌ Error guardando en backend:", err));

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
        sections={sections}
        onDelete={handleDelete}
        onDownload={handleDownload}
        onEdit={handleEdit}
        onView={handleView}
        onSectionChange={handleSectionChange}
      />

      <DocumentUpload ref={uploadRef} onUpload={handleUpload} />


      {selectedDocument && (
        <div className="modal-overlay" onClick={() => setSelectedDocument(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedDocument.name}</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedDocument(null)}
                title="Cerrar"
              >
                ✖
              </button>
            </div>
            <DocumentViewer document={selectedDocument} />
          </div>
        </div>
      )}

      {modalType && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            {modalType === "delete" ? (
              <>
                <h3>¿Eliminar documento?</h3>
                <p>
                  Estás a punto de eliminar <b>{modalDoc?.name}</b>.
                </p>
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={() => setModalType(null)}>
                    Cancelar
                  </button>
                  <button className="delete-btn" onClick={confirmDelete}>
                    Eliminar
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Editar documento</h3>
                <label>Nombre:</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="modal-input"
                />

                <label>Sección:</label>
                <select
                  value={tempMenuId}
                  onChange={(e) => setTempMenuId(e.target.value)}
                  className="modal-input"
                >
                  <option value="">-- Seleccionar sección --</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.title}
                    </option>
                  ))}
                </select>

                <label>Reemplazar archivo:</label>
                <input
                  type="file"
                  onChange={(e) =>
                    setTempFile(e.target.files ? e.target.files[0] : null)
                  }
                  className="modal-input"
                />

                <div className="modal-actions">
                  <button className="cancel-btn" onClick={() => setModalType(null)}>
                    Cancelar
                  </button>
                  <button className="save-btn" onClick={saveModalChanges}>
                    Guardar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
