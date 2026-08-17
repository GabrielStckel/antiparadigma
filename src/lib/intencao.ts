import { useEffect } from "react";

/**
 * Barramento leve de "intenções" — usado pela paleta de comandos (⌘K) para
 * navegar até uma rota e, ao chegar, abrir o formulário correspondente.
 * A intenção fica pendente por um curto período até que a tela se registre.
 */
export type Intencao = "nova-ferramenta" | "custos-mes" | "nova-tarefa" | "novo-projeto";

const ouvintes = new Map<Intencao, Set<() => void>>();
let pendente: { intencao: Intencao; em: number } | null = null;

const JANELA_MS = 3000;

export function dispararIntencao(intencao: Intencao) {
  const alvo = ouvintes.get(intencao);
  if (alvo && alvo.size > 0) {
    alvo.forEach((fn) => fn());
    return;
  }
  pendente = { intencao, em: Date.now() };
}

export function useIntencao(intencao: Intencao, acao: () => void) {
  useEffect(() => {
    const set = ouvintes.get(intencao) ?? new Set<() => void>();
    set.add(acao);
    ouvintes.set(intencao, set);

    if (pendente?.intencao === intencao && Date.now() - pendente.em < JANELA_MS) {
      pendente = null;
      acao();
    }

    return () => {
      set.delete(acao);
    };
  }, [intencao, acao]);
}
