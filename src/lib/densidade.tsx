import { Rows2, Rows3 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export type Densidade = "confortavel" | "compacto";

const CHAVE = "ap-densidade";

export function useDensidade() {
  const [densidade, setDensidade] = useState<Densidade>("confortavel");

  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE);
    const inicial: Densidade = salvo === "compacto" ? "compacto" : "confortavel";
    setDensidade(inicial);
    document.documentElement.setAttribute("data-density", inicial);
  }, []);

  const alternar = () => {
    const proxima: Densidade = densidade === "compacto" ? "confortavel" : "compacto";
    setDensidade(proxima);
    localStorage.setItem(CHAVE, proxima);
    document.documentElement.setAttribute("data-density", proxima);
  };

  return { densidade, alternar, definir: (d: Densidade) => {
    setDensidade(d);
    localStorage.setItem(CHAVE, d);
    document.documentElement.setAttribute("data-density", d);
  } };
}

export function BotaoDensidade({ comRotulo = false }: { comRotulo?: boolean }) {
  const { densidade, alternar } = useDensidade();
  const compacto = densidade === "compacto";
  const rotulo = compacto ? "Densidade compacta" : "Densidade confortável";

  if (comRotulo) {
    return (
      <Button variant="outline" size="sm" onClick={alternar} className="h-8 gap-2">
        {compacto ? <Rows3 className="size-4" /> : <Rows2 className="size-4" />}
        {rotulo}
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={alternar} aria-label={rotulo} title={rotulo} className="size-8">
      {compacto ? <Rows3 className="size-4" /> : <Rows2 className="size-4" />}
    </Button>
  );
}
