import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAplicarCambio } from "@/hooks/use-admin";
import { useCambio, useFerramentas } from "@/hooks/use-ferramentas";
import { brl, num } from "@/lib/format";

const DIVISOR: Record<string, number> = {
  mensal: 1,
  trimestral: 3,
  semestral: 6,
  anual: 12,
  uso: 1,
};

export function AbaConfiguracoes() {
  const { data: cambio } = useCambio();
  const { data: ferramentas } = useFerramentas();
  const aplicar = useAplicarCambio();

  const usdAtual = Number(cambio?.["USD"] ?? 0);
  const eurAtual = Number(cambio?.["EUR"] ?? 0);

  const [usd, setUsd] = useState("");
  const [eur, setEur] = useState("");

  const novoUsd = usd === "" ? usdAtual : Number(usd.replace(",", "."));
  const novoEur = eur === "" ? eurAtual : Number(eur.replace(",", "."));

  const previa = useMemo(() => {
    const estrangeiras = (ferramentas ?? []).filter((f) => f.moeda !== "BRL");
    const mensal = (taxaUsd: number, taxaEur: number) =>
      estrangeiras.reduce((s, f) => {
        if (f.ciclo === "vitalicio" || f.ciclo === "gratuito") return s;
        const taxa = f.moeda === "USD" ? taxaUsd : f.moeda === "EUR" ? taxaEur : 1;
        const base = Number(f.valor) * (f.num_licencas ?? 1) * taxa;
        return s + base / (DIVISOR[f.ciclo] ?? 1);
      }, 0);
    const antes = mensal(usdAtual, eurAtual);
    const depois = mensal(novoUsd, novoEur);
    return { qtd: estrangeiras.length, antes, depois, delta: depois - antes };
  }, [ferramentas, usdAtual, eurAtual, novoUsd, novoEur]);

  const mudou = novoUsd !== usdAtual || novoEur !== eurAtual;
  const invalido = !(novoUsd > 0) || !(novoEur > 0);

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <h2 className="titulo-secao">Taxas de câmbio</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Usadas para converter ferramentas em moeda estrangeira para reais. Alterar as taxas
          recalcula o custo mensal de todas essas ferramentas e grava uma única entrada de auditoria.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="usd">USD → BRL (atual: {num(usdAtual)})</Label>
          <Input
            id="usd"
            inputMode="decimal"
            placeholder={num(usdAtual)}
            value={usd}
            onChange={(e) => setUsd(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="eur">EUR → BRL (atual: {num(eurAtual)})</Label>
          <Input
            id="eur"
            inputMode="decimal"
            placeholder={num(eurAtual)}
            value={eur}
            onChange={(e) => setEur(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border p-3 text-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Prévia do impacto
        </p>
        <dl className="mt-2 space-y-1">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Ferramentas em moeda estrangeira</dt>
            <dd>{previa.qtd}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Total mensal hoje</dt>
            <dd>{brl(previa.antes)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Total mensal com as novas taxas</dt>
            <dd>{brl(previa.depois)}</dd>
          </div>
          <div className="flex justify-between font-medium">
            <dt>Variação</dt>
            <dd>
              {previa.delta >= 0 ? "+" : "−"}
              {brl(Math.abs(previa.delta))}
            </dd>
          </div>
        </dl>
      </div>

      <Button
        disabled={!mudou || invalido || aplicar.isPending}
        onClick={() =>
          aplicar.mutate(
            { USD: novoUsd, EUR: novoEur },
            {
              onSuccess: (r) => {
                setUsd("");
                setEur("");
                toast.success(
                  `Câmbio atualizado: ${r.ferramentas_afetadas} ferramenta(s) recalculada(s), variação de ${brl(Number(r.delta_brl))}.`,
                );
              },
            },
          )
        }
      >
        {aplicar.isPending ? "Aplicando…" : "Confirmar novas taxas"}
      </Button>
      {invalido && (
        <p className="text-xs text-destructive">Informe taxas maiores que zero para as duas moedas.</p>
      )}
    </div>
  );
}
