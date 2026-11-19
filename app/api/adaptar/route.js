import { gerarJson, limitado } from "@/lib/ia";

export const maxDuration = 60;

const SISTEMA = `Você é a Bússola, especialista em currículos de estudantes e recém-formados de tecnologia no Brasil. Receberá o PDF do currículo atual e o texto de uma vaga. Gere o currículo ADAPTADO a essa vaga.

REGRAS INVIOLÁVEIS
- Use SOMENTE fatos que estão no PDF. Nunca invente experiência, ferramenta, nota, número, resultado, curso ou data.
- Pode reordenar, cortar o que for irrelevante para a vaga, reescrever bullets (verbo de ação + o que foi feito + resultado, só se o dado existir no PDF) e usar as palavras-chave da vaga APENAS quando forem verdadeiras para a pessoa.
- O que a vaga pede e a pessoa não tem NÃO entra no currículo: vai em "lacunas".
- Priorize o que mais pesa para esta vaga. Máximo de 4 bullets por item. O currículo deve caber em 1 página (no máximo 2).
- Escreva em português.

Responda SOMENTE JSON neste formato:
{"nome":string,"contatos":[string],"headline":string (título profissional alinhado à vaga, sem inventar cargo),"resumo":string (2 a 3 linhas),"skills":[string],"experiencias":[{"cargo":string,"org":string,"periodo":string,"bullets":[string]}],"projetos":[{"nome":string,"periodo":string,"bullets":[string]}],"formacao":[{"curso":string,"inst":string,"periodo":string,"detalhe":string}],"extras":[{"titulo":string (ex.: Liga acadêmica, Monitoria, Certificações, Extensão),"itens":[string]}],"idiomas":[string],"fit":number (0-100, honesto),"mudancas":[string (o que foi destacado, cortado ou reescrito e por quê)],"lacunas":[{"item":string,"como_fechar":string (curso, projeto ou evento concreto)}]}`;

export async function POST(req) {
  if (limitado(req)) return Response.json({ erro: "Muitas chamadas. Tente mais tarde." }, { status: 429 });
  try {
    const { pdf, vaga } = await req.json();
    if (typeof pdf !== "string" || pdf.length < 100) return Response.json({ erro: "Envie o PDF do currículo." }, { status: 400 });
    if (typeof vaga !== "string" || vaga.trim().length < 40) return Response.json({ erro: "Cole o texto completo da vaga." }, { status: 400 });
    const { dados, modelo } = await gerarJson(SISTEMA, [
      { inlineData: { mimeType: "application/pdf", data: pdf } },
      { text: "TEXTO DA VAGA:\n" + vaga.slice(0, 9000) },
    ]);
    return Response.json({ cv: dados, modelo });
  } catch (e) {
    return Response.json({ erro: String(e?.message || e).slice(0, 400) }, { status: 500 });
  }
}
