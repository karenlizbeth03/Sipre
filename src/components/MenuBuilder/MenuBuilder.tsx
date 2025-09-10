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

  const handleAddMenuItem = (sectionId: string, parentId: string | null, itemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = { ...itemData, id: Date.now().toString() };
    addMenuItem(sectionId, newItem, parentId || undefined);
    setActiveItem(null);
  };

  const handleUpdateMenuItem = (sectionId: string, itemId: string, itemData: Omit<MenuItem, 'id'>) => {
    updateMenuItem(sectionId, itemId, itemData);
    setEditItemId(null);
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    addSection(newSectionTitle.trim());
    setNewSectionTitle('');
  };

  const renderMenuItems = (items: MenuItem[], sectionId: string, level = 0) => (
    <ul className="menu-list" style={{ marginLeft: `${level * 20}px` }}>
      {items.map(item => (
        <li key={item.id}>
          <div className="menu-item">
            <span>{item.title}</span>
            <div className="menu-buttons">
              <button onClick={() => setActiveItem(item.id)}>+ Submenú</button>
              <button onClick={() => setEditItemId(item.id)}>Editar</button>
              <button onClick={() => removeMenuItem(sectionId, item.id)}>Eliminar</button>
            </div>
          </div>

          {item.children && renderMenuItems(item.children, sectionId, level + 1)}

          {activeItem === item.id && (
            <MenuItemForm
              key={`add-${item.id}`}
              mode="add"
              onAddItem={(data) => handleAddMenuItem(sectionId, item.id, data)}
              onCancel={() => setActiveItem(null)}
            />
          )}

          {editItemId === item.id && (
            <MenuItemForm
              key={`edit-${item.id}`}
              mode="edit"
              initialData={{ title: item.title, option: item.option }}
              onSubmit={(data) => handleUpdateMenuItem(sectionId, item.id, data)}
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

      <div className="section-creator">
        <input
          type="text"
          placeholder="Nueva sección..."
          value={newSectionTitle}
          onChange={(e) => setNewSectionTitle(e.target.value)}
        />
        <button onClick={handleAddSection}>+ Sección</button>
      </div>

      {sections.map(section => (
        <div key={section.id} className="section">
          <h3>
            {section.title}{' '}
            <button onClick={() => removeSection(section.id)}>Eliminar Sección</button>
          </h3>

          {renderMenuItems(section.items, section.id)}

          {activeItem === section.id && (
            <MenuItemForm
              key={`add-root-${section.id}`}
              mode="add"
              onAddItem={(data) => handleAddMenuItem(section.id, null, data)}
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
