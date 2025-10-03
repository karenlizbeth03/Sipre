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
  const [name, setName] = useState(initialData?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name }; // 👈 ahora solo mandamos "name"
    if (mode === 'add' && onAddItem) {
      onAddItem(data);
    } else if (mode === 'edit' && onSubmit) {
      onSubmit(data);
    }
  };

  useEffect(() => {
    setName(initialData?.name || '');
  }, [initialData]);

  return (
    <form className="menu-item-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre del menú"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      
      <div className="form-buttons">
        <button type="submit">{mode === 'add' ? 'Agregar' : 'Actualizar'}</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
};
