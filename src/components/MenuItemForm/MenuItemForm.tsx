import React, { useState, useEffect } from 'react';
import type { MenuItem } from '../../types';

interface MenuItemFormProps {
  initialData?: Omit<MenuItem, 'id'>;
  mode?: 'add' | 'edit';
  onAddItem?: (item: Omit<MenuItem, 'id'>) => void;
  onSubmit?: (item: Omit<MenuItem, 'id'>) => void;
  onCancel: () => void;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({
  initialData,
  mode = 'add',
  onAddItem,
  onSubmit,
  onCancel
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [option, setOption] = useState(initialData?.option || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { title, option };
    if (mode === 'add' && onAddItem) {
      onAddItem(data);
    } else if (mode === 'edit' && onSubmit) {
      onSubmit(data);
    }
  };

  useEffect(() => {
    setTitle(initialData?.title || '');
    setOption(initialData?.option || '');
  }, [initialData]);

  return (
    <form className="menu-item-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Opción (opcional)"
        value={option}
        onChange={(e) => setOption(e.target.value)}
      />
      <div className="form-buttons">
        <button type="submit">{mode === 'add' ? 'Agregar' : 'Actualizar'}</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
};
