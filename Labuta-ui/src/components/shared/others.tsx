import { useEffect, useMemo, useState } from "react";
import { Clock, MapPin, Phone, Search, Star, X } from "lucide-react";
import { apiRequest } from "../../api";
import type { Prof } from "../../types/types";

export type Page = "home" | "cadastro" | "login" | "admin-login";

export const inputClass = "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 focus:border-[#1D4ED8] transition-all placeholder:text-gray-400";
export const btnBlueW = "w-full bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-sm py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer";
export const fileClass = "w-full border border-dashed border-gray-300 rounded-lg px-3.5 py-4 text-sm text-gray-500 bg-[#F9FAFB] cursor-pointer hover:border-[#1D4ED8] hover:bg-[#EFF6FF] transition-all flex items-center gap-2";

export function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) { return <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100"><h2 className="text-xl font-semibold text-gray-900">{title}</h2><button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"><X className="w-5 h-5" /></button></div>; }
export function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-gray-700">{label}</label>{children}</div>; }
export function ModalOverlay({ children, wide }: { children: React.ReactNode; wide?: boolean }) { return <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}><div className={`bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${wide ? "max-w-3xl" : "max-w-lg"}`}>{children}</div></div>; }
export function RatingStars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) { const s = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"; return <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`${s} ${i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />)}</div>; }
export function AvailBadge({ available }: { available: boolean }) { return <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${available ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}><span className={`w-1.5 h-1.5 rounded-full ${available ? "bg-green-500" : "bg-red-500"}`} />{available ? "Disponível" : "Indisponível"}</span>; }
export function ProfCard({ prof, onSaibaMais }: { prof: Prof; onSaibaMais: (p: Prof) => void }) { return <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.09)] p-6 flex flex-col gap-3 hover:shadow-[0_4px_24px_rgba(29,78,216,0.13)] transition-shadow"><div className="flex items-start justify-between gap-2"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center text-base font-bold flex-shrink-0">{prof.name.charAt(0)}</div><div><p className="font-semibold text-gray-900 text-sm leading-tight">{prof.name}</p><p className="text-xs text-[#1D4ED8] font-medium">{prof.profession}</p></div></div><AvailBadge available={prof.available} /></div><div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500"><span className="flex items-center gap-1"><Clock className="w-3 h-3" />{prof.years} anos de exp.</span><span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{prof.city}</span><span className="flex items-center gap-1"><Phone className="w-3 h-3" />{prof.phone}</span></div><div className="flex items-center gap-2"><RatingStars rating={prof.rating} /><span className="text-xs text-gray-500">{prof.rating.toFixed(1)}</span></div><p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{prof.summary}</p><button onClick={() => onSaibaMais(prof)} className="mt-1 w-full border border-[#1D4ED8] text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white text-sm font-semibold py-2 rounded-lg transition-colors cursor-pointer">Saiba mais </button></div>; }
export function ProfessionalsSection({ onSaibaMais }: { onSaibaMais: (p: Prof) => void }) {
  const [search, setSearch] = useState("");
  const [professionals, setProfessionals] = useState<Prof[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    void apiRequest<Array<{ id: string; user: { id: string; name: string; phone: string; city: string }; profession: { name: string }; experienceYears: number; available: boolean; bio: string; reviews: Array<{ rating: number }> }>>("/professionals")
      .then((records) => setProfessionals(records.map((record) => ({
        id: record.id,
        userId: record.user.id,
        name: record.user.name,
        profession: record.profession.name,
        years: record.experienceYears,
        city: record.user.city,
        phone: record.user.phone,
        available: record.available,
        summary: record.bio,
        rating: record.reviews.length ? record.reviews.reduce((sum, review) => sum + review.rating, 0) / record.reviews.length : 0,
      }))))
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os profissionais."));
  }, []);
  const filtered = useMemo(() => {
    if (!search.trim()) return professionals;
    const query = search.toLowerCase();
    return professionals.filter((professional) => professional.name.toLowerCase().includes(query) || professional.profession.toLowerCase().includes(query) || professional.city.toLowerCase().includes(query));
  }, [professionals, search]);
  return <div className="flex flex-col gap-5"><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/30 focus:border-[#1D4ED8] transition-all placeholder:text-gray-400 shadow-sm" placeholder="Buscar por nome, profissão ou cidade..." /></div>{error ? <p role="alert" className="text-center py-12 text-sm text-red-600">{error}</p> : filtered.length === 0 ? <div className="text-center py-16 text-gray-400"><Search className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">Nenhum profissional encontrado para "{search}".</p></div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{filtered.map((professional) => <ProfCard key={professional.id} prof={professional} onSaibaMais={onSaibaMais} />)}</div>}</div>;
}
