// types.ts
export type MenuOption = 'home' | 'documents' | 'nuevo_menu';

export interface MenuItem {
  id: string;
  name: string;        
  parent_menu_id?: string | null;
  option?: MenuOption;
  url?: string;        
  children?: MenuItem[];
  submenus?: MenuItem[];
  menu_level: string; 
  
}

export interface MenuSection {
  
  id: string;
  name: string;
  children: MenuSection[];
  items?: MenuItem[];
  submenus?: MenuSection[];
}


export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  url: string;
  menuId?: string;
  menuName?: string;
  path: string;
  state: number;
  updatedAt: string;
  user_edit?: {
    id: string;
    name: string;
  };
}
