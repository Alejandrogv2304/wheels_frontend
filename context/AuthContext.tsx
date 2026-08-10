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
  login: (correo: string, password: string) => Promise<boolean>;
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
  login: async () => false,
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

  useEffect(() => {
    const checkAuth = () => {
      try {
        const accessToken = getToken("access_token");
        const userCookie = getToken("user");

        if (!accessToken || !userCookie) {
          setUser(null);
          return;
        }

        try {
          const parsedUser = JSON.parse(userCookie);
          setUser(parsedUser);
        } catch {
          setUser(null);
          removeToken("user");
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
        const { accessToken, refreshToken, user } = res.data;
        persistSession({ accessToken, refreshToken, user });
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
        login,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
