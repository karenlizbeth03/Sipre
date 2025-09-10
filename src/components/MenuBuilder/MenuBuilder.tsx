import { useState } from 'react';
import type { MenuItem } from '../../types';
import { MenuItemForm } from '../MenuItemForm/MenuItemForm';
import { useMenu } from '../../hooks/useMenu';
import './MenuBuilder.css';

const MenuBuilder: React.FC = () => {
  const { sections, addSection, addMenuItem, updateMenuItem, removeMenuItem, removeSection } = useMenu();
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Agregar item
  const handleAddMenuItem = (
    sectionId: string,
    parentId: string | null,
    itemData: Omit<MenuItem, 'id'>
  ) => {
    const newItem: MenuItem = { ...itemData, id: Date.now().toString() };
    addMenuItem(sectionId, newItem, parentId || undefined);
    setActiveItem(null);
  };

  // Editar item
  const handleUpdateMenuItem = (
    sectionId: string,
    itemId: string,
    itemData: Omit<MenuItem, 'id'>
  ) => {
    updateMenuItem(sectionId, itemId, itemData);
    setEditItemId(null);
  };

  // Agregar sección
  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    addSection(newSectionTitle.trim());
    setNewSectionTitle('');
  };

  // Render items recursivos (para submenús)
  const renderMenuItems = (items: MenuItem[], sectionId: string, level = 0) => (
    <ul className="menu-list" style={{ marginLeft: `${level * 20}px` }}>
      {items.map(item => (
        <li key={item.id}>
          <div className="menu-item">
            <span>{item.title}</span>
            <button onClick={() => setActiveItem(item.id)}>+ Submenú</button>
            <button onClick={() => setEditItemId(item.id)}>Editar</button>
            <button onClick={() => removeMenuItem(sectionId, item.id)}>Eliminar</button>
          </div>

          {/* Sub-items */}
          {item.children && renderMenuItems(item.children, sectionId, level + 1)}

          {/* Formulario para agregar submenú */}
          {activeItem === item.id && (
            <MenuItemForm
              onAddItem={(itemData) => handleAddMenuItem(sectionId, item.id, itemData)}
              onCancel={() => setActiveItem(null)}
            />
          )}

          {/* Formulario para editar item */}
          {editItemId === item.id && (
            <MenuItemForm
              initialData={{
                title: item.title,
                option: item.option ?? undefined, // opcional
              }}
              onSubmit={(itemData) => handleUpdateMenuItem(sectionId, item.id, itemData)}
              onCancel={() => setEditItemId(null)}
            />
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="menu-builder">
      <h2>Constructor de Menú</h2>

      {/* Crear nueva sección */}
      <div className="section-creator">
        <input
          type="text"
          placeholder="Nueva sección..."
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
        />
        <button onClick={handleAddSection}>+ Sección</button>
      </div>

      {/* Render secciones */}
      {sections.map(section => (
        <div key={section.id} className="section">
          <h3>
            {section.title}{' '}
            <button onClick={() => removeSection(section.id)}>Eliminar Sección</button>
          </h3>

          {renderMenuItems(section.items, section.id)}

          {/* Formulario para agregar item raíz */}
          {activeItem === section.id && (
            <MenuItemForm
              onAddItem={(itemData) => handleAddMenuItem(section.id, null, itemData)}
              onCancel={() => setActiveItem(null)}
            />
          )}

          <button onClick={() => setActiveItem(section.id)}>+ Item</button>
        </div>
      ))}
    </div>
  );
};

export default MenuBuilder;
