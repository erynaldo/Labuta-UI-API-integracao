import { useEffect, useState } from "react";
import { Briefcase, ChevronDown, ClipboardList, Hammer, LogOut, MapPin, MessageSquare, Search, Settings, Star, User } from "lucide-react";
import type { AppUser, DashModal, Page, Prof, UserRole } from "../types/types";
import { apiRequest } from "../api";
import { btnBlueW, Field, inputClass, ModalHeader, ModalOverlay, ProfessionalsSection } from "../components/shared/others";
import { AvaliacaoModal, CadastroProfModal, ContratarModal, MensagensModal, SaibaMaisModal, SolicitacoesModal } from "./modals/modals";

// Página Dashboard - Página do Usuário Logado
export function DashboardUsuario({ navigate, user, onLogout, onUserUpdate }: { navigate: (p: Page) => void; user: AppUser | null; onLogout: () => void; onUserUpdate: (updatedUser: AppUser) => void }) {
  const [dashModal, setDashModal] = useState<DashModal>(null);
  const [selectedProf, setSelectedProf] = useState<Prof | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(user?.role === "professional" ? "professional" : "client");
  const [dropOpen, setDropOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState(() => ({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "", city: user?.city ?? "", cpf: user?.cpf ?? "", role: userRole, available: true }));
  const [requestCount, setRequestCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [professionalCount, setProfessionalCount] = useState(0);
  const [professionalsKey, setProfessionalsKey] = useState(0);
  const [dashboardError, setDashboardError] = useState("");

  const refreshDashboard = async () => {
    try {
      const [requests, messages, professionals] = await Promise.all([
        apiRequest<Array<{ status: string }>>("/requests"),
        apiRequest<Array<{ receiverId: string; readAt: string | null }>>("/messages"),
        apiRequest<Array<{ available: boolean }>>("/professionals"),
      ]);
      setRequestCount(requests.filter((request) => request.status === "PENDING" || request.status === "ACCEPTED").length);
      setUnreadCount(messages.filter((message) => message.receiverId === user?.id && !message.readAt).length);
      setProfessionalCount(professionals.filter((professional) => professional.available).length);
      setDashboardError("");
    } catch (requestError) {
      setDashboardError(requestError instanceof Error ? requestError.message : "Não foi possível atualizar o resumo da conta.");
    }
  };

  useEffect(() => {
    void refreshDashboard();
  }, [user?.id]);

  const closeModal = () => { setDashModal(null); setSelectedProf(null); void refreshDashboard(); };
  const openSaibaMais = (p: Prof) => { setSelectedProf(p); setDashModal("saiba-mais"); };
  const openContratar = () => setDashModal("contratar");
  const openAccountEditor = async () => {
    setDropOpen(false);
    setEditError("");
    try {
      const account = await apiRequest<{ name: string; email: string; phone: string; city: string; cpf: string | null; role: "CLIENT" | "PROFESSIONAL"; professionalProfile: { available: boolean; documentType: "CPF" | "CNPJ" | null; documentNumber: string | null } | null }>("/users/me");
      const role = account.role === "PROFESSIONAL" ? "professional" : "client";
      setUserRole(role);
      setEditForm({ name: account.name, email: account.email, phone: account.phone, city: account.city, cpf: account.cpf ?? (account.professionalProfile?.documentType === "CPF" ? account.professionalProfile.documentNumber ?? "" : ""), role, available: account.professionalProfile?.available ?? false });
    } catch (requestError) {
      setEditError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os dados da conta.");
    }
    setEditOpen(true);
  };
  const updateEditField = (field: "name" | "email" | "phone" | "city" | "cpf", value: string) => setEditForm((current) => ({ ...current, [field]: value }));
  const updateEditPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    const masked = digits.length <= 2 ? `(${digits}` : `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}${digits.length > 7 ? `-${digits.slice(7)}` : ""}`;
    updateEditField("phone", masked);
  };
  const updateEditCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    const masked = digits.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1-$2");
    updateEditField("cpf", masked);
  };
  const saveAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if ([editForm.name, editForm.email, editForm.phone, editForm.city].some((value) => !value.trim())) { setEditError("Preencha todos os campos."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) { setEditError("Digite um e-mail válido."); return; }
    if (editForm.phone.replace(/\D/g, "").length !== 11) { setEditError("Digite um telefone celular com 11 números."); return; }
    if (editForm.cpf && editForm.cpf.replace(/\D/g, "").length !== 11) { setEditError("Digite um CPF válido com 11 números."); return; }
    try {
      const updatedUser = await apiRequest<{ name: string; email: string; phone: string; city: string; cpf: string | null; role: "CLIENT" | "PROFESSIONAL"; professionalProfile: { available: boolean; documentType: "CPF" | "CNPJ" | null; documentNumber: string | null } | null }>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          city: editForm.city,
          ...(editForm.cpf && { cpf: editForm.cpf.replace(/\D/g, "") }),
          role: editForm.role === "professional" ? "PROFESSIONAL" : "CLIENT",
          ...(editForm.role === "professional" && { available: editForm.available }),
        }),
      });
      setUserRole(editForm.role);
      onUserUpdate({ ...user!, ...updatedUser, role: editForm.role, cpf: updatedUser.cpf ?? "" });
      setEditError("");
      setEditOpen(false);
      await refreshDashboard();
    } catch (requestError) {
      setEditError(requestError instanceof Error ? requestError.message : "Não foi possível salvar as alterações.");
    }
  };

  const featureCards = [
    { key: "cadastro-prof" as DashModal, label: "Cadastro Profissional", desc: "Cadastre-se como prestador de serviço.", icon: <Briefcase className="w-5 h-5" />, badge: 0 },
    { key: "mensagens" as DashModal, label: "Caixa de Mensagens", desc: "Veja suas mensagens e solicitações.", icon: <MessageSquare className="w-5 h-5" />, badge: unreadCount },
    { key: "avaliacao" as DashModal, label: "Avaliar Profissional", desc: "Avalie o serviço que você contratou.", icon: <Star className="w-5 h-5" />, badge: 0 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">

      {/* Nav Header Cabeçalho */}
      <header className="bg-[#f6f6f6] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-2">
            {/* Imagem para Computador (Desktop) - Aparece em telas md (médias) ou maiores */}
            <img
              src="/logo-labuta.png"
              alt="Labuta"
              className="w-45 hidden md:block"
            />

            {/* Imagem para Smartphone (Mobile) - Aparece apenas em telas menores que md */}
            <img
              src="/favicon.ico"
              alt="Labuta"
              className="block md:hidden"
            />
            <span className="text-xl text-[#1D4ED8] font-bold tracking-tight md:hidden">Labuta</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setDropOpen(!dropOpen)}
              className="flex items-center gap-2 bg-[#2257e8] hover:bg-[#1D4ED8] rounded-xl px-4 py-2 transition-colors"
            >
              <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
              <div className="w-6 h-6 rounded-full bg-white text-[#1D4ED8] flex items-center justify-center text-xs font-bold">
                {user?.name?.charAt(0) ?? "U"}
              </div>
              <span className="text-sm font-medium">{user?.name ?? "Usuário"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${dropOpen ? "rotate-180" : ""}`} />
            </button>
            {dropOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setDropOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-40">
                  <button onClick={() => void openAccountEditor()} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-400" />
                    Editar sua conta
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button onClick={() => { setDropOpen(false); onLogout(); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        <section className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1D4ED8]">Área do usuário</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">Olá, {user?.name?.split(" ")[0] ?? "usuário"}!</h1>
            <p className="mt-2 text-sm text-gray-500">Encontre profissionais confiáveis para resolver o que você precisa.</p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 sm:self-auto">
            <span className="h-2 w-2 rounded-full bg-green-500" /> Conta ativa
          </div>
        </section>

        {dashboardError && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{dashboardError}</p>}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Resumo da conta">
          {[
            { label: "Profissionais disponíveis", value: String(professionalCount), icon: <User className="h-5 w-5" /> },
            { label: "Solicitações abertas", value: String(requestCount), icon: <ClipboardList className="h-5 w-5" />, action: () => setDashModal("solicitacoes") },
            { label: "Mensagens não lidas", value: String(unreadCount), icon: <MessageSquare className="h-5 w-5" />, action: () => setDashModal("mensagens") },
          ].map((item) => (
            <button key={item.label} type="button" onClick={item.action} disabled={!item.action} className={`flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm ${item.action ? "cursor-pointer transition hover:border-blue-200 hover:shadow-md" : "cursor-default"}`}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#1D4ED8]">{item.icon}</div>
              <div><p className="text-2xl font-bold text-gray-900">{item.value}</p><p className="text-xs text-gray-500">{item.label}</p></div>
            </button>
          ))}
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Ações rápidas">
          {featureCards.map((card) => (
            <button key={card.key} onClick={() => setDashModal(card.key)} className="group flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D4ED8] text-white">{card.icon}</div>
              <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold text-gray-900">{card.label}</h2>{card.badge > 0 && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">{card.badge}</span>}</div><p className="mt-1 text-xs leading-relaxed text-gray-500">{card.desc}</p><span className="mt-3 inline-block text-xs font-semibold text-[#1D4ED8] group-hover:underline">Abrir</span></div>
            </button>
          ))}
        </section>

        <section className="mt-10" >
          <div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="text-xl font-bold text-gray-900">Encontre um profissional</h2><p className="mt-1 text-sm text-gray-500">Compare avaliações, experiência e disponibilidade.</p></div><Search className="hidden h-5 w-5 text-gray-300 sm:block" /></div>
          <ProfessionalsSection key={professionalsKey} onSaibaMais={openSaibaMais} />
        </section>
      </main>

      {dashModal && (
        <ModalOverlay wide={dashModal === "mensagens"}>
          {dashModal === "saiba-mais" && selectedProf && <SaibaMaisModal prof={selectedProf} onClose={closeModal} onContratar={openContratar} onEnviarMensagem={() => setDashModal("mensagens")} />}
          {dashModal === "contratar" && selectedProf && <ContratarModal prof={selectedProf} onClose={closeModal} />}
          {dashModal === "cadastro-prof" && <CadastroProfModal onClose={closeModal} user={user} onCreated={() => { setUserRole("professional"); onUserUpdate({ ...user!, role: "professional" }); setProfessionalsKey((key) => key + 1); }} />}
          {dashModal === "mensagens" && user?.id && <MensagensModal onClose={closeModal} userId={user.id} role={userRole === "professional" ? "PROFESSIONAL" : "CLIENT"} initialRecipient={selectedProf} />}
          {dashModal === "avaliacao" && <AvaliacaoModal onClose={closeModal} role={userRole} />}
          {dashModal === "solicitacoes" && <SolicitacoesModal onClose={closeModal} role={userRole} onUpdated={() => void refreshDashboard()} />}
        </ModalOverlay>
      )}

      {editOpen && (
        <ModalOverlay>
          <ModalHeader title="Editar sua conta" onClose={() => setEditOpen(false)} />
          <form className="flex flex-col gap-4 px-7 py-6" onSubmit={saveAccount}>
            {editError && <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-center text-xs text-red-600">{editError}</p>}
            <Field label="Nome completo"><input className={inputClass} value={editForm.name} onChange={(event) => updateEditField("name", event.target.value)} /></Field>
            <Field label="E-mail"><input type="email" className={inputClass} value={editForm.email} onChange={(event) => updateEditField("email", event.target.value)} /></Field>
            <Field label="Telefone"><input className={inputClass} value={editForm.phone} onChange={(event) => updateEditPhone(event.target.value)} placeholder="(00) 00000-0000" /></Field>
            <Field label="CPF"><input className={inputClass} value={editForm.cpf} onChange={(event) => updateEditCpf(event.target.value)} placeholder="000.000.000-00" inputMode="numeric" /></Field>
            <Field label="Cidade"><input className={inputClass} value={editForm.city} onChange={(event) => updateEditField("city", event.target.value)} /></Field>
            <Field label="Tipo de usuário">
              <select className={inputClass} value={editForm.role} onChange={(event) => setEditForm((current) => ({ ...current, role: event.target.value as UserRole }))}>
                <option value="client">Usuário cliente</option>
                <option value="professional">Usuário profissional</option>
              </select>
            </Field>
            <Field label="Disponibilidade na lista de buscas">
              <select className={inputClass} value={editForm.available ? "available" : "unavailable"} onChange={(event) => setEditForm((current) => ({ ...current, available: event.target.value === "available" }))} disabled={editForm.role !== "professional"}>
                <option value="available">Estar disponível</option>
                <option value="unavailable">Não estar disponível</option>
              </select>
              {editForm.role !== "professional" && <span className="text-xs text-gray-500">A disponibilidade só se aplica a contas profissionais.</span>}
            </Field>
            <button type="submit" className={btnBlueW}><Settings className="h-4 w-4" />Salvar alterações</button>
          </form>
        </ModalOverlay>
      )}
    </div>
  );
}