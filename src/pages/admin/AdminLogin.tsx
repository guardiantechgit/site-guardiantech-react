import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface Props {
  onLogin: (username: string, password: string) => boolean;
}

const AdminLogin = ({ onLogin }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!onLogin(username, password)) {
      setError("Usuário ou senha inválidos.");
    }
  };

  return (
    <div className="min-h-screen bg-dark-slate-blue flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/images/logo-white.png" alt="GuardianTech" className="h-7 mx-auto mb-6" />
          <div className="w-12 h-12 bg-base-color rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={20} className="text-white" />
          </div>
          <h1 className="font-alt text-white text-xl font-semibold mb-1">Painel Administrativo</h1>
          <p className="text-white/50 text-sm">Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-extra-medium-slate-blue rounded-xl p-8 space-y-5">
          <div>
            <label className="text-white/70 text-sm font-medium mb-1.5 block">Usuário</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-dark-slate-blue border-white/10 text-white placeholder:text-white/30 focus:border-base-color"
              placeholder="Digite seu usuário"
              autoFocus
            />
          </div>
          <div>
            <label className="text-white/70 text-sm font-medium mb-1.5 block">Senha</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-dark-slate-blue border-white/10 text-white placeholder:text-white/30 focus:border-base-color"
              placeholder="Digite sua senha"
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-base-color hover:bg-base-color/90 text-white font-alt font-medium"
          >
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
