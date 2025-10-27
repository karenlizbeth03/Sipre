import React, { useState, useEffect, useRef } from "react";
import DocumentUpload from "../DocumentUpload/DocumentUpload";
import DocumentListPage from "../DocumentListPage";
import DocumentViewer from "../DocumentViewer/DocumentViewer";
import { useMenu } from "../../../hooks/useMenu";
import "./DocumentManager.css";

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

const API_BASE = "http://192.168.2.187:3000";

const DocumentManager: React.FC = () => {
  const { sections, setSections } = useMenu();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [modalDoc, setModalDoc] = useState<Document | null>(null);
  const [modalType, setModalType] = useState<"edit" | "delete" | null>(null);
  const [tempName, setTempName] = useState("");
  const [tempMenuId, setTempMenuId] = useState("");
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [currentFileName, setCurrentFileName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const uploadRef = useRef<{ triggerUpload: () => void }>(null);

  // ===================== 🔐 HEADERS =====================
  const authHeaders = (contentType = "application/json") => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Sesión expirada. Inicie sesión de nuevo.");
      window.location.href = "/login";
    }
    return {
      "Content-Type": contentType,
      Authorization: `Bearer ${token}`,
    };
  };

  // ===================== MENÚS =====================
  const buildMenuTree = (menus: any[]) => {
    const map: Record<string, any> = {};
    menus.forEach((m) => {
      map[m.id] = { ...m, children: [] };
    });

    const roots: any[] = [];

    menus.forEach((m) => {
      if (m.parent_menu_id) {
        const parent = map[m.parent_menu_id];
        if (parent) parent.children.push(map[m.id]);
        else roots.push(map[m.id]);
      } else {
        roots.push(map[m.id]);
      }
    });

    return roots;
  };

  const renderMenuSelect = (menus: any[], level = 0): React.ReactNode[] => {
    return menus.flatMap((menu) => {
      const prefix = " ".repeat(level * 2) + (level > 0 ? "└─ " : "");
      const option = (
        <option key={menu.id} value={menu.id}>
          {prefix + menu.name}
        </option>
      );
      if (menu.children?.length) return [option, ...renderMenuSelect(menu.children, level + 1)];
      return [option];
    });
  };

  // ===================== REFRESH DATA =====================
  const refreshData = async () => {
    try {
      setIsLoading(true);

      // Menús
      const menuRes = await fetch(`${API_BASE}/menus`, { headers: authHeaders() });
      const menuData = await menuRes.json();
      if (menuRes.ok) setSections(buildMenuTree(menuData.data || []));

      // Documentos
      const docRes = await fetch(`${API_BASE}/documents`, { headers: authHeaders() });
      const docData = await docRes.json();
      if (docRes.ok) {
        setDocuments(
          (docData.data || []).map((doc: any) => ({
            ...doc,
            menuId: doc.menu?.id || "",
          }))
        );
      }
    } catch (error) {
      console.error("Error refrescando datos:", error);
      setStatusMessage("Error cargando datos. Verifique su sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // ===================== SUBIR DOCUMENTOS =====================
  const handleUpload = async (files: FileList, menuId: string) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    for (const file of Array.from(files)) {
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
        if (!res.ok) throw new Error(data.message || "Error subiendo documento");
        setDocuments((prev) => [...prev, data.data]);
        await refreshData();
      } catch (err) {
        console.error("Error subiendo documento:", err);
        alert("Error subiendo documento. Revisa consola.");
      }
    }
  };

  // ===================== EDITAR / ELIMINAR =====================
  const handleDelete = (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;
    setModalDoc(doc);
    setModalType("delete");
  };

  const confirmDelete = async () => {
    if (!modalDoc) return;
    try {
      await fetch(`${API_BASE}/documents/${modalDoc.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      setDocuments((prev) => prev.filter((d) => d.id !== modalDoc.id));
      await refreshData();
    } catch (err) {
      console.error("Error eliminando documento:", err);
    } finally {
      setModalType(null);
      setModalDoc(null);
    }
  };

  const handleEdit = (doc: Document) => {
    setModalDoc(doc);
    setModalType("edit");
    setTempName(doc.name);
    setTempMenuId(doc.menuId || "");
    setTempFile(null);
    setCurrentFileName(doc.name);
  };

  const saveModalChanges = async () => {
    if (!modalDoc) return;
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");
    const formData = new FormData();
    formData.append("name", tempName);
    formData.append("menu_id", tempMenuId);
    if (userId) formData.append("user_id", userId);
    if (tempFile) formData.append("file", tempFile);

    try {
      const res = await fetch(`${API_BASE}/documents/${modalDoc.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error ${res.status}: ${text}`);
      }
      await refreshData();
    } catch (err) {
      console.error("Error actualizando documento:", err);
      alert("Error actualizando documento. Revisa consola.");
    } finally {
      setModalType(null);
      setModalDoc(null);
      setTempFile(null);
      setCurrentFileName("");
    }
  };

  // ===================== VER DOCUMENTOS =====================
  const handleView = async (doc: Document) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/documents/view/${doc.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Unauthorized");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      alert("No se pudo cargar el documento. Asegúrate de estar logueado.");
    }
  };

  const handleSectionChange = (docId: string, sectionId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, menuId: sectionId } : doc))
    );

    fetch(`${API_BASE}/documents/${docId}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ menuId: sectionId }),
    }).catch((err) => console.error("Error guardando sección:", err));
  };

  // ===================== RENDER =====================
  return (
    <div className="document-manager">
      <div className="document-header">
        <h2>Gestión de Documentos</h2>
        <button className="subirdocs-btn" onClick={() => uploadRef.current?.triggerUpload()}>
          Subir Documentos
        </button>
      </div>

      <DocumentUpload ref={uploadRef} onUpload={handleUpload} sections={sections} />

      <DocumentListPage
        documents={documents}
        sections={sections}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onView={handleView}
        onSectionChange={handleSectionChange}
      />

      {selectedDocument && (
        <div className="modal-overlay" onClick={() => setSelectedDocument(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedDocument.name}</h3>
              <button className="close-btn" onClick={() => setSelectedDocument(null)}>
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
              modalType === "edit" && (
                <>
                  <h3>Editar documento</h3>
                  <label>Nombre:</label>
                  <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="modal-input" />

                  <label>Seleccionar menú o submenú:</label>
                  <select value={tempMenuId} onChange={(e) => setTempMenuId(e.target.value)} className="modal-input">
                    <option value="">- Seleccionar sección -</option>
                    {renderMenuSelect(sections)}
                  </select>

                  <label>Archivo actual:</label>
                  <p>{currentFileName}</p>

                  <label>Reemplazar archivo (opcional):</label>
                  <input type="file" onChange={(e) => setTempFile(e.target.files?.[0] || null)} className="modal-input" />

                  <div className="modal-actions">
                    <button className="cancel-btn" onClick={() => setModalType(null)}>Cancelar</button>
                    <button className="save-btn" onClick={saveModalChanges}>Guardar</button>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
