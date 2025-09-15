import React, { useState } from "react";
import { AiOutlineDownload, AiOutlineDelete, AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import type { Document } from "./DocumentManager/DocumentManager";
import "./DocumentListPage.css";

interface Props {
  documents: Document[];
  onDelete: (id: string) => void;
  onDownload: (doc: Document) => void;
  onEdit: (doc: Document) => void;
  onView: (doc: Document) => void;
}

const DocumentListPage: React.FC<Props> = ({ documents, onDelete, onDownload, onEdit, onView }) => {
  return (
    <div className="document-list-page">
      <h2>📂 Lista de Documentos</h2>
      {documents.length === 0 ? (
        <p>No hay documentos disponibles.</p>
      ) : (
        <table className="document-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Tamaño</th>
              <th>Subido</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.name}</td>
                <td>{doc.type}</td>
                <td>{(doc.size / 1024).toFixed(2)} KB</td>
                <td>{doc.uploadDate.toLocaleDateString()}</td>
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
