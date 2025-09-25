import React from "react";
import GalaImage from "../assets/Gala.png"; // 🔹 Ajusta la ruta si cambia
import "./Home.css";

const Home: React.FC = () => {
  return (
    <div className="home">
      <div className="hero-section">
        <img src={GalaImage} alt="Gala" className="home-image" />
      </div>
    </div>
  );
};

export default Home;
