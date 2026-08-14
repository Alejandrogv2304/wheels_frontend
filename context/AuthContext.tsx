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
        const me = await api.get("/auth/me");
        const fetchedUser = me.data?.user || me.data;
        if (fetchedUser) {
          persistSession({
            accessToken,
            refreshToken: refreshToken || "",
            user: fetchedUser,
          });
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
        router.push("/inicio");
        return;
      }

      // If we reach here, we have tokens but couldn't hydrate a user
      toast.success(
        "Autenticación completada. Por favor espera mientras se finaliza la sesión.",
      );
      router.push("/inicio");
    } catch (e: any) {
      console.error(e);
      toast.error("Error procesando callback OAuth");
    }
  };

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

      const width = 600;
      const height = 700;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      const popup = window.open(
        url,
        `oauth_${provider}`,
        `popup=yes,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${width},height=${height},top=${top},left=${left}`,
      );

      if (!popup) {
        toast.error("No se pudo abrir la ventana de autenticación.");
        return;
      }

      let handled = false;

      const messageListener = async (e: MessageEvent) => {
        if (e.origin !== window.location.origin) return;
        if (e.data?.type === "oauth") {
          handled = true;
          try {
            // If the popup sends tokens directly, save them first so api can use them
            const accessTokenFromMsg =
              e.data?.access_token || e.data?.accessToken || e.data?.token;
            const refreshTokenFromMsg =
              e.data?.refresh_token || e.data?.refreshToken;
            if (accessTokenFromMsg) {
              saveToken(accessTokenFromMsg, "access_token");
              if (refreshTokenFromMsg)
                saveToken(refreshTokenFromMsg, "refresh_token");
            }

            // Try to hydrate user from backend endpoint /users/me
            try {
              const me = await api.get("/users/me");
              const fetchedUser = me.data?.user || me.data;

              // backend may return accessToken inside body; prefer explicit token
              const returnedAccess =
                me.data?.accessToken || accessTokenFromMsg || "";
              const returnedRefresh =
                me.data?.refreshToken || refreshTokenFromMsg || "";

              if (fetchedUser) {
                persistSession({
                  accessToken: returnedAccess,
                  refreshToken: returnedRefresh,
                  user: fetchedUser,
                });
                toast.success("Autenticado correctamente");
                try {
                  if (!popup.closed) popup.close();
                } catch {}
                window.removeEventListener("message", messageListener);
                router.push("/inicio");
                return;
              }
            } catch (err) {
              // If fetching /users/me failed, continue to fallback handling below
              console.warn("/users/me fallback failed", err);
            }

            toast.success("Autenticación completada. Finalizando sesión...");
            try {
              if (!popup.closed) popup.close();
            } catch {}
            window.removeEventListener("message", messageListener);
            router.push("/inicio");
          } catch (err) {
            console.error(err);
            toast.error("Error procesando respuesta de OAuth");
          }
        }
      };

      window.addEventListener("message", messageListener);

      const poll = setInterval(() => {
        if (popup.closed) {
          clearInterval(poll);
          window.removeEventListener("message", messageListener);
          if (!handled) {
            toast.error(
              "La ventana de autenticación se cerró sin completar el proceso.",
            );
          }
        }
      }, 500);
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
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
