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
