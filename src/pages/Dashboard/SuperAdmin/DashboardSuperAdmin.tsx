import React, { useState, useEffect } from "react";
import {
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineLogout,
  AiOutlineSave,
  AiOutlineClose,
  AiOutlineKey,
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
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserCi, setNewUserCi] = useState("");
  const [newUserRoleId, setNewUserRoleId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRoleId, setEditRoleId] = useState("");

  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const token = localStorage.getItem("token");

  const fetchRoles = async () => {
    try {
      const res = await fetch("http://192.168.1.3:3000/roles", {
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
      const res = await fetch("http://192.168.1.3:3000/users", {
        headers: { Authorization: `Bearer ${token}` },
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

  const handleCiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) setNewUserCi(value);
  };

  const handleCreateUser = async () => {
    setError("");
    setSuccess("");

    if (!newUserName || !newUserEmail || !newUserPassword || !newUserCi || !newUserRoleId) {
      setError("⚠️ Todos los campos son obligatorios");
      return;
    }

    if (newUserCi.length !== 10) {
      setError("⚠️ La cédula debe tener exactamente 10 números");
      return;
    }

    try {
      const res = await fetch("http://192.168.1.3:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          ci: newUserCi,
          role_id: newUserRoleId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error al crear usuario");
        return;
      }

      setSuccess("✅ Usuario creado correctamente");
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserCi("");
      setNewUserRoleId("");
      fetchUsers();
    } catch {
      setError("Error al crear usuario");
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRoleId(user.role?.id || "");
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch(`http://192.168.1.3:3000/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          role_id: editRoleId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error al actualizar usuario");
        return;
      }

      setSuccess("✅ Usuario actualizado correctamente");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError("Error al actualizar usuario");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
      const res = await fetch(`http://192.168.1.3:3000/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error al eliminar usuario");
        return;
      }

      setSuccess("🗑️ Usuario eliminado correctamente");
      fetchUsers();
    } catch {
      setError("Error al eliminar usuario");
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordModalUser) return;
    if (!newPassword) {
      setError("⚠️ Ingrese la nueva contraseña");
      return;
    }

    try {
      const res = await fetch(`http://192.168.1.3:3000/users/${passwordModalUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error al actualizar contraseña");
        return;
      }

      setSuccess("🔑 Contraseña actualizada correctamente");
      setPasswordModalUser(null);
      setNewPassword("");
      fetchUsers();
    } catch {
      setError("Error al actualizar contraseña");
    }
  };

  return (
    <div className="superadmin-dashboard">
      <header className="superadmin-header">
        <h1>Panel Super Admin</h1>
        <button className="logout-btn" onClick={onLogout}>
          <AiOutlineLogout size={18} /> Cerrar sesión
        </button>
      </header>

      <section className="superadmin-create-user">
        <h2>Crear nuevo usuario</h2>
        <div className="form-grid">
          <input type="text" placeholder="Nombre completo" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
          <input type="email" placeholder="Correo electrónico" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
          <input type="password" placeholder="Contraseña" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
          <input type="text" placeholder="Cédula" value={newUserCi} onChange={handleCiChange} />
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
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
      </section>

      <section className="superadmin-users-list">
        <h2>Usuarios existentes</h2>
        {loading ? (
          <p>Cargando usuarios...</p>
        ) : users.length === 0 ? (
          <p>No hay usuarios registrados.</p>
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
                  <td>{u.role?.name || "Sin rol"}</td>
                  <td>
                    <button className="icon-btn edit" onClick={() => handleEditUser(u)}>
                      <AiOutlineEdit size={18} />
                    </button>
                    <button className="icon-btn key" onClick={() => setPasswordModalUser(u)}>
                      <AiOutlineKey size={18} />
                    </button>
                    <button className="icon-btn delete" onClick={() => handleDeleteUser(u.id)}>
                      <AiOutlineDelete size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* MODAL EDITAR */}
      {editingUser && (
        <div className="modal">
          <div className="modal-content">
            <h3>Editar Usuario</h3>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nombre" />
            <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Correo" />
            <select value={editRoleId} onChange={(e) => setEditRoleId(e.target.value)}>
              <option value="">Seleccione un rol</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <div className="modal-buttons">
              <button className="save-btn" onClick={handleUpdateUser}>
                <AiOutlineSave /> Guardar
              </button>
              <button className="cancel-btn" onClick={() => setEditingUser(null)}>
                <AiOutlineClose /> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONTRASEÑA */}
      {passwordModalUser && (
        <div className="modal">
          <div className="modal-content">
            <h3>Cambiar contraseña de {passwordModalUser.name}</h3>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="save-btn" onClick={handleUpdatePassword}>
                <AiOutlineSave /> Actualizar
              </button>
              <button className="cancel-btn" onClick={() => setPasswordModalUser(null)}>
                <AiOutlineClose /> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSuperAdmin;
