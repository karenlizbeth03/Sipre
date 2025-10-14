import { useState, useEffect } from "react";
import type { MenuItem, MenuSection } from "../../types";
import { MenuItemForm } from "../MenuItemForm/MenuItemForm";
import { useMenu } from "../../hooks/useMenu";
import "./MenuBuilder.css";

const API_URL = "http://192.168.2.201:3000/menus";

// Normaliza la estructura del backend
const normalizeMenuTree = (menus: any[]): MenuSection[] => {
  return menus.map((menu) => ({
    id: menu.id,
    name: menu.name,
    children: menu.submenus ? normalizeMenuTree(menu.submenus) : [],
    items: menu.submenus ? menu.submenus.map((item: any) => ({
      id: item.id,
      name: item.name,
      parent_menu_id: item.parent_menu_id || null,
      children: item.submenus ? normalizeMenuTree(item.submenus) : [],
    })) : [],
  }));
};

const MenuBuilder: React.FC = () => {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const { addMenuItem, updateMenuItem, removeMenuItem, removeSection } = useMenu();
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [newSectionname, setNewSectionname] = useState("");
  const [openSections, setOpenSections] = useState<string[]>([]);

  // Fetch inicial
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Error al cargar menús");

        const result = await res.json();
        const normalized = normalizeMenuTree(result.data || []);
        setSections(normalized);
      } catch (err) {
        console.error(" Error cargando menús:", err);
      }
    };
    fetchMenus();
  }, []);

  // Crear sección raíz
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
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al crear sección");

      const newSection: MenuSection = {
        id: result.data.id,
        name: result.data.name,
        children: [],
        items: [],
      };
      setSections((prev) => [...prev, newSection]);
      setNewSectionname("");
    } catch (err) {
      console.error(" Error creando sección:", err);
    }
  };

  // Crear submenú o item
  const handleAddMenuItem = async (
    sectionId: string,
    parentId: string | null,
    itemData: Omit<MenuItem, "id">
  ) => {
    if (!itemData.name.trim()) return;

    try {
      const token = localStorage.getItem("token") || "";

      // Buscar nivel
      const findMenuLevel = (items: MenuItem[], id: string, level = 0): number | null => {
        for (const item of items) {
          if (item.id === id) return level;
          if (item.children?.length) {
            const found = findMenuLevel(item.children, id, level + 1);
            if (found !== null) return found;
          }
        }
        return null;
      };

      const payload: any = {
        name: itemData.name.trim(),
        parent_menu_id: parentId,
        menu_level: "0",
      };

      if (parentId) {
        const section = sections.find((s) => s.id === sectionId);
        if (section) {
          const parentLevel = findMenuLevel(section.items ?? [], parentId);
          payload.menu_level = parentLevel !== null ? String(parentLevel + 1) : "1";
        }
      } else {
        payload.parent_menu_id = null;
        payload.menu_level = "0";
      }

      console.log("📤 Payload que se enviará:", payload);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        console.error(" Respuesta del backend:", result);
        throw new Error(result.message || "Error al crear menú/submenú");
      }

      const newItem: MenuItem = {
        id: result.data.id,
        name: result.data.name,
        parent_menu_id: payload.parent_menu_id,
        children: [],
      };

      addMenuItem(sectionId, newItem, parentId || undefined);
      setActiveItem(null);
      console.log("✅ Menú/submenú creado con éxito:", newItem);
    } catch (err) {
      console.error(" Error creando menú/submenú:", err);
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
      console.error(" Error actualizando menú:", err);
    }
  };

  // Eliminar sección
  const handleRemoveSection = async (sectionId: string) => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/${sectionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al eliminar sección");

      setSections((prev) => prev.filter((s) => s.id !== sectionId));
      removeSection(sectionId);
    } catch (err) {
      console.error(" Error eliminando sección:", err);
    }
  };

  // Eliminar item
  const handleRemoveItem = async (sectionId: string, itemId: string) => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al eliminar menú/submenú");

      removeMenuItem(sectionId, itemId);
    } catch (err) {
      console.error(" Error eliminando item:", err);
    }
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Render recursivo de items
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

          {Array.isArray(item.children) && item.children.length > 0 &&
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
              onSubmit={(data) => handleUpdateMenuItem(sectionId, item.id, data)}
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
              <span className={`arrow ${openSections.includes(section.id) ? "open" : ""}`}>
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

          {openSections.includes(section.id) &&
            renderMenuItems(section.items || [], section.id)}

          {/* Agregar item raíz */}
          {activeItem === section.id && (
            <MenuItemForm
              key={`add-root-${section.id}`}
              mode="add"
              onAddItem={(data) => handleAddMenuItem(section.id, section.id, data)}
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
