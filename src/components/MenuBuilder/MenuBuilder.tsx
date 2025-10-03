import { useState, useEffect } from "react";
import type { MenuItem, MenuSection } from "../../types";
import { MenuItemForm } from "../MenuItemForm/MenuItemForm";
import { useMenu } from "../../hooks/useMenu";
import "./MenuBuilder.css";

const API_URL = "http://192.168.2.165:3000/menus";

// 🔧 Helper para construir árbol a partir de parent_menu_id
const buildMenuTree = (flatMenus: any[]): MenuSection[] => {
  const map = new Map<string, any>();
  const roots: MenuSection[] = [];

  // Normalizar
  flatMenus.forEach((item) => {
    map.set(item.id, {
      id: item.id,
      name: item.name,
      parentId: item.parent_menu_id,
      items: [],
    });
  });

  // Armar árbol
  map.forEach((item) => {
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId).items.push(item);
    } else {
      roots.push(item);
    }
  });

  return roots;
};

const MenuBuilder: React.FC = () => {
  // 👇 Usamos state local para controlar los menús
  const [sections, setSections] = useState<MenuSection[]>([]);

  const { addMenuItem, updateMenuItem, removeMenuItem, removeSection } = useMenu();

  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [newSectionname, setNewSectionname] = useState("");
  const [openSections, setOpenSections] = useState<string[]>([]);

  // 🚀 Fetch inicial desde backend
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Error al cargar menús");

        const result = await res.json();
        const tree = buildMenuTree(result.data || []);
        setSections(tree);
        console.info("✅ Menús cargados en MenuBuilder:", tree);
      } catch (err) {
        console.error("❌ Error cargando menús:", err);
      }
    };

    fetchMenus();
  }, []);

  // 📌 Crear nueva sección
  const handleAddSection = async () => {
    if (!newSectionname.trim()) return;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSectionname, parent_menu_id: null }),
      });

      if (!res.ok) throw new Error("Error al crear menú");

      const result = await res.json();
      const newMenu = {
        id: result.data.id,
        name: result.data.name,
        parentId: null,
        items: [],
      };

      setSections((prev) => [...prev, newMenu]);
      setNewSectionname("");
    } catch (err) {
      console.error("❌ Error creando sección:", err);
    }
  };

  // 📌 Agregar submenú
  const handleAddMenuItem = async (
    sectionId: string,
    parentId: string | null,
    itemData: Omit<MenuItem, "id">
  ) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: itemData.name,
          parent_menu_id: parentId,
        }),
      });

      if (!res.ok) throw new Error("Error al crear submenú");

      const result = await res.json();
      const newItem: MenuItem = {
        id: result.data.id,
        name: result.data.name,
        option: itemData.option,
        children: [],
      };

      addMenuItem(sectionId, newItem, parentId || undefined);
      setActiveItem(null);
    } catch (err) {
      console.error("❌ Error creando submenú:", err);
    }
  };

  // 📌 Actualizar menú
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

  // 📌 Eliminar menú o sección
  const handleRemoveSection = async (sectionId: string) => {
    try {
      const res = await fetch(`${API_URL}/${sectionId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar sección");

      removeSection(sectionId);
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
    } catch (err) {
      console.error("❌ Error eliminando sección:", err);
    }
  };

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

  const renderMenuItems = (
    items: MenuItem[],
    sectionId: string,
    level = 0
  ) => (
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

          {item.children &&
            renderMenuItems(item.children, sectionId, level + 1)}

          {activeItem === item.id && (
            <MenuItemForm
              key={`add-${item.id}`}
              mode="add"
              onAddItem={(data) =>
                handleAddMenuItem(sectionId, item.id, data)
              }
              onCancel={() => setActiveItem(null)}
            />
          )}

          {editItemId === item.id && (
            <MenuItemForm
              key={`edit-${item.id}`}
              mode="edit"
              initialData={{ name: item.name, option: item.option }}
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
                className={`arrow ${
                  openSections.includes(section.id) ? "open" : ""
                }`}
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

          {openSections.includes(section.id) &&
            renderMenuItems(section.items, section.id)}

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
