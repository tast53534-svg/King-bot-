let patched = false;

export default async function before(m, { conn }) {
  if (patched) return false;
  patched = true;

  const original = conn.groupMetadata.bind(conn);
  const cache = new Map();
  const TTL = 2 * 60 * 1000; // 2 دقايق بدل 5

  conn.groupMetadata = async (jid) => {
    const hit = cache.get(jid);
    if (hit && Date.now() - hit.t < TTL) return hit.d;
    const data = await original(jid);
    cache.set(jid, { d: data, t: Date.now() });
    return data;
  };

  // مسح الكاش لجروب معين (بيتم استدعاؤها عند promote/demote)
  conn.clearGroupCache = (jid) => {
    if (jid) cache.delete(jid);
    else cache.clear();
  };

  // الاستماع لإيفنت الترقية/التخفيض مباشرة ومسح الكاش فوراً
  try {
    const evTarget = conn.ev ?? conn.sock?.ev ?? conn;
    const evName = "group-participants.update";
    const handler = (update) => {
      if (!update?.id) return;
      if (update.action === "promote" || update.action === "demote") {
        cache.delete(update.id);
      }
    };
    if (typeof evTarget?.on === "function") {
      evTarget.on(evName, handler);
    } else if (typeof evTarget?.process === "function") {
      evTarget.process({ [evName]: [handler] });
    }
  } catch (_) {}

  // مسح الكاش كل دقيقتين للعناصر المنتهية
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now - v.t > TTL) cache.delete(k);
    }
  }, TTL);

  return false;
}
