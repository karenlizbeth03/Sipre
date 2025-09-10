import { useState, useEffect } from 'react';
import type { MenuItem, MenuSection } from '../types';

export const useMenu = () => {
  const [sections, setSections] = useState<MenuSection[]>(() => {
    const saved = localStorage.getItem('menu-sections');
    return saved ? JSON.parse(saved) : [];
  });

  // Guardar cambios en localStorage
  useEffect(() => {
    localStorage.setItem('menu-sections', JSON.stringify(sections));
  }, [sections]);

  // Agregar sección
  const addSection = (title: string) => {
    const newSection: MenuSection = {
      id: Date.now().toString(),
      title,
      items: [],
    };
    setSections(prev => [...prev, newSection]);
  };

  // Agregar item o subitem
  const addMenuItem = (sectionId: string, item: MenuItem, parentId?: string) => {
    const updateNestedItems = (items: MenuItem[]): MenuItem[] =>
      items.map(currentItem => {
        if (currentItem.id === parentId) {
          return {
            ...currentItem,
            children: [...(currentItem.children || []), item],
          };
        } else if (currentItem.children) {
          return { ...currentItem, children: updateNestedItems(currentItem.children) };
        }
        return currentItem;
      });

    setSections(prev =>
      prev.map(section => {
        if (section.id === sectionId) {
          return !parentId
            ? { ...section, items: [...section.items, item] }
            : { ...section, items: updateNestedItems(section.items) };
        }
        return section;
      })
    );
  };

  // Eliminar item
  const removeMenuItem = (sectionId: string, itemId: string) => {
    const removeNested = (items: MenuItem[]): MenuItem[] =>
      items
        .filter(i => i.id !== itemId)
        .map(i => ({ ...i, children: i.children ? removeNested(i.children) : i.children }));

    setSections(prev =>
      prev.map(section =>
        section.id === sectionId ? { ...section, items: removeNested(section.items) } : section
      )
    );
  };

  // Editar item
  const updateMenuItem = (sectionId: string, itemId: string, newData: Omit<MenuItem, 'id'>) => {
    const updateNested = (items: MenuItem[]): MenuItem[] =>
      items.map(item =>
        item.id === itemId
          ? { ...item, ...newData } // mantiene children
          : item.children
          ? { ...item, children: updateNested(item.children) }
          : item
      );

    setSections(prev =>
      prev.map(section =>
        section.id === sectionId ? { ...section, items: updateNested(section.items) } : section
      )
    );
  };

  // Eliminar sección
  const removeSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
  };

  return { sections, addSection, addMenuItem, removeMenuItem, updateMenuItem, removeSection };
};
