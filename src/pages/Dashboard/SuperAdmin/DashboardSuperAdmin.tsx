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
  const [success, setSuccess] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [ciExists, setCiExists] = useState(false);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  const token = localStorage.getItem("token");

  // ===== FETCH ROLES Y USERS =====
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
          const res = await fetch("http://192.168.1.3:3000/users", {
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
          } else {
            setErrors((prev) => ({ ...prev, email: "" }));
          }

          if (ciDup) {
            setErrors((prev) => ({ ...prev, ci: "La cédula ya está registrada" }));
          } else {
            setErrors((prev) => ({ ...prev, ci: "" }));
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
  // Solo permitir números y máximo 10 dígitos
  let value = e.target.value.replace(/\D/g, "").slice(0, 10);
  setNewUserCi(value);

  // Validación inmediata
  if (value.length !== 10) {
    setErrors((prev) => ({
      ...prev,
      ci: "La cédula debe tener exactamente 10 números",
    }));
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
  setSuccess("");

  const allValid =
    validateField("name", newUserName) &&
    validateField("email", newUserEmail) &&
    validateField("password", newUserPassword) &&
    validateField("ci", newUserCi) &&
    validateField("role", newUserRoleId);

  if (!allValid) return;

  if (emailExists || ciExists) {
    if (emailExists) showToast("warning", "⚠️ El correo ya existe en el sistema.");
    if (ciExists) showToast("warning", "⚠️ La cédula ya está registrada.");
    return;
  }

  const body = {
    name: newUserName.trim(),
    email: newUserEmail.trim(),
    password: newUserPassword.trim(),
    ci: newUserCi.trim(),
    role_id: newUserRoleId,
  };

  console.log("📤 Enviando al backend:", body);

  try {
    const res = await fetch("http://192.168.1.3:3000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("📥 Respuesta backend:", data);

    if (!res.ok) {
      showToast("error", data.message || "❌ Error al crear usuario (422).");
      return;
    }

    showToast("success", "✅ Usuario creado correctamente.");
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserCi("");
    setNewUserRoleId("");
    setErrors({});
    setEmailExists(false);
    setCiExists(false);
    fetchUsers();
  } catch (error) {
    console.error(error);
    showToast("error", "❌ Error al conectar con el servidor.");
  }
};


  return (
    <div className="superadmin-dashboard">
      <header className="superadmin-header">
        <h1>Panel Super </h1>
        <button className="logout-btn" onClick={onLogout}>
          <AiOutlineLogout size={18} /> Cerrar sesión
        </button>
      </header>

      <section className="superadmin-create-user">
        <h2>Crear nuevo usuario</h2>

        <div className="form-grid">
          <div className="form-field">
            <input
              type="text"
              placeholder="Nombre completo"
              value={newUserName}
              onChange={(e) => {
                setNewUserName(e.target.value);
                validateField("name", e.target.value);
              }}
              className={errors.name ? "error" : ""}
            />
            {errors.name && <span className="error-msg">{errors.name}</span>}
          </div>

          <div className="form-field">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={newUserEmail}
              onChange={(e) => {
                setNewUserEmail(e.target.value);
                validateField("email", e.target.value);
              }}
              className={errors.email ? "error" : ""}
            />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <div className="form-field">
            <input
              type="password"
              placeholder="Contraseña"
              value={newUserPassword}
              onChange={(e) => {
                setNewUserPassword(e.target.value);
                validateField("password", e.target.value);
              }}
              className={errors.password ? "error" : ""}
            />
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>

          <div className="form-field">
            <input
              type="text"
              placeholder="Cédula"
              value={newUserCi}
              onChange={handleCiChange}
              className={errors.ci ? "error" : ""}
            />
            {errors.ci && <span className="error-msg">{errors.ci}</span>}
          </div>

          <div className="form-field">
            <select
              value={newUserRoleId}
              onChange={(e) => {
                setNewUserRoleId(e.target.value);
                validateField("role", e.target.value);
              }}
              className={errors.role ? "error" : ""}
            >
              <option value="">Seleccione un rol</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.role && <span className="error-msg">{errors.role}</span>}
          </div>

          <button onClick={handleCreateUser}>Crear Usuario</button>
        </div>
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
                    <button className="icon-btn edit">
                      <AiOutlineEdit size={18} />
                    </button>
                    <button className="icon-btn key">
                      <AiOutlineKey size={18} />
                    </button>
                    <button className="icon-btn delete">
                      <AiOutlineDelete size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

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
