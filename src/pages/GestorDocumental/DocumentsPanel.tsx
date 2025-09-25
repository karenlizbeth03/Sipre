import React from "react";
import GalaImage from "../../assets/Gala.png"; // 🔹 Importamos la imagen
import "./DocumentsPanel.css";

const DocumentsPanel: React.FC = () => {
  return (
    <div className="image-fullscreen">
      <img
        src={GalaImage}
        alt="Gala"
        className="image-viewer"
      />
    </div>
  );
};

export default DocumentsPanel;
