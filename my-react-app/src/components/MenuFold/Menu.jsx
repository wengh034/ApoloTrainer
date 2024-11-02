import React, { useState } from 'react';
import SVGComponent from '../SVGComponent';

const MenuBar = ({ onMenuClick }) => {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menus = [
    { id: 1, name: "Inicio", icon: <SVGComponent src="./src/assets/home.svg" color="#1f2937" /> },
    { id: 2, name: "Alumnos", icon: <SVGComponent src="./src/assets/group.svg" color="#1f2937" /> },
    { id: 3, name: "Gimnasios", icon: <SVGComponent src="./src/assets/exercise.svg" color="#1f2937" /> },
    { id: 4, name: "Finanzas", icon: <SVGComponent src="./src/assets/wallet.svg" color="#1f2937" /> },
  ];
  const handleMenuClick = (id) => {
    setActiveMenuId(id); // Actualiza el estado activo
    onMenuClick(id); // Llama a la función onMenuClick pasada como prop
  };

  return (
    <div className="menu-bar">
      {menus.map((menu) => (
        <button
          key={menu.id}
          className={`menu-button ${activeMenuId === menu.id ? 'active' : ''}`} // Aplica clase 'active' si es el menú activo
          onClick={() => handleMenuClick(menu.id)} // Maneja el clic
        >
          {menu.icon}
          <span className="menu-text">{menu.name}</span>
        </button>
      ))}
    </div>
  );
};

export default MenuBar;