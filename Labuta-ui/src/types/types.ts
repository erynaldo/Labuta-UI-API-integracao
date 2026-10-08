export type Page = "home" | "cadastro" | "login" | "dashboard" | "admin-login" | "admin";
export type DashModal = "saiba-mais" | "contratar" | "cadastro-prof" | "mensagens" | "avaliacao" | "solicitacoes" | null;
export type AdminTab = "usuarios" | "profissionais" | "solicitacoes" | "auditoria";
export type MsgType = "orcamento" | "servico" | "avaliacao_cliente" | "mensagem";
export type UserRole = "client" | "professional";

export interface Prof { id: string; userId: string; name: string; profession: string; years: number; city: string; phone: string; available: boolean; summary: string; rating: number; }
export interface AppUser { id?: string; name: string; email: string; phone?: string; city?: string; cpf?: string; role?: UserRole | "admin"; }
export interface AdminUser { id: string; name: string; email: string; phone: string; city: string; role: "CLIENT" | "PROFESSIONAL" | "ADMIN"; status: "ACTIVE" | "SUSPENDED"; createdAt: string; }
export interface ServiceRequest { id: string; client: string; professional: string; type: string; date: string; status: "PENDING" | "ACCEPTED" | "COMPLETED" | "REJECTED" | "CANCELLED"; }
export interface AuditItem { id: string; user: string; action: string; date: string; flagged: boolean; resolved: boolean; }
export interface Mensagem { id: string; senderId: string; receiverId: string; requestId?: string; requestStatus?: "PENDING" | "ACCEPTED" | "COMPLETED" | "REJECTED" | "CANCELLED"; tipo: MsgType; remetente: string; telefone: string; data: string; hora: string; preview: string; conteudo: string; lida: boolean; nota?: number; }
