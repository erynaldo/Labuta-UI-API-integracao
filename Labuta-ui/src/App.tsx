import { useEffect, useState } from "react";
import type { AppUser, Page } from "./types/types";
import { apiRequest, getAuthToken, setAuthToken, type ApiUser } from "./api";

import { HomePage } from "./pages/HomePage";
import { CadastroPage } from "./pages/CadastrarUsuario";
import { LoginPage } from "./pages/LoginUsuario";
import { DashboardUsuario } from "./pages/DashboardUsuario";
import { AdminLoginPage } from "./pages/LoginAdmin";
import { DashboardAdmin } from "./pages/DashboardAdmin";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [user, setUser] = useState<AppUser | null>(null);
  const navigate = (nextPage: Page) => setPage(nextPage);
  const mapUser = (apiUser: ApiUser): AppUser => ({
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    phone: apiUser.phone,
    city: apiUser.city,
    role: apiUser.role === "ADMIN" ? "admin" : apiUser.role === "PROFESSIONAL" ? "professional" : "client",
  });

  useEffect(() => {
    if (!getAuthToken()) return;
    void apiRequest<ApiUser>("/users/me").then((apiUser) => {
      setUser(mapUser(apiUser));
      setPage(apiUser.role === "ADMIN" ? "admin" : "dashboard");
    }).catch(() => setAuthToken(null));
  }, []);

  const logout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Não foi possível registrar o logout na auditoria.", error);
    } finally {
      setAuthToken(null);
      setUser(null);
      navigate("home");
    }
  };

  return (
    <div className="font-[Inter,sans-serif]">
      {page === "home" && <HomePage navigate={navigate} />}
      {page === "cadastro" && <CadastroPage navigate={navigate} />}
      {page === "login" && <LoginPage navigate={navigate} onLogin={(loggedUser) => { setUser(loggedUser); navigate("dashboard"); }} />}
      {page === "dashboard" && <DashboardUsuario navigate={navigate} user={user} onUserUpdate={setUser} onLogout={() => { void logout(); }} />}
      {page === "admin-login" && <AdminLoginPage navigate={navigate} onAdminLogin={(apiUser) => { setUser(mapUser(apiUser)); navigate("admin"); }} />}
      {page === "admin" && <DashboardAdmin navigate={navigate} onLogout={logout} />}
    </div>
  );
}
