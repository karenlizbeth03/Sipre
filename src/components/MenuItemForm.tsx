import { useState } from 'react';
import type { MenuItem } from '../types';

interface MenuItemFormProps {
  onAddItem: (item: Omit<MenuItem, 'id'>) => void;
  onCancel: () => void;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({ onAddItem, onCancel }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAddItem({
      title: title.trim(),
      ...(url.trim() && { url: url.trim() })
    });
    
    setTitle('');
    setUrl('');
  };

  return (
    <form onSubmit={handleSubmit} className="menu-item-form">
      <div>
        <label htmlFor="title">Título:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="url">URL (opcional):</label>
        <input
          type="text"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <div className="form-actions">
        <button type="submit">Agregar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
};