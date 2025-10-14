import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import "./DocumentUpload.css";

export interface DocumentUploadProps {
  onUpload: (files: FileList, menuId: string) => void;
  sections: any[]; // incluye submenus
}

export interface DocumentUploadHandle {
  triggerUpload: () => void;
}

const DocumentUpload = forwardRef<DocumentUploadHandle, DocumentUploadProps>(
  ({ onUpload, sections }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showMenuModal, setShowMenuModal] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState("");

    useImperativeHandle(ref, () => ({
      triggerUpload: () => setShowMenuModal(true),
    }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0 && selectedMenu) {
        onUpload(e.target.files, selectedMenu);
        e.target.value = "";
        setSelectedMenu("");
      }
    };

    // Función recursiva para renderizar submenus
    const renderOptions = (menus: any[], level = 0): React.ReactNode[] => {
      return menus.flatMap((menu) => {
        const prefix = " ".repeat(level * 2) + (level > 0 ? "└─ " : "");
        const option = (
          <option key={menu.id} value={menu.id}>
            {prefix + menu.name}
          </option>
        );

        // Leer la propiedad correcta: submenus
        if (menu.submenus?.length) {
          return [option, ...renderOptions(menu.submenus, level + 1)];
        }

        return [option];
      });
    };


    const handleMenuSelect = () => {
      if (!selectedMenu) return;
      setShowMenuModal(false);
      fileInputRef.current?.click();
    };

    return (
      <>
        {showMenuModal && (
          <div className="modal-overlay" onClick={() => setShowMenuModal(false)}>
            <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
              <h3>Seleccionar sección</h3>
              <select
                value={selectedMenu}
                onChange={(e) => setSelectedMenu(e.target.value)}
              >
                <option value="">- Seleccionar sección -</option>
                {renderOptions(sections)}
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
