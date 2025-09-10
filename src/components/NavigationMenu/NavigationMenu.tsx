/* import { useState } from 'react';
import type { MenuSection, MenuItem } from '../../types';

interface NavigationMenuProps {
  sections: MenuSection[];
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({ sections }) => {
  const [activeMenus, setActiveMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (menuId: string) => {
    setActiveMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const renderMenuItems = (items: MenuItem[], level = 0) => {
    return (
      <ul className={`menu-level-${level}`}>
        {items.map(item => (
          <li key={item.id} className="menu-item">
            {item.url ? (
              <a href={item.url} className="menu-link">
                {item.title}
                {item.children && item.children.length > 0 && (
                  <span className="menu-arrow">▼</span>
                )}
              </a>
            ) : (
              <div 
                className="menu-toggle"
                onClick={() => toggleMenu(item.id)}
              >
                <span>{item.title}</span>
                {item.children && item.children.length > 0 && (
                  <span className={`menu-arrow ${activeMenus[item.id] ? 'open' : ''}`}>
                    ▼
                  </span>
                )}
              </div>
            )}
            
            {item.children && item.children.length > 0 && activeMenus[item.id] && (
              <div className="submenu">
                {renderMenuItems(item.children, level + 1)}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <nav className="user-navigation">
      {sections.map(section => (
        <div key={section.id} className="menu-section">
          <h3 className="section-title">{section.title}</h3>
          {renderMenuItems(section.items)}
        </div>
      ))}
    </nav>
  );
}; */
import type { MenuSection } from '../../types';

interface NavigationMenuProps {
  sections: MenuSection[];
}

// Este componente solo sirve para pasar datos al DashboardUser
export const NavigationMenu: React.FC<NavigationMenuProps> = ({ sections }) => {
  return null;
};

// Asignar nombre para poder identificarlo
NavigationMenu.displayName = 'NavigationMenu';