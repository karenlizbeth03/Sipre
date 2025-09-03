import React, { useState } from 'react'
import type { MenuOption } from '../../../App'
import './Dashboard.css'
import Header from '../../../components/Header/Header'

interface DashboardProps {
  activeMenu: MenuOption
  setActiveMenu: (option: MenuOption) => void
}

interface MenuItem {
  label: string
  option?: MenuOption
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
    
  { label: 'RUTA ENTREGAS', option: 'ruta-entregas' },
  {
    label: 'ADMINISTRACIÓN',
    children: [
      { label: 'DATOS EMPRESA', option: 'datos-empresa' },
      {
        label: 'ROLES-USUARIOS',
        children: [
          { label: 'ROLES DE USUARIOS', option: 'roles-usuarios' },
          { label: 'FICHA USUARIO', option: 'ficha-usuario' }
        ]
      }
    ]
  },
  {
    label: 'MARKETING',
    children: [
      { label: 'NUEVO TICKET DE MARKETING', option: 'nuevo-ticket-marketing' },
      { label: 'LISTADO TICKETS DE MARKETING', option: 'listado-tickets-marketing' },
      { label: 'LISTADO TICKETS ASIGNADOS', option: 'listado-tickets-asignados' },
      { label: 'TICKETS CERRADOS', option: 'tickets-cerrados' },
      {
        label: 'REPORTES',
        children: [
          { label: 'REPORTE FILTRO POR FECHAS', option: 'reporte-fechas' },
          { label: 'REPORTE ACTIVIDADES POR FECHAS', option: 'reporte-actividades' }
        ]
      }
    ]
  },
  {
    label: 'ORDENES TRABAJO ST',
    children: [
      { label: 'LISTADO ORDENES TRABAJO', option: 'listado-ot' },
      { label: 'NUEVA ORDEN DE TRABAJO', option: 'nueva-ot' },
      { label: 'OT CERRADOS', option: 'ot-cerrados' },
      { label: 'LISTADO OT ASIGNADOS', option: 'listado-ot-asignados' },
      { label: 'EDITAR OT', option: 'editar-ot' },
      { label: 'DATOS ENVIO OST', option: 'datos-envio-ost' },
      {
        label: 'REPORTES',
        children: [
          { label: 'REPORTE GENERAL OT', option: 'reporte-general-ot' },
          { label: 'REPORTE REPUESTOS OT', option: 'reporte-repuestos-ot' }
        ]
      }
    ]
  },
  {
    label: 'POST-VENTA',
    children: [
      { label: 'FICHA CLIENTE', option: 'ficha-cliente' },
      { label: 'LISTADO POSTVENTA', option: 'listado-postventa' },
      { label: 'NUEVA ORDEN DE POSTVENTA', option: 'nueva-postventa' }
    ]
  },
  { label: 'RUTA-CAMIONES', children: [{ label: 'RUTA CAMIONES', option: 'ruta-camiones' }] },
  {
    label: 'TECNOLOGIAS DE LA INFORMACION',
    children: [
      {
        label: 'CONFIGURACION',
        children: [
          { label: 'CATEGORIA', option: 'categoria' },
          { label: 'SUB-CATEGORIA', option: 'sub-categoria' }
        ]
      },
      {
        label: 'TICKETS',
        children: [
          { label: 'LISTADO TICKETS DE SOPORTE', option: 'listado-tickets-soporte' },
          { label: 'NUEVO TICKET DE SOPORTE', option: 'nuevo-ticket-soporte' },
          { label: 'LISTADO TICKETS SOPORTE ASIGNADOS', option: 'tickets-soporte-asignados' },
          { label: 'BUSQUEDA TICKET', option: 'busqueda-ticket' }
        ]
      },
      {
        label: 'REPORTES',
        children: [
          { label: 'REPORTE TI FILTRO POR FECHAS', option: 'reporte-ti-fechas' },
          { label: 'REPORTE TI ACTIVIDADES POR FECHAS', option: 'reporte-ti-actividades' }
        ]
      }
    ]
  }
  ,
  {
    label: 'GESTOR DOCUMENTAL',
    children: [
      { label: 'DOCUMENTOS', option: 'documentos' }
    ]
  }
]

const Dashboard: React.FC<DashboardProps> = ({ activeMenu, setActiveMenu }) => {
  const [openMenus, setOpenMenus] = useState<string[]>([])

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
        <Header />
      <div className="dashboard-header">
        <h1></h1>
      </div>

      <nav className="dashboard-nav">{renderMenu(menuItems)}</nav>

      <div className="dashboard-footer">
        <p>Inicio de Sesión</p>
      </div>
    </div>
  )
}

export default Dashboard
