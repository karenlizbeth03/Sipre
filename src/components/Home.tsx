import React, { useState } from "react";
import type { Document } from "../types"; // 👈 importa el tipo Document
import galaImg from "../assets/gala.jpg";
import gala2 from "../assets/gala2.jpg";
import gala3 from "../assets/gala3.jpg";
import "./Home.css";

// ✅ 1. Define la interfaz de props
interface HomeProps {
  documents: Document[];
}

// ✅ 2. Define el componente correctamente
const Home: React.FC<HomeProps> = ({ documents }) => {
  const images = [galaImg, gala2, gala3];
  const [paused, setPaused] = useState(false);

  return (
    <div className="home">
      <div className="hero-section">
        <div
          className="carousel-wrapper"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className={`carousel-track ${paused ? "paused" : ""}`}>
            {/* Duplicamos las imágenes para efecto infinito */}
            {[...images, ...images].map((img, i) => (
              <div className="carousel-item" key={i}>
                <img src={img} alt={`img-${i}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
