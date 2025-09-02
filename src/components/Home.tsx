import React from 'react'
import Header from './Header'
import './Home.css'

const Home: React.FC = () => {
  return (
    <div className="home">
      <Header />

      <div className="page-content">
        <div className="hero-section">
          <h2>Bienvenido al Gestor de Documentos</h2>
          <p>Gestiona todos tus documentos en un solo lugar</p>
        </div>

        <div className="features">
          <div className="feature-card">
            <h3>Subir Documentos</h3>
            <p>Carga cualquier tipo de documento de forma sencilla</p>
          </div>
          <div className="feature-card">
            <h3>Buscar y Encontrar</h3>
            <p>Encuentra rápidamente los documentos que necesitas</p>
          </div>
          <div className="feature-card">
            <h3>Visualizar</h3>
            <p>Visualiza tus documentos sin necesidad de descargarlos</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
