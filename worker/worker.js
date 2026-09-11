/**
 * Polished Nail Bar DTLA — chat Worker
 *
 * Sits between the website and the Anthropic API so the API key never
 * reaches a visitor's browser. Deploy free on Cloudflare Workers.
 *
 * SET THESE IN THE CLOUDFLARE DASHBOARD (Settings > Variables):
 *   ANTHROPIC_API_KEY   secret   your key from console.anthropic.com
 *   ALLOWED_ORIGIN      plain    https://polishednailbardtla.com
 */

const MODEL = "claude-haiku-4-5-20251001";
const MAX_QUESTION = 500;
const MAX_KNOWLEDGE = 60000;

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || "https://polishednailbardtla.com";

    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return json({ error: "POST only" }, 405, cors);
    }

    // only answer requests coming from the salon's own site
    const from = request.headers.get("Origin");
    if (from && from !== origin) {
      return json({ error: "Not allowed" }, 403, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Bad request" }, 400, cors);
    }

    const question = String(body.question || "").slice(0, MAX_QUESTION).trim();
    const knowledge = String(body.knowledge || "").slice(0, MAX_KNOWLEDGE);
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

    if (!question) return json({ error: "No question" }, 400, cors);

    const system = [
      "You are the assistant for Polished Nail Bar DTLA, a nail salon in the Historic Core of Downtown Los Angeles.",
      "Answer ONLY from the salon information below. It is the single source of truth.",
      "If the answer is not in it, say you are not sure and give the text number. Never invent a price, a policy, a promotion or an appointment time.",
      "Never promise that a specific technician or time slot is available — you cannot see the calendar. Point people to the booking link or the text line.",
      "When asked who should do a service, name the technicians whose specialties match, as a short list, then hand off to booking.",
      "Keep answers to two or three sentences unless asked for detail. Be warm, brief and direct.",
      "",
      "=== SALON INFORMATION ===",
      knowledge || "(no salon information was supplied — say you cannot answer and give the text number 323-379-3469)",
    ].join("\n");

    const messages = [];
    for (const m of history) {
      if (m && (m.role === "user" || m.role === "assistant") && m.content) {
        messages.push({ role: m.role, content: String(m.content).slice(0, 2000) });
      }
    }
    messages.push({ role: "user", content: question });

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 400,
          system,
          messages,
        }),
      });

      if (!res.ok) {
        const detail = await res.text();
        console.log("anthropic error", res.status, detail.slice(0, 300));
        return json({ error: "Assistant unavailable" }, 502, cors);
      }

      const data = await res.json();
      const reply = (data.content || [])
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();

      return json({ reply: reply || "Sorry, I did not catch that." }, 200, cors);
    } catch (err) {
      console.log("worker error", String(err));
      return json({ error: "Assistant unavailable" }, 502, cors);
    }
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}
