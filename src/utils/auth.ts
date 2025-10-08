// utils/auth.ts
// Función para hacer logout llamando al backend y limpiar sesión en el frontend

export async function logout(): Promise<void> {
  try {
    await fetch('http://192.168.2.169:3000/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (err) {
    // Puedes mostrar un mensaje si lo deseas
  }
}

