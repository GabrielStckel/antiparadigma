export const brl = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v ?? 0));

export const num = (v: number | null | undefined, digits = 2) =>
  new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(v ?? 0));

export const inteiro = (v: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR").format(Number(v ?? 0));

/** "2026-08-17" | ISO -> "17/08/2026" */
export const dataBR = (v: string | null | undefined) => {
  if (!v) return "—";
  const [d] = v.split("T");
  const parts = (d ?? "").split("-");
  if (parts.length !== 3) return "—";
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

export const competenciaBR = (v: string | null | undefined) => {
  if (!v) return "—";
  const [ano, mes] = v.split("-");
  return `${mes}/${ano}`;
};

export const diasAte = (v: string | null | undefined) => {
  if (!v) return null;
  const alvo = new Date(`${v.split("T")[0]}T12:00:00`);
  const hoje = new Date();
  return Math.ceil((alvo.getTime() - hoje.getTime()) / 86_400_000);
};

export const CICLO_LABEL: Record<string, string> = {
  mensal: "Mensal",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
  vitalicio: "Vitalício",
  uso: "Por uso",
  gratuito: "Gratuito",
};

export const STATUS_LABEL: Record<string, string> = {
  ativa: "Ativa",
  trial: "Trial",
  em_avaliacao: "Em avaliação",
  pausada: "Pausada",
  cancelada: "Cancelada",
};

export const CRITICIDADE_LABEL: Record<string, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export const MOEDAS = ["BRL", "USD", "EUR"] as const;
