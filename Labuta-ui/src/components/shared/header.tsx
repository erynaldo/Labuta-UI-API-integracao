export type Page = "home" | "cadastro" | "login" | "admin-login";


export function PublicNav({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <header className="bg-[#f6f6f6] text-white shadow-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <button onClick={() => navigate("home")} className="flex items-center gap-2">
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
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("cadastro")} 
            className="bg-[#3163ed] text-white text-sm font-medium border px-4 py-2 rounded-lg hover:bg-[#1D4ED8] transition-colors cursor-pointer"
          >
            Cadastre-se
          </button>
          <button 
            onClick={() => navigate("login")}
            className="bg-white text-[#1D4ED8] text-sm font-medium border px-4 py-2 rounded-lg hover:border-gray-300 hover:text-gray-600 transition-colors cursor-pointer"
          >
            Entrar
          </button>
        </div>
      </div>
    </header>
  );
}