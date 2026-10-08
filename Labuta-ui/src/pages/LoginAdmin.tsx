import { useState } from "react";
import { Shield, Hammer } from "lucide-react";
import type { Page } from "../types/types";
import { login, setAuthToken, type ApiUser } from "../api";

// Página de Login do Administrador
export function AdminLoginPage({ navigate, onAdminLogin }: { navigate: (p: Page) => void; onAdminLogin: (user: ApiUser) => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const session = await login(email.trim(), password);
            if (session.user.role !== "ADMIN") throw new Error("Esta conta não possui acesso administrativo.");
            setAuthToken(session.token);
            onAdminLogin(session.user);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Não foi possível entrar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-4 py-16">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-sm p-8">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <Hammer className="w-6 h-6 text-blue-400" />
                    <span className="font-bold text-xl text-blue-400">Labuta</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-6 h-6 text-blue-400" />
                    <span className="text-white font-bold text-lg">Painel Administrativo</span>
                </div>
                <p className="text-gray-500 text-sm mb-7">Acesso restrito a administradores do sistema Labuta.</p>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    {error && (
                        <div className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">{error}</div>
                    )}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-300">E-mail administrativo</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-500 transition-all placeholder:text-gray-600"
                            placeholder="admin@labuta.com"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-300">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-700 rounded-lg px-3.5 py-2.5 text-sm text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600/40 focus:border-blue-500 transition-all placeholder:text-gray-600"
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-sm py-3 rounded-xl transition-colors mt-1 cursor-pointer disabled:opacity-50">
                        {loading ? "Acessando..." : "Acessar"}
                    </button>
                </form>
                <button onClick={() => navigate("home")} className="mt-5 text-sm text-gray-500 hover:text-gray-400 transition-colors block cursor-pointer">
                    ← Voltar ao site
                </button>
            </div>
        </div>
    );
}