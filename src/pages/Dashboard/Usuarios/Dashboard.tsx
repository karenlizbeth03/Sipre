import React, { useState, useEffect } from "react";
import type { MenuOption } from "../../../types";
import type { MenuItem, MenuSection } from "../../../types";
import "./Dashboard.css";
import { Repeat } from 'lucide-react';

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

  useEffect(() => {
    const stored = localStorage.getItem("menuSections");
    if (stored) {
      setSections(JSON.parse(stored));
    }
  }, []);

  const renderMenu = (items: MenuItem[], level = 0) => (
    <ul className={`menu level-${level}`}>
      {items.map((item) => (
        <li key={item.id}>
          <div
            className={`menu-item ${item.children ? "has-children" : ""} ${
              activeMenu === item.option ? "active" : ""
            }`}
            onClick={() => {
              if (item.url) {
                window.open(item.url, "_blank");
              } else if (item.option) {
                setActiveMenu(item.option as MenuOption);
              }
            }}
          >
            {item.title}
          </div>
          {item.children && renderMenu(item.children, level + 1)}
        </li>
      ))}
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
              {/* título clickable */}
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

              {/* solo mostrar items si está expandida */}
              {openSection === section.id && renderMenu(section.items, 0)}
            </div>
          ))}

          <button className="logout-btn" onClick={onLogout}><Repeat />
            <center>Cambiar Rol</center>
          </button>
        </nav>
      </header>

      <main className="dashboard-content">{children}</main>
    </div>
  );
};

export default DashboardUser;
