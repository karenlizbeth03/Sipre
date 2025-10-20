import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard/Principal/Dashboard';
import DashboardUser from './pages/Dashboard/Usuarios/Dashboard';
import DocumentManager from './pages/GestorDocumental/DocumentManager/DocumentManager';
import MenuBuilder from './components/MenuBuilder/MenuBuilder';
import Login from './components/Login/Login';
import type { UserRole } from './components/Login/Login';
import './App.css';
import type { Document } from './types';
import galaImg from './assets/gala.jpg';
import DashboardSuperAdmin from './pages/Dashboard/SuperAdmin/DashboardSuperAdmin';

export type MenuOption = 'home' | 'documents' | 'nuevo_menu';

function App() {
  const [activeMenu, setActiveMenu] = useState<MenuOption>('home');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [showLogin, setShowLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') as UserRole | null;

    if (token && role) {
      setUserRole(role);
      setShowLogin(false);
    } else {
      setUserRole(null);
      setShowLogin(true);
    }

    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (token: string, role: UserRole) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setUserRole(role);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUserRole(null);
    setActiveMenu('home');
    setShowLogin(true);
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

  const renderContent = () => {
    if (isLoading) return <div>Cargando...</div>;

    if (showLogin || !userRole) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    if (userRole === 'super-admin') {
      return <DashboardSuperAdmin onLogout={handleLogout} />;
    }

    if (userRole === 'admin') {
      return (
        <Dashboard
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onLogout={handleLogout}
        >
          {renderAdminContent()}
        </Dashboard>
      );
    }

    return (
      <DashboardUser
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        onLogout={handleLogout}
        filteredDocs={filteredDocs}
        setFilteredDocs={setFilteredDocs}
      />
    );
  };

  return <div className="app">{renderContent()}</div>;
}

export default App;
