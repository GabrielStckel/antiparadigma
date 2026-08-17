/**
 * Catálogo embutido de ferramentas comuns em agências e empresas de marketing
 * brasileiras. Não é integração externa: é uma constante no código, usada só
 * para sugerir categoria, site e moeda ao digitar o nome.
 */
export type ItemCatalogo = {
  nome: string;
  categoria: string;
  dominio: string;
  moeda: "BRL" | "USD" | "EUR";
};

export const CATALOGO_FERRAMENTAS: ItemCatalogo[] = [
  { nome: "Figma", categoria: "Design", dominio: "figma.com", moeda: "USD" },
  { nome: "Adobe Creative Cloud", categoria: "Design", dominio: "adobe.com", moeda: "BRL" },
  { nome: "Canva", categoria: "Design", dominio: "canva.com", moeda: "BRL" },
  { nome: "Envato Elements", categoria: "Design", dominio: "elements.envato.com", moeda: "USD" },
  { nome: "Freepik", categoria: "Design", dominio: "freepik.com", moeda: "EUR" },
  { nome: "Shutterstock", categoria: "Design", dominio: "shutterstock.com", moeda: "USD" },
  { nome: "Framer", categoria: "Design", dominio: "framer.com", moeda: "USD" },
  { nome: "Webflow", categoria: "Design", dominio: "webflow.com", moeda: "USD" },

  { nome: "Notion", categoria: "Gestão", dominio: "notion.so", moeda: "USD" },
  { nome: "ClickUp", categoria: "Gestão", dominio: "clickup.com", moeda: "USD" },
  { nome: "Linear", categoria: "Gestão", dominio: "linear.app", moeda: "USD" },
  { nome: "Asana", categoria: "Gestão", dominio: "asana.com", moeda: "USD" },
  { nome: "Trello", categoria: "Gestão", dominio: "trello.com", moeda: "USD" },
  { nome: "Monday.com", categoria: "Gestão", dominio: "monday.com", moeda: "USD" },
  { nome: "Pipefy", categoria: "Gestão", dominio: "pipefy.com", moeda: "BRL" },
  { nome: "Miro", categoria: "Gestão", dominio: "miro.com", moeda: "USD" },
  { nome: "Airtable", categoria: "Gestão", dominio: "airtable.com", moeda: "USD" },

  { nome: "Slack", categoria: "Comunicação", dominio: "slack.com", moeda: "USD" },
  { nome: "Google Workspace", categoria: "Comunicação", dominio: "workspace.google.com", moeda: "BRL" },
  { nome: "Microsoft 365", categoria: "Comunicação", dominio: "microsoft.com", moeda: "BRL" },
  { nome: "Zoom", categoria: "Comunicação", dominio: "zoom.com", moeda: "USD" },
  { nome: "Loom", categoria: "Comunicação", dominio: "loom.com", moeda: "USD" },
  { nome: "Discord", categoria: "Comunicação", dominio: "discord.com", moeda: "USD" },

  { nome: "Meta Business", categoria: "Marketing", dominio: "business.facebook.com", moeda: "BRL" },
  { nome: "Google Ads", categoria: "Marketing", dominio: "ads.google.com", moeda: "BRL" },
  { nome: "TikTok Ads", categoria: "Marketing", dominio: "ads.tiktok.com", moeda: "BRL" },
  { nome: "LinkedIn Ads", categoria: "Marketing", dominio: "linkedin.com", moeda: "BRL" },
  { nome: "RD Station", categoria: "Marketing", dominio: "rdstation.com", moeda: "BRL" },
  { nome: "Mailchimp", categoria: "Marketing", dominio: "mailchimp.com", moeda: "USD" },
  { nome: "ActiveCampaign", categoria: "Marketing", dominio: "activecampaign.com", moeda: "USD" },
  { nome: "Brevo", categoria: "Marketing", dominio: "brevo.com", moeda: "EUR" },
  { nome: "mLabs", categoria: "Marketing", dominio: "mlabs.com.br", moeda: "BRL" },
  { nome: "Etus", categoria: "Marketing", dominio: "etus.digital", moeda: "BRL" },
  { nome: "Semrush", categoria: "Marketing", dominio: "semrush.com", moeda: "USD" },
  { nome: "Ahrefs", categoria: "Marketing", dominio: "ahrefs.com", moeda: "USD" },
  { nome: "SimilarWeb", categoria: "Marketing", dominio: "similarweb.com", moeda: "USD" },
  { nome: "Hotjar", categoria: "Marketing", dominio: "hotjar.com", moeda: "USD" },
  { nome: "Typeform", categoria: "Marketing", dominio: "typeform.com", moeda: "USD" },
  { nome: "CapCut", categoria: "Marketing", dominio: "capcut.com", moeda: "BRL" },
  { nome: "Metricool", categoria: "Marketing", dominio: "metricool.com", moeda: "EUR" },

  { nome: "HubSpot", categoria: "Vendas", dominio: "hubspot.com", moeda: "USD" },
  { nome: "Pipedrive", categoria: "Vendas", dominio: "pipedrive.com", moeda: "USD" },
  { nome: "Salesforce", categoria: "Vendas", dominio: "salesforce.com", moeda: "USD" },
  { nome: "Ploomes", categoria: "Vendas", dominio: "ploomes.com", moeda: "BRL" },
  { nome: "Zendesk", categoria: "Vendas", dominio: "zendesk.com", moeda: "USD" },

  { nome: "Conta Azul", categoria: "Financeiro", dominio: "contaazul.com", moeda: "BRL" },
  { nome: "Omie", categoria: "Financeiro", dominio: "omie.com.br", moeda: "BRL" },
  { nome: "Asaas", categoria: "Financeiro", dominio: "asaas.com", moeda: "BRL" },
  { nome: "Nibo", categoria: "Financeiro", dominio: "nibo.com.br", moeda: "BRL" },
  { nome: "Stripe", categoria: "Financeiro", dominio: "stripe.com", moeda: "USD" },
  { nome: "Pluggy", categoria: "Financeiro", dominio: "pluggy.ai", moeda: "BRL" },

  { nome: "ChatGPT", categoria: "IA", dominio: "openai.com", moeda: "USD" },
  { nome: "Claude", categoria: "IA", dominio: "claude.ai", moeda: "USD" },
  { nome: "Gemini", categoria: "IA", dominio: "gemini.google.com", moeda: "USD" },
  { nome: "Midjourney", categoria: "IA", dominio: "midjourney.com", moeda: "USD" },
  { nome: "ElevenLabs", categoria: "IA", dominio: "elevenlabs.io", moeda: "USD" },
  { nome: "Runway", categoria: "IA", dominio: "runwayml.com", moeda: "USD" },
  { nome: "Perplexity", categoria: "IA", dominio: "perplexity.ai", moeda: "USD" },
  { nome: "HeyGen", categoria: "IA", dominio: "heygen.com", moeda: "USD" },
  { nome: "Zapier", categoria: "IA", dominio: "zapier.com", moeda: "USD" },
  { nome: "Make", categoria: "IA", dominio: "make.com", moeda: "EUR" },
  { nome: "n8n", categoria: "IA", dominio: "n8n.io", moeda: "EUR" },

  { nome: "GitHub", categoria: "Desenvolvimento", dominio: "github.com", moeda: "USD" },
  { nome: "Vercel", categoria: "Desenvolvimento", dominio: "vercel.com", moeda: "USD" },
  { nome: "Supabase", categoria: "Desenvolvimento", dominio: "supabase.com", moeda: "USD" },
  { nome: "Lovable", categoria: "Desenvolvimento", dominio: "lovable.dev", moeda: "USD" },
  { nome: "Sentry", categoria: "Desenvolvimento", dominio: "sentry.io", moeda: "USD" },

  { nome: "AWS", categoria: "Infraestrutura", dominio: "aws.amazon.com", moeda: "USD" },
  { nome: "Cloudflare", categoria: "Infraestrutura", dominio: "cloudflare.com", moeda: "USD" },
  { nome: "Google Cloud", categoria: "Infraestrutura", dominio: "cloud.google.com", moeda: "USD" },
  { nome: "Hostinger", categoria: "Infraestrutura", dominio: "hostinger.com.br", moeda: "BRL" },
  { nome: "Locaweb", categoria: "Infraestrutura", dominio: "locaweb.com.br", moeda: "BRL" },
  { nome: "1Password", categoria: "Infraestrutura", dominio: "1password.com", moeda: "USD" },
  { nome: "Dropbox", categoria: "Infraestrutura", dominio: "dropbox.com", moeda: "USD" },

  { nome: "Clicksign", categoria: "Jurídico", dominio: "clicksign.com", moeda: "BRL" },
  { nome: "DocuSign", categoria: "Jurídico", dominio: "docusign.com", moeda: "USD" },
  { nome: "Gupy", categoria: "RH", dominio: "gupy.io", moeda: "BRL" },
  { nome: "Convenia", categoria: "RH", dominio: "convenia.com.br", moeda: "BRL" },
  { nome: "Feedz", categoria: "RH", dominio: "feedz.com.br", moeda: "BRL" },
];

const normalizar = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Melhor correspondência para o texto digitado, ou null. */
export function sugerirDoCatalogo(texto: string): ItemCatalogo | null {
  const t = normalizar(texto);
  if (t.length < 2) return null;
  const exato = CATALOGO_FERRAMENTAS.find((i) => normalizar(i.nome) === t);
  if (exato) return exato;
  const comeca = CATALOGO_FERRAMENTAS.find((i) => normalizar(i.nome).startsWith(t));
  if (comeca) return comeca;
  return CATALOGO_FERRAMENTAS.find((i) => normalizar(i.nome).includes(t)) ?? null;
}

/**
 * Casa a categoria sugerida com as categorias existentes no banco, sem acento
 * e sem diferenciar maiúsculas. Sem correspondência → string vazia (o campo
 * fica em branco e nada mais é bloqueado).
 */
export function casarCategoria(
  nomeSugerido: string,
  categorias: { id: string; nome: string }[],
): string {
  const alvo = normalizar(nomeSugerido);
  return categorias.find((c) => normalizar(c.nome) === alvo)?.id ?? "";
}

/** URL completa a partir do domínio do catálogo. */
export const siteDoCatalogo = (item: ItemCatalogo) => `https://${item.dominio}`;
