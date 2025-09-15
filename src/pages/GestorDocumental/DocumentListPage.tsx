import React, { useState } from "react";
import {
  AiOutlineDownload,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineEye,
  AiOutlineSearch,
} from "react-icons/ai";
import type { Document } from "./DocumentManager/DocumentManager";
import type { MenuSection } from "../../types";
import "./DocumentListPage.css";

interface Props {
  documents: Document[];
  sections: MenuSection[]; // ✅ recibimos secciones
  onDelete: (id: string) => void;
  onDownload: (doc: Document) => void;
  onEdit: (doc: Document) => void;
  onView: (doc: Document) => void;
}

const DocumentListPage: React.FC<Props> = ({
  documents,
  sections,
  onDelete,
  onDownload,
  onEdit,
  onView,
}) => {
  const [search, setSearch] = useState("");

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

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
              <th>Sección</th> {/* ✅ nueva columna */}
              <th>Tipo</th>
              <th>Tamaño</th>
              <th>Subido</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.map((doc) => {
              const sectionTitle =
                sections.find((sec) => sec.id === doc.menuId)?.title || "-";
              return (
                <tr key={doc.id}>
                  <td>{doc.name}</td>
                  <td>{sectionTitle}</td>
                  <td>{doc.type}</td>
                  <td>{(doc.size / 1024).toFixed(2)} KB</td>
                  <td>{new Date(doc.uploadDate).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => onView(doc)} title="Ver"><AiOutlineEye /></button>
                    <button onClick={() => onEdit(doc)} title="Editar"><AiOutlineEdit /></button>
                    <button onClick={() => onDownload(doc)} title="Descargar"><AiOutlineDownload /></button>
                    <button onClick={() => onDelete(doc.id)} title="Eliminar"><AiOutlineDelete /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DocumentListPage;
