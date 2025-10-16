import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard/Principal/Dashboard';
import DashboardUser from './pages/Dashboard/Usuarios/Dashboard';
import DocumentManager from './pages/GestorDocumental/DocumentManager/DocumentManager';
import MenuBuilder from './components/MenuBuilder/MenuBuilder';
import Login from './components/Login/Login';
import { useMenu } from './hooks/useMenu';
import './App.css';
import type { Document } from './types';
import galaImg from './assets/gala.jpg';

export type MenuOption = 'home' | 'documents' | 'nuevo_menu';

function App() {
  const [activeMenu, setActiveMenu] = useState<MenuOption>('home');
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [showLogin, setShowLogin] = useState(false);
  const { sections } = useMenu();


useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    setUserRole('admin');
  } else {
    setUserRole('user');
  }
}, []);

const handleLoginSuccess = (token: string) => {
  localStorage.setItem("token", token);
  setShowLogin(false);
  setTimeout(() => {
    setUserRole("admin");
  }, 0);
};



const handleLogout = () => {
  localStorage.removeItem('token');
  setUserRole('user');
  setActiveMenu('home');
};

  const renderAdminContent = () => {
    switch (activeMenu) {
      case 'documents':
        return <DocumentManager />;
      case 'nuevo_menu':
        return <MenuBuilder />;
      default:
        return (
          <div>
            <img
              src={galaImg}
              alt="Inicio"
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            />
          </div>
        );
    }
  };
  return (
    <div className="app">
      {showLogin ? (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onCancel={() => setShowLogin(false)}
        />
      ) : userRole === 'admin' ? (
        <Dashboard
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onLogout={handleLogout}
        >
          {renderAdminContent()}
        </Dashboard>
      ) : (
        <DashboardUser
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onLogout={() => setShowLogin(true)}
          filteredDocs={filteredDocs}
          setFilteredDocs={setFilteredDocs}
        />
      )}
    </div>
  );

}

export default App;
