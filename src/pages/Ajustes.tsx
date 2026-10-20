// Painel de ajustes: tema, instalação do app, conta e informações.
import { CloudOff, Download, LogOut, Smartphone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTema, type Tema } from "@/context/TemaContext";
import { Sheet } from "@/components/Sheet";
import { Botao, Segmentado } from "@/components/ui";
import { nuvemLigada } from "@/lib/firebase";
import { useInstalar } from "@/hooks/useInstalar";

export function Ajustes({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const { tema, setTema } = useTema();
  const { usuario, sair } = useAuth();
  const { podeInstalar, instalar, instalado } = useInstalar();

  return (
    <Sheet aberto={aberto} onFechar={onFechar} titulo="Ajustes">
      {/* Tema */}
      <p className="mb-2.5 text-[15px] font-medium text-texto-2">Aparência</p>
      <Segmentado<Tema>
        id="tema"
        valor={tema}
        onMudar={setTema}
        opcoes={[
          { valor: "auto", rotulo: "Automático" },
          { valor: "claro", rotulo: "Claro" },
          { valor: "escuro", rotulo: "Escuro" },
        ]}
      />

      {/* Instalar na tela inicial (Android/Chrome mostra o botão; iPhone, a dica) */}
      {!instalado && (
        <div className="mt-7 rounded-2xl bg-elevado p-4">
          <p className="flex items-center gap-2 text-[17px] font-semibold">
            <Smartphone className="size-5 text-marca-tinta" /> Instalar o app
          </p>
          {podeInstalar ? (
            <Botao className="mt-3" bloco icone={Download} onClick={instalar}>
              Instalar na tela inicial
            </Botao>
          ) : (
            <p className="mt-1 text-[15px] text-texto-2">
              No iPhone: toque em Compartilhar e depois em "Adicionar à Tela de Início". No Android: menu ⋮ e "Instalar app".
            </p>
          )}
        </div>
      )}

      {/* Conta: nuvem (com login) ou modo demo */}
      <p className="mt-7 mb-2.5 text-[15px] font-medium text-texto-2">Dados</p>
      {nuvemLigada && usuario ? (
        <div className="rounded-2xl bg-elevado p-4">
          <p className="text-[16px]">
            Salvo na nuvem com <span className="font-semibold">{usuario.email}</span>
          </p>
          <Botao className="mt-3" variante="secundario" bloco icone={LogOut} onClick={() => void sair()}>
            Sair da conta
          </Botao>
        </div>
      ) : (
        <div className="flex gap-3 rounded-2xl bg-elevado p-4">
          <CloudOff className="mt-0.5 size-5 shrink-0 text-texto-2" />
          <p className="text-[15px] text-texto-2">Modo demonstração: dados fictícios, só neste aparelho.</p>
        </div>
      )}

      <p className="mt-8 text-center text-[13px] text-texto-3">Komicho Bar · versão {__VERSAO__}</p>
    </Sheet>
  );
}
