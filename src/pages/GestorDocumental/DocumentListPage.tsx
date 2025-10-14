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
  onDownload: (doc: Document) => void;
  onEdit: (doc: Document) => void;
  onView: (doc: Document) => void;
  onSectionChange: (docId: string, sectionId: string) => void;
}

const DocumentListPage: React.FC<Props> = ({
  documents,
  sections,
  onDelete,
  onDownload,
  onEdit,
  onView,
  onSectionChange,
}) => {
  const [search, setSearch] = useState("");

  const filteredDocs = documents.filter((doc) =>
    doc.name?.toLowerCase().includes(search.toLowerCase())
  );
  const getMenuName = (menuId?: string): string => {
  if (!menuId) return "—";

  const findMenu = (menus: MenuSection[]): string | undefined => {
    for (const m of menus) {
      if (m.id === menuId) return m.name;
      const found = m.children && findMenu(m.children);
      if (found) return found;
    }
  };

  return findMenu(sections) || menuId; // Si no lo encuentra, muestra el ID
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
              {/* <th>Ruta</th> */}
              <th>Menú ID</th>
              <th>Última modificación</th>
              {/* <th>Modificado por</th> */}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.name}</td>
                <td>{doc.type}</td>
                
                <td>{getMenuName(doc.menuId)}</td>
                <td>{new Date(doc.updatedAt).toLocaleString()}</td>
                {/* <td>{doc.user_edit?.name || "—"}</td> */}
                <td>
                  <button onClick={() => onView(doc)} title="Ver">
                    <AiOutlineEye />
                  </button>
                  <button onClick={() => onEdit(doc)} title="Editar">
                    <AiOutlineEdit />
                  </button>
                  <button onClick={() => onDownload(doc)} title="Descargar">
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
