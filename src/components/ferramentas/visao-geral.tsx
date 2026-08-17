import { AlertTriangle, CalendarClock, Layers, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { brl, dataBR, diasAte, inteiro, STATUS_LABEL } from "@/lib/format";
import type { Ferramenta } from "@/hooks/use-ferramentas";

const CORES = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function Kpi({
  titulo,
  valor,
  detalhe,
  icone: Icone,
}: {
  titulo: string;
  valor: string;
  detalhe: string;
  icone: typeof Wallet;
}) {
  return (
    <Card className="gap-2 py-4">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          {titulo}
          <Icone className="size-4" />
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <p className="text-2xl font-semibold tracking-tight">{valor}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{detalhe}</p>
      </CardContent>
    </Card>
  );
}

export function VisaoGeral({
  ferramentas,
  areas,
  categorias,
}: {
  ferramentas: Ferramenta[];
  areas: { id: string; nome: string }[];
  categorias: { id: string; nome: string }[];
}) {
  const ativas = ferramentas.filter((f) => f.status === "ativa" || f.status === "trial");
  const mensal = ativas.reduce((s, f) => s + Number(f.custo_mensal_brl ?? 0), 0);
  const licencas = ativas.reduce((s, f) => s + (f.num_licencas ?? 0), 0);
  const criticas = ferramentas.filter((f) => f.criticidade === "critica").length;

  const renovacoes = ferramentas
    .filter((f) => f.data_renovacao)
    .map((f) => ({ ...f, dias: diasAte(f.data_renovacao) ?? 9999 }))
    .filter((f) => f.dias >= 0 && f.dias <= 60)
    .sort((a, b) => a.dias - b.dias);

  const porCategoria = categorias
    .map((c) => ({
      nome: c.nome,
      valor: ativas.filter((f) => f.categoria_id === c.id).reduce((s, f) => s + Number(f.custo_mensal_brl ?? 0), 0),
    }))
    .filter((c) => c.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  const porArea = areas
    .map((a) => ({
      nome: a.nome,
      valor: ativas.filter((f) => f.area_id === a.id).reduce((s, f) => s + Number(f.custo_mensal_brl ?? 0), 0),
    }))
    .filter((a) => a.valor > 0)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 8);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi titulo="Custo mensal" valor={brl(mensal)} detalhe={`${brl(mensal * 12)} por ano`} icone={Wallet} />
        <Kpi
          titulo="Ferramentas ativas"
          valor={inteiro(ativas.length)}
          detalhe={`${inteiro(ferramentas.length)} cadastradas`}
          icone={Layers}
        />
        <Kpi titulo="Licenças" valor={inteiro(licencas)} detalhe="somando ferramentas ativas" icone={CalendarClock} />
        <Kpi
          titulo="Criticidade alta"
          valor={inteiro(criticas)}
          detalhe="ferramentas críticas"
          icone={AlertTriangle}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="py-4">
          <CardHeader className="px-4 pb-2">
            <CardTitle className="text-sm">Custo mensal por categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-64 px-2">
            {porCategoria.length === 0 ? (
              <p className="px-2 text-sm text-muted-foreground">Sem custos lançados ainda.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={porCategoria} dataKey="valor" nameKey="nome" innerRadius={45} outerRadius={80}>
                    {porCategoria.map((_, i) => (
                      <Cell key={i} fill={CORES[i % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => brl(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader className="px-4 pb-2">
            <CardTitle className="text-sm">Custo mensal por área</CardTitle>
          </CardHeader>
          <CardContent className="h-64 px-2">
            {porArea.length === 0 ? (
              <p className="px-2 text-sm text-muted-foreground">Sem custos lançados ainda.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porArea} margin={{ left: 8, right: 8, top: 8 }}>
                  <XAxis dataKey="nome" tick={{ fontSize: 10 }} interval={0} angle={-15} height={40} />
                  <YAxis tick={{ fontSize: 10 }} width={70} tickFormatter={(v: number) => brl(v)} />
                  <Tooltip formatter={(v: number) => brl(v)} />
                  <Bar dataKey="valor" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="py-4">
        <CardHeader className="px-4 pb-2">
          <CardTitle className="text-sm">Renovações nos próximos 60 dias</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          {renovacoes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma renovação nos próximos 60 dias.</p>
          ) : (
            <ul className="divide-y text-sm">
              {renovacoes.map((f) => (
                <li key={f.id} className="flex items-center justify-between py-2">
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{f.nome}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {STATUS_LABEL[f.status]}
                    </Badge>
                  </span>
                  <span className="text-muted-foreground">
                    {dataBR(f.data_renovacao)} · em {f.dias} dia(s) · {brl(f.custo_mensal_brl)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
