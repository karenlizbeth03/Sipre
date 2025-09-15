import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import './DocumentUpload.css'

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
      },
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
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    )
  }
)

DocumentUpload.displayName = 'DocumentUpload'
export default DocumentUpload
