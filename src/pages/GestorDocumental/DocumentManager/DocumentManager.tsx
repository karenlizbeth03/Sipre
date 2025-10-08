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

const API_BASE = "http://192.168.2.169:3000";

const DocumentManager: React.FC = () => {
  const { sections, setSections } = useMenu();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [modalDoc, setModalDoc] = useState<Document | null>(null);
  const [modalType, setModalType] = useState<"edit" | "delete" | null>(null);
  const [tempName, setTempName] = useState("");
  const [tempMenuId, setTempMenuId] = useState("");
  const [tempFile, setTempFile] = useState<File | null>(null);

  const uploadRef = useRef<{ triggerUpload: () => void }>(null);

  // Helper para encabezados
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
        const res = await fetch(`${API_BASE}/menus`, {
          headers: authHeaders(),
        });
        if (res.status === 401) throw new Error("No autorizado");
        const data = await res.json();
        setSections(data.data || []);
      } catch (err) {
        console.error("❌ Error cargando menús:", err);
      }
    };
    fetchMenus();
  }, [setSections]);

  const createMenu = async (name: string, parentId: string | null = null) => {
    try {
      const res = await fetch(`${API_BASE}/menus`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name, parent_menu_id: parentId }),
      });
      const result = await res.json();
      setSections((prev: any) => [...prev, result.data]);
    } catch (err) {
      console.error("❌ Error creando menú:", err);
    }
  };

  const updateMenu = async (id: string, name: string) => {
    try {
      await fetch(`${API_BASE}/menus/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ name }),
      });
      setSections((prev: any) =>
        prev.map((menu: any) => (menu.id === id ? { ...menu, name } : menu))
      );
    } catch (err) {
      console.error("❌ Error actualizando menú:", err);
    }
  };

  const deleteMenu = async (id: string) => {
    try {
      await fetch(`${API_BASE}/menus/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      setSections((prev: any) => prev.filter((menu: any) => menu.id !== id));
    } catch (err) {
      console.error("❌ Error eliminando menú:", err);
    }
  };

  // ===================== 📄 DOCUMENTOS =====================
  useEffect(() => {
    const fetchDocuments = async () => {
  console.log(" Cargando documentos desde el backend...");

  const token = localStorage.getItem("token");
  console.log(" Token recuperado:", token); 

  try {
    const response = await fetch("http://192.168.2.169:3000/documents", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, 
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(" Documentos cargados:", data.data);
    setDocuments(data.data);
  } catch (error) {
    console.error(" Error cargando documentos:", error);
  }
};
    fetchDocuments();
  }, []);

  const handleUpload = async (files: FileList, menuId: string) => {
    const fileArray = Array.from(files);
    const token = localStorage.getItem("token");

    for (const file of fileArray) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("menuId", menuId);

      try {
        const res = await fetch(`${API_BASE}/documents/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const newDoc = await res.json();
        setDocuments((prev) => [...prev, newDoc.data || newDoc]);
      } catch (err) {
        console.error("❌ Error subiendo documento:", err);
      }
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

    try {
      await fetch(`${API_BASE}/documents/${modalDoc.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      setDocuments((prev) => prev.filter((d) => d.id !== modalDoc.id));
    } catch (err) {
      console.error("❌ Error eliminando documento:", err);
    }

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

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("name", tempName);
    formData.append("menuId", tempMenuId);
    if (tempFile) {
      formData.append("file", tempFile);
    }

    try {
      const res = await fetch(`${API_BASE}/documents/${modalDoc.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const updatedDoc = await res.json();
      setDocuments((prev) =>
        prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
      );
    } catch (err) {
      console.error("❌ Error actualizando documento:", err);
    }

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

    fetch(`${API_BASE}/documents/${docId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ menuId: sectionId }),
    }).catch((err) => console.error("❌ Error guardando en backend:", err));
  };

  // ===================== 📌 RENDER =====================
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

      {/* Modal para ver documento */}
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
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
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
