import { useState, useEffect } from "react";
import type { MenuItem, MenuSection } from "../../types";
import { MenuItemForm } from "../MenuItemForm/MenuItemForm";
import { useMenu } from "../../hooks/useMenu";
import "./MenuBuilder.css";

const API_URL = "http://192.168.2.181:3000/menus";

// Normaliza la estructura del backend
const normalizeMenuTree = (menus: any[]): MenuSection[] => {
  return menus.map((menu) => {
    const section: MenuSection = {
      id: menu.id,
      name: menu.name,
      children: [], // sub-secciones si aplica
      items: [],    // submenús/items
    };

    if (menu.submenus && menu.submenus.length > 0) {
      section.items = menu.submenus.map((item: any) => ({
        id: item.id,
        name: item.name,
        parent_menu_id: item.parent_menu_id || null,
        children: item.submenus
          ? item.submenus.map((sub: any) => ({
              id: sub.id,
              name: sub.name,
              parent_menu_id: sub.parent_menu_id,
              children: [],
            }))
          : [],
      }));
    }

    return section;
  });
};

const MenuBuilder: React.FC = () => {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const { addMenuItem, updateMenuItem, removeMenuItem, removeSection } = useMenu();
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [newSectionname, setNewSectionname] = useState("");
  const [openSections, setOpenSections] = useState<string[]>([]);

  // 🚀 Fetch inicial
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Error al cargar menús");

        const result = await res.json();
        const normalized = normalizeMenuTree(result.data || []);
        setSections(normalized);
      } catch (err) {
        console.error("❌ Error cargando menús:", err);
      }
    };
    fetchMenus();
  }, []);

  // Crear nueva sección raíz
  const handleAddSection = async () => {
    if (!newSectionname.trim()) return;

    try {
      const token = localStorage.getItem("token") || "";
      const payload = { name: newSectionname.trim() };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al crear sección");
      }

      const result = await res.json();
      const newSection: MenuSection = {
        id: result.data.id,
        name: result.data.name,
        children: [],
        items: [],
      };

      setSections((prev) => [...prev, newSection]);
      setNewSectionname("");
    } catch (err) {
      console.error("❌ Error creando sección:", err);
    }
  };

// Crear submenú o item
const handleAddMenuItem = async (
  sectionId: string,
  parentId: string | null,
  itemData: Omit<MenuItem, 'id'>
) => {
  if (!itemData.name.trim()) return;

  try {
    const token = localStorage.getItem('token') || '';

    // Construir payload
    const payload: any = { name: itemData.name.trim() };

    if (parentId) {
      // Submenú → enviar parent_menu_id
      payload.parent_menu_id = parentId;
    } else {
      // Item raíz dentro de la sección → enviar section_id
      payload.section_id = sectionId;
    }

    console.log('📤 Payload que se enviará:', payload);

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error('❌ Respuesta del backend:', result);
      throw new Error(result.message || 'Error al crear menú/submenú');
    }

    // Crear objeto MenuItem para frontend
    const newItem: MenuItem = {
      id: result.data.id,
      name: result.data.name,
      parent_menu_id: parentId || undefined, // submenú tendrá parentId, item raíz undefined
      children: [],
    };

    // Agregar item en la sección correspondiente
    addMenuItem(sectionId, newItem, parentId || undefined);
    setActiveItem(null);

    console.log('✅ Menú/submenú creado con éxito:', newItem);
  } catch (err) {
    console.error('❌ Error creando menú/submenú:', err);
  }
};



  // Actualizar menú
  const handleUpdateMenuItem = async (
    sectionId: string,
    itemId: string,
    itemData: Omit<MenuItem, "id">
  ) => {
    try {
      const res = await fetch(`${API_URL}/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: itemData.name }),
      });

      if (!res.ok) throw new Error("Error al actualizar menú");

      updateMenuItem(sectionId, itemId, itemData);
      setEditItemId(null);
    } catch (err) {
      console.error("❌ Error actualizando menú:", err);
    }
  };

  // Eliminar sección
  const SECTIONS_API_URL = "http://192.168.2.181:3000/sections";

const handleRemoveSection = async (sectionId: string) => {
  try {
    const res = await fetch(`${SECTIONS_API_URL}/${sectionId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar sección");

    removeSection(sectionId);
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  } catch (err) {
    console.error("❌ Error eliminando sección:", err);
  }
};

  // Eliminar item
  const handleRemoveItem = async (sectionId: string, itemId: string) => {
    try {
      const res = await fetch(`${API_URL}/${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar item");

      removeMenuItem(sectionId, itemId);
    } catch (err) {
      console.error("❌ Error eliminando item:", err);
    }
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Render recursivo de items/submenús
  const renderMenuItems = (items: MenuItem[], sectionId: string, level = 0) => (
    <ul
      className="menu-list"
      style={{
        marginLeft: `${level * 20}px`,
        maxHeight: openSections.includes(sectionId) ? "1000px" : "0",
        overflow: "hidden",
        transition: "max-height 0.4s cubic-bezier(.4,0,.2,1)",
      }}
    >
      {items.map((item) => (
        <li key={item.id}>
          <div className="menu-item">
            <span>{item.name}</span>
            <div className="menu-buttons">
              <button onClick={() => setActiveItem(item.id)}>+ Submenú</button>
              <button onClick={() => setEditItemId(item.id)}>Editar</button>
              <button onClick={() => handleRemoveItem(sectionId, item.id)}>
                Eliminar
              </button>
            </div>
          </div>

          {/* Render recursivo */}
          {item.children && item.children.length > 0 &&
            renderMenuItems(item.children, sectionId, level + 1)}

          {activeItem === item.id && (
            <MenuItemForm
              key={`add-${item.id}`}
              mode="add"
              onAddItem={(data) => handleAddMenuItem(sectionId, item.id, data)}
              onCancel={() => setActiveItem(null)}
            />
          )}

          {editItemId === item.id && (
            <MenuItemForm
              key={`edit-${item.id}`}
              mode="edit"
              initialData={{ name: item.name }}
              onSubmit={(data) =>
                handleUpdateMenuItem(sectionId, item.id, data)
              }
              onCancel={() => setEditItemId(null)}
            />
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="menu-builder">
      <h2>Constructor de Menú</h2>

      <div className="section-creator">
        <input
          type="text"
          placeholder="Nueva sección..."
          value={newSectionname}
          onChange={(e) => setNewSectionname(e.target.value)}
        />
        <button onClick={handleAddSection}>+ Sección</button>
      </div>

      {sections.map((section) => (
        <div key={section.id} className="section">
          <h3
            onClick={() => toggleSection(section.id)}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{section.name}</span>
              <span
                className={`arrow ${openSections.includes(section.id) ? "open" : ""}`}
              >
                ▼
              </span>
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveSection(section.id);
              }}
            >
              Eliminar Sección
            </button>
          </h3>

          {/* Render items/submenús */}
          {openSections.includes(section.id) &&
            renderMenuItems(section.items || [], section.id)}

          {/* Agregar item raíz */}
          {activeItem === section.id && (
            <MenuItemForm
              key={`add-root-${section.id}`}
              mode="add"
              onAddItem={(data) => handleAddMenuItem(section.id, null, data)}
              onCancel={() => setActiveItem(null)}
            />
          )}

          {openSections.includes(section.id) && (
            <button onClick={() => setActiveItem(section.id)}>+ Item</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default MenuBuilder;
