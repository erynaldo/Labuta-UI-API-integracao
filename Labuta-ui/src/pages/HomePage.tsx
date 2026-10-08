import { useState } from "react";
import type { Page, Prof } from "../types/types";
import { ModalOverlay, ProfessionalsSection } from "../components/shared/others";
import { PublicNav } from "../components/shared/header";
import { SiteFooter } from "../components/shared/footer";
import { SaibaMaisModal } from "./modals/modals";

export function HomePage({ navigate }: { navigate: (p: Page) => void }) {
    const [selectedProf, setSelectedProf] = useState<Prof | null>(null);

    return (
        <div className="min-h-screen flex flex-col">
            <PublicNav navigate={navigate} />

            <section className="bg-gradient-to-br from-[#1D4ED8] via-[#1E40AF] to-[#1e3a8a] text-white py-14 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    {/* <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        328 profissionais disponíveis agora
                    </div> */}

                    <h1 className="text-4xl font-bold leading-tight mb-5">
                        Conectando profissionais a oportunidades
                    </h1>
                    <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                        Encontre os melhores profissionais de serviços domésticos da sua região ou cadastre-se para oferecer seus serviços.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate("cadastro")}
                            className="bg-white text-[#1D4ED8] font-bold text-base px-10 py-4 rounded-2xl hover:bg-blue-100 transition-colors shadow-lg cursor-pointer"
                        >
                            Cadastre-se grátis
                        </button>
                        <button
                            onClick={() => navigate("login")}
                            className="border-2 border-white/60 hover:border-white text-white font-bold text-base px-10 py-4 rounded-2xl transition-colors cursor-pointer"
                        >
                            Já tenho conta → Entrar
                        </button>
                    </div>
                </div>
            </section>

            <div className="bg-white border-b border-gray-100 py-5">
                <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-10 text-center">
                    {[
                        ["247", "Usuários cadastrados"],
                        ["98", "Profissionais ativos"],
                        ["891", "Serviços realizados"],
                        ["4.7★", "Avaliação média"],
                    ].map(([number, label]) => (
                        <div key={label}>
                            <div className="text-2xl font-bold text-[#1D4ED8]">{number}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
                <div className="mb-7">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Pesquise o profissional
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Busque pelo nome, profissão ou cidade.
                    </p>
                </div>
                <ProfessionalsSection onSaibaMais={setSelectedProf} />
            </main>

            <SiteFooter navigate={navigate} />

            {selectedProf && (
                <ModalOverlay>
                    <SaibaMaisModal
                        prof={selectedProf}
                        onClose={() => setSelectedProf(null)}
                        onContratar={() => { setSelectedProf(null); navigate("login"); }}
                        onEnviarMensagem={() => { setSelectedProf(null); navigate("login"); }}
                    />
                </ModalOverlay>
            )}
        </div>
    );
}
