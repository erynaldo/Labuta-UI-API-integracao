import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, UserPlus } from "lucide-react";
import type { Page } from "../types/types";
import { btnBlueW, Field, inputClass } from "../components/shared/others";
import { PublicNav } from "../components/shared/header";
import { SiteFooter } from "../components/shared/footer";
import { register } from "../api";

// Página de Cadastro do Usuário
export function CadastroPage({ navigate }: { navigate: (p: Page) => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    const masked = digits.length <= 2 ? `(${digits}` : `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}${digits.length > 7 ? `-${digits.slice(7)}` : ""}`;
    updateField("phone", masked);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = form.email.trim().toLowerCase();

    if (Object.values(form).some((value) => !value.trim())) {
      setError("Preencha todos os campos.");
      return;
    }
    if (form.name.trim().split(/\s+/).length < 2) {
      setError("Digite seu nome completo, incluindo nome e sobrenome.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Digite um e-mail válido.");
      return;
    }
    if (form.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Os campos Senha e Confirmar senha estão diferentes.");
      return;
    }
    if (!/^\(\d{2}\) 9\d{4}-\d{4}$/.test(form.phone)) {
      setError("Digite o número completo do celular no formato (00) 90000-0000.");
      return;
    }
    if (!acceptedTerms) {
      setError("Aceite os termos de uso e a política de privacidade para continuar.");
      return;
    }

    try {
      await register({ name: form.name, email: normalizedEmail, phone: form.phone, city: form.city, password: form.password });
      setError("");
      setAcceptedTerms(false);
      setForm({ name: "", email: "", phone: "", city: "", password: "", confirmPassword: "" });
      setSuccess("Cadastro realizado com sucesso");
      window.setTimeout(() => navigate("cadastro"), 1500);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível concluir o cadastro.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav navigate={navigate} />
      <main className="flex-1 flex items-center justify-center px-4 py-16 bg-gray-50">
        <div className="bg-white rounded-2xl shadow-[0_2px_32px_rgba(0,0,0,0.10)] w-full max-w-md p-8">
          <div className="mb-7">
            <div className="flex items-center justify-center gap-2 mb-1">
              <img src="/favicon-32.png" alt="Labuta" className="w-7" />
              <span className="text-1xs font-bold text-[#1D4ED8] uppercase tracking-wide">Labuta</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">Criar conta</h2>
            <p className="text-sm text-gray-500 mt-1">Preencha seus dados para se cadastrar.</p>
          </div>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            {error && (
              <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                {error}
              </p>
            )}

            {success && (
              <p role="status" className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                {/* {success}. Redirecionando para o login... */}
                {success}
              </p>
            )}

            <Field label="Nome completo">
              <input
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className={inputClass}
                placeholder="Ex.: Maria Silva"
                autoComplete="name"
                required
              />
            </Field>

            <Field label="E-mail">
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className={inputClass}
                placeholder="seu@email.com"
                autoComplete="email"
                required
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Celular">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => handlePhoneChange(event.target.value)}
                  className={inputClass}
                  placeholder="(11) 90000-0000"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                />
              </Field>

              <Field label="Cidade">
                <input
                  type="text"
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  className={inputClass}
                  placeholder="Sua cidade"
                  autoComplete="address-level2"
                  required
                />
              </Field>
            </div>

            <Field label="Senha">
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  className={`${inputClass} pl-10 pr-11`}
                  placeholder="Mínimo de 6 caracteres"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            <Field label="Confirmar senha">
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(event) => updateField("confirmPassword", event.target.value)}
                  className={`${inputClass} pl-10 pr-11`}
                  placeholder="Repita sua senha"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer" aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}>
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            <label className="flex items-start gap-2 text-xs text-gray-500 cursor-pointer">
              <input type="checkbox" checked={acceptedTerms} onChange={(event) => { setAcceptedTerms(event.target.checked); setError(""); }} className="mt-0.5 h-4 w-4 accent-[#1D4ED8] cursor-pointer" />
              <span>Li e aceito os termos de uso e a política de privacidade da Labuta.</span>
            </label>

            <button type="submit" className={btnBlueW}>
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              Criar minha conta
            </button>

            <p className="text-center text-sm text-gray-500">
              Já possui uma conta? <button type="button" onClick={() => navigate("login")} className="text-[#1D4ED8] font-semibold text-sm hover:underline cursor-pointer">Entrar</button>
            </p>
          </form>
        </div>
      </main>
      <SiteFooter navigate={navigate} />
    </div>
  );
}