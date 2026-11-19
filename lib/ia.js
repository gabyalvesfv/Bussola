import { GoogleGenAI } from "@google/genai";

// Tenta o modelo da variável GEMINI_MODEL e, se falhar, os próximos da lista.
const MODELOS = [process.env.GEMINI_MODEL, "gemini-3-flash-preview", "gemini-flash-latest", "gemini-3.8-flash"].filter(Boolean);

// Limite simples por IP (em memória): 60 chamadas por hora.
const hits = new Map();
export function limitado(req) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0];
  const now = Date.now();
  const lista = (hits.get(ip) || []).filter((t) => now - t < 3600_000);
  lista.push(now);
  hits.set(ip, lista);
  return lista.length > 60;
}

// Envia partes (texto e/ou PDF) e devolve um JSON validado.
export async function gerarJson(system, parts) {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY não encontrada. Confira o arquivo .env.local e reinicie o servidor.");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let ultimo;
  for (const model of MODELOS) {
    try {
      const r = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: { systemInstruction: system, responseMimeType: "application/json" },
      });
      const m = (r.text || "").match(/\{[\s\S]*\}/);
      if (!m) throw new Error("A IA não devolveu JSON.");
      return { dados: JSON.parse(m[0]), modelo: model };
    } catch (e) {
      ultimo = e;
    }
  }
  throw ultimo;
}
