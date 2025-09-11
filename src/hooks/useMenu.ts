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

  const addSection = (title: string) => {
    setSections([...sections, { id: Date.now().toString(), title, items: [] }]);
  };

  const addMenuItem = (sectionId: string, item: MenuItem, parentId?: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: parentId
                ? addChild(section.items, parentId, item)
                : [...section.items, item],
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
              items: updateChild(section.items, itemId, newData),
            }
          : section
      )
    );
  };

  const removeMenuItem = (sectionId: string, itemId: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, items: deleteChild(section.items, itemId) }
          : section
      )
    );
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  return { sections, addSection, addMenuItem, updateMenuItem, removeMenuItem, removeSection };
};

// helpers recursivos
const addChild = (items: MenuItem[], parentId: string, newItem: MenuItem): MenuItem[] => {
  return items.map(item =>
    item.id === parentId
      ? { ...item, children: [...(item.children || []), newItem] }
      : { ...item, children: item.children ? addChild(item.children, parentId, newItem) : [] }
  );
};

const updateChild = (items: MenuItem[], itemId: string, newData: Omit<MenuItem, "id">): MenuItem[] => {
  return items.map(item =>
    item.id === itemId
      ? { ...item, ...newData }
      : { ...item, children: item.children ? updateChild(item.children, itemId, newData) : [] }
  );
};

const deleteChild = (items: MenuItem[], itemId: string): MenuItem[] => {
  return items
    .filter(item => item.id !== itemId)
    .map(item => ({ ...item, children: item.children ? deleteChild(item.children, itemId) : [] }));
};
