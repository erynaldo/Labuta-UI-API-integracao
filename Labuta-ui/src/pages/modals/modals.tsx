import { useEffect, useState } from "react";
import { CheckCircle, ChevronDown, ChevronRight, Clock, DollarSign, FileText, Hammer, MapPin, Phone, Send, Star, Upload, XCircle, User, Building2 } from "lucide-react";
import type { AppUser, Mensagem, Prof, UserRole } from "../../types/types";
import { apiRequest } from "../../api";
import { btnBlueW, Field, fileClass, inputClass, ModalHeader, RatingStars } from "../../components/shared/others";


// Modal Saiba Mais - Abrir perfil do Profissional - Página do Usuario Logado
export function SaibaMaisModal({ prof, onClose, onContratar, onEnviarMensagem }: { prof: Prof; onClose: () => void; onContratar: (() => void) | null; onEnviarMensagem: (() => void) | null }) {
	return <><ModalHeader title="Perfil Profissional" onClose={onClose} />
		<div className="px-7 py-6 flex flex-col gap-5">
			<div className="flex items-start gap-4">
				<div className="w-16 h-16 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center text-2xl font-bold">
					{prof.name.charAt(0)}
				</div>
				{!prof.available && <p className="text-center text-xs text-amber-700">Este profissional está indisponível para novas solicitações no momento.</p>}
				<div className="flex-1"><h3 className="text-xl font-bold text-gray-900">{prof.name}</h3>
					<p className="text-[#1D4ED8] font-medium text-sm">{prof.profession}</p>
					<div className="flex items-center gap-2 mt-1.5">
						<RatingStars rating={prof.rating} size="md" />{prof.rating.toFixed(1)}
					</div>
				</div>
			</div>
			<div className="grid grid-cols-3 gap-3">
				{[[Clock, "Experiência", `${prof.years} anos`], [MapPin, "Cidade", prof.city], [Phone, "Telefone", prof.phone]].map(([Icon, label, value]) => <div key={String(label)} className="bg-[#F9FAFB] border border-gray-200 rounded-xl p-3"><Icon className="w-4 h-4 text-[#1D4ED8] mb-1" />
					<p className="text-xs text-gray-400">{String(label)}</p>
					<p className="text-sm font-semibold text-gray-800">{String(value)}</p>
				</div>)}</div><p className="text-sm text-gray-600 leading-relaxed bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">{prof.summary}</p>
			<div className="flex flex-col gap-3 sm:flex-row">
				<button type="button" onClick={onContratar ?? undefined} disabled={!onContratar || !prof.available} className={`${btnBlueW} disabled:cursor-not-allowed`}>
					<Hammer className="w-4 h-4" />Contratar serviço
				</button>
				<button type="button" onClick={onEnviarMensagem ?? undefined} disabled={!onEnviarMensagem} className="w-full rounded-lg border border-[#1D4ED8] py-3 text-sm font-semibold text-[#1D4ED8] transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50">
					<Send className="mr-2 inline h-4 w-4" />Enviar mensagem
				</button>
			</div>
			{(!onContratar || !onEnviarMensagem) && <p className="text-center text-xs text-gray-500">Entre na sua conta para contratar ou enviar uma mensagem.</p>}
		</div>
	</>;
}


// Modal de Contratar o Profissional - Página do Usuario Logado
export function ContratarModal({ prof, onClose }: { prof: Prof; onClose: () => void }) {
	const [orcamento, setOrcamento] = useState(false);
  const [description, setDescription] = useState("");
  const [desiredDate, setDesiredDate] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const request = await apiRequest<{ id: string }>("/requests", {
        method: "POST",
        body: JSON.stringify({ professionalId: prof.id, kind: orcamento ? "QUOTE" : "SERVICE", description, ...(desiredDate && { desiredDate }) }),
      });
      await apiRequest("/messages", {
        method: "POST",
        body: JSON.stringify({ receiverId: prof.userId, requestId: request.id, content: description }),
      });
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível enviar a solicitação.");
    } finally {
      setSubmitting(false);
    }
	};

	return (
		<>
			<ModalHeader title={`Contratar - ${prof.name}`} onClose={onClose} />
			<form className="px-7 py-6 flex flex-col gap-5" onSubmit={handleSubmit}>
				<Field label="Breve descrição do serviço">
          <textarea className={`${inputClass} resize-none h-28`} value={description} onChange={(event) => setDescription(event.target.value)} minLength={10} required />
				</Field>
				<Field label="Anexar foto do local / problema">
					<label className={fileClass}>
						<Upload className="w-4 h-4" />
						Clique para selecionar uma foto
						<input type="file" className="hidden" />
					</label>
				</Field>
				<Field label="Data desejada para o serviço">
          <input type="date" className={inputClass} value={desiredDate} onChange={(event) => setDesiredDate(event.target.value)} />
				</Field>
				<label className="flex items-center gap-3 bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl px-4 py-4 text-sm">
					<input
						type="checkbox"
						checked={orcamento}
						onChange={(event) => setOrcamento(event.target.checked)}
					/>
					Solicitar orçamento primeiro
				</label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={submitting} className={btnBlueW}>
					<Send className="w-4 h-4" />
          {submitting ? "Enviando..." : "Enviar solicitação"}
				</button>
			</form>
		</>
	);
}


// Antigo Modal Cadastro Profissional - Página do Usuario Logado


const tipoConfig = {
	orcamento: {
		label: "Orçamento",
		color: "text-amber-700",
		bg: "bg-amber-50 border-amber-200",
		icon: <DollarSign className="w-3.5 h-3.5" />,
	},
	servico: {
		label: "Serviço",
		color: "text-blue-700",
		bg: "bg-blue-50 border-blue-200",
		icon: <FileText className="w-3.5 h-3.5" />,
	},
	avaliacao_cliente: {
		label: "Avaliação",
		color: "text-green-700",
		bg: "bg-green-50 border-green-200",
		icon: <Star className="w-3.5 h-3.5" />,
	},
	mensagem: {
		label: "Mensagem",
		color: "text-gray-700",
		bg: "bg-gray-50 border-gray-200",
		icon: <Send className="w-3.5 h-3.5" />,
	},
} as const;


// Modal Caixa de Mensagens - Página do Usuario Logado
export function MensagensModal({ onClose, userId, role, initialRecipient }: { onClose: () => void; userId: string; role: "CLIENT" | "PROFESSIONAL"; initialRecipient?: Prof | null }) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [professionals, setProfessionals] = useState<Array<{ userId: string; name: string; profession: string }>>([]);
	const [selecionada, setSelecionada] = useState<Mensagem | null>(null);
  const [composing, setComposing] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [composeText, setComposeText] = useState("");
	const [decisao, setDecisao] = useState<"aceitar" | "recusar" | "">("");
	const [valor, setValor] = useState("");
  const [resposta, setResposta] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const carregarMensagens = async () => {
    const records = await apiRequest<Array<{ id: string; senderId: string; receiverId: string; requestId: string | null; content: string; readAt: string | null; createdAt: string; sender: { name: string; phone: string }; receiver: { name: string; phone: string }; request: { kind: string; status: Mensagem["requestStatus"] } | null }>>("/messages");
    setMensagens(records.map((record) => {
      const date = new Date(record.createdAt);
      return {
        id: record.id,
        senderId: record.senderId,
        receiverId: record.receiverId,
        requestId: record.requestId ?? undefined,
        requestStatus: record.request?.status,
        tipo: record.request?.kind === "QUOTE" ? "orcamento" : record.request ? "servico" : "mensagem",
        remetente: record.senderId === userId ? record.receiver.name : record.sender.name,
        telefone: record.senderId === userId ? record.receiver.phone : record.sender.phone,
        data: date.toLocaleDateString("pt-BR"),
        hora: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        preview: record.content,
        conteudo: record.content,
        lida: record.receiverId !== userId || Boolean(record.readAt),
      };
    }));
  };

  useEffect(() => {
    void carregarMensagens().catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar as mensagens.")).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void apiRequest<Array<{ user: { id: string; name: string }; profession: { name: string } }>>("/professionals")
      .then((records) => setProfessionals(records.filter((record) => record.user.id !== userId).map((record) => ({ userId: record.user.id, name: record.user.name, profession: record.profession.name }))))
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os profissionais."));
  }, [userId]);

  useEffect(() => {
    if (initialRecipient) {
      setSelectedRecipient(initialRecipient.userId);
      setComposing(true);
    }
  }, [initialRecipient]);

	const naoLidas = mensagens.filter((m) => !m.lida).length;
	const precisaResposta = selecionada?.requestId && (selecionada.tipo === "orcamento" || selecionada.tipo === "servico");

  const abrirMensagem = async (msg: Mensagem) => {
    let readMessage = msg.lida;
    setError("");
    if (msg.receiverId === userId && !msg.lida) {
      try {
        await apiRequest(`/messages/${msg.id}/read`, { method: "PATCH" });
        readMessage = true;
        setMensagens((prev) => prev.map((m) => m.id === msg.id ? { ...m, lida: true } : m));
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Não foi possível marcar a mensagem como lida.");
      }
    }
		setSelecionada({ ...msg, lida: readMessage });
    setDecisao(""); setValor(""); setResposta("");
	};

  const voltar = () => { setSelecionada(null); setDecisao(""); setValor(""); setResposta(""); setError(""); };
  const responder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selecionada || (!resposta.trim() && !decisao)) return;
    try {
      if (selecionada.requestId && role === "PROFESSIONAL" && decisao && selecionada.requestStatus === "PENDING") {
        await apiRequest(`/requests/${selecionada.requestId}`, {
          method: "PATCH",
          body: JSON.stringify({ status: decisao === "aceitar" ? "ACCEPTED" : "REJECTED", ...(decisao === "aceitar" && valor && { quotedPrice: Number(valor) }) }),
        });
      }
      await apiRequest("/messages", {
        method: "POST",
        body: JSON.stringify({ receiverId: selecionada.senderId === userId ? selecionada.receiverId : selecionada.senderId, ...(selecionada.requestId && { requestId: selecionada.requestId }), content: resposta.trim() || (decisao === "aceitar" ? "Aceitei sua solicitação." : "Não poderei atender esta solicitação.") }),
      });
      await carregarMensagens();
      voltar();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível enviar a resposta.");
    }
  };

  const enviarMensagem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedRecipient || !composeText.trim()) return;
    setError("");
    try {
      await apiRequest("/messages", {
        method: "POST",
        body: JSON.stringify({ receiverId: selectedRecipient, content: composeText.trim() }),
      });
      setComposeText("");
      await carregarMensagens();
      setComposing(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível enviar a mensagem.");
    }
  };

	return (
		<>
			<ModalHeader
				title={selecionada ? "Mensagem" : `Caixa de Mensagens${naoLidas > 0 ? ` (${naoLidas} não lidas)` : ""}`}
				onClose={onClose}
			/>
			{!selecionada ? (
				<div>
          {!composing && <div className="px-6 py-4 border-b border-gray-100">
            <button type="button" onClick={() => setComposing(true)} className="rounded-lg bg-[#1D4ED8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1E40AF]">
              <Send className="mr-2 inline h-4 w-4" />Nova mensagem
            </button>
          </div>}
          {composing && <form onSubmit={enviarMensagem} className="flex flex-col gap-4 border-b border-gray-100 bg-blue-50/50 px-6 py-5">
            <Field label="Profissional">
              <select className={inputClass} value={selectedRecipient} onChange={(event) => setSelectedRecipient(event.target.value)} required>
                <option value="">Selecione um profissional cadastrado</option>
                {professionals.map((professional) => <option key={professional.userId} value={professional.userId}>{professional.name} · {professional.profession}</option>)}
              </select>
            </Field>
            {!professionals.length && <p className="text-xs text-gray-500">Nenhum profissional cadastrado para iniciar uma conversa.</p>}
            <Field label="Mensagem">
              <textarea className={`${inputClass} resize-none`} rows={3} value={composeText} onChange={(event) => setComposeText(event.target.value)} placeholder="Escreva sua mensagem..." required maxLength={4000} />
            </Field>
            <div className="flex gap-3">
              <button type="submit" disabled={!professionals.length} className={`${btnBlueW} flex-1`}><Send className="h-4 w-4" />Enviar mensagem</button>
              <button type="button" onClick={() => { setComposing(false); setError(""); }} className="rounded-lg border border-gray-200 px-4 text-sm text-gray-600 hover:bg-white">Cancelar</button>
            </div>
          </form>}
          {professionals.length > 0 && !composing && <div className="px-6 py-4 border-b border-gray-100">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Profissionais cadastrados</p>
            <div className="flex flex-wrap gap-2">
              {professionals.map((professional) => <button key={professional.userId} type="button" onClick={() => { setSelectedRecipient(professional.userId); setComposing(true); }} className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100">{professional.name} · {professional.profession}</button>)}
            </div>
          </div>}
          <div className="divide-y divide-gray-100">
          {loading && <p className="px-6 py-8 text-center text-sm text-gray-500">Carregando mensagens...</p>}
          {error && <p role="alert" className="px-6 py-4 text-sm text-red-600">{error}</p>}
          {!loading && !mensagens.length && <p className="px-6 py-8 text-center text-sm text-gray-500">Nenhuma mensagem por enquanto.</p>}
					{mensagens.map((msg) => {
						const cfg = tipoConfig[msg.tipo];
						return (
							<button key={msg.id} onClick={() => abrirMensagem(msg)} className={`w-full text-left px-6 py-4 hover:bg-[#EFF6FF] transition-colors flex items-start gap-4 ${!msg.lida ? "bg-blue-50/40" : ""}`}>
								<div className="w-10 h-10 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
									{msg.remetente.charAt(0)}
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between gap-2 mb-1">
										<span className={`text-sm font-semibold truncate ${!msg.lida ? "text-gray-900" : "text-gray-700"}`}>{msg.remetente}</span>
										<span className="text-xs text-gray-400 flex-shrink-0">{msg.hora} · {msg.data}</span>
									</div>
									<div className="flex items-center gap-2 mb-1">
										<span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>{cfg.icon}{cfg.label}</span>
										{!msg.lida && <span className="w-2 h-2 rounded-full bg-[#1D4ED8] flex-shrink-0" />}
									</div>
									<p className="text-xs text-gray-500 truncate">{msg.preview}</p>
								</div>
								<ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-3" />
							</button>
						);
					})}
				</div></div>
			) : (
				<div className="flex flex-col">
					<div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
						<button onClick={voltar} className="text-sm text-[#1D4ED8] font-medium hover:underline">← Voltar</button>
						<span className="text-gray-300">|</span>
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center text-xs font-bold">
								{selecionada.remetente.charAt(0)}
							</div>
							<div>
								<p className="text-sm font-semibold text-gray-900">
									{selecionada.remetente} · {selecionada.telefone}
								</p>
								<p className="text-xs text-gray-400">{selecionada.hora} · {selecionada.data}</p>
							</div>
						</div>
						<span className={`ml-auto inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${tipoConfig[selecionada.tipo].bg} ${tipoConfig[selecionada.tipo].color}`}>
							{tipoConfig[selecionada.tipo].icon}
							{tipoConfig[selecionada.tipo].label}
						</span>
					</div>
					<div className="px-6 py-5">
						<div className="flex items-start gap-3">
							<div className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
								{selecionada.remetente.charAt(0)}
							</div>
							<div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-sm">
								<p className="text-sm text-gray-800 leading-relaxed">{selecionada.conteudo}</p>
							</div>
						</div>
						{selecionada.tipo === "avaliacao_cliente" && selecionada.nota && (
							<div className="mt-4 ml-12 flex items-center gap-2">
								<RatingStars rating={selecionada.nota} size="md" />
								<span className="text-xs text-gray-500">{selecionada.nota}/5</span>
							</div>
						)}
						{selecionada.tipo === "avaliacao_cliente" && (
							<div className="mt-5 ml-12 bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-2">
								<CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
								<p className="text-xs text-green-700">Esta é uma avaliação do cliente. Nenhuma resposta é necessária.</p>
							</div>
						)}
					</div>
          <form onSubmit={responder} className="border-t border-gray-100 px-6 py-5 flex flex-col gap-4 bg-gray-50/50">
            {precisaResposta && role === "PROFESSIONAL" && selecionada.requestStatus === "PENDING" && (
							<p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sua resposta ao cliente</p>
            )}
            {precisaResposta && role === "PROFESSIONAL" && selecionada.requestStatus === "PENDING" && (
							<div className="flex flex-col gap-2">
								<label className="text-sm font-medium text-gray-700">Decisão sobre o serviço</label>
								<div className="flex gap-3">
									{[
										{ val: "aceitar" as const, label: "Aceitar", Icon: CheckCircle, active: "border-[#1D4ED8] bg-[#EFF6FF]", activeText: "text-[#1D4ED8]", activeIcon: "text-[#1D4ED8]" },
										{ val: "recusar" as const, label: "Não aceitar", Icon: XCircle, active: "border-red-400 bg-red-50", activeText: "text-red-600", activeIcon: "text-red-500" },
									].map(({ val, label, Icon, active, activeText, activeIcon }) => (
										<label key={val} className={`flex-1 flex items-center gap-2.5 border rounded-xl px-4 py-3 cursor-pointer select-none transition-all ${decisao === val ? active : "border-gray-200 bg-white hover:border-gray-300"}`}>
											<input type="radio" name="decisao" value={val} checked={decisao === val} onChange={() => setDecisao(val)} className="w-4 h-4 accent-[#1D4ED8]" />
											<Icon className={`w-4 h-4 ${decisao === val ? activeIcon : "text-gray-400"}`} />
											<span className={`text-sm font-medium ${decisao === val ? activeText : "text-gray-700"}`}>{label}</span>
										</label>
									))}
								</div>
							</div>
              )}
              {decisao === "aceitar" && (
								<>
									<div className="flex flex-col gap-1.5">
										<label className="text-sm font-medium text-gray-700">Valor do serviço (R$)</label>
										<div className="relative">
											<span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">R$</span>
											<input type="number" min={0} step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} className={`${inputClass} pl-9`} placeholder="0,00" />
										</div>
									</div>
								</>
							)}
            <Field label="Responder">
              <textarea className={`${inputClass} resize-none h-24`} value={resposta} onChange={(event) => setResposta(event.target.value)} placeholder="Escreva uma mensagem..." />
            </Field>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={!resposta.trim() && !decisao} className={btnBlueW}>
								<Send className="w-4 h-4" />
                Enviar resposta
							</button>
          </form>
				</div>
			)}
		</>
	);
}


type RequestItem = {
  id: string;
  kind: "QUOTE" | "SERVICE";
  status: "PENDING" | "ACCEPTED" | "COMPLETED" | "REJECTED" | "CANCELLED";
  description: string;
  desiredDate: string | null;
  createdAt: string;
  client: { name: string };
  professional: { user: { name: string }; profession: { name: string } };
};

const requestStatusLabel: Record<RequestItem["status"], string> = {
  PENDING: "Aguardando resposta",
  ACCEPTED: "Aceita",
  COMPLETED: "Concluída",
  REJECTED: "Recusada",
  CANCELLED: "Cancelada",
};

const formatDateOnly = (value: string | null) => {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) return null;
  return date.toLocaleDateString("pt-BR");
};

export function SolicitacoesModal({ onClose, role, onUpdated }: { onClose: () => void; role: UserRole; onUpdated: () => void }) {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const loadRequests = async () => {
    const items = await apiRequest<RequestItem[]>("/requests");
    setRequests(items.filter((item) => item.status === "PENDING" || item.status === "ACCEPTED"));
  };

  useEffect(() => {
    void loadRequests()
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar as solicitações."))
      .finally(() => setLoading(false));
  }, []);

  const updateRequest = async (id: string, status: "ACCEPTED" | "REJECTED") => {
    setUpdatingId(id);
    setError("");
    try {
      await apiRequest(`/requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      await loadRequests();
      onUpdated();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível atualizar a solicitação.");
    } finally {
      setUpdatingId("");
    }
  };

  return <>
    <ModalHeader title="Solicitações abertas" onClose={onClose} />
    <div className="divide-y divide-gray-100">
      {loading && <p className="px-6 py-8 text-center text-sm text-gray-500">Carregando solicitações...</p>}
      {error && <p role="alert" className="px-6 py-4 text-sm text-red-600">{error}</p>}
      {!loading && !requests.length && !error && <p className="px-6 py-8 text-center text-sm text-gray-500">Não há solicitações abertas.</p>}
      {requests.map((request) => <article key={request.id} className="px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-900">{role === "professional" ? request.client.name : request.professional.user.name}</h3>
            <p className="mt-1 text-xs text-gray-500">{request.professional.profession.name} · {request.kind === "QUOTE" ? "Pedido de orçamento" : "Solicitação de serviço"}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${request.status === "PENDING" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>{requestStatusLabel[request.status]}</span>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{request.description}</p>
        <p className="mt-2 text-xs text-gray-400">{formatDateOnly(request.desiredDate) ? `Data desejada: ${formatDateOnly(request.desiredDate)}` : `Recebida em ${new Date(request.createdAt).toLocaleDateString("pt-BR")}`}</p>
        {role === "professional" && request.status === "PENDING" && <div className="mt-4 flex gap-3">
          <button type="button" disabled={updatingId === request.id} onClick={() => void updateRequest(request.id, "ACCEPTED")} className="rounded-lg bg-[#1D4ED8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1E40AF] disabled:opacity-50">Aceitar</button>
          <button type="button" disabled={updatingId === request.id} onClick={() => void updateRequest(request.id, "REJECTED")} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Recusar</button>
        </div>}
      </article>)}
    </div>
  </>;
}

// Modal Avaliação do Profissional - Página do Usuario Logado
export function AvaliacaoModal({ onClose, role }: { onClose: () => void; role: UserRole }) {
  const [requests, setRequests] = useState<Array<{ id: string; status: string; kind: string; description: string; client: { name: string }; professional: { user: { name: string }; profession: { name: string } } }>>([]);
  const [selected, setSelected] = useState("");
	const [nota, setNota] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const loadRequests = async () => {
    const items = await apiRequest<Array<{ id: string; status: string; kind: string; description: string; client: { name: string }; professional: { user: { name: string }; profession: { name: string } } }>>("/requests");
    setRequests(items.filter((item) => role === "professional" ? item.status === "ACCEPTED" : item.status === "COMPLETED"));
  };
  useEffect(() => {
    void loadRequests()
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os serviços concluídos."))
      .finally(() => setLoadingRequests(false));
  }, [role]);
  const request = requests.find((item) => item.id === selected);
  const markServiceCompleted = async () => {
    if (!selected) return;
    setLoading(true);
    setError("");
    try {
      await apiRequest(`/requests/${selected}`, { method: "PATCH", body: JSON.stringify({ status: "COMPLETED" }) });
      setSuccess("Serviço marcado como realizado. O cliente já pode avaliá-lo.");
      setRequests((current) => current.filter((item) => item.id !== selected));
      setSelected("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível marcar o serviço como realizado.");
    } finally {
      setLoading(false);
    }
  };
  const submitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !nota) return;
    setLoading(true);
    try {
      await apiRequest("/reviews", { method: "POST", body: JSON.stringify({ requestId: selected, rating: Number(nota), comment }) });
      setSuccess("Avaliação salva com sucesso.");
      setRequests((current) => current.filter((item) => item.id !== selected));
      setSelected("");
      setNota("");
      setComment("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível salvar a avaliação.");
    } finally {
      setLoading(false);
    }
  };

	return (
		<>
			<ModalHeader title="Avaliação do Profissional" onClose={onClose} />
      <form className="px-7 py-6 flex flex-col gap-5" onSubmit={submitReview}>
        <Field label={role === "professional" ? "Solicitação aceita" : "Serviço concluído"}>
					<div className="relative">
            <select className={`${inputClass} appearance-none pr-10`} value={selected} onChange={(e) => setSelected(e.target.value)} required>
              <option value="">{loadingRequests ? "Carregando solicitações..." : role === "professional" ? "— Escolha uma solicitação aceita —" : "— Escolha um serviço concluído —"}</option>
                      {requests.map((item) => <option key={item.id} value={item.id}>{role === "professional" ? `${item.client.name} · ` : ""}{item.professional.user.name} · {item.professional.profession.name}</option>)}
						</select>
						<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
					</div>
                  {!loadingRequests && !requests.length && !error && <p className="mt-2 text-xs text-gray-500">{role === "professional" ? "Você não tem serviços aceitos aguardando confirmação de conclusão." : "Você ainda não tem serviços concluídos disponíveis para avaliar."}</p>}
				</Field>
				<Field label="Profissão">
          <input type="text" className={`${inputClass} text-gray-500`} value={request?.professional.profession.name ?? ""} readOnly placeholder="Preenchido automaticamente" />
				</Field>
                {role === "professional" ? (
                  <button type="button" onClick={() => void markServiceCompleted()} disabled={loading || !selected} className={btnBlueW}>
                    <CheckCircle className="h-4 w-4" />{loading ? "Atualizando serviço..." : "Informar que o serviço foi realizado"}
                  </button>
                ) : <>
				<Field label="Nota do serviço prestado">
					<div className="bg-[#F9FAFB] border border-gray-200 rounded-xl px-5 py-4 flex flex-col gap-3">
						{[{ val: "5", label: "Excelente" }, { val: "4", label: "Muito bom" }, { val: "3", label: "Bom" }, { val: "2", label: "Regular" }, { val: "1", label: "Ruim" }].map(({ val, label }) => (
							<label key={val} className="flex items-center gap-3 cursor-pointer select-none">
								<input type="radio" name="nota" value={val} checked={nota === val} onChange={() => setNota(val)} className="w-4 h-4 accent-[#1D4ED8]" />
								<div className="flex items-center gap-2">
									<RatingStars rating={Number(val)} />
									<span className="text-sm text-gray-700 font-medium">{label}</span>
								</div>
							</label>
						))}
					</div>
				</Field>
				<Field label="Descrição da avaliação">
          <textarea className={`${inputClass} resize-none h-24`} placeholder="Compartilhe sua experiência com este profissional..." value={comment} onChange={(event) => setComment(event.target.value)} minLength={3} required />
				</Field>
        <button type="submit" disabled={loading || !selected || !nota} className={btnBlueW}>
					<Send className="w-4 h-4" />
          {loading ? "Salvando..." : "Enviar Avaliação"}
				</button>
        </>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {success && <p role="status" className="text-sm text-green-700">{success}</p>}
			</form>
		</>
	);
}

// Modal de Cadastro Completo / Edição de Perfil
// export function CadastroCompletoModal({ onClose }: { onClose: () => void }) {
export function CadastroProfModal({ onClose, user, onCreated }: { onClose: () => void; user: AppUser | null; onCreated: () => void }) {
  const role = "PRESTADOR";

  // Estado 2: Define se o cadastro é PF (CPF) ou PJ (CNPJ)
  const [docType, setDocType] = useState<"CPF" | "CNPJ">("CPF");
  // Estados para dados de identificação
  const [name, setName] = useState(user?.name ?? "");
  const [documentNumber, setDocumentNumber] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState("0");
  const [error, setError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  // Estados específicos do Prestador
  const [profession, setProfession] = useState("");
  const [serviceInput, setServiceInput] = useState("");
  const [services, setServices] = useState<string[]>([]);

  const formatDocument = (value: string, type: "CPF" | "CNPJ") => {
    const digits = value.replace(/\D/g, "").slice(0, type === "CPF" ? 11 : 14);
    if (type === "CPF") {
      return digits
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1-$2");
    }
    return digits
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  };

  // Adiciona um novo tipo de serviço ao apertar Enter
  const handleAddService = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && serviceInput.trim()) {
      e.preventDefault();
      if (!services.includes(serviceInput.trim())) {
        setServices([...services, serviceInput.trim()]);
      }
      setServiceInput("");
    }
  };

  // Remove um serviço da lista de tags
  const handleRemoveService = (serviceToRemove: string) => {
    setServices(services.filter((s) => s !== serviceToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setError("");
    try {
      await apiRequest("/professionals/me", {
        method: "PUT",
        body: JSON.stringify({ profession, bio, experienceYears: Number(experienceYears), documentType: docType, documentNumber: documentNumber.replace(/\D/g, ""), services }),
      });
      onCreated();
      onClose();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível salvar o perfil profissional.");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <>
      <ModalHeader title="Cadastro de Perfil" onClose={onClose} />
       <form onSubmit={handleSubmit} className="px-7 py-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
        {/* 2. Seleção: PF (CPF) ou PJ (CNPJ) */}
        <div className="flex flex-col gap-2">
          <label className="font-bold text-gray-700">Tipo de Inscrição:</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="docType"
                checked={docType === "CPF"}
                onChange={() => { setDocType("CPF"); setDocumentNumber((current) => formatDocument(current, "CPF")); }}
                className="accent-[#1D4ED8]"
              />
              <User className="w-4 h-4 text-gray-500" />
              Pessoa Física (CPF)
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="docType"
                checked={docType === "CNPJ"}
                onChange={() => { setDocType("CNPJ"); setDocumentNumber((current) => formatDocument(current, "CNPJ")); }}
                className="accent-[#1D4ED8]"
              />
              <Building2 className="w-4 h-4 text-gray-500" />
              Pessoa Jurídica (CNPJ)
            </label>
          </div>
        </div>     {/* 3. Dados Principais de Identificação */}
        <div className="grid grid-cols-2 gap-4">
          <Field label={docType === "CPF" ? "Nome Completo" : "Razão Social"}>
            <input
              type="text"
              value={name}
              className={inputClass}
              placeholder={docType === "CPF" ? "Digite seu nome completo" : "Nome oficial da empresa"}
              readOnly
              required
            />
          </Field>

          <Field label={docType === "CPF" ? "CPF" : "CNPJ"}>
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(formatDocument(e.target.value, docType))}
              className={inputClass}
              placeholder={docType === "CPF" ? "000.000.000-00" : "00.000.000/0001-00"}
              required
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="E-mail de Contato">
            <input
              type="email"
              value={email}
              className={inputClass}
              readOnly
              required
            />
          </Field>

          <Field label="Telefone / WhatsApp">
            <input
              type="tel"
              value={phone}
              className={inputClass}
              readOnly
              required
            />
          </Field>
        </div>
       {/* 5. Autodeclaração / Bio */}
        <Field label="Fale um pouco sobre você ou seu negócio">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={`${inputClass} resize-none h-24`}
            placeholder={
              role === "PRESTADOR"
                ? "Apresente suas habilidades, sua pontualidade e os diferenciais do seu atendimento..."
                : "Apresente quem é você ou sua empresa e que tipos de serviço costuma demandar..."
            }
            required
          />
        </Field>
    <Field label="Anos de experiência">
      <input type="number" min="0" max="80" value={experienceYears} onChange={(event) => setExperienceYears(event.target.value)} className={inputClass} required />
    </Field>
		{/* 6. Seção Exclusiva: Prestador de Serviço */}
        {role === "PRESTADOR" && (
          <div className="flex flex-col gap-5 border-t border-gray-100 pt-5">
            <div className="flex items-center gap-2 text-[#1D4ED8]">
              <Hammer className="w-5 h-5" />
              <h4 className="font-bold text-base text-gray-900">Especialidades e Portfólio</h4>
            </div>

            <Field label="Profissão Principal">
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className={inputClass}
                placeholder="Ex: Eletricista Residencial, Mecânico Geral, Encanador..."
                required={role === "PRESTADOR"}
              />
            </Field>

            {/* Tipos de serviços prestados */}
            <Field label="Outros tipos de serviços que realiza">
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  onKeyDown={handleAddService}
                  className={inputClass}
                  placeholder="Ex: Troca de fiação, Instalação de chuveiro... e tecle Enter"
                />
                <div className="flex flex-wrap gap-2 mt-1">
                  {services.map((srv) => (
                    <span
                      key={srv}
                      className="bg-blue-50 text-[#1D4ED8] border border-blue-200 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
                    >
                      {srv}
                      <button
                        type="button"
                        onClick={() => handleRemoveService(srv)}
                        className="text-blue-400 hover:text-blue-700 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </Field>

          </div>
        )}
		{error && <p role="alert" className="text-sm text-red-600">{error}</p>}
		<button type="submit" disabled={savingProfile} className={`${btnBlueW} mt-2`}>
          <Send className="w-4 h-4" />
          {savingProfile ? "Salvando..." : "Concluir Cadastro de Perfil"}
        </button> 
      </form>
    </>
  );
}