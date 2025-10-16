// Función para cerrar sesión

export async function logout(): Promise<void> {
  try {
    await fetch('http://192.168.2.225:3000/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (err) {
  }
}

