import React, { useState } from 'react'
import type { MenuOption } from '../../../App'
import './Dashboard.css'
import Header from '../../../components/Header/Header'

interface DashboardProps {
  activeMenu: MenuOption
  setActiveMenu: (option: MenuOption) => void
  onLogout: () => void // ✅ agregamos la prop de logout
}

interface MenuItem {
  label: string
  option?: MenuOption
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [

  { label: 'INICIO', option: 'home' },
   {
    label: 'ADMINISTRADOR',
    children: [
      { label: 'NUEVO MENU', option: 'nuevo_menu' }
    ]
  },
  {
    label: 'GESTOR DOCUMENTAL',
    children: [
      { label: 'DOCUMENTOS', option: 'documents' }
    ]
  }
]

const DashboardUser: React.FC<DashboardProps> = ({ activeMenu, setActiveMenu, onLogout }) => {
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const [showMenu, setShowMenu] = useState(true) // 👈 controla visibilidad del menú

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
            className={`menu-item ${item.children ? 'has-children' : ''} ${
              activeMenu === item.option ? 'active' : ''
            }`}
            onClick={() =>
              item.children ? toggleMenu(item.label) : item.option && setActiveMenu(item.option)
            }
          >
            {item.label}
          </div>
          {item.children && openMenus.includes(item.label) && renderMenu(item.children, level + 1)}
        </li>
      ))}
    </ul>
  )

  return (
    <div className="dashboard">
      <Header
        onLoginClick={() => {
          throw new Error('Function not implemented.')
        }}
      />

      {/* Botón para ocultar/mostrar el menú */}
      <div className="dashboard-header">
        <button className="toggle-menu-btn" onClick={() => setShowMenu(!showMenu)}>
          {showMenu ? 'Ocultar Menú' : 'Mostrar Menú'}
        </button>
      </div>

      {/* Menú que se oculta */}
      {showMenu && <nav className="dashboard-nav">{renderMenu(menuItems)}</nav>}

      <div className="dashboard-footer">
        <button className="login-btn" onClick={onLogout}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}


export default DashboardUser
