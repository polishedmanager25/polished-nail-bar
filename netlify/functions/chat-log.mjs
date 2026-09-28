import { getStore } from "@netlify/blobs";

// Private page listing every Baby P chat, newest first.
// Open: https://polishednailbardtla.com/chat-log?key=YOUR_PASSWORD
export default async (req) => {
  const key = new URL(req.url).searchParams.get("key") || "";
  if (!process.env.CHAT_LOG_PASSWORD || key !== process.env.CHAT_LOG_PASSWORD) {
    return new Response("Not found", { status: 404 });
  }

  const store = getStore("baby-p-chats");
  const { blobs } = await store.list();
  const keys = blobs.map((b) => b.key).sort().reverse().slice(0, 300);
  const chats = await Promise.all(keys.map((k) => store.get(k, { type: "json" })));

  const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const rows = chats.filter(Boolean).map((c) => `
    <div class="chat">
      <div class="when">${esc(c.time)} · ${esc((c.page || "").replace(/^https?:\/\/[^/]+/, "") || "/")}</div>
      <div class="q">${esc(c.question)}</div>
      <div class="a">${esc(c.reply)}</div>
    </div>`).join("");

  const html = `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>Baby P chat log</title>
<style>
body{font-family:-apple-system,Helvetica,sans-serif;margin:0;padding:16px;background:#f6f4ef;color:#141414}
h1{font-size:20px;margin:0 0 4px}.sub{color:#666;font-size:13px;margin-bottom:16px}
.chat{background:#fff;border-left:3px solid #DCB63F;padding:12px;margin-bottom:10px;border-radius:4px}
.when{font-size:12px;color:#888;margin-bottom:6px}.q{font-weight:600;margin-bottom:6px}
.a{white-space:pre-wrap;color:#333;font-size:14px}
</style></head><body>
<h1>Baby P chat log</h1>
<div class="sub">${blobs.length} chats saved · newest first${blobs.length > 300 ? " · showing latest 300" : ""}</div>
${rows || "<p>No chats saved yet.</p>"}
</body></html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
};

export const config = { path: "/chat-log" };
