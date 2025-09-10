import React, { useState } from 'react';
import Dashboard from './pages/Dashboard/Principal/Dashboard';
import DashboardUser from './pages/Dashboard/Usuarios/Dashboard';
import DocumentManager from './pages/GestorDocumental/DocumentManager/DocumentManager';
import Home from './components/Home';
import MenuBuilder from './components/MenuBuilder/MenuBuilder';
import { NavigationMenu } from './components/NavigationMenu/NavigationMenu';
import { useMenu } from './hooks/useMenu';
import './App.css';

export type MenuOption = 'home' | 'documents' | 'nuevo_menu';

function App() {
  const [activeMenu, setActiveMenu] = useState<MenuOption>('home');
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const { sections } = useMenu(); // 👉 secciones dinámicas desde localStorage

  const toggleRole = () => {
    setUserRole(prev => (prev === 'user' ? 'admin' : 'user'));
    setActiveMenu('home');
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'home':
        return <Home />;
      case 'documents':
        return <DocumentManager />;
      case 'nuevo_menu':
        return <MenuBuilder />; // 👉 Admin construye menús aquí
      default:
        return <div style={{ padding: '20px' }}>Página: {activeMenu}</div>;
    }
  };

  return (
    <div className="app">
      <div style={{ position: 'fixed', top: 20, right: 20 }}>
        <button onClick={toggleRole} className="btn toggle">
          Cambiar a {userRole === 'user' ? 'Admin' : 'Usuario'}
        </button>
      </div>

      {userRole === 'admin' && (
        <Dashboard
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onLogout={toggleRole}
        >
          {renderContent()}
        </Dashboard>
      )}

      {userRole === 'user' && (
        <DashboardUser
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onLogout={toggleRole}
        >
          {/* 👉 Menú dinámico que el admin construyó */}
          <NavigationMenu sections={sections} />
          {renderContent()}
        </DashboardUser>
      )}
    </div>
  );
}

export default App;
