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
  path: string;
  state: number;
  updatedAt: string;
  user_edit?: {
    id: string;
    name: string;
  };
}

const API_BASE = "http://192.168.2.181:3000";

const DocumentManager: React.FC = () => {
  const { sections, setSections } = useMenu();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [modalDoc, setModalDoc] = useState<Document | null>(null);
  const [modalType, setModalType] = useState<"edit" | "delete" | null>(null);
  const [tempName, setTempName] = useState("");
  const [tempMenuId, setTempMenuId] = useState("");
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const uploadRef = useRef<{ triggerUpload: () => void }>(null);

  // ===================== 🔐 HEADERS =====================
  const authHeaders = (contentType = "application/json") => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": contentType,
      Authorization: `Bearer ${token}`,
    };
  };

  // ===================== 📁 MENÚS =====================
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch(`${API_BASE}/menus`, { headers: authHeaders() });
        if (res.status === 401) throw new Error("No autorizado");
        const data = await res.json();
        setSections(data.data || []);
      } catch (err) {
        console.error(" Error cargando menús:", err);
      }
    };
    fetchMenus();
  }, [setSections]);

  // ===================== 📄 DOCUMENTOS =====================
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/documents`, {
          headers: authHeaders(),
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Error al cargar documentos");

        const normalizedDocs = (data.data || []).map((doc: any) => ({
          ...doc,
          menuId: doc.menu?.id || "",
        }));

        setDocuments(normalizedDocs);
      } catch (error) {
        console.error("Error cargando documentos:", error);
        setStatusMessage(" Error al cargar documentos. Verifique su conexión o sesión.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // ===================== 📤 SUBIR DOCUMENTOS =====================
  const handleUpload = async (files: FileList, menuId: string) => {
    const fileArray = Array.from(files);
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    for (const file of fileArray) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);
      formData.append("menu_id", menuId);
      if (userId) formData.append("user_id", userId);

      try {
        const res = await fetch(`${API_BASE}/documents`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(`Error ${res.status}: ${data.message}`);

        setDocuments((prev) => [...prev, data.data]);
      } catch (err) {
        console.error(" Error subiendo documento:", err);
        alert("Error subiendo documento. Revisa consola para más detalles.");
      }
    }
  };

  // ===================== EDITAR / ELIMINAR =====================
  const handleDelete = (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;
    setModalType("delete");
    setModalDoc(doc);
  };

  const confirmDelete = async () => {
    if (!modalDoc) return;
    try {
      await fetch(`${API_BASE}/documents/${modalDoc.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      setDocuments((prev) => prev.filter((d) => d.id !== modalDoc.id));
    } catch (err) {
      console.error(" Error eliminando documento:", err);
    }
    setModalType(null);
    setModalDoc(null);
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

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");
    const formData = new FormData();

    formData.append("id", modalDoc.id);
    formData.append("name", tempName);
    formData.append("menu_id", tempMenuId);
    if (userId) formData.append("user_id", userId);
    if (tempFile) formData.append("file", tempFile);

    try {
      const res = await fetch(`${API_BASE}/documents`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(`Error ${res.status}: ${JSON.stringify(data)}`);

      setDocuments((prev) =>
        prev.map((d) => (d.id === data.data.id ? data.data : d))
      );
    } catch (err) {
      console.error("Error actualizando documento:", err);
      alert("Error actualizando documento. Revisa consola para más detalles.");
    }

    setModalType(null);
    setModalDoc(null);
  };

  const handleView = (doc: Document) => setSelectedDocument(doc);

  const handleSectionChange = (docId: string, sectionId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, menuId: sectionId } : doc))
    );

    fetch(`${API_BASE}/documents/${docId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ menuId: sectionId }),
    }).catch((err) => console.error("Error guardando en backend:", err));
  };

  // ===================== RENDER =====================
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

      {/* 🔹 DocumentUpload maneja su propio modal */}
      <DocumentUpload
        ref={uploadRef}
        onUpload={handleUpload}
        sections={sections}
      />

      <DocumentListPage
        documents={documents}
        sections={sections}
        onDelete={handleDelete}
        onDownload={(doc) => window.open(`${API_BASE}/uploads/${doc.path}`, "_blank")}
        onEdit={handleEdit}
        onView={handleView}
        onSectionChange={handleSectionChange}
      />

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
            <DocumentViewer
              document={{
                ...selectedDocument,
                url: `${API_BASE}/documents/view/${selectedDocument.id}`,
              }}
            />
          </div>
        </div>
      )}

      {/* Modal editar / eliminar */}
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
                    <React.Fragment key={sec.id}>
                      <option value={sec.id}>{sec.name}</option>
                      {sec.children?.map((child) => (
                        <option key={child.id} value={child.id}>
                          └─ {child.name}
                        </option>
                      ))}
                    </React.Fragment>
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
