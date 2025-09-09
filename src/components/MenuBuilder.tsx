import { useState } from 'react';
import type { MenuSection, MenuItem } from '../types';
import { MenuItemForm } from './MenuItemForm';
import { useMenu } from '../hooks/useMenu';

const MenuBuilder: React.FC = () => {
  const { sections, addSection, addMenuItem } = useMenu();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    addSection(newSectionTitle.trim());
    setNewSectionTitle('');
  };

  const handleAddMenuItem = (parentId: string | null, itemData: Omit<MenuItem, 'id'>) => {
    if (!activeSection) return;
    
    const newItem: MenuItem = {
      ...itemData,
      id: Date.now().toString()
    };
    
    addMenuItem(activeSection, newItem, parentId || undefined);
    setActiveItem(null);
  };

  const renderMenuItems = (items: MenuItem[], level = 0) => {
    return (
      <ul style={{ marginLeft: `${level * 20}px` }}>
        {items.map(item => (
          <li key={item.id}>
            <div className="menu-item">
              <span>{item.title}</span>
              <button onClick={() => setActiveItem(item.id)}>+ Submenú</button>
            </div>
            {item.children && renderMenuItems(item.children, level + 1)}
            {activeItem === item.id && (
              <MenuItemForm
                onAddItem={(itemData) => handleAddMenuItem(item.id, itemData)}
                onCancel={() => setActiveItem(null)}
              />
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="menu-builder">
      <h2>ADMIN</h2>
      
      <div className="section-creator">
        <input
          type="text"
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
          placeholder="Nueva sección"
        />
        <button onClick={handleAddSection}>Agregar Sección</button>
      </div>

      <div className="sections">
        {sections.map(section => (
          <div key={section.id} className="section">
            <h3 onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}>
              {section.title}
            </h3>
            
            {activeSection === section.id && (
              <>
                <button onClick={() => setActiveItem('root')}>+ Agregar Item</button>
                {activeItem === 'root' && (
                  <MenuItemForm
                    onAddItem={(itemData) => handleAddMenuItem(null, itemData)}
                    onCancel={() => setActiveItem(null)}
                  />
                )}
                {renderMenuItems(section.items)}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuBuilder; // Exportación por defecto