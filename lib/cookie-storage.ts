// lib/secure-storage.ts

export function saveToken(token: string, key: string) {
  try {
    const maxAge = key === "refresh_token" ? 24 * 60 * 60 : 4 * 60 * 60; // 1 día para refresh, 4 horas para access

    document.cookie = `${key}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`;
  } catch (err) {
    console.error("Error guardando token:", err);
  }
}

export function getToken(key: string): string | null {
  try {
    if (typeof document === "undefined") return null;

    const cookies = document.cookie.split(";");
    const cookie = cookies.find((c) => c.trim().startsWith(`${key}=`));

    if (cookie) {
      const value = cookie.slice(cookie.indexOf("=") + 1);
      return decodeURIComponent(value);
    }
    return null;
  } catch (err) {
    console.error("Error obteniendo token:", err);
    return null;
  }
}

export function removeToken(key: string) {
  try {
    document.cookie = `${key}=; path=/; max-age=0`;
  } catch (err) {
    console.error("Error removiendo token:", err);
  }
}
