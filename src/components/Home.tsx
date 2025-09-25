import React from "react";
// import DocumentsPanel from "../pages/GestorDocumental/DocumentsPanel";
import type { Document } from "../types";
import galaImg from '../assets/gala.jpg';

interface HomeProps {
  documents: Document[];
}

const Home: React.FC<HomeProps> = ({ documents }) => {
  return (
    <div className="home">
      <div className="page-content">
        <div className="hero-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <img src={galaImg} alt="Inicio" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', marginTop: '24px' }} />
        </div>
      </div>
    </div>
  );
};

export default Home;
