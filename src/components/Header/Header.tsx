// components/Header.tsx
import React from 'react'
import './Header.css'

const Header: React.FC = () => {
  return (
    <header className="header">
      <h1 className="logo">Sipre</h1>
      <button className="login-btn">Iniciar Sesión</button>
    </header>
  )
}

export default Header
