// Aba Fiado: quanto há para receber e a lista dos clientes fiéis com o saldo de cada um.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookUser, ChevronRight, UserPlus } from "lucide-react";
import { useDados } from "@/context/DadosContext";
import { CabecalhoAba } from "@/components/Cabecalho";
import { Sheet } from "@/components/Sheet";
import { Avatar, Botao, BotaoFlutuante, Campo, Cartao, Vazio } from "@/components/ui";
import { reais } from "@/lib/dinheiro";
import { dataCurta } from "@/lib/datas";
import { saldoDoCliente } from "@/lib/balanco";
import { porNome } from "@/lib/utils";

export function Fiado() {
  const { clientes, fiado } = useDados();
  const [novo, setNovo] = useState(false);

  // Saldo e última movimentação de cada cliente; quem deve mais aparece primeiro
  const lista = clientes
    .map((c) => ({
      ...c,
      deve: saldoDoCliente(fiado, c.id),
      ultimo: fiado.find((m) => m.clienteId === c.id)?.data, // fiado já vem do mais recente
    }))
    .sort((a, b) => b.deve - a.deve || porNome(a, b));
  const aReceber = lista.reduce((s, c) => s + Math.max(0, c.deve), 0);
  const devendo = lista.filter((c) => c.deve > 0).length;

  return (
    <>
      <CabecalhoAba titulo="Fiado" />

      {clientes.length === 0 ? (
        <Vazio icone={BookUser} titulo="Nenhum cliente no fiado" texto="Cadastre aqui os clientes de confiança que pagam depois." />
      ) : (
        <>
          {/* Total a receber em destaque */}
          <Cartao className="mb-5 p-5">
            <p className="text-[15px] font-medium text-texto-2">A receber</p>
            <p className={`num mt-0.5 text-[38px] leading-tight font-bold ${aReceber > 0 ? "text-negativo" : "text-positivo"}`}>{reais(aReceber)}</p>
            <p className="mt-0.5 text-[15px] text-texto-2">
              {devendo === 0 ? "Ninguém devendo" : `${devendo} ${devendo === 1 ? "cliente devendo" : "clientes devendo"}`}
            </p>
          </Cartao>

          {/* Clientes */}
          <Cartao className="divide-y divide-linha overflow-hidden">
            {lista.map((c) => (
              <Link key={c.id} to={`/fiado/${c.id}`} className="flex items-center gap-3.5 px-4 py-4 active:bg-elevado">
                <Avatar nome={c.nome} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[18px] font-semibold">{c.nome}</p>
                  <p className="text-[14px] text-texto-2">{c.ultimo ? `Último: ${dataCurta(c.ultimo).toLowerCase()}` : "Sem movimento"}</p>
                </div>
                {c.deve > 0 ? (
                  <p className="num text-[18px] font-semibold text-negativo">{reais(c.deve)}</p>
                ) : (
                  <span className="rounded-full bg-positivo-suave px-3 py-1 text-[14px] font-semibold text-positivo">
                    {c.deve < 0 ? `Crédito ${reais(-c.deve)}` : "Em dia"}
                  </span>
                )}
                <ChevronRight className="-mr-1 size-5 text-texto-3" />
              </Link>
            ))}
          </Cartao>
        </>
      )}

      <BotaoFlutuante icone={UserPlus} onClick={() => setNovo(true)}>
        Novo cliente
      </BotaoFlutuante>
      <NovoCliente aberto={novo} onFechar={() => setNovo(false)} />
    </>
  );
}

/** Painel para cadastrar um cliente novo no fiado (já abre a página dele). */
function NovoCliente({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const { criarCliente } = useDados();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");

  const salvar = () => {
    if (!nome.trim()) return;
    const c = criarCliente(nome);
    setNome("");
    onFechar();
    navigate(`/fiado/${c.id}`);
  };

  return (
    <Sheet aberto={aberto} onFechar={onFechar} titulo="Novo cliente" rodape={<Botao bloco onClick={salvar} disabled={!nome.trim()} className="disabled:opacity-40">Cadastrar</Botao>}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          salvar();
        }}
      >
        <Campo rotulo="Nome" placeholder="Ex.: Seu Zé" value={nome} onChange={(e) => setNome(e.target.value)} autoCapitalize="words" enterKeyHint="done" />
      </form>
    </Sheet>
  );
}
