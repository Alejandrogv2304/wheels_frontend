"use client";
import { createContext, useContext, useState } from "react";
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
  login: (email: string, password: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  logout: () => {},
  login: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading] = useState(true);

  // async function checkAuth() {
  //   try {
  //     const accessToken = getToken("access_token");
  //     const refreshToken = getToken("refresh_token");
  //     const userCookie = getToken("user");

  //     if (!accessToken && !refreshToken) {
  //       setUser(null);
  //       return;
  //     }

  //     // RECUPERAR USER DESDE COOKIE
  //     if (userCookie) {
  //       try {
  //         const parsedUser = JSON.parse(userCookie);
  //         setUser(parsedUser);
  //       } catch {
  //         setUser(null);
  //       }
  //     }
  //   } catch (error) {
  //     toast.error("Error verificando autenticación:" + error);
  //     logout();
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      if (res.data) {
        const { accessToken, refreshToken, user } = res.data;

        saveToken(accessToken, "access_token");
        saveToken(refreshToken, "refresh_token");
        saveToken(JSON.stringify(user), "user");

        setUser(user); // después de guardar
        router.push("/inicio");
      }
    } catch {
      toast.error("Error al iniciar sesión. Verifica tus credenciales.");
    }
  };

  const logout = (redirect = true) => {
    removeToken("access_token");
    removeToken("refresh_token");
    removeToken("user");
    setUser(null);

    if (redirect) router.push("/login");
  };

  const isAuthenticated = !!getToken("access_token");

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        logout,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
