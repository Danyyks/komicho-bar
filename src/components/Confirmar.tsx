// Pergunta de confirmação antes de apagar algo (nada some sem o usuário confirmar).
import { Sheet } from "./Sheet";
import { Botao } from "./ui";

interface ConfirmarProps {
  aberto: boolean;
  titulo: string;
  texto: string;
  botao: string; // ex.: "Apagar cliente"
  onConfirmar: () => void;
  onFechar: () => void;
}

export function Confirmar({ aberto, titulo, texto, botao, onConfirmar, onFechar }: ConfirmarProps) {
  return (
    <Sheet
      aberto={aberto}
      onFechar={onFechar}
      titulo={titulo}
      rodape={
        <div className="flex flex-col gap-2.5">
          <Botao
            variante="perigo"
            bloco
            onClick={() => {
              onConfirmar();
              onFechar();
            }}
          >
            {botao}
          </Botao>
          <Botao variante="fantasma" bloco onClick={onFechar}>
            Voltar
          </Botao>
        </div>
      }
    >
      <p className="text-[17px] text-texto-2">{texto}</p>
    </Sheet>
  );
}
