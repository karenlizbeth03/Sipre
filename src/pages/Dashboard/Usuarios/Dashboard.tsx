import React, { useState, useEffect } from "react";
import type { MenuOption, MenuItem, MenuSection, Document } from "../../../types";
import "./Dashboard.css";
import Home from "../../../components/Home";
import DocumentsPanel from "../../GestorDocumental/DocumentsPanel";
import logo from "../../../assets/logo.png";

import {
  AiOutlineFilePdf,
  AiOutlineFileWord,
  AiOutlineFileExcel,
  AiOutlineFile,
  AiOutlineEye,
  AiOutlineDownload,
  AiOutlineLogout
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
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [openchildren, setOpenchildren] = useState<Record<string, boolean>>({});
  const [menuDocs, setMenuDocs] = useState<Record<string, Document[]>>({});
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string }>({});
  const navigate = useNavigate();

  const API_BASE = "http://192.168.2.187:3000";

  // 🔹 Carga del usuario autenticado
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setShowLogin(true);
          return;
        }

        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error("No se pudo obtener la información del usuario");

        const result = await res.json();
        setUser(result.data); // guarda los datos del usuario
        setShowLogin(false);
      } catch (err) {
        console.error("❌ Error cargando usuario:", err);
        setShowLogin(true);
      }
    };

    fetchUser();
  }, []);

  // 🔹 Carga del menú
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_BASE}/menus`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

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
      } catch (err) {
        console.error("❌ No se pudo cargar el menú:", err);
      }
    };

    fetchMenu();
  }, []);

  // 🔹 Cargar documentos por menú
  const handleMenuClick = async (item: MenuItem) => {
    try {
      if (menuDocs[item.id]) {
        setFilteredDocs(menuDocs[item.id]);
        setActiveMenu(item.id as unknown as MenuOption);
        return;
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/documents/get-by-menu/${item.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error("Error al cargar documentos por menú");

      const result = await res.json();
      const docsForMenu: Document[] = result.data || [];

      setMenuDocs((prev) => ({ ...prev, [item.id]: docsForMenu }));
      setFilteredDocs(docsForMenu);
      setActiveMenu(item.id as unknown as MenuOption);
    } catch (err) {
      console.error("❌ Error cargando documentos:", err);
      setFilteredDocs([]);
    }
  };

  // 🔹 Vista previa PDF
  const handlePreview = async (doc: Document) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/documents/view/${doc.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("No se pudo cargar el PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setPreviewDoc({ ...doc, url });
    } catch (err) {
      console.error(err);
      alert("No se pudo cargar el PDF para vista previa");
    }
  };

  const toggleItem = (itemId: string) => {
    setOpenchildren((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleLoginSuccess = (token: string) => {
    localStorage.setItem("token", token);
    setShowLogin(false);
    window.location.reload();
  };

  // 🔹 Render del menú lateral
  const renderMenu = (children: MenuItem[], level = 0) => (
    <ul className={`menu level-${level}`}>
      {children.map((item) => {
        const docsForMenu = menuDocs[item.id] || [];
        const isOpen = openchildren[item.id] || false;

        return (
          <li key={item.id}>
            <div
              className={`menu-item ${item.children ? "has-children" : ""} ${activeMenu === item.id ? "active" : ""
                }`}
              onClick={() => {
                toggleItem(item.id);
                handleMenuClick(item);
              }}
            >
              {item.name}
            </div>

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

            {isOpen && item.children && renderMenu(item.children, level + 1)}
          </li>
        );
      })}
    </ul>
  );

  // 🔹 Si no hay usuario logueado → mostrar login
  if (showLogin) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="dashboard-top-layout">
      <header className="dashboard-header">
        <div className="login-logo">
          <img src={logo} alt="" style={{ maxWidth: '150px', width: '100%', borderRadius: '12px' }} />
        </div>

        <div className="user-info">
          {user?.name ? (
            <span>
              👤 {user.name} {user.email ? `(${user.email})` : ""}
            </span>
          ) : (
            <span>Cargando usuario...</span>
          )}
        </div>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <nav className={`dashboard-nav ${menuOpen ? "open" : ""}`}>
          {sections.length === 0 ? (
            <p style={{ padding: "10px" }}></p>
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
                  <div className="submenu-dropdown">
                    {renderMenu(
                      section.children.map((c) => ({
                        id: c.id,
                        name: c.name,
                        menu_level: "1",
                        children: (c.children || []).map((child) => ({
                          id: child.id,
                          name: child.name,
                          menu_level: "2",
                          children: [],
                        })),
                      })) as MenuItem[]
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          <button className="logout-btn" onClick={onLogout}>
            <AiOutlineLogout size={18} />
            Cerrar Sesión
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

                  const viewUrl = `${API_BASE}/documents/view/${doc.id}`;

                  const handleDownload = async () => {
                    try {
                      const token = localStorage.getItem("token");
                      const response = await fetch(viewUrl, {
                        headers: { Authorization: `Bearer ${token}` },
                      });

                      if (!response.ok)
                        throw new Error("Error al descargar el documento");

                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = doc.name;
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                      window.URL.revokeObjectURL(url);
                    } catch (err) {
                      console.error("Error al descargar el archivo:", err);
                      alert("No se pudo descargar el documento");
                    }
                  };

                  return (
                    <li key={doc.id} className="doc-item">
                      <div className="doc-icon">
                        <FileIcon size={28} />
                      </div>

                      <span className="doc-name">{doc.name}</span>

                      <div className="doc-actions">
                        {doc.type.includes("pdf") && (
                          <button
                            className="icon-btn"
                            onClick={() => handlePreview(doc)}
                            title="Visualizar PDF"
                          >
                            <AiOutlineEye />
                          </button>
                        )}

                        <button
                          className="icon-btn"
                          onClick={handleDownload}
                          title="Descargar"
                        >
                          <AiOutlineDownload />
                        </button>
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
        <div
          className="modal-overlay dashboard-usuario-modal"
          onClick={() => setPreviewDoc(null)}
        >
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
    </div>
  );
};

export default DashboardUser;
