import React, { useState } from 'react';
import Header from './components/Header/Header';
import Login from './components/Login/Login';
import Dashboard from './pages/Dashboard/Principal/Dashboard';
import DashboardUser from './pages/Dashboard/Usuarios/Dashboard';
import DocumentManager from './pages/GestorDocumental/DocumentManager/DocumentManager';
import Home from './components/Home';
import './App.css';

export type MenuOption =
  | 'home'
  | 'documents'
  | 'ficha-usuario'
  | 'ruta-entregas'
  | 'datos-empresa'
  | 'roles-usuarios'
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
  |'nuevo_menu'  
  | 'reporte-ti-actividades';

function App() {
  const [activeMenu, setActiveMenu] = useState<MenuOption>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  // Mostrar login desde Header
  const handleLoginClick = () => {
    setShowLogin(true);
  };

  // Login exitoso
  const handleLogin = (username: string, password: string) => {
    if (username === 'admin' && password === 'admin') {
      setUserRole('admin');
      setIsLoggedIn(true);
      setShowLogin(false);
    } else if (username === 'user' && password === 'user') {
      setUserRole('user');
      setIsLoggedIn(true);
      setShowLogin(false);
    } else {
      alert('Credenciales incorrectas. Use admin/admin o user/user');
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setActiveMenu('home');
    setShowLogin(true); // opcional: mostrar login al cerrar sesión
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'home':
        return <Home />;
      case 'documents':
        return <DocumentManager />;
      case 'ficha-usuario':
        return <div>Contenido del Dashboard del usuario</div>;
      default:
        return <div style={{ padding: '20px' }}>Página: {activeMenu}</div>;
    }
  };

  return (
    <div className="app">
      <Header onLoginClick={handleLoginClick} />

      {/* Login modal flotante si no está logueado */}
      {!isLoggedIn && showLogin && <Login onLogin={handleLogin} />}

      {/* Dashboard según rol */}
      {isLoggedIn && userRole === 'admin' && (
        <Dashboard activeMenu={activeMenu} setActiveMenu={setActiveMenu} onLogout={handleLogout} />
      )}
      {isLoggedIn && userRole === 'user' && (
        <DashboardUser activeMenu={activeMenu} setActiveMenu={setActiveMenu} onLogout={handleLogout} />
      )}

      <main className="main-content">{isLoggedIn && renderContent()}</main>
    </div>
  );
}

export default App;
