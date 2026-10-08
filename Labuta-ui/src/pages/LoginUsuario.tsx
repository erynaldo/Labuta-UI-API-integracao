import { useState } from "react";
import type { AppUser, Page } from "../types/types";
import { btnBlueW, Field, inputClass, ModalHeader, ModalOverlay } from "../components/shared/others";
import { PublicNav } from "../components/shared/header";
import { SiteFooter } from "../components/shared/footer";
import { login, setAuthToken } from "../api";

// Página de Login do Usuário
export function LoginPage({ navigate, onLogin }: { navigate: (p: Page) => void; onLogin: (u: AppUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const session = await login(email.trim(), password);
      if (session.user.role === "ADMIN") throw new Error("Use o acesso administrativo para entrar com esta conta.");
      setAuthToken(session.token);
      onLogin({ id: session.user.id, name: session.user.name, email: session.user.email, phone: session.user.phone, city: session.user.city, role: session.user.role === "PROFESSIONAL" ? "professional" : "client" });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav navigate={navigate} />
      <main className="flex-1 flex items-center justify-center px-4 py-16 bg-gray-50">
        <div className="bg-white rounded-2xl shadow-[0_2px_32px_rgba(0,0,0,0.10)] w-full max-w-sm p-8">
          <div className="mb-7">
            <div className="flex items-center justify-center gap-2 mb-1">
              <img src="/favicon-32.png" alt="Labuta" className="w-7" />
              <span className="text-1xs font-bold text-[#1D4ED8] uppercase tracking-wide">Labuta</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">Entrar</h2>
            <p className="text-sm text-gray-500 mt-1">Acesse sua conta.</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                {error}
              </p>
            )}

            <Field label="E-mail">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="seu@email.com"
                required
              />
            </Field>

            <Field label="Senha">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                required
              />
            </Field>

            
            <div className="text-right">
              <button
                type="button"
                onClick={() => setRecoveryOpen(true)}
                className="text-xs text-blue-600 hover:underline cursor-pointer"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button type="submit" className={btnBlueW} disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </main>

      <SiteFooter navigate={navigate} />

      {recoveryOpen && (
        <ModalOverlay>
          <ModalHeader title="Recuperar senha" onClose={() => setRecoveryOpen(false)} />
          <form 
            className="px-7 py-6 flex flex-col gap-4" 
            onSubmit={(event) => { 
              event.preventDefault(); 
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail)) { 
                setRecoveryMessage("Digite um e-mail válido."); 
                return; 
              } 
              setRecoveryMessage("Se o e-mail estiver cadastrado, enviaremos as instruções para recuperar sua senha."); 
            }}
          >
            <Field label="E-mail">
              <input 
                type="email" 
                value={recoveryEmail} 
                onChange={(event) => setRecoveryEmail(event.target.value)} 
                className={inputClass} 
                placeholder="seu@email.com" 
                required 
              />
            </Field>
            {recoveryMessage && (
              <p role="status" className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                {recoveryMessage}
              </p>
            )}
            <button type="submit" className={btnBlueW}>Recuperar senha</button>
          </form>
        </ModalOverlay>
      )}
    </div>
  );
}