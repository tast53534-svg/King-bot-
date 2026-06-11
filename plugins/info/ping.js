import os from 'os';
import { performance } from 'perf_hooks';

const startTime = Date.now();

const handler = async (m, { conn }) => {
  const start = performance.now();
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  const ping = (performance.now() - start).toFixed(2);

  const mem = process.memoryUsage();
  const botRam = (mem.rss / 1024 / 1024).toFixed(1);
  const heapUsed = (mem.heapUsed / 1024 / 1024).toFixed(1);
  const heapTotal = (mem.heapTotal / 1024 / 1024).toFixed(1);

  const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
  const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
  const usedMem = (totalMem - freeMem).toFixed(2);

  const uptime = runtime(process.uptime());
  const botUptime = runtime((Date.now() - startTime) / 1000);

  const ramBar = makeBar(botRam, 800, 10);
  const memBar = makeBar(usedMem * 1024, totalMem * 1024, 10);

  const statsMessage = `
⚡ *بنج:* ${ping} ms
⏱️ *وقت تشغيل البوت:* ${botUptime}
🔄 *وقت تشغيل العملية:* ${uptime}

📊 *رام البوت:*
${ramBar} ${botRam}MB / 800MB
  └ Heap: ${heapUsed}MB / ${heapTotal}MB

💾 *رام السيرفر:*
${memBar} ${usedMem}GB / ${totalMem}GB

🖥️ *النظام:* ${os.platform()} — ${os.arch()}
🟢 *الحالة:* متصل
`.trim();

  await conn.msgUrl(m.chat, statsMessage, {
    img: "https://i.pinimg.com/736x/73/56/32/735632c6fa8e665c249abbc8a340b77d.jpg",
    title: "𝐒𝐲𝐬𝐭𝐞𝐦 / 𝐒𝐭𝐚𝐭𝐮𝐬",
    body: "𝐊𝐈𝐍𝐆 𝐁𝐎𝐓 — Performance Monitor",
    newsletter: {
      name: '𝑲𝑰𝑵𝑮 𝑩𝑶𝑻',
      jid: '120363427010273264@newsletter'
    },
    big: false
  });

  await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
};

function runtime(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const min = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [d && `${d}d`, h && `${h}h`, min && `${min}m`, `${s}s`].filter(Boolean).join(' ');
}

function makeBar(used, max, size) {
  const pct = Math.min(used / max, 1);
  const filled = Math.round(pct * size);
  const empty = size - filled;
  const fill = pct > 0.75 ? '🟥' : pct > 0.5 ? '🟨' : '🟩';
  return fill.repeat(filled) + '⬜'.repeat(empty);
}

handler.command = ["بنج", "ping", "stats", "حالة"];
handler.category = "info";
export default handler;
