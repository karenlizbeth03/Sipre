import React, { useState } from 'react'
import { logout } from '../../../utils/auth'
import type { MenuOption } from '../../../App'
import './Dashboard.css'

interface DashboardProps {
  activeMenu: MenuOption
  setActiveMenu: React.Dispatch<React.SetStateAction<MenuOption>>;
  onLogout: () => void
  children?: React.ReactNode
}

interface MenuItem {
  label: string
  option?: MenuOption
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    label: 'GESTOR DE MENUS',
    children: [{ label: 'NUEVO MENU', option: 'nuevo_menu' }]
  },
  {
    label: 'GESTOR DOCUMENTAL',
    children: [{ label: 'DOCUMENTOS', option: 'documents' }]
  }
]

const Dashboard: React.FC<DashboardProps> = ({
  activeMenu,
  setActiveMenu,
  onLogout,
  children
}) => {
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const [menuOpen, setMenuOpen] = useState(false)


  const toggleMenu = (label: string) => {
    setOpenMenus(prev =>
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    )
  }

  const renderMenu = (items: MenuItem[], level = 0) => (
  <ul className={`menu level-${level}`}>
    {items.map(item => (
      <li key={item.label}>
        <div
          className={`menu-item ${item.children ? 'menu-header' : 'menu-subitem'} ${
            activeMenu === item.option ? 'active' : ''
          }`}
          onClick={() => {
            if (item.children) {
              toggleMenu(item.label);
            } else {
              setActiveMenu((item.option || item.label) as MenuOption);
            }
          }}
        >
          {item.children ? (
            <span>
              {item.label}{" "}
              <span className="menu-arrow">
                {openMenus.includes(item.label) ? "▲" : "▼"}
              </span>
            </span>
          ) : (
            item.label
          )}
        </div>
        {item.children && openMenus.includes(item.label) && renderMenu(item.children, level + 1)}
      </li>
    ))}
  </ul>
);

  const handleLogoutClick = async () => {
    await logout();
    localStorage.removeItem('token');
    onLogout();
  };


  return (
    <div className="dashboard-top-layout">
      <header className="dashboard-header">
        <div className="logo">Admin</div>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <nav className={`dashboard-nav ${menuOpen ? 'open' : ''}`}>
          {renderMenu(menuItems)}
          <button className="logout-btn" onClick={handleLogoutClick}>
            <center>Cerrar Sesión</center>
          </button>
        </nav>
      </header>

      <main className="dashboard-content">{children}</main>
    </div>
  )
}

export default Dashboard
