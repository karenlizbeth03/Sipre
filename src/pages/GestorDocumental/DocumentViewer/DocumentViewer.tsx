import React, { useEffect, useState } from "react";
import "./DocumentViewer.css";

interface Document {
  id: string;
  name: string;
  url: string; // URL del endpoint en el backend
}

interface Props {
  document: Document;
  onClose?: () => void;
}

const DocumentViewer: React.FC<Props> = ({ document, onClose }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!document) return;

    const fetchDocument = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(document.url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("No autorizado o documento no encontrado");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (err: any) {
        console.error(err);
        setError("No se pudo cargar el documento. Revisa tu sesión o permisos.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();

    // Limpiar blob al desmontar
    return () => {
      if (blobUrl) {
        window.URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
    };
  }, [document]);

  if (!document) return <p>No hay documento seleccionado.</p>;

  return (
    <div className="document-viewer">
      <div className="viewer-header">
        <h3>{document.name}</h3>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ✖
          </button>
        )}
      </div>

      <div className="viewer-content">
        {loading && <p>Cargando documento...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && blobUrl && (
          <iframe
            src={blobUrl}
            title={document.name}
            className="pdf-frame"
            width="100%"
            height="600px"
            style={{ border: "none" }}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
