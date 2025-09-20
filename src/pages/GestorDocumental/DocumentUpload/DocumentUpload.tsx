import React, { forwardRef, useImperativeHandle, useRef } from "react";
import "./DocumentUpload.css";

export interface DocumentUploadProps {
  onUpload: (files: FileList, menuId: string) => void; // ✅ ahora acepta menuId
}

export interface DocumentUploadHandle {
  triggerUpload: (menuId: string) => void; // ✅ trigger recibe menuId
}

const DocumentUpload = forwardRef<DocumentUploadHandle, DocumentUploadProps>(
  ({ onUpload }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const currentMenuId = useRef<string>("");

    useImperativeHandle(ref, () => ({
      triggerUpload: (menuId: string) => {
        currentMenuId.current = menuId;
        fileInputRef.current?.click();
      },
    }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onUpload(e.target.files, currentMenuId.current);
        e.target.value = "";
      }
    };

    return <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} style={{ display: "none" }} />;
  }
);

DocumentUpload.displayName = "DocumentUpload";
export default DocumentUpload;
