import React, { useState, useEffect } from "react";
import type { MenuOption } from "../../../types";
import type { MenuItem, MenuSection } from "../../../types";
import "./Dashboard.css";

interface DashboardUserProps {
  activeMenu: MenuOption;
  setActiveMenu: (option: MenuOption) => void;
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
            <div key={section.id}>
              <h3>{section.title}</h3>
              {renderMenu(section.items, 0)}
            </div>
          ))}
          <button className="logout-btn" onClick={onLogout}>
            🔄 Cambiar Rol
          </button>
        </nav>
      </header>

      <main className="dashboard-content">{children}</main>
    </div>
  );
};

export default DashboardUser;
