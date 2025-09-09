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

  const addSection = (title: string) => {
    const newSection: MenuSection = {
      id: Date.now().toString(),
      title,
      items: []
    };
    setSections([...sections, newSection]);
  };

  const addMenuItem = (sectionId: string, item: MenuItem, parentId?: string) => {
    const updateNestedItems = (items: MenuItem[]): MenuItem[] => {
      return items.map(currentItem => {
        if (currentItem.id === parentId) {
          return {
            ...currentItem,
            children: [...(currentItem.children || []), item]
          };
        } else if (currentItem.children) {
          return {
            ...currentItem,
            children: updateNestedItems(currentItem.children)
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

  const removeMenuItem = (sectionId: string, itemId: string) => {
    // Implementar lógica para eliminar items
  };

  return { sections, addSection, addMenuItem, removeMenuItem };
};