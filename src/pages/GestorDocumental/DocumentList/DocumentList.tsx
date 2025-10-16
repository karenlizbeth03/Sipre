import React from "react";
import type { Document } from "../DocumentManager/DocumentManager";

interface Props {
  documents: Document[];
  onView: (doc: Document) => void;
  onDelete: (id: string) => void;
  onDownload: (doc: Document) => void;
  onSectionChange: (docId: string, sectionId: string) => void;

}

const DocumentList: React.FC<Props> = ({ documents, onView, onDelete, onDownload }) => {
  return (
    <table className="document-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Sección</th> 
          <th>Tamaño</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((doc) => (
          <tr key={doc.id}>
            <td>{doc.name}</td>
            <td>{doc.menuId}</td> 
            <td>{(doc.size / 1024).toFixed(2)} KB</td>
            <td>{new Date(doc.uploadDate).toLocaleDateString()}</td>
            <td>
              <button onClick={() => onView(doc)}>👁 Ver</button>
              <button onClick={() => onDownload(doc)}>⬇ Descargar</button>
              <button onClick={() => onDelete(doc.id)}>🗑 Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DocumentList;
