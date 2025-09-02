// components/DocumentManager.tsx
import React, { useState, useRef } from 'react'
import DocumentList from './DocumentList'
import DocumentUpload from './DocumentUpload'
import DocumentViewer from './DocumentViewer'
import './DocumentManager.css'
import Header from './Header'

export interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadDate: Date
  url: string
}

const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const uploadRef = useRef<{ triggerUpload: () => void }>(null)

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUpload = (files: FileList) => {
    const newDocuments: Document[] = []
    
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newDoc: Document = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          uploadDate: new Date(),
          url: e.target?.result as string
        }
        newDocuments.push(newDoc)
        
        if (newDocuments.length === files.length) {
          setDocuments(prev => [...prev, ...newDocuments])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
    if (selectedDocument?.id === id) {
      setSelectedDocument(null)
    }
  }

  const handleDownload = (doc: Document) => {
    const link = document.createElement('a')
    link.href = doc.url
    link.download = doc.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="document-manager">
        <Header />
      <div className="page-content">
        <div className="document-header">
          <h2>Gestión de Documentos</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => uploadRef.current?.triggerUpload()}>
              Subir Documentos
            </button>
          </div>
        </div>

        <div className="document-content">
          <DocumentList
            documents={filteredDocuments}
            onSelect={setSelectedDocument}
            onDelete={handleDelete}
            onDownload={handleDownload}
          />

          <div className="document-viewer-container">
            {selectedDocument ? (
              <DocumentViewer document={selectedDocument} />
            ) : (
              <div className="no-document-selected">
                <p>Selecciona un documento para visualizarlo</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <DocumentUpload ref={uploadRef} onUpload={handleUpload} />
    </div>
  )
}
export default DocumentManager