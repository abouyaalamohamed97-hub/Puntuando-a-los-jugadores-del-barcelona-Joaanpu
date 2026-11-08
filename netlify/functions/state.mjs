import { getStore } from "@netlify/blobs";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export default async (req) => {
  const store = getStore("barca");

  if (req.method === "GET") {
    const data = await store.get("state", { type: "json" });
    return json(data || {});
  }

  if (req.method === "POST") {
    const pass = Netlify.env.get("SAVE_PASSWORD");
    if (!pass) return json({ error: "Falta SAVE_PASSWORD en Netlify" }, 500);
    if (req.headers.get("x-key") !== pass) return json({ error: "unauthorized" }, 401);
    const text = await req.text();
    if (text.length > 1_000_000) return json({ error: "too large" }, 413);
    let body;
    try { body = JSON.parse(text); } catch { return json({ error: "bad json" }, 400); }
    await store.setJSON("state", body);
    return json({ ok: true });
  }

  return json({ error: "method not allowed" }, 405);
};
