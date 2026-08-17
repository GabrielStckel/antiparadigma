import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type { Ferramenta } from "@/hooks/use-ferramentas";
import { supabase } from "@/integrations/supabase/client";
import { CICLO_LABEL, CRITICIDADE_LABEL, MOEDAS, STATUS_LABEL } from "@/lib/format";

type Props = {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  ferramenta: Ferramenta | null;
  areas: { id: string; nome: string }[];
  categorias: { id: string; nome: string }[];
  perfis: { id: string; nome_completo: string }[];
  podeEditar: boolean;
};

const VAZIO = {
  nome: "",
  fornecedor: "",
  site_url: "",
  categoria_id: "",
  area_id: "",
  descricao_uso: "",
  status: "ativa",
  criticidade: "media",
  responsavel_id: "",
  plano: "",
  ciclo: "mensal",
  valor: "0",
  moeda: "BRL",
  num_licencas: "1",
  forma_pagamento: "",
  ultimos_4_digitos: "",
  centro_custo: "",
  data_contratacao: "",
  data_renovacao: "",
  renovacao_automatica: true,
  prazo_cancelamento_dias: "",
  contrato_url: "",
  contem_dados_sensiveis: false,
  observacoes: "",
};

export function FerramentaSheet({
  aberto,
  onOpenChange,
  ferramenta,
  areas,
  categorias,
  perfis,
  podeEditar,
}: Props) {
  const [form, setForm] = useState({ ...VAZIO });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!aberto) return;
    if (ferramenta) {
      setForm({
        nome: ferramenta.nome ?? "",
        fornecedor: ferramenta.fornecedor ?? "",
        site_url: ferramenta.site_url ?? "",
        categoria_id: ferramenta.categoria_id ?? "",
        area_id: ferramenta.area_id ?? "",
        descricao_uso: ferramenta.descricao_uso ?? "",
        status: ferramenta.status,
        criticidade: ferramenta.criticidade,
        responsavel_id: ferramenta.responsavel_id ?? "",
        plano: ferramenta.plano ?? "",
        ciclo: ferramenta.ciclo,
        valor: String(ferramenta.valor ?? 0),
        moeda: ferramenta.moeda ?? "BRL",
        num_licencas: String(ferramenta.num_licencas ?? 1),
        forma_pagamento: ferramenta.forma_pagamento ?? "",
        ultimos_4_digitos: ferramenta.ultimos_4_digitos ?? "",
        centro_custo: ferramenta.centro_custo ?? "",
        data_contratacao: ferramenta.data_contratacao ?? "",
        data_renovacao: ferramenta.data_renovacao ?? "",
        renovacao_automatica: ferramenta.renovacao_automatica,
        prazo_cancelamento_dias: ferramenta.prazo_cancelamento_dias?.toString() ?? "",
        contrato_url: ferramenta.contrato_url ?? "",
        contem_dados_sensiveis: ferramenta.contem_dados_sensiveis,
        observacoes: ferramenta.observacoes ?? "",
      });
    } else {
      setForm({ ...VAZIO });
    }
  }, [aberto, ferramenta]);

  const set = (campo: keyof typeof VAZIO, valor: string | boolean) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  const salvar = useMutation({
    mutationFn: async () => {
      if (!form.nome.trim()) throw new Error("Informe o nome da ferramenta.");
      if (!form.descricao_uso.trim()) throw new Error("Descreva para que a ferramenta é usada.");

      const payload = {
        nome: form.nome.trim(),
        fornecedor: form.fornecedor.trim() || null,
        site_url: form.site_url.trim() || null,
        categoria_id: form.categoria_id || null,
        area_id: form.area_id || null,
        descricao_uso: form.descricao_uso.trim(),
        status: form.status as Ferramenta["status"],
        criticidade: form.criticidade as Ferramenta["criticidade"],
        responsavel_id: form.responsavel_id || null,
        plano: form.plano.trim() || null,
        ciclo: form.ciclo as Ferramenta["ciclo"],
        valor: Number(form.valor.replace(",", ".")) || 0,
        moeda: form.moeda,
        num_licencas: Number(form.num_licencas) || 1,
        forma_pagamento: form.forma_pagamento.trim() || null,
        ultimos_4_digitos: form.ultimos_4_digitos.trim() || null,
        centro_custo: form.centro_custo.trim() || null,
        data_contratacao: form.data_contratacao || null,
        data_renovacao: form.data_renovacao || null,
        renovacao_automatica: form.renovacao_automatica,
        prazo_cancelamento_dias: form.prazo_cancelamento_dias
          ? Number(form.prazo_cancelamento_dias)
          : null,
        contrato_url: form.contrato_url.trim() || null,
        contem_dados_sensiveis: form.contem_dados_sensiveis,
        observacoes: form.observacoes.trim() || null,
      };

      if (ferramenta) {
        const { error } = await supabase.from("tools").update(payload).eq("id", ferramenta.id);
        if (error) throw error;
      } else {
        const { data: sess } = await supabase.auth.getUser();
        const { error } = await supabase
          .from("tools")
          .insert({ ...payload, created_by: sess.user?.id ?? null });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(ferramenta ? "Ferramenta atualizada." : "Ferramenta cadastrada.");
      void queryClient.invalidateQueries({ queryKey: ["ferramentas"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível salvar."),
  });

  return (
    <Sheet open={aberto} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{ferramenta ? "Editar ferramenta" : "Nova ferramenta"}</SheetTitle>
          <SheetDescription>
            O custo mensal em reais é calculado automaticamente pelo ciclo, número de licenças e câmbio.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo label="Nome *">
              <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} />
            </Campo>
            <Campo label="Fornecedor">
              <Input value={form.fornecedor} onChange={(e) => set("fornecedor", e.target.value)} />
            </Campo>
            <Campo label="Site">
              <Input
                placeholder="https://"
                value={form.site_url}
                onChange={(e) => set("site_url", e.target.value)}
              />
            </Campo>
            <Campo label="Plano">
              <Input value={form.plano} onChange={(e) => set("plano", e.target.value)} />
            </Campo>
            <Campo label="Categoria">
              <Selecao
                valor={form.categoria_id}
                onValor={(v) => set("categoria_id", v)}
                opcoes={categorias.map((c) => ({ valor: c.id, label: c.nome }))}
              />
            </Campo>
            <Campo label="Área">
              <Selecao
                valor={form.area_id}
                onValor={(v) => set("area_id", v)}
                opcoes={areas.map((a) => ({ valor: a.id, label: a.nome }))}
              />
            </Campo>
            <Campo label="Responsável">
              <Selecao
                valor={form.responsavel_id}
                onValor={(v) => set("responsavel_id", v)}
                opcoes={perfis.map((p) => ({ valor: p.id, label: p.nome_completo }))}
              />
            </Campo>
            <Campo label="Status">
              <Selecao
                valor={form.status}
                onValor={(v) => set("status", v)}
                opcoes={Object.entries(STATUS_LABEL).map(([valor, label]) => ({ valor, label }))}
                semVazio
              />
            </Campo>
            <Campo label="Criticidade">
              <Selecao
                valor={form.criticidade}
                onValor={(v) => set("criticidade", v)}
                opcoes={Object.entries(CRITICIDADE_LABEL).map(([valor, label]) => ({ valor, label }))}
                semVazio
              />
            </Campo>
          </div>

          <Campo label="Descrição de uso *">
            <Textarea
              rows={3}
              value={form.descricao_uso}
              onChange={(e) => set("descricao_uso", e.target.value)}
            />
          </Campo>

          <Separator />
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contrato e custo</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Campo label="Ciclo">
              <Selecao
                valor={form.ciclo}
                onValor={(v) => set("ciclo", v)}
                opcoes={Object.entries(CICLO_LABEL).map(([valor, label]) => ({ valor, label }))}
                semVazio
              />
            </Campo>
            <Campo label="Valor do ciclo">
              <Input inputMode="decimal" value={form.valor} onChange={(e) => set("valor", e.target.value)} />
            </Campo>
            <Campo label="Moeda">
              <Selecao
                valor={form.moeda}
                onValor={(v) => set("moeda", v)}
                opcoes={MOEDAS.map((m) => ({ valor: m, label: m }))}
                semVazio
              />
            </Campo>
            <Campo label="Licenças">
              <Input
                inputMode="numeric"
                value={form.num_licencas}
                onChange={(e) => set("num_licencas", e.target.value)}
              />
            </Campo>
            <Campo label="Forma de pagamento">
              <Input
                value={form.forma_pagamento}
                onChange={(e) => set("forma_pagamento", e.target.value)}
              />
            </Campo>
            <Campo label="Últimos 4 dígitos">
              <Input
                maxLength={4}
                value={form.ultimos_4_digitos}
                onChange={(e) => set("ultimos_4_digitos", e.target.value)}
              />
            </Campo>
            <Campo label="Centro de custo">
              <Input value={form.centro_custo} onChange={(e) => set("centro_custo", e.target.value)} />
            </Campo>
            <Campo label="Prazo de cancelamento (dias)">
              <Input
                inputMode="numeric"
                value={form.prazo_cancelamento_dias}
                onChange={(e) => set("prazo_cancelamento_dias", e.target.value)}
              />
            </Campo>
            <Campo label="Data de contratação">
              <Input
                type="date"
                value={form.data_contratacao}
                onChange={(e) => set("data_contratacao", e.target.value)}
              />
            </Campo>
            <Campo label="Data de renovação">
              <Input
                type="date"
                value={form.data_renovacao}
                onChange={(e) => set("data_renovacao", e.target.value)}
              />
            </Campo>
          </div>

          <Campo label="Link do contrato">
            <Input value={form.contrato_url} onChange={(e) => set("contrato_url", e.target.value)} />
          </Campo>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.renovacao_automatica}
                onCheckedChange={(v) => set("renovacao_automatica", v === true)}
              />
              Renovação automática
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.contem_dados_sensiveis}
                onCheckedChange={(v) => set("contem_dados_sensiveis", v === true)}
              />
              Trata dados sensíveis
            </label>
          </div>

          <Campo label="Observações">
            <Textarea rows={3} value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
          </Campo>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={!podeEditar || salvar.isPending} onClick={() => salvar.mutate()}>
            {salvar.isPending ? "Salvando…" : "Salvar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  const id = React.useId();
  const filho = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<{ id?: string }>, { id })
    : children;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      {filho}
    </div>
  );
}


function Selecao({
  valor,
  onValor,
  opcoes,
  semVazio,
}: {
  valor: string;
  onValor: (v: string) => void;
  opcoes: { valor: string; label: string }[];
  semVazio?: boolean;
}) {
  return (
    <Select value={valor || "__vazio"} onValueChange={(v) => onValor(v === "__vazio" ? "" : v)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione" />
      </SelectTrigger>
      <SelectContent>
        {!semVazio && <SelectItem value="__vazio">— não definido —</SelectItem>}
        {opcoes.map((o) => (
          <SelectItem key={o.valor} value={o.valor}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
