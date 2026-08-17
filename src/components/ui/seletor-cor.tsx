import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Paleta fechada derivada do design system (verdete, degraus de gráfico e
 * cores semânticas). Valores em hex porque a cor é persistida no banco.
 * Cores legadas fora da paleta continuam válidas: aparecem como opção extra
 * marcada como atual e renderizam pelo valor salvo.
 */
export const PALETA_SISTEMA = [
  { valor: "#2C5F5A", nome: "Verdete" },
  { valor: "#3E7F77", nome: "Verdete claro" },
  { valor: "#5FA39A", nome: "Água" },
  { valor: "#8FC3BB", nome: "Água clara" },
  { valor: "#4E7C4A", nome: "Verde" },
  { valor: "#A8762C", nome: "Âmbar" },
  { valor: "#9C4038", nome: "Vermelho" },
  { valor: "#6E6960", nome: "Neutro" },
] as const;

export const COR_PADRAO = PALETA_SISTEMA[0].valor;

function normalizar(cor?: string | null) {
  return (cor ?? "").trim().toLowerCase();
}

export function SeletorCor({
  valor,
  onChange,
  className,
  rotulo = "Cor",
}: {
  valor?: string | null;
  onChange: (cor: string) => void;
  className?: string;
  rotulo?: string;
}) {
  const atual = normalizar(valor);
  const legada =
    atual && !PALETA_SISTEMA.some((c) => normalizar(c.valor) === atual)
      ? { valor: valor as string, nome: "Cor atual" }
      : null;
  const opcoes = legada ? [legada, ...PALETA_SISTEMA] : [...PALETA_SISTEMA];

  return (
    <div role="radiogroup" aria-label={rotulo} className={cn("flex flex-wrap items-center gap-1", className)}>
      {opcoes.map((c) => {
        const selecionada = normalizar(c.valor) === atual;
        return (
          <button
            key={c.valor}
            type="button"
            role="radio"
            aria-checked={selecionada}
            aria-label={c.nome}
            title={c.nome}
            onClick={() => onChange(c.valor)}
            className={cn(
              "flex size-6 items-center justify-center rounded-md border border-border transition-[box-shadow]",
              selecionada && "ring-2 ring-ring ring-offset-2 ring-offset-background",
            )}
            style={{ backgroundColor: c.valor }}
          >
            {selecionada ? <Check className="size-3.5 text-primary-foreground drop-shadow" /> : null}
          </button>
        );
      })}
    </div>
  );
}
