import { useEffect, useState } from "react";
import { AlertTriangle, Ban, CheckCircle, Eye, FileText, LogOut, Shield, UserCheck, Users } from "lucide-react";
import type { AdminTab, AdminUser, Page } from "../types/types";
import { apiRequest } from "../api";
import { AvailBadge, RatingStars } from "../components/shared/others";

const auditActionLabel: Record<string, string> = {
  USER_REGISTERED: "Cadastro de usuário",
  USER_LOGIN: "Login realizado",
  USER_LOGOUT: "Logout realizado",
  USER_PROFILE_UPDATED: "Perfil atualizado",
  PROFESSIONAL_PROFILE_SAVED: "Perfil profissional atualizado",
  SERVICE_REQUEST_CREATED: "Solicitação criada",
  SERVICE_REQUEST_STATUS_UPDATED: "Status da solicitação atualizado",
  MESSAGE_SENT: "Mensagem enviada",
  REVIEW_CREATED: "Avaliação criada",
  USER_SUSPENDED: "Usuário suspenso",
  USER_REACTIVATED: "Usuário reativado",
  AUDIT_EVENT_RESOLVED: "Evento de auditoria resolvido",
  AUDIT_EVENT_FLAGGED: "Evento sinalizado",
  AUDIT_EVENT_UNFLAGGED: "Sinalização removida",
};

// Página Dashboard do Administrador
export function DashboardAdmin({ navigate, onLogout }: { navigate: (p: Page) => void; onLogout: () => void }) {
  const [tab, setTab] = useState<AdminTab>("usuarios");
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [professionals, setProfessionals] = useState<Array<{ id: string; user: { name: string; city: string }; profession: { name: string }; available: boolean; experienceYears: number; reviews: Array<{ rating: number }> }>>([]);
  const [serviceRequests, setServiceRequests] = useState<Array<{ id: string; client: { name: string }; professional: { user: { name: string }; profession: { name: string } }; kind: string; status: string; createdAt: string }>>([]);
  const [auditItems, setAuditItems] = useState<Array<{ id: string; actor: { name: string } | null; subjectUser: { name: string } | null; action: string; details: string | null; flagged: boolean; resolvedAt: string | null; createdAt: string }>>([]);
  const [counts, setCounts] = useState({ users: 0, professionals: 0, requests: 0, flaggedAudits: 0 });
  const [error, setError] = useState("");

  const loadAdminData = async () => {
    try {
      const [dashboard, users, professionalsList, requests, audit] = await Promise.all([
        apiRequest<typeof counts>("/admin/dashboard"),
        apiRequest<AdminUser[]>("/admin/users?limit=100"),
        apiRequest<typeof professionals>("/professionals"),
        apiRequest<typeof serviceRequests>("/admin/requests?limit=100"),
        apiRequest<typeof auditItems>("/admin/audit?limit=100"),
      ]);
      setCounts(dashboard);
      setAdminUsers(users);
      setProfessionals(professionalsList);
      setServiceRequests(requests);
      setAuditItems(audit);
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os dados administrativos.");
    }
  };

  useEffect(() => { void loadAdminData(); }, []);

  const toggleBan = async (user: AdminUser) => {
    const status = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await apiRequest(`/admin/users/${user.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      await loadAdminData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível atualizar o usuário.");
    }
  };

  const resolveFlag = async (id: string) => {
    try {
      await apiRequest(`/admin/audit/${id}/resolve`, { method: "PATCH", body: JSON.stringify({ resolved: true }) });
      await loadAdminData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível resolver o evento.");
    }
  };

  const flagEvent = async (id: string) => {
    try {
      await apiRequest(`/admin/audit/${id}/flag`, { method: "PATCH", body: JSON.stringify({ flagged: true }) });
      await loadAdminData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível sinalizar o evento.");
    }
  };

  const stats = [
    { label: "Usuários totais", value: counts.users, icon: <Users className="w-5 h-5" />, red: false },
    { label: "Profissionais", value: counts.professionals, icon: <UserCheck className="w-5 h-5" />, red: false },
    { label: "Solicitações", value: counts.requests, icon: <FileText className="w-5 h-5" />, red: false },
    { label: "Sinalizados", value: counts.flaggedAudits, icon: <AlertTriangle className="w-5 h-5" />, red: true },
  ];

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: "usuarios", label: "Usuários", icon: <Users className="w-4 h-4" /> },
    { key: "solicitacoes", label: "Solicitações", icon: <FileText className="w-4 h-4" /> },
    { key: "profissionais", label: "Avaliações", icon: <UserCheck className="w-4 h-4" /> },
    { key: "auditoria", label: "Auditoria", icon: <Shield className="w-4 h-4" /> },
  ];

  const statusColor: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    ACCEPTED: "bg-green-50 text-green-700 border-green-200",
    COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
    CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gray-900 text-white border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-base">Labuta Admin</span>
            <span className="text-xs bg-blue-900/60 text-blue-300 border border-blue-800 px-2 py-0.5 rounded-full">Painel administrativo</span>
          </div>
          <button onClick={onLogout} className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.red ? "bg-red-50 text-red-500" : "bg-blue-50 text-[#1D4ED8]"}`}>
                {s.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${tab === t.key ? "border-[#1D4ED8] text-[#1D4ED8] bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* Users */}
          {tab === "usuarios" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Nome", "E-mail", "Cidade", "Tipo", "Status", "Desde", "Ações"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {adminUsers.map((u) => (
                    <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${u.status === "SUSPENDED" ? "opacity-60" : ""}`}>
                      {/* <td className="px-4 py-3 text-gray-400 text-xs">{u.id}</td> */}
                      <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                      <td className="px-4 py-3 text-gray-500">{u.city}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${u.role === "PROFESSIONAL" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                          {u.role === "PROFESSIONAL" ? "Profissional" : u.role === "ADMIN" ? "Administrador" : "Cliente"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${u.status === "ACTIVE" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"}`} />
                          {u.status === "ACTIVE" ? "Ativo" : "Suspenso"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => void toggleBan(u)}
                            disabled={u.role === "ADMIN"}
                            className={`w-20 border border-gray-300 rounded-md px-2 py-1 text-xs flex items-center gap-1 transition-colors font-bold disabled:opacity-40 ${u.status === "ACTIVE" ? "text-red-500 hover:text-red-700 bg-red-100" : "text-green-700 bg-green-100"}`}
                          >
                            <Ban className="w-3.5 h-3.5" />
                            {u.status === "ACTIVE" ? "Suspender" : "Reativar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Professionals */}
          {tab === "profissionais" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["#", "Nome", "Profissão", "Cidade", "Avaliação", "Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {professionals.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs">{p.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{p.user.name}</td>
                      <td className="px-4 py-3 text-gray-600">{p.profession.name}</td>
                      <td className="px-4 py-3 text-gray-500">{p.user.city}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <RatingStars rating={p.reviews.length ? p.reviews.reduce((sum, review) => sum + review.rating, 0) / p.reviews.length : 0} />
                          <span className="text-xs text-gray-500">{p.reviews.length ? (p.reviews.reduce((sum, review) => sum + review.rating, 0) / p.reviews.length).toFixed(1) : "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <AvailBadge available={p.available} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Requests */}
          {tab === "solicitacoes" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["#", "Cliente", "Profissional", "Tipo", "Data", "Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {serviceRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-xs">{r.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{r.client.name}</td>
                      <td className="px-4 py-3 text-gray-600">{r.professional.user.name}</td>
                      <td className="px-4 py-3 text-gray-500">{r.kind === "QUOTE" ? "Orçamento" : "Serviço"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.createdAt).toLocaleDateString("pt-BR")}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor[r.status] ?? ""}`}>
                          {{ PENDING: "Pendente", ACCEPTED: "Aceito", COMPLETED: "Concluído", REJECTED: "Recusado", CANCELLED: "Cancelado" }[r.status] ?? r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Audit */}
          {tab === "auditoria" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["#", "Usuário", "Ação registrada", "Data / Hora", "Status", "Ações"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditItems.map((a) => (
                    <tr key={a.id} className={`hover:bg-gray-50 transition-colors ${a.flagged ? "bg-red-50/30" : ""}`}>
                      <td className="px-4 py-3 text-gray-400 text-xs">{a.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{a.subjectUser?.name ?? a.actor?.name ?? "Sistema"}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[320px]" title={a.details ? `${a.action}: ${a.details}` : a.action}>
                        <span className="font-medium">{auditActionLabel[a.action] ?? a.action}</span>
                        {a.details && <span className="block truncate text-xs text-gray-500">{a.details}</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(a.createdAt).toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-3">
                        {a.resolvedAt ? (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200">Resolvido</span>
                        ) : a.flagged ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-200">
                            <AlertTriangle className="w-3 h-3" /> Sinalizado
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-gray-100 text-gray-600 border-gray-200">Normal</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!a.flagged && !a.resolvedAt && (
                          <button onClick={() => void flagEvent(a.id)} className="mr-2 border rounded-md px-2 py-1 text-xs bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Sinalizar
                          </button>
                        )}
                        {a.flagged && !a.resolvedAt && (
                          <button onClick={() => void resolveFlag(a.id)} className="border rounded-md px-2 py-1 text-xs bg-blue-300 text-blue-800 hover:text-black flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Resolver
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}