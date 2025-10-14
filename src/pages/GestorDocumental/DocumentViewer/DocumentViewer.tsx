import React, { useEffect, useState } from "react";

interface DocumentViewerProps {
  document: {
    id: string;
    name: string;
    url: string;
  };
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(document.url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Error al cargar el documento");

        const blob = await res.blob();
        const fileUrl = URL.createObjectURL(blob);
        setBlobUrl(fileUrl);
      } catch (error) {
        console.error("  Error visualizando documento:", error);
      }
    };

    fetchDocument();
  }, [document.url]);

  if (!blobUrl) return <p>Cargando documento...</p>;

  return (
    <iframe
      src={blobUrl}
      title={document.name}
      style={{ width: "100%", height: "80vh", border: "none" }}
    />
  );
};

export default DocumentViewer;
