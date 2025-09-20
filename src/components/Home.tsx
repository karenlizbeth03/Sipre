import React from "react";
import DocumentsPanel from "../pages/GestorDocumental/DocumentsPanel";
import type { Document } from "../types";

interface HomeProps {
  documents: Document[];
}

const Home: React.FC<HomeProps> = ({ documents }) => {
  return (
    <div className="home">
      <div className="page-content">
        <div className="hero-section">
          <h1>Bienvenido</h1>
        </div>

        <DocumentsPanel documents={documents} />
      </div>
    </div>
  );
};

export default Home;
