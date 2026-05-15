# Proposta: Agente de IA para o Jornal

> Documento técnico — maio de 2026

---

## O que é o Agente do Jornal

Um agente de IA é um processo autônomo que roda em segundo plano, executa tarefas sem interação do usuário, toma decisões e entrega resultados prontos para consumo.

No contexto do Durando Mind, o Agente do Jornal substituiria o fluxo atual — onde o usuário abre a aba e espera o fetch — por um sistema onde o conteúdo **já está pronto e enriquecido com IA quando o usuário abre o app**.

---

## Problemas atuais que o agente resolve

| Problema atual | O que o agente faz |
|---|---|
| Notícias carregam só quando o usuário abre a aba | Busca em background, conteúdo pronto ao acordar |
| IA só roda quando o usuário clica no botão | Pré-processa resumo + insights para cada notícia |
| Relevância igual para todas as notícias | Filtra por score de relevância antes de exibir |
| Notificações dependem do app estar aberto | Push em background via Firebase Functions + FCM |
| Cache expira e força novo fetch no front | Cache centralizado no Firestore, não por dispositivo |

---

## Arquitetura proposta

```
┌─────────────────────────────────────────────────────────────┐
│  Firebase Functions (backend — Node.js 20)                  │
│                                                             │
│  ┌─────────────────┐      ┌───────────────────────────┐    │
│  │  journalAgent   │─────▶│  fetchNews (rss2json/GNews)│   │
│  │  (onSchedule)   │      └───────────────────────────┘    │
│  │                 │      ┌───────────────────────────┐    │
│  │  Roda 2x/dia    │─────▶│  scoreRelevance (Groq)    │    │
│  │  06:00 / 12:00  │      └───────────────────────────┘    │
│  │                 │      ┌───────────────────────────┐    │
│  │                 │─────▶│  enrichArticles (Groq)    │    │
│  │                 │      │  resumo + insights por IA  │    │
│  │                 │      └───────────────────────────┘    │
│  │                 │      ┌───────────────────────────┐    │
│  │                 │─────▶│  saveToFirestore           │    │
│  │                 │      │  journalCache/{date}_{cat} │    │
│  └─────────────────┘      └───────────────────────────┘    │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │  notifyUsers    │─────▶ FCM push para usuários ativos   │
│  │  (após enrich)  │                                        │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend (durando-mind.html)                               │
│                                                             │
│  refreshJournal() ──▶ getJournalNews (Function)            │
│                       └─▶ lê journalCache do Firestore     │
│                           (já tem resumo e insights prontos)│
└─────────────────────────────────────────────────────────────┘
```

---

## Fluxo detalhado do agente

### Passo 1 — Buscar notícias
Para cada categoria (8 categorias):
- Faz fetch no Google News RSS via rss2json
- Normaliza os artigos (título, resumo, fonte, data, link, imagem)
- Deduplica por título/URL

### Passo 2 — Pontuar relevância (Groq)
Para cada artigo, envia ao Groq:
```
Dê uma nota de 0 a 10 para a relevância desta notícia para um leitor 
brasileiro interessado em [categoria]. Retorne apenas o número.

Título: [título]
Resumo: [snippet]
```
- Filtra artigos com nota < 5
- Ordena por score decrescente
- Mantém os top 8 por categoria

### Passo 3 — Enriquecer com IA (Groq em paralelo)
Para cada artigo selecionado, gera em paralelo (`Promise.all`):
- **Resumo estruturado** (Resumo + Pontos principais + Impacto + Contexto)
- **Insights** (Impacto imediato + Tendência + O que observar)

O artigo expandido e as ideias ficam **on-demand** (só quando o usuário clica).

### Passo 4 — Salvar no Firestore
```
journalCache/{YYYY-MM-DD}_{categoryId} = {
  items: [...],          // artigos normalizados
  enriched: {            // pré-processados pela IA
    [articleId]: {
      summary: "...",
      insights: "...",
    }
  },
  generatedAt: timestamp,
  expiresAt: timestamp + 12h
}
```

### Passo 5 — Enviar notificação
Seleciona o artigo com maior score de cada categoria preferida do usuário.
Envia FCM push para todos os usuários com `journalNotifyEnabled: true`.

---

## Implementação na Firebase Function

```javascript
// functions/index.js — adicionar ao arquivo existente

const { onSchedule } = require("firebase-functions/v2/scheduler");
const { Groq } = require("groq-sdk");

exports.journalAgent = onSchedule({
  schedule: "0 6,12 * * *",   // 06:00 e 12:00, horário de Brasília
  timeZone: "America/Sao_Paulo",
  region: "southamerica-east1",
  secrets: ["GROQ_API_KEY", "RSS2JSON_API_KEY"],
  memory: "512MiB",
  timeoutSeconds: 300,
}, async (event) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  for (const cat of JOURNAL_CATEGORIES) {
    try {
      // 1. Buscar
      const raw = await fetchRss2Json(cat.query);
      
      // 2. Score de relevância (em paralelo, máx 10 artigos)
      const scored = await scoreArticles(groq, raw.slice(0, 10), cat);
      const top = scored.filter(a => a.score >= 5)
                        .sort((a,b) => b.score - a.score)
                        .slice(0, 8);
      
      // 3. Enriquecer com IA (paralelo)
      const enriched = {};
      await Promise.all(top.map(async article => {
        enriched[article.id] = await enrichArticle(groq, article);
      }));
      
      // 4. Salvar no Firestore
      const key = `${today()}_${cat.id}`;
      await db.collection("journalCache").doc(key).set({
        items: top,
        enriched,
        generatedAt: Date.now(),
        expiresAt: Date.now() + 12 * 3600 * 1000,
        source: "agent",
      });
      
    } catch (e) {
      console.error(`Agent failed for ${cat.id}:`, e.message);
    }
  }
  
  // 5. Notificar usuários
  await sendJournalPushToAll();
});
```

---

## No frontend — aproveitar o enriquecimento do agente

Quando o usuário abre o detalhe de um artigo, verificar se já tem resumo pré-processado:

```javascript
// Modificação em renderJournalDetailContent() — journal.js
async function renderJournalDetailContent(a) {
  // ... renderização atual ...
  
  // Se o artigo veio do agente, carregar resumo pré-pronto
  if (a.enriched?.summary) {
    document.getElementById('jdAiResult').innerHTML = 
      '<div class="jd-ai-result-inner">' +
      '<div class="jd-ai-result-title">✦ Resumo — gerado pelo agente</div>' +
      '<div class="jd-ai-result-body">' + mdLite(a.enriched.summary) + '</div>' +
      '</div>';
  }
}
```

---

## Custo estimado

| Componente | Custo |
|---|---|
| **Groq API** | **Gratuito** (rate limit: 30 req/min, 14.400/dia) |
| Firebase Functions (invocações) | Gratuito até 2M/mês (Spark plan) |
| Firebase Functions (tempo de execução) | ~300s × 2 execuções/dia = grátis no Spark |
| Firestore (leituras/escritas) | ~200 writes/dia × 30 dias = 6.000/mês → grátis |
| FCM (notificações push) | Gratuito |
| **Cloud Scheduler** | **Requer plano Blaze** (~R$ 0,10/mês) |
| **Estimativa mensal total** | **~R$ 0 no Spark, ~R$ 0,10 no Blaze** |

> **Atenção:** O Cloud Scheduler (para agendar a função 2x/dia) exige o plano Blaze. O resto pode rodar no Spark (gratuito). O Blaze tem pay-as-you-go — com o volume deste app, o custo real ficaria na faixa de centavos/mês.

---

## Frequência de execução recomendada

| Horário | Justificativa |
|---|---|
| **06:00** | Usuário acorda, notícias da manhã prontas |
| **12:00** | Atualização do meio-dia, novidades da manhã |
| (opcional) **18:00** | Resumo do dia para quem acessa à noite |

---

## O que ainda depende de ação externa

| Item | O que fazer |
|---|---|
| Deploy do agente | `firebase deploy --only functions:journalAgent` |
| Plano Blaze | Ativar no Firebase Console para Cloud Scheduler |
| GROQ_API_KEY no backend | `firebase functions:secrets:set GROQ_API_KEY` |
| Firestore rules | Já configuradas (admin SDK pode escrever em `journalCache`) |
| VAPID key para FCM | Gerar no Firebase Console → Project settings → Cloud Messaging |

---

## Resumo: o que muda para o usuário

**Hoje:**
1. Abre o app → clica em Jornal → espera o fetch → notícia aparece sem resumo → clica em Resumir → espera a IA

**Com o agente:**
1. Abre o app → Jornal já tem notícias → clica em qualquer card → resumo e insights **já estão lá**, gerados durante a madrugada
