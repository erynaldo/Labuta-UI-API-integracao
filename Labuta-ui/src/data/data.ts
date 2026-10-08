import type { AdminUser, AuditItem, Mensagem, Prof, ServiceRequest } from "../types/types"; 

export const professionalsData: Prof[] = [
  { id: 1, name: "Carlos Mendes", profession: "Eletricista", years: 12, city: "São Paulo", phone: "(11) 98765-4321", available: true, summary: "Especialista em instalações elétricas residenciais e comerciais. Atendo urgências 24h.", rating: 4.8 },
  { id: 2, name: "Ana Paula Souza", profession: "Encanadora", years: 8, city: "Rio de Janeiro", phone: "(21) 97654-3210", available: true, summary: "Hidráulica residencial e comercial. Detecção de vazamentos e desentupimentos.", rating: 4.6 },
  { id: 3, name: "Roberto Lima", profession: "Pintor", years: 15, city: "São Paulo", phone: "(11) 96543-2109", available: false, summary: "Pintura residencial e comercial, texturas, grafiato e acabamentos especiais.", rating: 4.9 },
  { id: 4, name: "Fernanda Costa", profession: "Pedreiro", years: 20, city: "Belo Horizonte", phone: "(31) 95432-1098", available: true, summary: "Construção, reforma e acabamentos. Especialista em alvenaria e revestimentos.", rating: 4.7 },
  { id: 5, name: "Marcos Oliveira", profession: "Carpinteiro", years: 10, city: "Curitiba", phone: "(41) 94321-0987", available: true, summary: "Fabricação e montagem de móveis sob medida. Decks, pergolados e reformas em madeira.", rating: 4.5 },
  { id: 6, name: "Juliana Ferreira", profession: "Jardineira", years: 6, city: "Porto Alegre", phone: "(51) 93210-9876", available: false, summary: "Paisagismo e jardinagem. Manutenção de áreas verdes, hortas e jardins verticais.", rating: 4.4 },
];

export const initialAdminUsers: AdminUser[] = [
  { id: 1, name: "Maria Santos", email: "maria@email.com", phone: "(11) 99999-1111", city: "São Paulo", role: "client", status: "active", joinDate: "10/01/2026" },
  { id: 2, name: "João Ferreira", email: "joao@email.com", phone: "(21) 98888-2222", city: "Rio de Janeiro", role: "client", status: "active", joinDate: "15/01/2026" },
  { id: 3, name: "Carlos Mendes", email: "carlos@email.com", phone: "(11) 97777-3333", city: "São Paulo", role: "professional", status: "active", joinDate: "05/01/2026" },
  { id: 4, name: "Ana Paula Souza", email: "ana@email.com", phone: "(21) 96666-4444", city: "Rio de Janeiro", role: "professional", status: "active", joinDate: "08/01/2026" },
  { id: 5, name: "Pedro Alves", email: "pedro@email.com", phone: "(31) 95555-5555", city: "Belo Horizonte", role: "client", status: "banned", joinDate: "20/01/2026" },
  { id: 6, name: "Beatriz Lima", email: "beatriz@email.com", phone: "(41) 94444-4444", city: "Curitiba", role: "professional", status: "active", joinDate: "25/01/2026" },
];

export const serviceRequestsData: ServiceRequest[] = [
  { id: 1, client: "Maria Santos", professional: "Carlos Mendes", type: "Orçamento", date: "16/08/2026", status: "Pendente" },
  { id: 2, client: "João Ferreira", professional: "Ana Paula Souza", type: "Serviço", date: "15/08/2026", status: "Aceito" },
  { id: 3, client: "Lucas Oliveira", professional: "Roberto Lima", type: "Serviço", date: "14/08/2026", status: "Concluído" },
  { id: 4, client: "Beatriz Almeida", professional: "Marcos Oliveira", type: "Orçamento", date: "13/08/2026", status: "Recusado" },
  { id: 5, client: "Felipe Costa", professional: "Juliana Ferreira", type: "Serviço", date: "12/08/2026", status: "Concluído" },
];

export const initialAuditItems: AuditItem[] = [
  { id: 1, user: "Carlos Mendes", action: "Perfil profissional atualizado", date: "16/08/2026 09:00", flagged: false, resolved: false },
  { id: 2, user: "Pedro Alves", action: "Conteúdo inapropriado reportado por 3 usuários", date: "15/08/2026 14:30", flagged: true, resolved: false },
  { id: 3, user: "Ana Paula Souza", action: "Foto de serviço adicionada ao perfil", date: "14/08/2026 11:20", flagged: false, resolved: false },
  { id: 4, user: "Roberto Lima", action: "Avaliação negativa contestada pelo profissional", date: "13/08/2026 16:45", flagged: true, resolved: false },
  { id: 5, user: "Marcos Oliveira", action: "Novo anúncio de serviço publicado", date: "12/08/2026 08:30", flagged: false, resolved: false },
];

export const mensagensData: Mensagem[] = [
  { id: 1, tipo: "orcamento", remetente: "Maria Santos", telefone: "(11) 99999-1111", data: "16/08/2026", hora: "09:14", preview: "Preciso de um orçamento para instalação elétrica...", conteudo: "Olá! Preciso de um orçamento para instalação de 4 tomadas novas na cozinha e troca do quadro de disjuntores. O imóvel fica no bairro Centro. Qual seria o valor aproximado?", lida: false },
  { id: 2, tipo: "servico", remetente: "Lucas Oliveira", telefone: "(21) 98888-2222", data: "15/08/2026", hora: "14:32", preview: "Solicito o serviço de revisão da fiação do apartamento...", conteudo: "Boa tarde! Gostaria de contratar seu serviço para revisar toda a fiação do apartamento. Temos percebido disjuntores caindo com frequência. Podem vir na próxima semana?", lida: false },
  { id: 3, tipo: "avaliacao_cliente", remetente: "João Ferreira", telefone: "(31) 97777-3333", data: "12/08/2026", hora: "11:05", preview: "Excelente profissional! Serviço rápido e limpo...", conteudo: "Excelente profissional! Serviço rápido, limpo e com ótimo custo-benefício. Resolveu o problema em menos de 2 horas. Com certeza voltarei a contratar.", lida: true, nota: 5 },
  { id: 4, tipo: "orcamento", remetente: "Beatriz Almeida", telefone: "(41) 96666-4444", data: "11/08/2026", hora: "08:50", preview: "Quero saber o preço para instalar um chuveiro elétrico...", conteudo: "Bom dia! Quero saber o preço para instalar um chuveiro elétrico novo e fazer a fiação adequada. O imóvel é um apartamento de 60m². Quando você teria disponibilidade?", lida: true },
  { id: 5, tipo: "avaliacao_cliente", remetente: "Carla Souza", telefone: "(51) 95555-5555", data: "08/08/2026", hora: "17:20", preview: "Muito bom! Trabalho bem feito, recomendo sem hesitar...", conteudo: "Muito bom! Trabalho bem feito, pontual e educado. Fez a instalação das luminárias sem deixar sujeira. Recomendo sem hesitar.", lida: true, nota: 4 },
];

export const extraProfessions = ["Servente de obras", "Instalação de ar-condicionado", "Montagem de móveis", "Jardinagem", "Dedetização", "Pintura", "Encanamento"];
