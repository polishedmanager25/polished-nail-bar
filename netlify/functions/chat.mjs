/**
 * Polished Nail Bar DTLA — Baby P chat function (Netlify)
 *
 * Runs on Netlify's US servers, so Baby P works for visitors anywhere
 * in the world. The website calls it at /api/chat.
 *
 * SET IN NETLIFY: Site configuration > Environment variables
 *   ANTHROPIC_API_KEY   your key from platform.claude.com
 *
 * QUESTION LOG: every question and answer is written to the function log.
 * Read it in Netlify > Logs & metrics > Functions > chat
 */

const MODEL = "claude-haiku-4-5-20251001";
const MAX_QUESTION = 500;
const MAX_KNOWLEDGE = 60000;

export default async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  // only answer requests from the salon's own site
  const from = req.headers.get("origin") || "";
  if (from && !/polishednailbardtla\.com$|netlify\.app$/.test(new URL(from).hostname)) {
    return json({ error: "Not allowed" }, 403);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Bad request" }, 400);
  }

  const question = String(body.question || "").slice(0, MAX_QUESTION).trim();
  const knowledge = String(body.knowledge || "").slice(0, MAX_KNOWLEDGE);
  const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

  if (!question) return json({ error: "No question" }, 400);

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
        "x-api-key": process.env.ANTHROPIC_API_KEY,
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
      return json({ error: "Assistant unavailable" }, 502);
    }

    const data = await res.json();
    const reply = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    // question log — Netlify > Logs & metrics > Functions > chat
    console.log(JSON.stringify({
      type: "baby_p_chat",
      page: req.headers.get("referer") || "",
      question,
      reply: reply.slice(0, 1000),
    }));

    return json({ reply: reply || "Sorry, I did not catch that." }, 200);
  } catch (err) {
    console.log("function error", String(err));
    return json({ error: "Assistant unavailable" }, 502);
  }
};

export const config = { path: "/api/chat" };

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
      
