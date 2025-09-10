import React, { useState } from "react";
import type { MenuOption } from "../../../types";
import "./Dashboard.css";

interface DashboardUserProps {
  activeMenu: MenuOption;
  setActiveMenu: (option: MenuOption) => void;
  onLogout: () => void;
  children?: React.ReactNode;
}

interface MenuItem {
  label: string;
  option?: MenuOption;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "GESTOR DOCUMENTAL",
    children: [{ label: "DOCUMENTOS", option: "documents" }],
  },
];

const DashboardUser: React.FC<DashboardUserProps> = ({
  activeMenu,
  setActiveMenu,
  onLogout,
  children,
}) => {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const renderMenu = (items: MenuItem[], level = 0) => (
    <ul className={`menu level-${level}`}>
      {items.map((item) => (
        <li key={item.label}>
          <div
            className={`menu-item ${item.children ? "has-children" : ""} ${
              activeMenu === item.option ? "active" : ""
            }`}
            onClick={() =>
              item.children ? toggleMenu(item.label) : item.option && setActiveMenu(item.option)
            }
          >
            {item.label}
          </div>
          {item.children &&
            openMenus.includes(item.label) &&
            renderMenu(item.children, level + 1)}
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
          {renderMenu(menuItems)}
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
