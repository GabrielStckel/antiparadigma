import type { Ferramenta } from "@/hooks/use-ferramentas";

const ESSENCIAIS: { campo: keyof Ferramenta; label: string }[] = [
  { campo: "area_id", label: "área" },
  { campo: "categoria_id", label: "categoria" },
  { campo: "responsavel_id", label: "responsável" },
  { campo: "descricao_uso", label: "descrição de uso" },
];

/** Campos essenciais em branco — base do selo "incompleto". */
export function faltandoEssenciais(f: Ferramenta): string[] {
  return ESSENCIAIS.filter(({ campo }) => {
    const v = f[campo];
    return v === null || v === undefined || String(v).trim() === "";
  }).map((e) => e.label);
}

export const estaIncompleta = (f: Ferramenta) => faltandoEssenciais(f).length > 0;
