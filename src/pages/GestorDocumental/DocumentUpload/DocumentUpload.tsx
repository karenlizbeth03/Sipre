// components/DocumentUpload.tsx
import React, { useState, useImperativeHandle, forwardRef } from 'react'
import './DocumentUpload.css'

interface DocumentUploadProps {
  onUpload: (files: FileList) => void
}

export interface DocumentUploadHandle {
  triggerUpload: () => void
}

const DocumentUpload = forwardRef<DocumentUploadHandle, DocumentUploadProps>(
  ({ onUpload }, ref) => {
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      triggerUpload: () => {
        fileInputRef.current?.click()
      }
    }))

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) {
        onUpload(e.dataTransfer.files)
      }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onUpload(e.target.files)
        e.target.value = '' // Reset input
      }
    }

    return (
      <>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          style={{ display: 'none' }}
        />
        <div
          className={`upload-area ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-content">
            <p>Arrastra documentos aquí o haz clic para seleccionar</p>
            <span>Sube cualquier tipo de documento</span>
          </div>
        </div>
      </>
    )
  }
)

DocumentUpload.displayName = 'DocumentUpload'

export default DocumentUpload