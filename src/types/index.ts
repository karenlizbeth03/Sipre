// types.ts
export type MenuOption = 'home' | 'documents' | 'nuevo_menu';

export interface MenuItem {
  id: string;
  title: string;
  option?: MenuOption; // navegación interna
  url?: string;        // navegación externa
  children?: MenuItem[];
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  url: string;
  menuId?: string; // 🔑 para saber a qué menú pertenece
}