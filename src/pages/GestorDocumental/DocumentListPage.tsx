import React, { useState } from "react";
import {
  AiOutlineDownload,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineEye,
  AiOutlineSearch,
} from "react-icons/ai";
import type { Document } from "../../types";
import type { MenuSection } from "../../types";
import "./DocumentListPage.css";

interface Props {
  documents: Document[];
  sections: MenuSection[];
  onDelete: (id: string) => void;
  onEdit: (doc: Document) => void;
  onView: (doc: Document) => void;
  onSectionChange: (docId: string, sectionId: string) => void;
}

const DocumentListPage: React.FC<Props> = ({
  documents,
  sections,
  onDelete,
  onEdit,
  onView,
  onSectionChange,
}) => {
  const [search, setSearch] = useState("");
  const API_BASE = "http://192.168.1.3:3000";

  const filteredDocs = documents.filter((doc) =>
    doc.name?.toLowerCase().includes(search.toLowerCase())
  );

  /**
   * 🔹 Buscar el nombre del menú (recursivamente) según el ID.
   * Funciona tanto para menús, submenús y niveles más profundos.
   */
  const getMenuName = (menuId?: string): string => {
    if (!menuId) return "—";

    const findMenu = (menus: MenuSection[]): string | undefined => {
      for (const menu of menus) {
        if (menu.id === menuId) return menu.name;

        // 🔹 Compatibilidad: buscar en submenus o children
        const children = (menu.submenus || (menu as any).children) ?? [];
        if (children.length > 0) {
          const found = findMenu(children);
          if (found) return found;
        }
      }
      return undefined;
    };

    return findMenu(sections) || menuId;
  };
  const handleView = async (doc: Document) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/documents/view/${doc.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("No se pudo cargar el PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Aquí puedes abrir un modal o ventana nueva
      window.open(url, "_blank");
      // O si tienes un modal con DocumentViewer:
      // setPreviewDoc({ ...doc, url });
    } catch (err) {
      console.error(err);
      alert("No se pudo cargar el PDF para vista previa");
    }
  };

  // 🔹 Descarga directa usando el endpoint existente /documents/view/{id}
  const handleDownload = async (doc: Document) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/documents/view/${doc.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al descargar el documento");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al descargar el archivo:", err);
      alert("No se pudo descargar el documento");
    }
  };

  return (
    <div className="document-list-page">
      <h2>📂 Lista de Documentos</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar documento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button>
          <AiOutlineSearch />
        </button>
      </div>

      {filteredDocs.length === 0 ? (
        <p>No hay documentos disponibles.</p>
      ) : (
        <table className="document-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Menú</th>
              <th>Última modificación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.name}</td>
                <td>{doc.type}</td>

                {/* ✅ Muestra el nombre correcto (no el ID) */}
                <td>{getMenuName(doc.menuId)}</td>

                <td>{new Date(doc.updatedAt).toLocaleString()}</td>
                <td>
                  {doc.type.includes("pdf") && (
                    <button onClick={() => handleView(doc)} title="Ver">
                      <AiOutlineEye />
                    </button>
                  )}



                  <button onClick={() => onEdit(doc)} title="Editar">
                    <AiOutlineEdit />
                  </button>

                  <button onClick={() => handleDownload(doc)} title="Descargar">
                    <AiOutlineDownload />
                  </button>

                  <button onClick={() => onDelete(doc.id)} title="Eliminar">
                    <AiOutlineDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DocumentListPage;
