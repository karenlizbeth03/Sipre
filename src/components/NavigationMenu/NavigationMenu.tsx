
import type { MenuSection } from '../../types';

interface NavigationMenuProps {
  sections: MenuSection[];
}

// Este componente solo sirve para pasar datos al DashboardUser
export const NavigationMenu: React.FC<NavigationMenuProps> = ({ sections }) => {
  return null;
};

// Asignar nombre para poder identificarlo
NavigationMenu.displayName = 'NavigationMenu';