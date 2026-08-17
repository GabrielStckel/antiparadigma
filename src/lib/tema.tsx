import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function useTema() {
  const [escuro, setEscuro] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem("ap-tema");
    const inicial = salvo ? salvo === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setEscuro(inicial);
    document.documentElement.classList.toggle("dark", inicial);
  }, []);

  const alternar = () => {
    const proximo = !escuro;
    setEscuro(proximo);
    localStorage.setItem("ap-tema", proximo ? "dark" : "light");
    document.documentElement.classList.toggle("dark", proximo);
  };

  return { escuro, alternar };
}

export function BotaoTema() {
  const { escuro, alternar } = useTema();
  return (
    <Button variant="ghost" size="icon" onClick={alternar} aria-label="Alternar tema" className="size-8">
      {escuro ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
