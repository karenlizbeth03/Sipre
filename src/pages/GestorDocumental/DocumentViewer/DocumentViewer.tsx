// components/DocumentViewer.tsx
import React from 'react'
import type { Document } from '../DocumentManager/DocumentManager'
import './DocumentViewer.css'

interface DocumentViewerProps {
  document: Document
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document }) => {
  const renderContent = () => {
    if (document.type.includes('image')) {
      return <img src={document.url} alt={document.name} />
    } else if (document.type.includes('pdf')) {
      return <iframe src={document.url} title={document.name} />
    } else if (document.type.includes('text')) {
      return (
        <iframe 
          src={document.url} 
          title={document.name}
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      )
    } else {
      return (
        <div className="unsupported-format">
          <p>Vista previa no disponible para este tipo de archivo</p>
          <p>Descarga el archivo para verlo</p>
        </div>
      )
    }
  }

  return (
    <div className="document-viewer">
      <div className="viewer-header">
        <h3>{document.name}</h3>
      </div>
      <div className="viewer-content">
        {renderContent()}
      </div>
    </div>
  )
}

export default DocumentViewer