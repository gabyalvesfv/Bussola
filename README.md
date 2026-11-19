# Bússola

Envie o PDF do seu currículo e o texto de uma vaga. A IA (Gemini) reescreve o currículo para a vaga, usando só fatos do original, e o navegador gera o novo PDF.

## Rodar localmente
1. `npm install`
2. Copie `.env.example` para `.env.local` e coloque sua chave em `GEMINI_API_KEY`
3. `npm run dev` e abra http://localhost:3000

## Estrutura
- `public/index.html`: interface e gerador de PDF (pdf-lib, no navegador)
- `app/api/adaptar/route.js`: recebe PDF + vaga e chama o Gemini
- `lib/ia.js`: conexão com o Gemini, modelos reserva e limite de uso
- `next.config.js`: abre o index.html na página inicial

## Deploy
Suba no GitHub e importe na Vercel. Em Environment Variables, adicione `GEMINI_API_KEY`.
