/** Gera e baixa um CSV com BOM e separador ";" (compatível com Excel pt-BR). */
export function baixarCSV(nomeArquivo: string, cabecalho: string[], linhas: (string | number)[][]) {
  const csv = [cabecalho, ...linhas]
    .map((l) => l.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nomeArquivo}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
