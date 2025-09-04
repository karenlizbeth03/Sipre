import React, { useState } from 'react';
import Dashboard from './pages/Dashboard/Principal/Dashboard';
import DashboardUser from './pages/Dashboard/Usuarios/Dashboard';
import DocumentManager from './pages/GestorDocumental/DocumentManager/DocumentManager';
import Home from './components/Home';
import Login from './components/Login/Login';
import './App.css';

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
  | 'reporte-ti-actividades';

function App() {
  const [activeMenu, setActiveMenu] = useState<MenuOption>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');

  const handleLogin = (username: string, password: string) => {
    // Lógica de autenticación básica
    if (username === 'admin' && password === 'admin') {
      setUserRole('admin');
      setIsLoggedIn(true);
    } else if (username === 'user' && password === 'user') {
      setUserRole('user');
      setIsLoggedIn(true);
    } else {
      alert('Credenciales incorrectas. Use admin/admin o user/user');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveMenu('home');
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'home':
        return <Home />;
      case 'documents':
        return <DocumentManager />;
      // Aquí puedes agregar más casos para otras opciones del menú
      default:
        return <div style={{ padding: '20px' }}>Página: {activeMenu}</div>;
    }
  };

  return (
    <div className="app">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          {userRole === 'admin' ? (
            <Dashboard activeMenu={activeMenu} setActiveMenu={setActiveMenu} onLogout={handleLogout} />
          ) : (
            <DashboardUser activeMenu={activeMenu} setActiveMenu={setActiveMenu} onLogout={handleLogout} />
          )}
          <main className="main-content">{renderContent()}</main>
        </>
      )}
    </div>
  );
}

export default App;