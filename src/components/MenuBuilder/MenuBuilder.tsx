import { useState, useEffect, useCallback } from "react";
import type { MenuItem, MenuSection } from "../../types";
import { MenuItemForm } from "../MenuItemForm/MenuItemForm";
import { useMenu } from "../../hooks/useMenu";
import "./MenuBuilder.css";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";


const API_URL = "http://192.168.2.226:3000/menus";

// Normaliza la estructura del backend
const normalizeMenuTree = (menus: any[]): MenuSection[] => {
  return menus.map((menu) => ({
    id: menu.id,
    name: menu.name,
    submenus: menu.submenus ? normalizeMenuTree(menu.submenus) : [], // ✅ nuevo
    children: menu.submenus ? normalizeMenuTree(menu.submenus) : [],
    items: menu.submenus
      ? menu.submenus.map((item: any) => ({
        id: item.id,
        name: item.name,
        parent_menu_id: item.parent_menu_id || null,
        children: item.submenus ? normalizeMenuTree(item.submenus) : [],
        submenus: item.submenus ? normalizeMenuTree(item.submenus) : [], // ✅ nuevo
      }))
      : [],
  }));
};


const MenuBuilder: React.FC = () => {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const { addMenuItem, updateMenuItem, removeMenuItem, removeSection } = useMenu();
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [newSectionname, setNewSectionname] = useState("");
  const [openSections, setOpenSections] = useState<string[]>([]);

  // 🧩 Estados para los modales
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<MenuSection | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isItemDelete, setIsItemDelete] = useState(false);
  // 🧩 Modal para eliminar submenú
  const [showConfirmItemModal, setShowConfirmItemModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ sectionId: string; item: MenuItem } | null>(null);


  // Fetch inicial
  const fetchMenus = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al cargar menús");
      const result = await res.json();
      const normalized = normalizeMenuTree(result.data || []);
      setSections(normalized);
    } catch (err) {
      console.error("Error cargando menús:", err);
    }
  }, []);

  // ✅ 2. Llamar una vez al inicio
  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

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
      await fetchMenus();
    } catch (err) {
      console.error("Error creando sección:", err);
    }
  };

  // Crear submenú o item
  const handleAddMenuItem = async (
    _sectionId: string,
    parentId: string | null,
    itemData: Omit<MenuItem, "id">
  ) => {
    if (!itemData.name.trim()) return;
    try {
      const token = localStorage.getItem("token") || "";

      const payload: any = {
        name: itemData.name.trim(),
        parent_menu_id: parentId || null,
        menu_level: "0",
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al crear menú/submenú");

      setActiveItem(null);
      await fetchMenus();
    } catch (err) {
      console.error("Error creando menú/submenú:", err);
    }
  };

  // ✅ Actualizar menú o submenú
  const handleUpdateMenuItem = async (
    _sectionId: string,
    itemId: string,
    itemData: Omit<MenuItem, "id" | "parent_menu_id" | "menu_level">
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No se encontró token de autenticación");

      const payload = {
        name: itemData.name, // SOLO name
      };

      const res = await fetch(`${API_URL}/${encodeURIComponent(itemId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Error al actualizar menú");

      setEditItemId(null);
      await fetchMenus();
    } catch (err: any) {
      console.error("Error actualizando menú:", err);
      setErrorMessage(err.message || "Ocurrió un error al actualizar el menú");
      setShowErrorModal(true);
    }
  };


  // 🧩 Mostrar confirmación antes de eliminar
  const handleRemoveSection = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId) || null;
    setSelectedSection(section);
    setShowConfirmModal(true);
  };

  // 🧩 Confirmar eliminación
  const confirmRemoveSection = async () => {
    if (!selectedSection) return;
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/${selectedSection.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al eliminar sección");

      setSections((prev) => prev.filter((s) => s.id !== selectedSection.id));
      removeSection(selectedSection.id);
      setShowConfirmModal(false);
      setSelectedSection(null);
      await fetchMenus();
    } catch (err: any) {
      console.error("Error eliminando sección:", err);
      setErrorMessage(err.message);

      if (err.message.includes("documentos") || err.message.includes("tiene")) {
        setShowErrorModal(true);
      }

      setShowConfirmModal(false);
      setSelectedSection(null);
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
      await fetchMenus();
    } catch (err) {
      console.error("Error eliminando item:", err);
    }
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };
  // 🧩 Confirmar eliminación de submenú
  const confirmRemoveItem = async () => {
    if (!itemToDelete) return;
    const { sectionId, item } = itemToDelete;
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(`${API_URL}/${item.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al eliminar submenú");

      removeMenuItem(sectionId, item.id);
      await fetchMenus();
      setShowConfirmItemModal(false);
      setItemToDelete(null);
    } catch (err: any) {
      console.error("Error eliminando submenú:", err);
      setErrorMessage(err.message);

      if (err.message.includes("documentos") || err.message.includes("tiene")) {
        setShowErrorModal(true);
      }

      setShowConfirmItemModal(false);
      setItemToDelete(null);
    }
  };

  // Render recursivo
  const renderMenuItems = (items: MenuItem[], sectionId: string, level = 0) => (
    <ul
      className="menu-list"
      style={{
        marginLeft: `${level * 20}px`,
        maxHeight: openSections.includes(sectionId) ? "1000px" : "0",
        overflow: "hidden",
        transition: "max-height 0.4s ease",
      }}
    >
      {items.map((item) => (
        <li key={item.id}>
          <div className="menu-item">
            <span>{item.name}</span>
            <div className="menu-buttons">
              <button className="btn add" onClick={() => setActiveItem(item.id)}>
                <AiOutlinePlus /> Submenú
              </button>
              <button className="btn edit" onClick={() => setEditItemId(item.id)}>
                <AiOutlineEdit /> Editar
              </button>
              <button
                className="btn delete"
                onClick={() => {
                  setItemToDelete({ sectionId, item });
                  setShowConfirmItemModal(true);
                }}
              >
                <AiOutlineDelete /> Eliminar
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
              initialData={{
                name: item.name,
                menu_level: item.menu_level || "0",  // ✅ siempre pasar un valor
              }}
              onSubmit={(data) =>
                handleUpdateMenuItem(
                  sectionId,
                  item.id,
                  data,
                )
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
        <button onClick={handleAddSection} className="btn primary"><AiOutlinePlus /> Sección</button>

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

          {activeItem === section.id && (
            <MenuItemForm
              key={`add-root-${section.id}`}
              mode="add"
              onAddItem={(data) => handleAddMenuItem(section.id, section.id, data)}
              onCancel={() => setActiveItem(null)}
            />
          )}

          {openSections.includes(section.id) && (
            <button className="btn primary" onClick={() => setActiveItem(section.id)}><AiOutlinePlus /> Item</button>

          )}
        </div>
      ))}

      {/* 🟠 Modal Confirmación */}
      {showConfirmModal && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-content">
            <h3>Confirmar eliminación</h3>
            <p>
              ¿Seguro que deseas eliminar la sección{" "}
              <strong>{selectedSection?.name}</strong>?
            </p>
            <div className="modal-actions">
              <button className="btn cancel" onClick={() => setShowConfirmModal(false)}>
                Cancelar
              </button>
              <button className="btn delete" onClick={confirmRemoveSection}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 🟠 Modal Confirmación Submenú */}
      {showConfirmItemModal && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-content">
            <h3>Confirmar eliminación</h3>
            <p>
              ¿Seguro que deseas eliminar el submenú{" "}
              <strong>{itemToDelete?.item.name}</strong>?
            </p>
            <div className="modal-actions">
              <button
                className="btn cancel"
                onClick={() => setShowConfirmItemModal(false)}
              >
                Cancelar
              </button>
              <button className="btn delete" onClick={confirmRemoveItem}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔴 Modal de error */}
      {showErrorModal && (
        <div className="menu-modal-overlay">
          <div className="menu-modal-content">
            <h3>No se puede eliminar</h3>
            <p>{errorMessage || "Esta sección tiene documentos cargados."}</p>
            <div className="modal-actions">
              <button className="btn ok" onClick={() => setShowErrorModal(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MenuBuilder;
