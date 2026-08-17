import { useCallback, useRef, useState } from "react";

type Regra<C extends string> = [campo: C, invalido: boolean, mensagem: string];

/**
 * Validação de formulário com feedback visível: marca o campo, mostra a
 * mensagem abaixo dele e foca o primeiro campo inválido. Nunca falha em silêncio.
 */
export function useErrosForm<C extends string>() {
  const [erros, setErros] = useState<Partial<Record<C, string>>>({});
  const refs = useRef<Partial<Record<C, HTMLElement | null>>>({});

  const limpar = useCallback((campo: C) => {
    setErros((atual) => {
      if (!atual[campo]) return atual;
      const proximo = { ...atual };
      delete proximo[campo];
      return proximo;
    });
  }, []);

  const limparTudo = useCallback(() => setErros({}), []);

  const validar = useCallback((regras: Regra<C>[]) => {
    const novos: Partial<Record<C, string>> = {};
    for (const [campo, invalido, mensagem] of regras) {
      if (invalido) novos[campo] = mensagem;
    }
    setErros(novos);
    const primeiro = regras.find(([, invalido]) => invalido)?.[0];
    if (primeiro) {
      const el = refs.current[primeiro];
      el?.focus?.();
      el?.scrollIntoView?.({ block: "center", behavior: "smooth" });
      return false;
    }
    return true;
  }, []);

  const campoProps = useCallback(
    (campo: C) => ({
      ref: (el: HTMLElement | null) => {
        refs.current[campo] = el;
      },
      "aria-invalid": erros[campo] ? true : undefined,
      className: erros[campo] ? "border-danger focus-visible:ring-danger" : undefined,
    }),
    [erros],
  );

  return { erros, validar, limpar, limparTudo, campoProps };
}

export function MensagemErro({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p role="alert" className="text-aux text-danger">
      {children}
    </p>
  );
}
