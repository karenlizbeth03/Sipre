import React, { useState, useEffect } from "react";
import type { MenuOption, MenuItem, MenuSection, Document } from "../../../types";
import "./Dashboard.css";
import { Repeat } from "lucide-react";

interface DashboardUserProps {
  activeMenu: MenuOption;
  setActiveMenu: React.Dispatch<React.SetStateAction<MenuOption>>;
  onLogout: () => void;
  children?: React.ReactNode;
}

const DashboardUser: React.FC<DashboardUserProps> = ({
  activeMenu,
  setActiveMenu,
  onLogout,
  children,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({}); // 👈 controlar items abiertos

  useEffect(() => {
    const storedSections = localStorage.getItem("menuSections");
    if (storedSections) {
      setSections(JSON.parse(storedSections));
    }

    const storedDocs = localStorage.getItem("documents");
    if (storedDocs) {
      setDocuments(JSON.parse(storedDocs));
    }
  }, []);

  const toggleItem = (itemId: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId], 
    }));
  };

  const renderMenu = (items: MenuItem[], level = 0) => (
    <ul className={`menu level-${level}`}>
      {items.map((item) => {
        const docsForMenu = documents.filter((doc) => doc.menuId === item.id);
        const isOpen = openItems[item.id] || false;

        return (
          <li key={item.id}>
            <div
              className={`menu-item ${item.children ? "has-children" : ""} ${
                activeMenu === item.option ? "active" : ""
              }`}
              onClick={() => {
                if (docsForMenu.length > 0 || item.children) {
                  toggleItem(item.id); // 👈 expandir/cerrar
                } else if (item.option) {
                  setActiveMenu(item.option as MenuOption);
                }
              }}
            >
              {item.title}
            </div>

            {/* 👇 Mostrar documentos solo si el item está abierto */}
            {isOpen && docsForMenu.length > 0 && (
              <ul className="menu-docs">
                {docsForMenu.map((doc) => (
                  <li key={doc.id} className="doc-item">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="doc-link"
                    >
                      📄 {doc.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {/* 👇 Mostrar hijos solo si está abierto */}
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
          {sections.map((section) => (
            <div key={section.id} className="menu-section">
              <h3
                className={`menu-section-title ${
                  openSection === section.id ? "open" : ""
                }`}
                onClick={() =>
                  setOpenSection(openSection === section.id ? null : section.id)
                }
              >
                {section.title}
              </h3>

              {openSection === section.id && renderMenu(section.items, 0)}
            </div>
          ))}

          <button className="logout-btn" onClick={onLogout}>
            <Repeat />
            <center>Cambiar Rol</center>
          </button>
        </nav>
      </header>

      <main className="dashboard-content">{children}</main>
    </div>
  );
};

export default DashboardUser;
