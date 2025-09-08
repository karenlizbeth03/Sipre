// DocumentUpload/DocumentUpload.tsx 
import React, { forwardRef, useImperativeHandle, useRef , useState} from 'react'
import './DocumentUpload.css'
//import axios from 'axios';

export interface DocumentUploadProps {
  onUpload: (files: FileList) => void
}

export interface DocumentUploadHandle {
  triggerUpload: () => void
}

const DocumentUpload = forwardRef<DocumentUploadHandle, DocumentUploadProps>(
  ({ onUpload }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    useImperativeHandle(ref, () => ({
      triggerUpload: () => {
        fileInputRef.current?.click()
      }
    }))
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onUpload(e.target.files)
        e.target.value = '' // Reset input
      }
    }
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onUpload(e.dataTransfer.files)
      }
    }
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
    }
    
    return (
      <div 
        className="document-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="upload-area">
          <div className="upload-icon">📁</div>
          <p>Arrastra y suelta archivos aquí o</p>
          <button 
            className="browse-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            Buscar archivos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
        {/* <div className="upload-info">
          <p>Formatos soportados: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, imágenes</p>
          <p>Límite máximo: 10MB por archivo</p>
        </div> */}
      </div>
    )
  }
)

DocumentUpload.displayName = 'DocumentUpload'

export default DocumentUpload