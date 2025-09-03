import React, { useState } from 'react'
import Dashboard from './pages/Dashboard/Principal/Dashboard'
import DocumentManager from './pages/GestorDocumental/DocumentManager/DocumentManager'
import Home from './components/Home'
import './App.css'

// Ahora MenuOption incluye todas las opciones posibles
export type MenuOption =
  | 'home'
  | 'documents'
  | 'ruta-entregas'
  | 'datos-empresa'
  | 'roles-usuarios'
  | 'ficha-usuario'
  | 'nuevo-ticket-marketing'
  | 'listado-tickets-marketing'
  | 'listado-tickets-asignados'
  | 'tickets-cerrados'
  | 'reporte-fechas'
  | 'reporte-actividades'
  | 'listado-ot'
  | 'nueva-ot'
  | 'ot-cerrados'
  | 'listado-ot-asignados'
  | 'editar-ot'
  | 'datos-envio-ost'
  | 'reporte-general-ot'
  | 'reporte-repuestos-ot'
  | 'ficha-cliente'
  | 'listado-postventa'
  | 'nueva-postventa'
  | 'ruta-camiones'
  | 'categoria'
  | 'sub-categoria'
  | 'listado-tickets-soporte'
  | 'nuevo-ticket-soporte'
  | 'tickets-soporte-asignados'
  | 'busqueda-ticket'
  | 'reporte-ti-fechas'
  | 'reporte-ti-actividades'
  | 'documentos'

function App() {
  const [activeMenu, setActiveMenu] = useState<MenuOption>('home')

  const renderContent = () => {
    switch (activeMenu) {
      case 'home':
        return <Home />
      case 'documents':
        return <DocumentManager />
      // Aquí puedes agregar más casos para otras opciones del menú
      default:
        return <div style={{ padding: '20px' }}>Página: {activeMenu}</div>
    }
  }

  return (
    <div className="app">
      <Dashboard activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <main className="main-content">{renderContent()}</main>
    </div>
  )
}

export default App
