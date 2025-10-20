import React, { useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import './Login.css';

export type UserRole = 'super-admin' | 'admin' | 'user';

interface LoginProps {
  onLoginSuccess: (token: string, role: UserRole) => void;
  onCancel?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [ci, setCi] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = 'http://192.168.2.226:3000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    try {
      // 1️⃣ LOGIN - autenticar usuario
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ci, password }),
      });

      const loginData = await res.json();

      if (!res.ok || !loginData.data) {
        throw new Error(loginData.message || 'Credenciales inválidas');
      }

      // Guardar token
      const token = loginData.data;
      localStorage.setItem('token', token);

      // 2️⃣ Obtener datos del usuario logueado
      const meRes = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const meData = await meRes.json();

      if (!meRes.ok || !meData.data) {
        throw new Error(meData.message || 'No se pudo obtener información del usuario');
      }

      // 3️ Determinar el rol
      const roleName = meData.data.role?.name?.toLowerCase().trim() || 'user';
      let role: UserRole = 'user';

      if (roleName.includes('super')) role = 'super-admin';
      else if (roleName.includes('admin')) role = 'admin';


      // Guardar rol también
      localStorage.setItem('role', role);

      // 4️ Éxito → redirigir según rol
      onLoginSuccess(token, role);

    } catch (err: any) {
      console.error('Error en login:', err);
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-form" style={{ position: 'relative' }}>
        {/* Botón de cerrar */}
        <button
          className="login-close-btn"
          onClick={onCancel}
          title="Cerrar"
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'transparent',
            border: 'none',
            fontSize: 24,
            cursor: 'pointer',
            color: '#888'
          }}
        >
          ×
        </button>

        <h2>Iniciar Sesión</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="ci">Cédula</label>
            <input
              type="text"
              id="ci"
              placeholder="Ingrese su cédula"
              value={ci}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) setCi(value);
              }}
              required
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="password">Contraseña</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: '35px' }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#666',
                fontSize: '20px'
              }}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {error && <div className="login-error">{error}</div>}
      </div>
    </div>
  );
};

export default Login;
