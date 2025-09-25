import React, { useState } from 'react';
import Dashboard from './pages/Dashboard/Principal/Dashboard';
import DashboardUser from './pages/Dashboard/Usuarios/Dashboard';
import DocumentManager from './pages/GestorDocumental/DocumentManager/DocumentManager';
import MenuBuilder from './components/MenuBuilder/MenuBuilder';
import { useMenu } from './hooks/useMenu';
import './App.css';
import type { Document } from './types';
import galaImg from './assets/gala.jpg';


export type MenuOption = 'home' | 'documents' | 'nuevo_menu';

function App() {
  const [activeMenu, setActiveMenu] = useState<MenuOption>('home');
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]); // 🔹 Estado agregado
  const { sections } = useMenu();

  const toggleRole = () => {
    setUserRole(prev => (prev === 'user' ? 'admin' : 'user'));
    setActiveMenu('home');
  };

  // Contenido solo para admin
  const renderAdminContent = () => {
    switch (activeMenu) {
      case 'documents':
        return <DocumentManager />;
      case 'nuevo_menu':
        return <MenuBuilder />;
      case 'home':
        return (
          <div>
            <img src={galaImg} alt="Inicio" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
          </div>
        );
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

      {/* Vista Admin */}
      {userRole === 'admin' && (
        <Dashboard
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onLogout={toggleRole}
        >
          {renderAdminContent()}
        </Dashboard>
      )}

      {/* Vista Usuario */}
      {userRole === 'user' && (
        <DashboardUser
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onLogout={toggleRole}
          filteredDocs={filteredDocs} 
          setFilteredDocs={setFilteredDocs} // 🔹 Ahora definido
        />
      )}
    </div>
  );
}

export default App;
