import { useState, useEffect } from "react";
import type { MenuItem, MenuSection } from "../types";

export const useMenu = () => {
  const [sections, setSections] = useState<MenuSection[]>(() => {
    const stored = localStorage.getItem("menuSections");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("menuSections", JSON.stringify(sections));
  }, [sections]);

  const addSection = (name: string) => {
    setSections([...sections, { id: Date.now().toString(), name, children: [] }]);
  };

  const addMenuItem = (sectionId: string, item: MenuItem, parentId?: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? {
            ...section,
            items: parentId
              ? addChild(section.items || [], parentId, item)
              : [...(section.items || []), item],
          }
          : section
      )
    );
  };

  const updateMenuItem = (sectionId: string, itemId: string, newData: Omit<MenuItem, "id">) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? {
            ...section,
            items: updateChild(section.items || [], itemId, newData),
          }
          : section
      )
    );
  };

  const removeMenuItem = (sectionId: string, itemId: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, items: deleteChild(section.items || [], itemId) }
          : section
      )
    );
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  return { sections, addSection, addMenuItem, updateMenuItem, removeMenuItem, removeSection, setSections };
};

// helpers recursivos
const addChild = (children: MenuItem[], parentId: string, newItem: MenuItem): MenuItem[] => {
  return children.map(item =>
    item.id === parentId
      ? { ...item, children: [...(item.children || []), newItem] }
      : { ...item, children: item.children ? addChild(item.children, parentId, newItem) : [] }
  );
};

const updateChild = (children: MenuItem[], itemId: string, newData: Omit<MenuItem, "id">): MenuItem[] => {
  return children.map(item =>
    item.id === itemId
      ? { ...item, ...newData }
      : { ...item, children: item.children ? updateChild(item.children, itemId, newData) : [] }
  );
};

const deleteChild = (children: MenuItem[], itemId: string): MenuItem[] => {
  return children
    .filter(item => item.id !== itemId)
    .map(item => ({ ...item, children: item.children ? deleteChild(item.children, itemId) : [] }));
};

// Si necesitas procesar las secciones, hazlo dentro del hook o exporta una función que lo haga.
// El siguiente bloque fue eliminado porque 'sections' no existe en el ámbito global.
