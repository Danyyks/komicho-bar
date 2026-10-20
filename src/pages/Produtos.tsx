// Aba Produtos: o cardápio por categoria, com cadastro e edição de preço.
import { useEffect, useRef, useState } from "react";
import { Beer, Plus, Settings, Trash2 } from "lucide-react";
import { useDados } from "@/context/DadosContext";
import { useAviso } from "@/context/AvisoContext";
import { CabecalhoAba } from "@/components/Cabecalho";
import { Sheet } from "@/components/Sheet";
import { Botao, BotaoFlutuante, BotaoIcone, Campo, CampoValor, Cartao, Chip, TituloSecao, Vazio } from "@/components/ui";
import { reais } from "@/lib/dinheiro";
import { CATEGORIAS_PRODUTO, type CategoriaProduto, type Produto } from "@/types";
import { Ajustes } from "./Ajustes";

export function Produtos() {
  const { produtos, usarCardapioExemplo } = useDados();
  const [editando, setEditando] = useState<{ aberto: boolean; produto?: Produto }>({ aberto: false });
  const [ajustes, setAjustes] = useState(false);

  return (
    <>
      <CabecalhoAba
        titulo="Produtos"
        subtitulo={produtos.length ? `${produtos.length} no cardápio` : undefined}
        direita={<BotaoIcone icone={Settings} aria-label="Ajustes" onClick={() => setAjustes(true)} />}
      />

      {produtos.length === 0 ? (
        <Vazio icone={Beer} titulo="Monte seu cardápio" texto="Cadastre o que você vende para usar nas comandas.">
          <Botao onClick={() => setEditando({ aberto: true })}>Adicionar produto</Botao>
          <Botao variante="secundario" onClick={usarCardapioExemplo}>
            Usar cardápio de exemplo
          </Botao>
        </Vazio>
      ) : (
        // Uma seção por categoria (na ordem fixa do cardápio)
        CATEGORIAS_PRODUTO.map((cat) => {
          const daCategoria = produtos.filter((p) => p.categoria === cat);
          if (daCategoria.length === 0) return null;
          return (
            <section key={cat}>
              <TituloSecao>{cat}</TituloSecao>
              <Cartao className="divide-y divide-linha overflow-hidden">
                {daCategoria.map((p) => (
                  <button key={p.id} onClick={() => setEditando({ aberto: true, produto: p })} className="flex min-h-14 w-full items-center gap-3 px-4 py-3.5 text-left active:bg-elevado">
                    <span className="flex-1 text-[17px] font-medium">{p.nome}</span>
                    <span className="num text-[17px] font-semibold">{reais(p.preco)}</span>
                  </button>
                ))}
              </Cartao>
            </section>
          );
        })
      )}

      <BotaoFlutuante icone={Plus} onClick={() => setEditando({ aberto: true })}>
        Novo produto
      </BotaoFlutuante>

      <EditarProduto aberto={editando.aberto} produto={editando.produto} onFechar={() => setEditando((e) => ({ ...e, aberto: false }))} />
      <Ajustes aberto={ajustes} onFechar={() => setAjustes(false)} />
    </>
  );
}

/** Painel de cadastro/edição de produto (nome, preço e categoria). */
function EditarProduto({ aberto, produto, onFechar }: { aberto: boolean; produto?: Produto; onFechar: () => void }) {
  const { salvarProduto, removerProduto } = useDados();
  const avisar = useAviso();
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState(0);
  const [categoria, setCategoria] = useState<CategoriaProduto>("Cervejas");
  const ultimaCategoria = useRef<CategoriaProduto>("Cervejas");

  // Carrega o produto (edição) ou limpa (novo, mantendo a última categoria usada)
  useEffect(() => {
    if (!aberto) return;
    setNome(produto?.nome ?? "");
    setPreco(produto?.preco ?? 0);
    setCategoria(produto?.categoria ?? ultimaCategoria.current);
  }, [aberto, produto]);

  function salvar() {
    if (!nome.trim()) return avisar("Digite o nome do produto.");
    if (preco <= 0) return avisar("Digite o preço.");
    salvarProduto({ id: produto?.id, nome: nome.trim(), preco, categoria });
    ultimaCategoria.current = categoria;
    onFechar();
    avisar(produto ? "Produto atualizado" : `${nome.trim()} no cardápio`);
  }

  return (
    <Sheet
      aberto={aberto}
      onFechar={onFechar}
      titulo={produto ? "Editar produto" : "Novo produto"}
      rodape={
        <div className="flex gap-2.5">
          {produto && (
            <Botao
              variante="perigo"
              aria-label="Apagar produto"
              className="px-5"
              onClick={() => {
                const desfazer = removerProduto(produto);
                onFechar();
                avisar(`${produto.nome} apagado`, { desfazer });
              }}
            >
              <Trash2 className="size-5" />
            </Botao>
          )}
          <Botao bloco onClick={salvar}>
            Salvar
          </Botao>
        </div>
      }
    >
      <Campo rotulo="Nome" placeholder="Ex.: Brahma 600 ml" value={nome} onChange={(e) => setNome(e.target.value)} autoCapitalize="sentences" />

      <div className="py-6">
        <CampoValor rotulo="Preço" valor={preco} onMudar={setPreco} />
      </div>

      <p className="mb-2.5 text-[15px] font-medium text-texto-2">Categoria</p>
      <div className="flex flex-wrap gap-2">
        {CATEGORIAS_PRODUTO.map((c) => (
          <Chip key={c} ativo={categoria === c} onClick={() => setCategoria(c)}>
            {c}
          </Chip>
        ))}
      </div>
      {produto && <p className="mt-5 text-[14px] text-texto-2">Mudar o preço não altera as vendas que já foram feitas.</p>}
    </Sheet>
  );
}
