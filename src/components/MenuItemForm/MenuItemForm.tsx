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

  // Mantener el valor sincronizado si initialData cambia
  useEffect(() => {
    setName(initialData?.name || '');
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: name.trim() };
    if (!data.name) return; // Validación simple

    if (mode === 'add' && onAddItem) {
      onAddItem(data); // MenuBuilder se encargará de agregar parentId o sectionId
    } else if (mode === 'edit' && onSubmit) {
      onSubmit(data);
    }
  };

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
