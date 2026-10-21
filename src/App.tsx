// Raiz do app: provedores (tema, avisos, login, dados) e as rotas das telas.
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TemaProvider } from "@/context/TemaContext";
import { AvisoProvider } from "@/context/AvisoContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DadosProvider } from "@/context/DadosContext";
import { Layout } from "@/components/Layout";
import { nuvemLigada } from "@/lib/firebase";
import { Hoje } from "@/pages/Hoje";
import { ComandaDetalhe } from "@/pages/ComandaDetalhe";
import { Fiado } from "@/pages/Fiado";
import { ClienteDetalhe } from "@/pages/ClienteDetalhe";
import { Balanco } from "@/pages/Balanco";
import { Produtos } from "@/pages/Produtos";
import { Login } from "@/pages/Login";

export default function App() {
  return (
    <TemaProvider>
      <AvisoProvider>
        <AuthProvider>
          <BrowserRouter>
            <Portao />
          </BrowserRouter>
        </AuthProvider>
      </AvisoProvider>
    </TemaProvider>
  );
}

/** Decide o que mostrar: carregando, login (nuvem sem sessão) ou o app. */
function Portao() {
  const { usuario, carregando } = useAuth();

  // Enquanto o Firebase confere a sessão salva: tela vazia na cor do fundo (sem "piscar")
  if (carregando) return <div className="min-h-dvh bg-fundo" />;
  if (nuvemLigada && !usuario) return <Login />;

  return (
    <DadosProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Hoje />} />
          <Route path="comanda/:id" element={<ComandaDetalhe />} />
          <Route path="fiado" element={<Fiado />} />
          <Route path="fiado/:id" element={<ClienteDetalhe />} />
          <Route path="balanco" element={<Balanco />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </DadosProvider>
  );
}
