import React, { useState, useRef } from "react";
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

const DocumentManager: React.FC = () => {
  const { sections } = useMenu(); // ✅ obtenemos secciones del menú
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalType, setModalType] = useState<"edit" | "menu" | "delete" | null>(null);
  const [modalDoc, setModalDoc] = useState<Document | null>(null);
  const [tempValue, setTempValue] = useState("");
  const uploadRef = useRef<{ triggerUpload: () => void }>(null);

  const handleUpload = (files: FileList) => {
    const fileArray = Array.from(files);

    Promise.all(
      fileArray.map(
        (file) =>
          new Promise<Document>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const newDoc: Document = {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                type: file.type,
                size: file.size,
                uploadDate: new Date(),
                url: e.target?.result as string,
              };

              setModalType("menu"); // abrir modal para seleccionar sección
              setModalDoc(newDoc);
              setTempValue("");
              resolve(newDoc);
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          })
      )
    )
      .then((newDocs) => {
        setDocuments((prev) => [...prev, ...newDocs]);
        const stored = JSON.parse(localStorage.getItem("documents") || "[]");
        localStorage.setItem("documents", JSON.stringify([...stored, ...newDocs]));
      })
      .catch((err) => console.error("Error leyendo archivos:", err));
  };

  const handleDelete = (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;
    setModalType("delete");
    setModalDoc(doc);
  };

  const confirmDelete = () => {
    if (!modalDoc) return;
    setDocuments((prev) => prev.filter((d) => d.id !== modalDoc.id));
    setModalType(null);
    setModalDoc(null);
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
    setModalType("edit");
    setModalDoc(doc);
    setTempValue(doc.name);
  };

  const handleView = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const saveModalChanges = () => {
    if (!modalDoc) return;

    if (modalType === "edit") {
      setDocuments((prev) =>
        prev.map((d) => (d.id === modalDoc.id ? { ...d, name: tempValue } : d))
      );
    }

    if (modalType === "menu") {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === modalDoc.id ? { ...d, menuId: tempValue } : d
        )
      );

      const stored = JSON.parse(localStorage.getItem("documents") || "[]");
      localStorage.setItem(
        "documents",
        JSON.stringify(
          stored.map((d: Document) =>
            d.id === modalDoc.id ? { ...d, menuId: tempValue } : d
          )
        )
      );
    }

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
        sections={sections} // ✅ pasamos secciones al listado
        onDelete={handleDelete}
        onDownload={handleDownload}
        onEdit={handleEdit}
        onView={handleView}
      />

      <DocumentUpload ref={uploadRef} onUpload={handleUpload} />

      {/* Modal para ver documentos */}
      {selectedDocument && (
        <div className="modal-overlay" onClick={() => setSelectedDocument(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedDocument(null)}>✖</button>
            <DocumentViewer document={selectedDocument} />
          </div>
        </div>
      )}

      {/* Modal para editar / menú / eliminar */}
      {modalType && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            {modalType === "delete" ? (
              <>
                <h3>¿Eliminar documento?</h3>
                <p>
                  Estás a punto de eliminar <b>{modalDoc?.name}</b>.
                  Esta acción no se puede deshacer.
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
