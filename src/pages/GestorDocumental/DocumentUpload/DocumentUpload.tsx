import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import "./DocumentUpload.css";

export interface DocumentUploadProps {
  onUpload: (files: FileList, menuId: string) => void;
  sections: { id: string; name: string; children?: any[] }[]; // para el modal
}

export interface DocumentUploadHandle {
  triggerUpload: () => void; // ya no necesitamos menuId externo
}

const DocumentUpload = forwardRef<DocumentUploadHandle, DocumentUploadProps>(
  ({ onUpload, sections }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showMenuModal, setShowMenuModal] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState("");

    useImperativeHandle(ref, () => ({
      triggerUpload: () => {
        setShowMenuModal(true); 
      },
    }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0 && selectedMenu) {
        onUpload(e.target.files, selectedMenu);
        e.target.value = "";
        setSelectedMenu("");
      }
    };

    const handleMenuSelect = () => {
      if (!selectedMenu) return;
      setShowMenuModal(false);
      fileInputRef.current?.click(); 
    };

    return (
      <>
        {/* Modal de selección de menú */}
        {showMenuModal && (
          <div className="modal-overlay" onClick={() => setShowMenuModal(false)}>
            <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
              <h3>Seleccionar sección</h3>
              <select
                value={selectedMenu}
                onChange={(e) => setSelectedMenu(e.target.value)}
              >
                <option value="">-- Seleccionar sección --</option>
                {sections.map((sec) => (
                  <React.Fragment key={sec.id}>
                    <option value={sec.id}>{sec.name}</option>
                    {sec.children?.map((child) => (
                      <option key={child.id} value={child.id}>
                        └─ {child.name}
                      </option>
                    ))}
                  </React.Fragment>
                ))}
              </select>

              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowMenuModal(false)}>
                  Cancelar
                </button>
                <button
                  className="save-btn"
                  disabled={!selectedMenu}
                  onClick={handleMenuSelect}
                >
                  Seleccionar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input de archivos oculto */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </>
    );
  }
);

DocumentUpload.displayName = "DocumentUpload";
export default DocumentUpload;
