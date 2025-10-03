import React, { useState, useEffect } from "react";
import type { MenuOption, MenuItem, MenuSection, Document } from "../../../types";
import "./Dashboard.css";
import Home from "../../../components/Home";
import DocumentsPanel from "../../GestorDocumental/DocumentsPanel";
import {
  AiOutlineFilePdf,
  AiOutlineFileWord,
  AiOutlineFileExcel,
  AiOutlineFile,
  AiOutlineEye,
  AiOutlineDownload,
} from "react-icons/ai";
import DocumentViewer from "../../GestorDocumental/DocumentViewer/DocumentViewer";
import Login from '../../../components/Login/Login';

interface DashboardUserProps {
  activeMenu: MenuOption;
  setActiveMenu: React.Dispatch<React.SetStateAction<MenuOption>>;
  onLogout: () => void;
  setFilteredDocs: React.Dispatch<React.SetStateAction<Document[]>>;
  filteredDocs: Document[];
}
const DashboardUser: React.FC<DashboardUserProps> = ({
  activeMenu,
  setActiveMenu,
  filteredDocs,
  onLogout,
  setFilteredDocs,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
  try {
    const res = await fetch("http://192.168.2.165:3000/menus");
    if (!res.ok) throw new Error("Error al cargar menú");

    const result = await res.json();

    // Normalizar el menú para tu frontend
    const normalizedSections = (result.data || []).map((item: any) => ({
      id: item.id,
      title: item.name,      // backend usa "name", lo pasamos a "title"
      items: [],             // aún no hay hijos, puedes construir árbol luego
      parentId: item.parent_menu_id,
    }));

    setSections(normalizedSections);
    console.info("✅ Menú cargado desde backend:", normalizedSections);

  } catch (err) {
    console.error("❌ No se pudo cargar el menú:", err);
  }
};
fetchMenu();

    // Documentos
    const fetchDocuments = async () => {
      try {
        console.info("⏳ Cargando documentos desde el backend...");
        const res = await fetch("http://localhost:4000/documents");
        if (!res.ok) throw new Error("❌ Error en la respuesta del servidor");
        const data: Document[] = await res.json();
        const normalizedDocs = data.map(doc => ({ ...doc, menuId: doc.menuId?.toString() }));
        setDocuments(normalizedDocs);
        setFilteredDocs(normalizedDocs);
        localStorage.setItem("documents", JSON.stringify(normalizedDocs));
        console.info(`📄 Documentos cargados (${normalizedDocs.length})`);
      } catch (err) {
        console.error("❌ No se pudieron cargar los documentos:", err);
      }
    };
    fetchDocuments();
  }, [setFilteredDocs]);
  const toggleItem = (itemId: string) => {
    setOpenItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };
  const handleMenuClick = (item: MenuItem) => {
    const docsForMenu = documents.filter(doc => doc.menuId === item.id.toString());
    setFilteredDocs(docsForMenu);
    setActiveMenu((item.option || item.name) as MenuOption);
  };
  const handleLoginSuccess = (token: string) => {
    setShowLogin(false);
    onLogout();
  };
  const renderMenu = (items: MenuItem[], level = 0) => (
    <ul className={`menu level-${level}`}>
      {items.map(item => {
        const docsForMenu = documents.filter(doc => doc.menuId === item.id.toString());
        const isOpen = openItems[item.id] || false;
        return (
          <li key={item.id}>
            <div
              className={`menu-item ${item.children ? "has-children" : ""} ${activeMenu === item.option ? "active" : ""
                }`}
              onClick={() => {
                if (item.children) {
                  toggleItem(item.id);
                  handleMenuClick(item);
                } else {
                  handleMenuClick(item);
                }
              }}
            >
              {item.name}
            </div>
            {isOpen && docsForMenu.length > 0 && (
              <ul className="menu-docs">
                {docsForMenu.map(doc => (
                  <li key={doc.id} className="doc-item">
                    <a href={doc.url} target="_blank" rel="noreferrer">
                      📄 {doc.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {isOpen && item.children && renderMenu(item.children, level + 1)}
          </li>
        );
      })}
    </ul>
  );
  return (
    <div className="dashboard-top-layout">
      <header className="dashboard-header">
        <div className="logo">Usuarios</div>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
        <nav className={`dashboard-nav ${menuOpen ? "open" : ""}`}>
          {sections.length === 0 ? (
            <p style={{ padding: "10px" }}>

            </p>
          ) : (
            sections.map(section => (
              <div key={section.id} className="menu-section">
                <h3
                  className={`menu-section-title ${openSection === section.id ? "open" : ""}`}
                  onClick={() => {
                    setOpenSection(openSection === section.id ? null : section.id);
                    const docsForMenu = documents.filter(doc => doc.menuId === section.id.toString());
                    setFilteredDocs(docsForMenu);
                    setActiveMenu(section.name as MenuOption);
                  }}
                >
                  <span>{section.name}</span>
                  {section.items && section.items.length > 0 ? (
                    <span style={{ fontSize: '1.1em', transition: 'transform 0.3s', transform: openSection === section.id ? 'rotate(90deg)' : 'rotate(0deg)' }}></span>
                  ) : null}
                </h3>
                {openSection === section.id && section.items && section.items.length > 0 && (
                  <div className="submenu-dropdown" style={{ position: 'absolute', top: '100%', left: 0, minWidth: '180px', background: '#fff', borderRadius: '8px', boxShadow: '0 6px 15px rgba(0,0,0,0.15)', padding: '12px 0', zIndex: 999, transition: 'opacity 0.3s', opacity: openSection === section.id ? 1 : 0 }}>
                    {renderMenu(section.items)}
                  </div>
                )}
              </div>
            ))
          )}
          <button className="login-btn" onClick={() => setShowLogin(true)}>
            <center>Iniciar Sesión</center>
          </button>
        </nav>
      </header>
      <main className="dashboard-content">
        {activeMenu === "home" && <Home documents={documents} />}
        {activeMenu === "documents" && <DocumentsPanel documents={documents} />}
        {activeMenu !== "home" && activeMenu !== "documents" && (
          <div>
            <h1 style={{
              textAlign: 'center',
              fontSize: '2.4rem',
              fontWeight: 700,
              color: '#000000ff',
              margin: '32px 0 18px 0',
              letterSpacing: '2px',
              fontFamily: 'Montserrat, Segoe UI, Arial, sans-serif',
              textTransform: 'uppercase',
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.18), 0 3px 0 #e9853aff',
            }}>
              {
                (() => {
                  for (const section of sections) {
                    if (section.id === activeMenu) return section.name.toUpperCase();
                    for (const item of section.items) {
                      if (item.id === activeMenu) return item.name.toUpperCase();
                      if (item.children) {
                        for (const child of item.children) {
                          if (child.id === activeMenu) return child.name.toUpperCase();
                        }
                      }
                    }
                  }
                  return String(activeMenu).toUpperCase();
                })()
              }
            </h1>
            <ul className="doc-list">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => {
                  let FileIcon = AiOutlineFile;
                  if (doc.type.includes("pdf")) FileIcon = AiOutlineFilePdf;
                  if (doc.type.includes("word") || doc.type.includes("doc"))
                    FileIcon = AiOutlineFileWord;
                  if (doc.type.includes("excel") || doc.type.includes("xls"))
                    FileIcon = AiOutlineFileExcel;
                  return (
                    <li key={doc.id} className="doc-item">
                      <div className="doc-icon">
                        <FileIcon size={28} />
                      </div>
                      <span className="doc-name">{doc.name}</span>
                      <div className="doc-actions">
                        <button
                          className="icon-btn"
                          onClick={() => setPreviewDoc(doc)}
                          title="Previsualizar"
                        >
                          <AiOutlineEye />
                        </button>
                        <a
                          href={doc.url}
                          download={doc.name}
                          title="Descargar"
                          className="icon-btn"
                        >
                          <AiOutlineDownload />
                        </a>
                      </div>
                    </li>
                  );
                })
              ) : (
                <p>No hay documentos en esta sección.</p>
              )}
            </ul>
          </div>
        )}
      </main>
      {previewDoc && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{previewDoc.name}</h3>
              <button onClick={() => setPreviewDoc(null)}>✖</button>
            </div>

            <DocumentViewer document={previewDoc} />
          </div>
        </div>
      )}
      {showLogin && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onCancel={() => setShowLogin(false)}
        />
      )}
    </div>
  );
};
export default DashboardUser;