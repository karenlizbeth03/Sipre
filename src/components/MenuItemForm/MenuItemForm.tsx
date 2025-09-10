import { useState, useEffect } from 'react';
import type { MenuItem } from '../../types';

interface MenuItemFormProps {
  initialData?: Omit<MenuItem, 'id'>; // para editar
  onAddItem?: (item: Omit<MenuItem, 'id'>) => void;
  onSubmit?: (item: Omit<MenuItem, 'id'>) => void;
  onCancel: () => void;
  mode?: 'add' | 'edit';
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({
  initialData,
  onAddItem,
  onSubmit,
  onCancel,
  mode = 'add'
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [url, setUrl] = useState(initialData?.url || '');

  // Si cambia initialData, actualizar inputs
  useEffect(() => {
    setTitle(initialData?.title || '');
    setUrl(initialData?.url || '');
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const itemData: Omit<MenuItem, 'id'> = {
      title: title.trim(),
      ...(url.trim() && { url: url.trim() })
    };

    if (mode === 'add' && onAddItem) onAddItem(itemData);
    if (mode === 'edit' && onSubmit) onSubmit(itemData);

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
        <button type="submit">{mode === 'add' ? 'Agregar' : 'Actualizar'}</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
};
