// components/DocumentList.tsx
import React from 'react'
import type { Document } from '../DocumentManager/DocumentManager'
import './DocumentList.css'

interface DocumentListProps {
  documents: Document[]
  onSelect: (doc: Document) => void
  onDelete: (id: string) => void
  onDownload: (doc: Document) => void
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onSelect,
  onDelete,
  onDownload
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="document-list">
      <h3>Documentos ({documents.length})</h3>
      <div className="document-items">
        {documents.map(doc => (
          <div key={doc.id} className="document-item" onClick={() => onSelect(doc)}>
            <div className="document-icon">
              {doc.type.includes('image') ? '🖼️' : 
               doc.type.includes('pdf') ? '📄' : 
               doc.type.includes('text') ? '📝' : '📁'}
            </div>
            <div className="document-info">
              <h4>{doc.name}</h4>
              <p>{formatFileSize(doc.size)} • {doc.uploadDate.toLocaleDateString()}</p>
            </div>
            <div className="document-actions">
              <button onClick={(e) => { e.stopPropagation(); onDownload(doc) }}>
                ⬇️
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(doc.id) }}>
                🗑️
              </button>
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <div className="no-documents">
            <p>No hay documentos disponibles</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentList