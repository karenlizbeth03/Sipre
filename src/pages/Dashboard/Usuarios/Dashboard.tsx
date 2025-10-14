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
import Login from "../../../components/Login/Login";
import { useNavigate } from "react-router-dom";


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
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [openchildren, setOpenchildren] = useState<Record<string, boolean>>({});
  const [menuDocs, setMenuDocs] = useState<Record<string, Document[]>>({});
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [showLogin, setShowLogin] = useState(false);


  const API_BASE = "http://192.168.2.201:3000";
  // 🔹 Carga inicial del menú
  useEffect(() => {

    const fetchMenu = async () => {
      try {
        const res = await fetch("http://192.168.2.201:3000/menus");
        if (!res.ok) throw new Error("Error al cargar menú");
        const result = await res.json();

        const normalizeMenu = (menuchildren: any[]): any[] =>
          menuchildren.map((item) => ({
            id: item.id,
            name: item.name,
            parentId: item.parent_menu_id,
            level: item.menu_level,
            children: item.submenus ? normalizeMenu(item.submenus) : [],
          }));

        const normalizedSections = (result.data || []).map((menu: any) => ({
          id: menu.id,
          name: menu.name,
          children: normalizeMenu(menu.submenus || []),
        }));

        setSections(normalizedSections);
        console.info("📁 Menú cargado:", normalizedSections);
      } catch (err) {
        console.error(" No se pudo cargar el menú:", err);
      }
    };

    fetchMenu();
  }, []);

  // 🔹 Cargar documentos de un menú específico
  const handleMenuClick = async (item: MenuItem) => {
    try {
      console.info(`📂 Cargando documentos del menú: ${item.name} (${item.id})`);
      console.log("👉 URL solicitada:", `http://192.168.2.201:3000/documents/get-by-menu/${item.id}`);

      // evitar recargar si ya existen en cache
      if (menuDocs[item.id]) {
        setFilteredDocs(menuDocs[item.id]);
        setActiveMenu(item.id as unknown as MenuOption);
        return;
      }

      const res = await fetch(
        `http://192.168.2.201:3000/documents/get-by-menu/${item.id}`
      );
      if (!res.ok) throw new Error("Error al cargar documentos por menú");

      const result = await res.json();
      const docsForMenu: Document[] = result.data || [];

      // guardar cache local
      setMenuDocs((prev) => ({ ...prev, [item.id]: docsForMenu }));

      setFilteredDocs(docsForMenu);
      setActiveMenu(item.id as unknown as MenuOption);

      console.info(`✅ ${docsForMenu.length} documentos cargados para ${item.name}`);
    } catch (err) {
      console.error(" Error cargando documentos por menú:", err);
      setFilteredDocs([]);
    }
  };

  const toggleItem = (itemId: string) => {
    setOpenchildren((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleLoginSuccess = (token: string) => {
    setShowLogin(false);
    onLogout();
  };

  // 🔹 Renderizado del menú lateral con documentos anidados
  const renderMenu = (children: MenuItem[], level = 0) => (
    <ul className={`menu level-${level}`}>
      {children.map((item) => {
        const docsForMenu = menuDocs[item.id] || [];
        const isOpen = openchildren[item.id] || false;

        return (
          <li key={item.id}>
            <div
              className={`menu-item ${item.children ? "has-children" : ""
                } ${activeMenu === item.id ? "active" : ""}`}
              onClick={() => {
                toggleItem(item.id);
                handleMenuClick(item);
              }}
            >
              {item.name}
            </div>

            {/* Documentos del menú */}
            {isOpen && docsForMenu.length > 0 && (
              <ul className="menu-docs">
                {docsForMenu.map((doc) => (
                  <li key={doc.id} className="doc-item">
                    <a href={doc.url} target="_blank" rel="noreferrer">
                      📄 {doc.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {/* Submenús */}
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
            <p style={{ padding: "10px" }}>Cargando menú...</p>
          ) : (
            sections.map((section) => (
              <div key={section.id} className="menu-section">
                <h3
                  className={`menu-section-title ${openSection === section.id ? "open" : ""
                    }`}
                  onClick={() => {
                    setOpenSection(openSection === section.id ? null : section.id);
                    handleMenuClick({ id: section.id, name: section.name } as MenuItem);
                  }}
                >
                  {section.name}
                </h3>
                {openSection === section.id && section.children.length > 0 && (
                  <div className="submenu-dropdown">{renderMenu(section.children)}</div>
                )}
              </div>
            ))
          )}
          <button className="login-btn" onClick={() => setShowLogin(true)}>
            <center>Iniciar Sesión</center>
          </button>
        </nav>
      </header>

      {/* Contenido principal */}
      <main className="dashboard-content">
        {activeMenu === "home" && <Home documents={[]} />}
        {activeMenu === "documents" && <DocumentsPanel documents={[]} />}
        {activeMenu !== "home" && activeMenu !== "documents" && (
          <div>
            <h1 className="menu-title">
              {(() => {
                for (const section of sections) {
                  if (section.id === activeMenu) return section.name.toUpperCase();
                  for (const item of section.children) {
                    if (item.id === activeMenu) return item.name.toUpperCase();
                    for (const child of item.children || []) {
                      if (child.id === activeMenu) return child.name.toUpperCase();
                    }
                  }
                }
                return String(activeMenu).toUpperCase();
              })()}
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
        <div className="modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{previewDoc.name}</h3>
              <div className="modal-actions">
                
                <button
                  className="close-btn"
                  onClick={() => setPreviewDoc(null)}
                  title="Cerrar"
                >
                  ✖
                </button>
              </div>
            </div>

            <DocumentViewer
              document={{
                id: previewDoc.id,
                name: previewDoc.name,
                url: `${API_BASE}/documents/view/${previewDoc.id}`,
              }}
            />
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
