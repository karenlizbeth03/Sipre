export interface MenuItem {
  id: string;
  title: string;
  url?: string;
  children?: MenuItem[];
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}