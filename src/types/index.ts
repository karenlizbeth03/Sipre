export interface MenuItem {
  id: string;
  title: string;
  option?: string;
  url?: string; // <-- agregar aquí
  children?: MenuItem[];
}


export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}
