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
  uploadDate: Date;
  url: string;
  menuId?: string;
}

const API_URL = "http://localhost:4000";

const DocumentManager: React.FC = () => {
  const { sections } = useMenu();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalType, setModalType] = useState<"edit" | "menu" | "delete" | null>(null);
  const [modalDoc, setModalDoc] = useState<Document | null>(null);
  const [tempValue, setTempValue] = useState("");
  const uploadRef = useRef<{ triggerUpload: () => void }>(null);

  // 📌 Cargar documentos del backend
  useEffect(() => {
    fetch(`${API_URL}/documents`)
      .then((res) => res.json())
      .then((data) => setDocuments(data))
      .catch((err) => console.error("Error cargando docs:", err));
  }, []);

  // 📌 Subir documentos al backend
  const handleUpload = async (files: FileList) => {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const newDoc = await res.json();
      setDocuments((prev) => [...prev, newDoc]);

      // 🚨 Abrir modal para asignar sección
      setModalDoc(newDoc);
      setModalType("menu");
      setTempValue("");
    }
  };

  // 📌 Eliminar documento
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
    setTempValue(doc.name);
  };

  const handleView = (doc: Document) => {
    setSelectedDocument(doc);
  };

  // 📌 Guardar cambios (editar nombre o asignar sección)
  const saveModalChanges = async () => {
    if (!modalDoc) return;

    let updatedDoc = { ...modalDoc };

    if (modalType === "edit") {
      updatedDoc = { ...modalDoc, name: tempValue };
    }

    if (modalType === "menu") {
      updatedDoc = { ...modalDoc, menuId: tempValue };
    }

    // 👉 Guardar en backend
    await fetch(`${API_URL}/documents/${modalDoc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedDoc),
    });

    // 👉 Actualizar en frontend
    setDocuments((prev) =>
      prev.map((d) => (d.id === modalDoc.id ? updatedDoc : d))
    );

    setModalType(null);
    setModalDoc(null);
    setTempValue("");
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        documents={filteredDocuments}
        sections={sections}
        onDelete={handleDelete}
        onDownload={handleDownload}
        onEdit={handleEdit}
        onView={handleView}
      />

      <DocumentUpload ref={uploadRef} onUpload={handleUpload} />

      {/* Modal de visor */}
      {selectedDocument && (
        <div className="modal-overlay" onClick={() => setSelectedDocument(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedDocument(null)}>✖</button>
            <DocumentViewer document={selectedDocument} />
          </div>
        </div>
      )}

      {/* Modal de editar / menú / eliminar */}
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
                  <button className="cancel-btn" onClick={() => setModalType(null)}>Cancelar</button>
                  <button className="delete-btn" onClick={confirmDelete}>Eliminar</button>
                </div>
              </>
            ) : (
              <>
                <h3>
                  {modalType === "edit"
                    ? "Editar nombre del documento"
                    : "Asignar apartado del menú"}
                </h3>

                {modalType === "edit" ? (
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    placeholder="Nuevo nombre..."
                    className="modal-input"
                  />
                ) : (
                  <select
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="modal-input"
                  >
                    <option value="">-- Seleccionar sección --</option>
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>{sec.title}</option>
                    ))}
                  </select>
                )}

                <div className="modal-actions">
                  <button className="cancel-btn" onClick={() => setModalType(null)}>Cancelar</button>
                  <button className="save-btn" onClick={saveModalChanges}>Guardar</button>
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
