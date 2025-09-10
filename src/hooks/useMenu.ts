import { useState, useEffect } from 'react';
import type { MenuItem, MenuSection } from '../types';

export const useMenu = () => {
  const [sections, setSections] = useState<MenuSection[]>(() => {
    const saved = localStorage.getItem('menu-sections');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('menu-sections', JSON.stringify(sections));
  }, [sections]);

  // ---------------------------
  // Agregar sección
  // ---------------------------
  const addSection = (title: string) => {
    const newSection: MenuSection = {
      id: Date.now().toString(),
      title,
      items: [],
    };
    setSections([...sections, newSection]);
  };

  // ---------------------------
  // Agregar item o subitem
  // ---------------------------
  const addMenuItem = (sectionId: string, item: MenuItem, parentId?: string) => {
    const updateNestedItems = (items: MenuItem[]): MenuItem[] => {
      return items.map(currentItem => {
        if (currentItem.id === parentId) {
          return {
            ...currentItem,
            children: [...(currentItem.children || []), item],
          };
        } else if (currentItem.children) {
          return {
            ...currentItem,
            children: updateNestedItems(currentItem.children),
          };
        }
        return currentItem;
      });
    };

    setSections(sections.map(section => {
      if (section.id === sectionId) {
        if (!parentId) {
          return { ...section, items: [...section.items, item] };
        } else {
          return { ...section, items: updateNestedItems(section.items) };
        }
      }
      return section;
    }));
  };

  // ---------------------------
  // Eliminar item (recursivo)
  // ---------------------------
  const removeMenuItem = (sectionId: string, itemId: string) => {
    const removeNested = (items: MenuItem[]): MenuItem[] =>
      items
        .filter(i => i.id !== itemId)
        .map(i => ({ ...i, children: i.children ? removeNested(i.children) : [] }));

    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return { ...section, items: removeNested(section.items) };
      }
      return section;
    }));
  };

  // ---------------------------
  // Editar item (recursivo)
  // ---------------------------
  const updateMenuItem = (sectionId: string, itemId: string, newData: Omit<MenuItem, 'id'>) => {
    const updateNested = (items: MenuItem[]): MenuItem[] =>
      items.map(i =>
        i.id === itemId
          ? { ...i, ...newData }
          : { ...i, children: i.children ? updateNested(i.children) : [] }
      );

    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return { ...section, items: updateNested(section.items) };
      }
      return section;
    }));
  };

  // ---------------------------
  // Eliminar sección completa
  // ---------------------------
  const removeSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  return { sections, addSection, addMenuItem, removeMenuItem, updateMenuItem, removeSection };
};
