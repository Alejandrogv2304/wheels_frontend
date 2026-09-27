/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getToken, removeToken, saveToken } from "@/lib/cookie-storage";
import { User } from "@/types/User";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: (redirect?: boolean) => void;
  handleOAuthCallback: (hash: string) => Promise<void>;
  startOAuth: (provider: string) => Promise<void>;
  login: (correo: string, password: string) => Promise<boolean>;
  updateProfile: (data: {
    nombre: string;
    telefono: string;
    tipoDocumento: string;
    numeroDocumento: string;
    foto?: File;
  }) => Promise<boolean>;
  register: (
    nombre: string,
    correo: string,
    password: string,
    telefono?: string,
  ) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  logout: () => {},
  handleOAuthCallback: async () => {},
  startOAuth: async () => {},
  login: async () => false,
  updateProfile: async () => false,
  register: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(
    (redirect = true) => {
      removeToken("access_token");
      removeToken("refresh_token");
      removeToken("user");
      setUser(null);

      if (redirect) router.push("/auth");
    },
    [router],
  );

  const parseHash = (hash: string) => {
    const trimmed = hash.startsWith("#") ? hash.slice(1) : hash;
    const parts = trimmed.split("&");
    const obj: Record<string, string> = {};
    parts.forEach((part) => {
      const [k, v] = part.split("=");
      if (k) obj[k] = decodeURIComponent(v || "");
    });
    return obj;
  };

  const handleOAuthCallback = async (hash: string) => {
    try {
      const params = parseHash(hash);
      const accessToken = params["access_token"];
      const refreshToken = params["refresh_token"];

      if (!accessToken) {
        toast.error("No se encontró access_token en el callback OAuth");
        return;
      }

      // Save tokens to cookies so api interceptor can use them
      saveToken(accessToken, "access_token");
      if (refreshToken) saveToken(refreshToken, "refresh_token");

      // Try to fetch user info from backend
      try {
        const me = await api.get("/users/me");
        const fetchedUser = me.data?.user || me.data;
        if (fetchedUser) {
          persistSession({
            accessToken,
            refreshToken: refreshToken || "",
            user: fetchedUser,
          });
          router.replace("/inicio");
          return;
        }
      } catch {
        // If fetching user fails, continue to try to parse minimal info
      }

      // As a fallback, set a minimal user from available params if present
      let fallbackUser = null;
      if (params["user"]) {
        try {
          fallbackUser = JSON.parse(params["user"]);
        } catch {
          // ignore
        }
      }

      if (fallbackUser) {
        persistSession({
          accessToken,
          refreshToken: refreshToken || "",
          user: fallbackUser,
        });
        router.replace("/inicio");
        return;
      }

      removeToken("access_token");
      removeToken("refresh_token");
      toast.error("No se pudo cargar tu perfil después de iniciar sesión con Google.");
    } catch (e: any) {
      console.error(e);
      toast.error("Error procesando callback OAuth");
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = getToken("access_token");
        const userCookie = getToken("user");

        if (!accessToken) {
          setUser(null);
          return;
        }

        if (userCookie) {
          try {
            setUser(JSON.parse(decodeURIComponent(userCookie)));
            return;
          } catch {
            removeToken("user");
          }
        }

        try {
          const me = await api.get("/users/me");
          const fetchedUser = me.data?.user || me.data;
          if (!fetchedUser) throw new Error("El endpoint /users/me no devolvió usuario");

          saveToken(JSON.stringify(fetchedUser), "user");
          setUser(fetchedUser);
        } catch (error) {
          console.error("No se pudo hidratar la sesión:", error);
          setUser(null);
        }
      } catch (error) {
        toast.error("Error verificando autenticación: " + error);
        logout(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [logout]);

  const persistSession = (session: {
    accessToken: string;
    refreshToken: string;
    user: User;
  }) => {
    saveToken(session.accessToken, "access_token");
    saveToken(session.refreshToken, "refresh_token");
    saveToken(JSON.stringify(session.user), "user");
    setUser(session.user);
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      if (res.data) {
        const { session, profile } = res.data;
        persistSession({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          user: profile,
        });
        router.push("/inicio");
        return true;
      }
    } catch (e: any) {
      toast.error(
        e.response?.data?.message ||
          "Error al iniciar sesión. Verifica tus credenciales.",
      );
    }
    return false;
  };

  const updateProfile = async (data: {
    nombre: string;
    telefono: string;
    tipoDocumento: string;
    numeroDocumento: string;
    foto?: File;
  }) => {
    try {
      const formData = new FormData();
      formData.append("nombre", data.nombre);
      formData.append("telefono", data.telefono);
      formData.append("tipoDocumento", data.tipoDocumento);
      formData.append("numeroDocumento", data.numeroDocumento);
      if (data.foto) formData.append("foto", data.foto);

      const response = await api.patch("/users/me", formData);
      const updatedUser = response.data?.profile || response.data?.user || response.data;
      if (!updatedUser) throw new Error("El endpoint /users/me no devolvió el perfil actualizado");

      const nextUser = { ...user, ...updatedUser } as User;
      saveToken(JSON.stringify(nextUser), "user");
      setUser(nextUser);
      toast.success("Perfil actualizado correctamente");
      return true;
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "No se pudo actualizar el perfil.",
      );
      return false;
    }
  };

  const startOAuth = async (provider: string) => {
    if (typeof window === "undefined") return;
    try {
      const redirectTo = `${window.location.origin}/auth`;
      const res = await api.get(`/auth/${provider}`, {
        params: { redirectTo },
      });
      const url = res.data?.url;
      if (!url) {
        toast.error("No se recibió la URL de autenticación");
        return;
      }

      window.location.assign(url);
    } catch (err) {
      console.error(err);
      toast.error("Error iniciando autenticación");
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) => {
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        phone,
      });

      if (res.data) {
        const { accessToken, refreshToken, user } = res.data;
        persistSession({ accessToken, refreshToken, user });
        router.push("/inicio");
        return true;
      }
    } catch (e: any) {
      toast.error(
        e.response?.data?.message ||
          "No se pudo crear la cuenta. Revisa los datos e intenta de nuevo.",
      );
    }
    return false;
  };

  const isAuthenticated = Boolean(user && getToken("access_token"));

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        logout,
        handleOAuthCallback,
        startOAuth,
        login,
        updateProfile,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
