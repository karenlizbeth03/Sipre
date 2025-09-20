import React, { useState, useEffect } from "react";
import type { MenuOption, MenuItem, MenuSection, Document } from "../../../types";
import "./Dashboard.css";
import { Repeat } from "lucide-react";
import Home from "../../../components/Home";
import DocumentsPanel from "../../GestorDocumental/DocumentsPanel";

interface DashboardUserProps {
  activeMenu: MenuOption;
  setActiveMenu: React.Dispatch<React.SetStateAction<MenuOption>>;
  onLogout: () => void;
  setFilteredDocs: React.Dispatch<React.SetStateAction<Document[]>>;
}

const DashboardUser: React.FC<DashboardUserProps> = ({
  activeMenu,
  setActiveMenu,
  onLogout,
  setFilteredDocs,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // 🔹 Cargar secciones desde localStorage
    const storedSections = localStorage.getItem("menuSections");
    if (storedSections) {
      const parsedSections: MenuSection[] = JSON.parse(storedSections);
      console.info("📂 Secciones cargadas desde localStorage:", parsedSections);
      setSections(parsedSections);
    } else {
      console.warn("⚠️ No se encontraron menús configurados. Contacta al administrador.");
    }

    // 🔹 Cargar documentos desde el backend
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
    setActiveMenu(item.option as MenuOption);
  };

  const renderMenu = (items: MenuItem[], level = 0) => (
    <ul className={`menu level-${level}`}>
      {items.map(item => {
        const docsForMenu = documents.filter(doc => doc.menuId === item.id.toString());
        const isOpen = openItems[item.id] || false;

        return (
          <li key={item.id}>
            <div
              className={`menu-item ${item.children ? "has-children" : ""} ${
                activeMenu === item.option ? "active" : ""
              }`}
              onClick={() => {
                if (item.children) {
                  toggleItem(item.id);
                } else {
                  handleMenuClick(item);
                }
              }}
            >
              {item.title}
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
            <p style={{ padding: "10px", color: "red" }}>
              ⚠️ No hay menús configurados.
            </p>
          ) : (
            sections.map(section => (
              <div key={section.id} className="menu-section">
                <h3
                  className={`menu-section-title ${openSection === section.id ? "open" : ""}`}
                  onClick={() =>
                    setOpenSection(openSection === section.id ? null : section.id)
                  }
                >
                  {section.title}
                </h3>

                {openSection === section.id && renderMenu(section.items)}
              </div>
            ))
          )}

          <button className="logout-btn" onClick={onLogout}>
            <Repeat />
            <center>Cambiar Rol</center>
          </button>
        </nav>
      </header>

      <main className="dashboard-content">
        {activeMenu === "home" && <Home documents={documents} />}
        {activeMenu === "documents" && <DocumentsPanel documents={documents} />}
      </main>
    </div>
  );
};

export default DashboardUser;
