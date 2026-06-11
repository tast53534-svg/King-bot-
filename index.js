import { Client } from 'MeowSub';
import { group, access } from "./system/control.js";
import UltraDB from "./system/UltraDB.js";
import sub from './sub.js';
import { fileURLToPath } from 'url';
import path from 'path';
import http from 'http';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SESSION_PATH = path.join(__dirname, 'session');

/* =========== Client ========== */
const client = new Client({
  phoneNumber: process.env.BOT_PHONE_NUMBER || '201557223720',
  prefix: [".", "/", "!"],
  fromMe: null,
  sessionPath: path.join(__dirname, 'session'),
  owners: [
    { name: "Owner", jid: "201557223720@s.whatsapp.net", lid: "201557223720@lid" },
    { name: "مطور", jid: "201024109563@s.whatsapp.net", lid: "201024109563@lid" },
    { name: ".ديـ🔥ـشا || Disha⁩", jid: "201128290021@s.whatsapp.net", lid: "253579701026847@lid" },
    { name: "آلَڠزٍآلَـــــــــــهّ", jid: "201130357198@s.whatsapp.net", lid: "64313511415907@lid" }
  ],
  settings: { noWelcome: false },
  commandsPath: path.join(__dirname, 'plugins'),
  onConnected: () => {
    console.log('\n✅ ══════════════════════════════════');
    console.log('✅ البوت اتصل بنجاح بواتساب! 🎉');
    console.log('✅ ══════════════════════════════════\n');
    clearTimeout(watchdog);
  },
  onDisconnected: () => {
    console.log('\n⚠️  البوت انفصل — بيمسح الجلسة وبيعمل restart...\n');
    try {
      const sp = path.join(__dirname, 'session');
      if (fs.existsSync(sp)) {
        for (const f of fs.readdirSync(sp)) {
          fs.rmSync(path.join(sp, f), { recursive: true, force: true });
        }
      }
    } catch (_) {}
    setTimeout(() => process.exit(0), 1000);
  }
});

client.onGroupEvent(group);
client.onCommandAccess(access);

/* =========== Database ========== */
if (!global.db) {
    global.db = new UltraDB();
}

/* =========== Config ========== */
const { config } = client;
config.info = { 
  nameBot: "♡ 𝑲𝑰𝑵𝑮 𝑩𝑶𝑻 👑〈", 
  nameChannel: "𝑲𝑰𝑵𝑮 𝑩𝑶𝑻", 
  idChannel: "120363427010273264@newsletter",
  urls: {
    repo: "https://wa.me/201551798379",
    api: "https://emam-api.web.id",
    channel: "https://whatsapp.com/channel/0029VbCPEZ88F2pNsd7YQB1i"
  },
  copyright: { 
    pack: '𝑲𝑰𝑵𝑮 𝑩𝑶𝑻 👑', 
    author: '𝑲𝑰𝑵𝑮 𝑩𝑶𝑻 👑'
  },
  images: [
    "https://files.catbox.moe/2xhp9q.jpg",
    "https://i.pinimg.com/originals/e2/21/20/e221203f319df949ee65585a657501a2.jpg",
    "https://i.pinimg.com/originals/bb/77/0f/bb770fad66a634a6b3bf93e9c00fb4e5.jpg"
  ]
};

/* =========== Start ========== */
client.start();

/* =========== Watchdog: إذا ما اتصلش في 45 ثانية — مسح وrestart ========== */
const watchdog = setTimeout(() => {
    const connected = !!(client.sock?.user);
    if (!connected) {
        console.log('\n⚠️  البوت مش متصل بعد 45 ثانية');
        console.log('🧹 بيمسح الجلسة ويعمل restart عشان يطلع كود جديد...\n');
        try {
            if (fs.existsSync(SESSION_PATH)) {
                const files = fs.readdirSync(SESSION_PATH);
                for (const f of files) {
                    fs.rmSync(path.join(SESSION_PATH, f), { recursive: true, force: true });
                }
            }
        } catch (_) {}
        process.exit(0);
    }
}, 45000);

/* =========== معرفة لما البوت يتصل فعلاً ========== */
client.onMessage(async (m) => {
    clearTimeout(watchdog);
});

setTimeout(async () => {
    if (client.commandSystem) { 
        sub(client);
    }
}, 2000);


/* =========== Catch Errors ========== */
process.on('uncaughtException', (e) => {
    if (e?.message?.includes('rate-overlimit')) {}
    else console.error('Uncaught Exception:', e);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err)
});

/* =========== Keep-Alive Server ========== */
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('King Bot is running ✅');
}).listen(PORT, () => {
    const domain = process.env.REPLIT_DEV_DOMAIN
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : `http://localhost:${PORT}`;
    console.log(`\n🌐 ══════════════════════════════════`);
    console.log(`🌐 Keep-alive server شغال على port ${PORT}!`);
    console.log(`🔗 رابط UptimeRobot: ${domain}`);
    console.log(`🌐 ══════════════════════════════════\n`);
});
