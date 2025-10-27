import React, { useState, useEffect } from "react";
import {
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineLogout,
  AiOutlineKey,
  AiOutlineClose,
} from "react-icons/ai";
import "./DashboardSuperAdmin.css";

interface Role {
  id: string;
  name: string;
}

interface User {
  id: string;
  ci: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
}

interface DashboardSuperAdminProps {
  onLogout: () => void;
}

const DashboardSuperAdmin: React.FC<DashboardSuperAdminProps> = ({ onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  // Campos del nuevo usuario
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserCi, setNewUserCi] = useState("");
  const [newUserRoleId, setNewUserRoleId] = useState("");

  // Estados
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailExists, setEmailExists] = useState(false);
  const [ciExists, setCiExists] = useState(false);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  // Modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const token = localStorage.getItem("token");
  const API_URL = "http://192.168.2.187:3000";

  // ===== FETCH ROLES Y USERS =====
  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setRoles(data.data || []);
    } catch (err) {
      console.error("Error roles:", err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) setUsers(data.data || []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  // ===== VALIDACIÓN GENERAL =====
  const validateField = (field: string, value: string) => {
    let message = "";

    switch (field) {
      case "name":
        if (!value.trim()) message = "El nombre es obligatorio";
        else if (value.length < 3) message = "Debe tener al menos 3 caracteres";
        break;

      case "email":
        if (!value.trim()) message = "El correo es obligatorio";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = "Correo inválido";
        else if (emailExists) message = "El correo ya está registrado";
        break;

      case "password":
        if (!value.trim()) message = "La contraseña es obligatoria";
        else if (value.length < 6) message = "Debe tener mínimo 6 caracteres";
        break;

      case "ci":
        if (!value.trim()) message = "La cédula es obligatoria";
        else if (!/^\d{10}$/.test(value)) message = "Debe tener 10 números";
        else if (ciExists) message = "La cédula ya está registrada";
        break;

      case "role":
        if (!value) message = "Seleccione un rol";
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: message }));
    return message === "";
  };

  // ===== VALIDAR EMAIL Y CI EN TIEMPO REAL =====
  useEffect(() => {
    if (!newUserEmail.trim() && !newUserCi.trim()) return;

    const timer = setTimeout(() => {
      try {
        const validateDuplicated = async () => {
          const res = await fetch(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          const allUsers = data.data || [];

          // Validar correo
          const emailDup = allUsers.some(
            (u: User) => u.email.toLowerCase() === newUserEmail.toLowerCase()
          );
          setEmailExists(emailDup);

          // Validar cédula
          const ciDup = allUsers.some((u: User) => u.ci === newUserCi);
          setCiExists(ciDup);

          if (emailDup) {
            setErrors((prev) => ({ ...prev, email: "El correo ya está registrado" }));
          }
          if (ciDup) {
            setErrors((prev) => ({ ...prev, ci: "La cédula ya está registrada" }));
          }
        };

        validateDuplicated();
      } catch {
        console.warn("No se pudo validar duplicados");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [newUserEmail, newUserCi]);

  // ===== CÉDULA SOLO NÚMEROS =====
  const handleCiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setNewUserCi(value);

    if (value.length !== 10) {
      setErrors((prev) => ({ ...prev, ci: "La cédula debe tener exactamente 10 números" }));
    } else {
      setErrors((prev) => ({ ...prev, ci: "" }));
    }
  };

  // ===== TOAST =====
  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // ===== CREAR USUARIO =====
  const handleCreateUser = async () => {
    const allValid =
      validateField("name", newUserName) &&
      validateField("email", newUserEmail) &&
      validateField("password", newUserPassword) &&
      validateField("ci", newUserCi) &&
      validateField("role", newUserRoleId);

    if (!allValid) return;

    if (emailExists || ciExists) {
      showToast("warning", "⚠️ El correo o la cédula ya existen.");
      return;
    }

    const body = {
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      password: newUserPassword.trim(),
      ci: newUserCi.trim(),
      role_id: newUserRoleId,
    };

    try {
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.message || "❌ Error al crear usuario.");
        return;
      }

      showToast("success", "✅ Usuario creado correctamente.");
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserCi("");
      setNewUserRoleId("");
      fetchUsers();
    } catch {
      showToast("error", "Error al conectar con el servidor.");
    }
  };

  // ===== EDITAR DATOS USUARIO =====
  const handleEditUser = async () => {
    if (!editUser) return;

    const res = await fetch(`${API_URL}/users/${editUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: editUser.name,
        email: editUser.email,
        ci: editUser.ci,
        role_id: editUser.role.id,
      }),
    });

    if (res.ok) {
      showToast("success", "✅ Usuario actualizado.");
      setShowEditModal(false);
      fetchUsers();
    } else {
      showToast("error", "❌ Error al actualizar usuario.");
    }
  };

  // ===== ACTUALIZAR CONTRASEÑA =====
  const handlePasswordChange = async () => {
    if (!editUser) return;

    const res = await fetch(`${API_URL}/users/${editUser.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ password: newPassword }),
    });

    if (res.ok) {
      showToast("success", "🔑 Contraseña actualizada.");
      setShowPasswordModal(false);
      setNewPassword("");
    } else {
      showToast("error", "❌ Error al actualizar la contraseña.");
    }
  };

  // ===== ELIMINAR USUARIO =====
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("¿Deseas eliminar este usuario?")) return;

    const res = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      showToast("success", "🗑️ Usuario eliminado.");
      fetchUsers();
    } else {
      showToast("error", "❌ No se pudo eliminar el usuario.");
    }
  };

  // ===== RENDER =====
  return (
    <div className="superadmin-dashboard">
      <header className="superadmin-header">
        <h1>Panel Super Admin</h1>
        <button className="logout-btn" onClick={onLogout}>
          <AiOutlineLogout size={18} /> Cerrar sesión
        </button>
      </header>

      {/* Crear usuario */}
      <section className="superadmin-create-user">
        <h2>Crear nuevo usuario</h2>

        <div className="form-grid">
          <input
            type="text"
            placeholder="Nombre completo"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
          />
          <input
            type="text"
            placeholder="Cédula"
            value={newUserCi}
            onChange={handleCiChange}
          />
          <select value={newUserRoleId} onChange={(e) => setNewUserRoleId(e.target.value)}>
            <option value="">Seleccione un rol</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <button onClick={handleCreateUser}>Crear Usuario</button>
        </div>
      </section>

      {/* Tabla de usuarios */}
      <section className="superadmin-users-list">
        <h2>Usuarios registrados</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Cédula</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.ci}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role?.name}</td>
                  <td>
                    <button
                      className="icon-btn edit"
                      onClick={() => {
                        setEditUser(u);
                        setShowEditModal(true);
                      }}
                    >
                      <AiOutlineEdit />
                    </button>
                    <button
                      className="icon-btn key"
                      onClick={() => {
                        setEditUser(u);
                        setShowPasswordModal(true);
                      }}
                    >
                      <AiOutlineKey />
                    </button>
                    <button className="icon-btn delete" onClick={() => handleDeleteUser(u.id)}>
                      <AiOutlineDelete />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* MODAL EDITAR */}
      {showEditModal && editUser && (
        <div className="superadmin-modal">
          <div className="superadmin-modal-content">
            <h3>Editar usuario</h3>
            <input
              type="text"
              value={editUser.name}
              onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
            />
            <input
              type="email"
              value={editUser.email}
              onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
            />
            <input
              type="text"
              value={editUser.ci}
              onChange={(e) => setEditUser({ ...editUser, ci: e.target.value })}
            />
            <select
              value={editUser.role?.id || ""}
              onChange={(e) =>
                setEditUser({
                  ...editUser,
                  role: { ...editUser.role, id: e.target.value },
                })
              }
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <div className="superadmin-modal-actions">
              <button onClick={handleEditUser}>Guardar</button>
              <button onClick={() => setShowEditModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONTRASEÑA */}
      {showPasswordModal && (
        <div className="superadmin-modal">
          <div className="superadmin-modal-content">
            <h3>Cambiar contraseña</h3>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="superadmin-modal-actions">
              <button onClick={handlePasswordChange}>Actualizar</button>
              <button onClick={() => setShowPasswordModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}


      {/* TOAST */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          <span>{toast.message}</span>
          <AiOutlineClose className="close-toast" onClick={() => setToast(null)} />
        </div>
      )}
    </div>
  );
};

export default DashboardSuperAdmin;
